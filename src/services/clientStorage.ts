import { get, set } from 'idb-keyval';
import { LibraryData, MediaItem, Episode, Season, IptvChannel } from '../types';

const DB_LIBRARY_KEY = 'cinelocal_library_data';
const DB_FAVORITES_KEY = 'cinelocal_iptv_favorites';
const DB_CUSTOM_CHANNELS_KEY = 'cinelocal_custom_channels';

// Default empty library structure
export const defaultLibrary: LibraryData = {
  version: 2,
  updatedAt: new Date().toISOString(),
  settings: {
    preferredAudioLanguage: 'pt',
    preferredSubtitleLanguage: 'pt',
    autoPlayNext: true,
  },
  items: [],
};

// Check if running in a backend-supported environment
let backendAvailableCache: boolean | null = null;

export async function isBackendAvailable(): Promise<boolean> {
  if (backendAvailableCache !== null) return backendAvailableCache;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/library', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    backendAvailableCache = res.ok;
    return res.ok;
  } catch {
    backendAvailableCache = false;
    return false;
  }
}

// Get library: from server if available, otherwise from IndexedDB
export async function getClientLibrary(): Promise<LibraryData> {
  const hasBackend = await isBackendAvailable();
  if (hasBackend) {
    try {
      const res = await fetch('/api/library', { cache: 'no-store' });
      if (res.ok) {
        const data: LibraryData = await res.json();
        // Also sync copy to IndexedDB for offline capability
        await set(DB_LIBRARY_KEY, data).catch(() => {});
        return data;
      }
    } catch (e) {
      console.warn('[CineLocal] Falha ao consultar backend, usando IndexedDB local:', e);
    }
  }

  // Load from IndexedDB
  try {
    const localData = await get<LibraryData>(DB_LIBRARY_KEY);
    if (localData && Array.isArray(localData.items)) {
      return localData;
    }
  } catch (err) {
    console.error('[CineLocal] Erro ao carregar IndexedDB:', err);
  }

  return defaultLibrary;
}

// Save library locally in IndexedDB
export async function saveClientLibrary(library: LibraryData): Promise<void> {
  library.updatedAt = new Date().toISOString();
  await set(DB_LIBRARY_KEY, library);
}

// Update playback progress locally
export async function saveClientProgress(
  mediaId: string,
  episodeId: string,
  progressSeconds: number,
  durationSeconds?: number,
  completed = false,
  audioIndex?: number,
  subtitleIndex?: number
): Promise<void> {
  // Always try sending to server first if online
  try {
    fetch('/api/library/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaId,
        episodeId,
        progressSeconds,
        durationSeconds,
        completed,
        audioIndex,
        subtitleIndex,
      }),
    }).catch(() => {});
  } catch {}

  // Also update in IndexedDB
  try {
    const lib = await getClientLibrary();
    const item = lib.items.find((i) => i.id === mediaId);
    if (item) {
      for (const season of item.seasons) {
        const ep = season.episodes.find((e) => e.id === episodeId);
        if (ep) {
          ep.progressSeconds = progressSeconds;
          if (durationSeconds && durationSeconds > 0) {
            ep.durationSeconds = durationSeconds;
          }
          if (completed) {
            ep.watched = true;
          }
          if (audioIndex !== undefined) ep.selectedAudioIndex = audioIndex;
          if (subtitleIndex !== undefined) ep.selectedSubtitleIndex = subtitleIndex;
          ep.lastWatchedAt = new Date().toISOString();
          item.lastWatchedEpisodeId = episodeId;
          item.lastWatchedAt = ep.lastWatchedAt;
          break;
        }
      }
      await saveClientLibrary(lib);
    }
  } catch (err) {
    console.warn('[CineLocal] Falha ao salvar progresso localmente no IndexedDB:', err);
  }
}

// IPTV Favorites storage
export async function getClientIptvFavorites(): Promise<string[]> {
  try {
    const res = await fetch('/api/iptv/favorites').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data.favorites)) {
        await set(DB_FAVORITES_KEY, data.favorites).catch(() => {});
        return data.favorites;
      }
    }
  } catch {}

  try {
    const local = await get<string[]>(DB_FAVORITES_KEY);
    if (Array.isArray(local)) return local;
  } catch {}
  return [];
}

export async function saveClientIptvFavorites(favorites: string[]): Promise<void> {
  try {
    await set(DB_FAVORITES_KEY, favorites);
  } catch {}
}

