const CAST_AVAILABILITY_EVENT = 'cinelocal-cast-available';

let castConfigured = false;

export interface CastDiagnostic {
  browser: string;
  isChrome: boolean;
  isBrave: boolean;
  isEdge: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isWebView: boolean;
  isIframe: boolean;
  isSecure: boolean;
  isLocalHost: boolean;
  isSdkScriptLoaded: boolean;
  isContextReady: boolean;
  title: string;
  reason: string;
  solution: string;
  suggestBraveToggle: boolean;
  suggestChromeMenu: boolean;
  suggestWebVideoCaster: boolean;
  suggestVlc: boolean;
  suggestHttps: boolean;
}

export function getCastContext(): any | null {
  if (typeof window === 'undefined') return null;

  const browserWindow = window as any;
  const castFramework = browserWindow.cast?.framework;
  const chromeCast = browserWindow.chrome?.cast;

  if (!castFramework?.CastContext || !chromeCast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID) {
    return null;
  }

  try {
    const context = castFramework.CastContext.getInstance();
    if (!castConfigured) {
      const options: Record<string, unknown> = {
        receiverApplicationId: chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      };
      if (chromeCast.AutoJoinPolicy?.ORIGIN_SCOPED) {
        options.autoJoinPolicy = chromeCast.AutoJoinPolicy.ORIGIN_SCOPED;
      }
      context.setOptions(options);
      castConfigured = true;
    }
    return context;
  } catch (err) {
    console.warn('[CineLocal Cast] Erro ao obter CastContext:', err);
    return null;
  }
}

export function subscribeToCastAvailability(onChange: (context: any | null) => void): () => void {
  let lastContext: any | null | undefined;
  let pollTimer: number | null = null;
  let stopTimer: number | null = null;

  const stopPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    if (stopTimer !== null) {
      window.clearTimeout(stopTimer);
      stopTimer = null;
    }
  };

  const notify = () => {
    const context = getCastContext();
    if (context) stopPolling();
    if (context === lastContext) return;
    lastContext = context;
    onChange(context);
  };

  window.addEventListener(CAST_AVAILABILITY_EVENT, notify);
  notify();

  // On mobile Chrome and desktop the Cast SDK can finish loading after the callback
  // has already fired. Keep checking briefly so the player does not miss it.
  if (!lastContext) {
    pollTimer = window.setInterval(notify, 300);
    stopTimer = window.setTimeout(stopPolling, 30000);
  }

  return () => {
    stopPolling();
    window.removeEventListener(CAST_AVAILABILITY_EVENT, notify);
  };
}

/**
 * Chromecast cannot resolve the sender's localhost. Ask the server for LAN
 * addresses and, when HTTPS is enabled, use its HTTP media port so the
 * receiver does not have to validate the local self-signed certificate.
 */
export async function resolveCastBaseUrls(): Promise<string[]> {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost === '::1' || currentHost === '[::1]';

  try {
    const response = await fetch('/api/system/cast-info');
    if (response.ok) {
      const data = await response.json();
      const protocol = typeof data.protocol === 'string' && data.protocol ? data.protocol : 'http';
      const port = Number(data.port) || (typeof window !== 'undefined' ? Number(window.location.port) : 3000) || 3000;
      const addresses = Array.isArray(data.addresses) ? data.addresses : [];

      const urls = addresses
        .filter((address: unknown): address is string => typeof address === 'string' && address.length > 0)
        .map((address: string) => `${protocol}://${address}:${port}`);

      if (urls.length > 0) {
        if (!isLocal && currentOrigin) {
          return [currentOrigin, ...urls.filter((u: string) => u !== currentOrigin)];
        }
        return urls;
      }
    }
  } catch {}

  // Fallback to network-info if cast-info was unreachable
  try {
    const netRes = await fetch('/api/system/network-info');
    if (netRes.ok) {
      const netData = await netRes.json();
      const netAddresses = Array.isArray(netData.addresses) ? netData.addresses : [];
      const netPort = Number(netData.port) || 3000;
      const netUrls = netAddresses
        .filter((addr: unknown): addr is string => typeof addr === 'string' && addr.length > 0)
        .map((addr: string) => `http://${addr}:${netPort}`);
      if (netUrls.length > 0) return netUrls;
    }
  } catch {}

  if (!isLocal && currentOrigin) {
    return [currentOrigin];
  }

  return currentOrigin ? [currentOrigin] : ['http://localhost:3000'];
}

export function getCastErrorMessage(error: unknown): string {
  const code = (error as any)?.code || (error as any)?.errorCode;
  if (code === 'cancel' || code === 'CANCEL') return 'A conexão com o Chromecast foi cancelada.';
  if (code === 'receiver_unavailable' || code === 'RECEIVER_UNAVAILABLE') {
    return 'Nenhum Chromecast disponível no momento. Verifique se o aparelho e seu dispositivo estão no mesmo Wi-Fi.';
  }
  if (typeof (error as any)?.message === 'string' && (error as any).message.trim()) {
    return (error as any).message;
  }
  return 'Não foi possível iniciar a transmissão direta para o Chromecast.';
}

/**
 * Diagnoses the current browser, device and network environment to provide
 * actionable solutions when Google Cast Web API is unavailable.
 */
export function getCastDiagnostics(): CastDiagnostic {
  if (typeof window === 'undefined') {
    return {
      browser: 'Desconhecido',
      isChrome: false,
      isBrave: false,
      isEdge: false,
      isFirefox: false,
      isSafari: false,
      isAndroid: false,
      isIOS: false,
      isWebView: false,
      isIframe: false,
      isSecure: false,
      isLocalHost: false,
      isSdkScriptLoaded: false,
      isContextReady: false,
      title: 'Ambiente não suportado',
      reason: 'Execução fora do navegador.',
      solution: 'Abra no Google Chrome ou em um navegador compatível.',
      suggestBraveToggle: false,
      suggestChromeMenu: false,
      suggestWebVideoCaster: false,
      suggestVlc: false,
      suggestHttps: false,
    };
  }

  const userAgent = navigator.userAgent || '';
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isBrave = Boolean((navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function');
  const isEdge = /Edg\//i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|CriOS/i.test(userAgent);
  const isChrome = /Chrome|CriOS/i.test(userAgent) && !isEdge && !isBrave;
  const isWebView = /(wv|Capacitor)/i.test(userAgent) || (window as any).Capacitor !== undefined;
  const isIframe = window.self !== window.top;
  const hostname = window.location.hostname.toLowerCase();
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
  const isSecure = window.location.protocol === 'https:';

  const browserWindow = window as any;
  const isSdkScriptLoaded = Boolean(browserWindow.cast?.framework || browserWindow.chrome?.cast);
  const isContextReady = Boolean(getCastContext());

  let browser = 'Google Chrome';
  if (isBrave) browser = 'Brave';
  else if (isEdge) browser = 'Microsoft Edge';
  else if (isFirefox) browser = 'Mozilla Firefox';
  else if (isSafari) browser = 'Apple Safari';
  else if (isWebView) browser = 'App CineLocal (Capacitor/WebView)';
  else if (!isChrome) browser = 'Navegador Web';

  // Construct specific diagnosis
  if (isBrave) {
    return {
      browser,
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Chromecast desativado no Navegador Brave',
      reason: 'O navegador Brave desativa a extensão nativa do Chromecast por padrão para proteger a privacidade na rede local.',
      solution: 'Para ativar: abra uma nova aba no Brave, acesse brave://settings/extensions, ligue a opção "Media router" e reinicie o Brave. Ou use as opções de transmissão direta abaixo (Web Video Caster / VLC).',
      suggestBraveToggle: true,
      suggestChromeMenu: false,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: false,
    };
  }

  if (isFirefox) {
    return {
      browser,
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Mozilla Firefox não possui Google Cast nativo',
      reason: 'A Mozilla não implementa a extensão Google Cast proprietária no Firefox para páginas web.',
      solution: 'Abra o CineLocal no Google Chrome para transmitir via Cast nativo, ou use o botão "Abrir no Web Video Caster / VLC" abaixo.',
      suggestBraveToggle: false,
      suggestChromeMenu: false,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: false,
    };
  }

  if (isIOS) {
    return {
      browser: 'iOS Safari / Chrome iOS',
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Transmissão no iPhone / iPad',
      reason: 'O iOS não permite a API Web do Google Cast em nenhum navegador, utilizando o protocolo Apple AirPlay.',
      solution: 'Use a opção "Transmissão Nativa / AirPlay" para enviar para sua Smart TV ou Apple TV, ou use o app Web Video Caster.',
      suggestBraveToggle: false,
      suggestChromeMenu: false,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: false,
    };
  }

  if (isWebView) {
    return {
      browser,
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Transmissão a partir do Aplicativo Android',
      reason: 'O aplicativo Android (WebView/APK) não compartilha a extensão do Chrome de Chromecast para páginas web.',
      solution: 'Toque em "Abrir no Web Video Caster" ou "Abrir no VLC" abaixo para transmitir qualquer vídeo diretamente para a sua TV com 1 toque!',
      suggestBraveToggle: false,
      suggestChromeMenu: false,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: false,
    };
  }

  if (!isSecure && !isLocalHost && isAndroid) {
    return {
      browser,
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Google Cast no Celular exige HTTPS na rede local',
      reason: 'No celular Android, o Google Chrome desativa a API do Chromecast em endereços HTTP simples de IP (ex: http://192.168.x.x).',
      solution: 'Abra pelo endereço seguro HTTPS gerado pelo CineLocal, ou use a opção "Abrir no Web Video Caster" abaixo para transmitir com total compatibilidade.',
      suggestBraveToggle: false,
      suggestChromeMenu: false,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: true,
    };
  }

  if (isIframe) {
    return {
      browser,
      isChrome,
      isBrave,
      isEdge,
      isFirefox,
      isSafari,
      isAndroid,
      isIOS,
      isWebView,
      isIframe,
      isSecure,
      isLocalHost,
      isSdkScriptLoaded,
      isContextReady,
      title: 'Execução em Janela Embutida (iframe)',
      reason: 'O navegador restringe o acesso direto ao Chromecast quando o aplicativo está dentro de um frame embutido.',
      solution: 'Abra o CineLocal diretamente em uma nova aba do navegador para liberar a detecção do Chromecast.',
      suggestBraveToggle: false,
      suggestChromeMenu: true,
      suggestWebVideoCaster: true,
      suggestVlc: true,
      suggestHttps: false,
    };
  }

  // Default Chrome/Chromium diagnosis
  return {
    browser,
    isChrome,
    isBrave,
    isEdge,
    isFirefox,
    isSafari,
    isAndroid,
    isIOS,
    isWebView,
    isIframe,
    isSecure,
    isLocalHost,
    isSdkScriptLoaded,
    isContextReady,
    title: 'Dispositivo Chromecast não localizado na rede',
    reason: 'O navegador não encontrou o Chromecast ou a extensão Cast ainda está procurando dispositivos na rede Wi-Fi.',
    solution: 'Certifique-se de que o Chromecast e o computador estão na mesma rede Wi-Fi. No Google Chrome, você também pode clicar nos 3 pontinhos no canto superior direito do navegador ➔ "Transmitir..." para projetar na TV.',
    suggestBraveToggle: false,
    suggestChromeMenu: true,
    suggestWebVideoCaster: true,
    suggestVlc: true,
    suggestHttps: false,
  };
}

/**
 * Attempts W3C HTML5 Remote Playback API or Apple webkitShowPlaybackTargetPicker
 */
export async function tryNativeRemotePlayback(video: HTMLVideoElement | null): Promise<boolean> {
  if (!video) return false;

  const anyVideo = video as any;

  // 1. Apple Safari / iOS AirPlay Target Picker
  if (typeof anyVideo.webkitShowPlaybackTargetPicker === 'function') {
    try {
      anyVideo.webkitShowPlaybackTargetPicker();
      return true;
    } catch {
      return false;
    }
  }

  // 2. W3C Remote Playback API (Chromium / Chrome Android / Edge)
  if (anyVideo.remote && typeof anyVideo.remote.prompt === 'function') {
    try {
      await anyVideo.remote.prompt();
      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        return false;
      }
      return false;
    }
  }

  return false;
}

/**
 * Re-injects or reloads the Google Cast Sender script if it was blocked or offline
 */
export function reloadCastSdk(): void {
  if (typeof window === 'undefined') return;

  const existingScript = document.querySelector('script[src*="cast_sender.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  script.async = true;
  script.onload = () => {
    window.dispatchEvent(new Event(CAST_AVAILABILITY_EVENT));
  };
  document.head.appendChild(script);
}