// File name parser for local media
export function parseLocalVideoFileName(fileName: string): {
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  isSeries: boolean;
  year?: number;
} {
  const cleanName = fileName.replace(/\.[^/.]+$/, ''); // remove extension

  // Match S01E02 or 1x02
  const seriesMatch = cleanName.match(/(?:s|season\s*)(\d{1,2})(?:e|episode|\s*x\s*)(\d{1,3})/i);
  if (seriesMatch) {
    const seasonNumber = parseInt(seriesMatch[1], 10);
    const episodeNumber = parseInt(seriesMatch[2], 10);
    const title = cleanName
      .substring(0, seriesMatch.index)
      .replace(/[._\-+]/g, ' ')
      .trim();
    return {
      title: title || cleanName,
      seasonNumber,
      episodeNumber,
      isSeries: true,
    };
  }

  // Match year e.g. "Matrix (1999)" or "Inception.2010"
  const yearMatch = cleanName.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  const title = (
    yearMatch && yearMatch.index
      ? cleanName.substring(0, yearMatch.index)
      : cleanName
  )
    .replace(/[._\-+]/g, ' ')
    .trim();

  return {
    title: title || cleanName,
    seasonNumber: 1,
    episodeNumber: 1,
    isSeries: false,
    year,
  };
}

// Global in-memory cache for local file Blobs/URLs so they can be played instantaneously
export const localBlobRegistry = new Map<string, string>();

/**
 * Register local video files (from <input type="file"> or drag/drop or Android file picker)
 * into IndexedDB and the player registry.
 */
export async function importLocalFilesToLibrary(
  files: File[] | FileList,
  categoryHint?: 'movie' | 'series'
): Promise<MediaItem[]> {
  const fileArray = Array.from(files).filter((f) => {
    const ext = f.name.toLowerCase();
    return (
      ext.endsWith('.mp4') ||
      ext.endsWith('.mkv') ||
      ext.endsWith('.webm') ||
      ext.endsWith('.avi') ||
      ext.endsWith('.mov') ||
      ext.endsWith('.m4v')
    );
  });

  if (fileArray.length === 0) {
    throw new Error('Nenhum arquivo de vídeo compatível foi encontrado.');
  }

  const lib = await getClientLibrary();
  const createdOrUpdatedItems: MediaItem[] = [];

  for (const file of fileArray) {
    const parsed = parseLocalVideoFileName(file.name);
    const isSeries = categoryHint ? categoryHint === 'series' : parsed.isSeries;
    const itemTitle = parsed.title;
    const blobUrl = URL.createObjectURL(file);
    const episodeId = `local_ep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localBlobRegistry.set(episodeId, blobUrl);

    // Look for existing MediaItem with same title
    let mediaItem = lib.items.find(
      (item) => item.title.toLowerCase() === itemTitle.toLowerCase() && item.kind === (isSeries ? 'series' : 'movie')
    );

    const newEpisode: Episode & { localBlobUrl?: string } = {
      id: episodeId,
      seasonNumber: parsed.seasonNumber,
      episodeNumber: parsed.episodeNumber,
      title: isSeries ? `Episódio ${parsed.episodeNumber}` : itemTitle,
      fileName: file.name,
      filePath: file.name,
      localBlobUrl: blobUrl,
      extension: '.' + (file.name.split('.').pop()?.toLowerCase() || 'mp4'),
      sizeBytes: file.size,
      durationSeconds: 0,
      audioTracks: [{ index: 0, streamIndex: 1, codec: 'aac', title: 'Áudio Principal' }],
      subtitleTracks: [],
      watched: false,
      progressSeconds: 0,
      lastWatchedAt: undefined,
    };

    if (mediaItem) {
      // Add episode to existing item
      let season = mediaItem.seasons.find((s) => s.seasonNumber === parsed.seasonNumber);
      if (!season) {
        season = {
          seasonNumber: parsed.seasonNumber,
          title: `Temporada ${parsed.seasonNumber}`,
          episodes: [],
        };
        mediaItem.seasons.push(season);
        mediaItem.totalSeasons = mediaItem.seasons.length;
      }
      season.episodes.push(newEpisode);
      mediaItem.totalEpisodes += 1;
      mediaItem.updatedAt = new Date().toISOString();
      createdOrUpdatedItems.push(mediaItem);
    } else {
      // Create new MediaItem
      const newId = `local_media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      mediaItem = {
        id: newId,
        title: itemTitle,
        kind: isSeries ? 'series' : 'movie',
        folderPath: 'Armazenamento Local',
        year: parsed.year,
        totalEpisodes: 1,
        totalSeasons: 1,
        seasons: [
          {
            seasonNumber: parsed.seasonNumber,
            title: `Temporada ${parsed.seasonNumber}`,
            episodes: [newEpisode],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      lib.items.unshift(mediaItem);
      createdOrUpdatedItems.push(mediaItem);
    }
  }

  await saveClientLibrary(lib);
  return createdOrUpdatedItems;
}
