import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Tv,
  Cast,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Info,
  RefreshCw,
  QrCode,
  Radio,
  Play,
  HelpCircle,
  Wifi,
  Monitor,
  Flame,
  Globe,
} from 'lucide-react';
import {
  CastDiagnostic,
  getCastDiagnostics,
  resolveCastBaseUrls,
  tryNativeRemotePlayback,
  reloadCastSdk,
  getCastContext,
} from '../cast';
import { createQrMatrix, getQrSvgPath } from '../utils/qrcode';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaTitle: string;
  mediaSubtitle?: string;
  streamPath: string; // e.g. /api/media/123/episode/456/stream or /api/torrent/stream/...
  m3uExportUrl?: string; // e.g. /api/media/123/episode/456/export-m3u
  videoElement: HTMLVideoElement | null;
  onTriggerGoogleCast?: () => void;
  castAvailable?: boolean;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  mediaTitle,
  mediaSubtitle,
  streamPath,
  m3uExportUrl,
  videoElement,
  onTriggerGoogleCast,
  castAvailable = false,
}) => {
  const [diagnostics, setDiagnostics] = useState<CastDiagnostic>(getCastDiagnostics);
  const [baseUrls, setBaseUrls] = useState<string[]>([]);
  const [selectedBaseUrlIndex, setSelectedBaseUrlIndex] = useState<number>(0);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedBrave, setCopiedBrave] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'chrome' | 'brave' | 'mobile' | 'smarttv'>('chrome');
  const [nativeCastStatus, setNativeCastStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDiagnostics(getCastDiagnostics());
      resolveCastBaseUrls().then((urls) => {
        setBaseUrls(urls);
      });
    }
  }, [isOpen]);

  // Determine preferred guide tab based on diagnostic
  useEffect(() => {
    if (diagnostics.isBrave) setActiveGuideTab('brave');
    else if (diagnostics.isAndroid || diagnostics.isIOS) setActiveGuideTab('mobile');
    else setActiveGuideTab('chrome');
  }, [diagnostics]);

  const activeBaseUrl = useMemo(() => {
    if (baseUrls.length > 0) {
      return baseUrls[selectedBaseUrlIndex] || baseUrls[0];
    }
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  }, [baseUrls, selectedBaseUrlIndex]);

  const fullStreamUrl = useMemo(() => {
    return `${activeBaseUrl}${streamPath}`;
  }, [activeBaseUrl, streamPath]);

  // Pure SVG QR Code generated offline
  const qrSvg = useMemo(() => {
    if (!fullStreamUrl) return null;
    try {
      const matrix = createQrMatrix(fullStreamUrl);
      return getQrSvgPath(matrix);
    } catch (err) {
      console.warn('Falha ao gerar QR Code local:', err);
      return null;
    }
  }, [fullStreamUrl]);

  if (!isOpen) return null;

  const handleCopyStreamUrl = () => {
    navigator.clipboard.writeText(fullStreamUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyBraveUrl = () => {
    navigator.clipboard.writeText('brave://settings/extensions');
    setCopiedBrave(true);
    setTimeout(() => setCopiedBrave(false), 2500);
  };

  const handleOpenWebVideoCaster = () => {
    const encodedStream = encodeURIComponent(fullStreamUrl);
    const encodedTitle = encodeURIComponent(mediaTitle);

    // 1. If on Android, try direct intent
    if (diagnostics.isAndroid) {
      const intentUrl = `intent:${fullStreamUrl}#Intent;action=android.intent.action.VIEW;type=video/*;package=com.instantbits.cast.webvideo;S.title=${encodedTitle};end`;
      window.location.href = intentUrl;
      return;
    }

    // 2. URL Scheme (works on iOS and Android)
    const callbackUrl = `wvc-x-callback://open?url=${encodedStream}&title=${encodedTitle}`;
    window.location.href = callbackUrl;
  };

  const handleOpenVlc = () => {
    if (m3uExportUrl) {
      window.location.href = m3uExportUrl;
    } else {
      window.location.href = `vlc://${fullStreamUrl}`;
    }
  };

  const handleTryNativeCast = async () => {
    setNativeCastStatus('Buscando dispositivos na rede local...');
    const ok = await tryNativeRemotePlayback(videoElement);
    if (ok) {
      setNativeCastStatus('Seletor do sistema aberto com sucesso!');
    } else {
      setNativeCastStatus('Seletor não disponível ou cancelado.');
      setTimeout(() => setNativeCastStatus(null), 3000);
    }
  };

  const handleReloadSdk = () => {
    reloadCastSdk();
    setTimeout(() => {
      setDiagnostics(getCastDiagnostics());
    }, 1500);
  };

  return (
    <div
      id="cast-modal-backdrop"
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="cast-modal-container"
        className="w-full max-w-2xl bg-[#141414] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-neutral-200 animate-in zoom-in-95 duration-200 max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/90 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-[#181818]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Transmitir para TV / Chromecast</span>
                {castAvailable && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                    Cast Pronto
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-sm sm:max-w-md">
                {mediaTitle} {mediaSubtitle && `• ${mediaSubtitle}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Diagnostic Context Alert */}
          <div
            id="cast-diagnostic-alert"
            className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
              diagnostics.isContextReady
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {diagnostics.isContextReady ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-bold text-white flex items-center justify-between">
                <span>{diagnostics.title}</span>
                <span className="text-[11px] font-mono opacity-80">{diagnostics.browser}</span>
              </div>
              <p className="text-neutral-300 text-[11px]">{diagnostics.reason}</p>
              <p className="text-amber-300/90 text-[11px] font-medium">{diagnostics.solution}</p>
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Google Cast Nativo (Android / Chrome) */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-3 col-span-1 sm:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                      <Cast className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">Google Cast / Chromecast</span>
                      <p className="text-[11px] text-neutral-400">Projeção direta para Chromecast, Google TV e Android TV na mesma rede Wi-Fi.</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60 shrink-0">
                    Google Cast
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTriggerGoogleCast) {
                      onTriggerGoogleCast();
                    }
                  }}
                  className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-red-950/40 cursor-pointer active:scale-95"
                >
                  <Cast className="w-4 h-4" />
                  <span>Transmitir Agora no Chromecast</span>
                </button>
                <button
                  type="button"
                  onClick={handleReloadSdk}
                  className="px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  title="Recarregar serviço do Google Cast"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Redetectar</span>
                </button>
              </div>
            </div>

            {/* Card 2: Native Browser Remote Playback / AirPlay */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-sm">Seletor do Sistema</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                    Android / AirPlay
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Abre o seletor nativo do sistema operacional (Android Cast, Smart TV DLNA ou AirPlay).
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleTryNativeCast}
                  className="w-full px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow cursor-pointer active:scale-95"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Abrir Menu de Transmissão</span>
                </button>
                {nativeCastStatus && (
                  <p className="text-[10px] text-sky-400 mt-1.5 text-center font-medium animate-pulse">
                    {nativeCastStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Card 4: Native Browser Remote Playback / AirPlay */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-sm">Transmissão Nativa</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                    Sistema
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Abre o menu nativo de dispositivos de tela do seu sistema ou navegador (AirPlay, DLNA ou Chromecast).
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleTryNativeCast}
                  className="w-full px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow cursor-pointer active:scale-95"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Abrir Seletor do Sistema</span>
                </button>
                {nativeCastStatus && (
                  <p className="text-[10px] text-sky-300 text-center mt-1 font-mono">{nativeCastStatus}</p>
                )}
              </div>
            </div>

            {/* Card 5: Smart TV QR Code & Direct Stream Link */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-sm">Assistir na Smart TV</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Via Link / QR
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Abra o navegador da sua TV (LG webOS, Samsung Tizen ou Fire TV) ou aponte a câmera para ler o QR Code.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyStreamUrl}
                  className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow cursor-pointer active:scale-95"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition border ${
                    showQrCode
                      ? 'bg-neutral-700 text-white border-neutral-600'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                  title="Ver QR Code na tela"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrCode ? 'Ocultar QR' : 'Ver QR'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Viewer Overlay/Section */}
          {showQrCode && qrSvg && (
            <div
              id="cast-qr-box"
              className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200"
            >
              <div className="p-3 bg-white rounded-xl shadow-lg inline-block">
                <svg
                  viewBox={`0 0 ${qrSvg.size} ${qrSvg.size}`}
                  className="w-48 h-48 sm:w-56 sm:h-56"
                  shapeRendering="crispEdges"
                >
                  <path d={qrSvg.path} fill="#000000" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Aponte a câmera do celular ou da TV</p>
                <p className="text-[11px] text-neutral-400 max-w-sm font-mono truncate select-all">
                  {fullStreamUrl}
                </p>
              </div>
            </div>
          )}

          {/* Direct Address & Network Selector */}
          <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="font-bold text-neutral-400 shrink-0">Endereço de Rede Local:</span>
              <span className="font-mono text-emerald-400 font-semibold truncate select-all">
                {fullStreamUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {baseUrls.length > 1 && (
                <select
                  value={selectedBaseUrlIndex}
                  onChange={(e) => setSelectedBaseUrlIndex(Number(e.target.value))}
                  className="bg-neutral-800 text-neutral-300 text-xs rounded border border-neutral-700 px-2 py-1 outline-none cursor-pointer"
                  title="Múltiplas placas de rede detectadas"
                >
                  {baseUrls.map((url, idx) => (
                    <option key={url} value={idx}>
                      IP {idx + 1}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleCopyStreamUrl}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white transition font-mono flex items-center space-x-1"
                title="Copiar URL"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Browser Instructions Tabs */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                <span>Como transmitir pelo seu navegador:</span>
              </span>

              <button
                type="button"
                onClick={handleReloadSdk}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 transition cursor-pointer"
                title="Tentar recarregar o SDK do Google Cast"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-testar Conexão</span>
              </button>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setActiveGuideTab('chrome')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeGuideTab === 'chrome'
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Google Chrome (PC)
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('brave')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeGuideTab === 'brave'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Navegador Brave
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeGuideTab === 'mobile'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Celular (Android / iOS)
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('smarttv')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeGuideTab === 'smarttv'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Smart TV Direta
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-2.5 p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 text-xs text-neutral-300 space-y-2">
              {activeGuideTab === 'chrome' && (
                <div className="space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-white">Transmissão direta pelo Google Chrome no PC:</div>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      Clique no menu de <strong>3 pontinhos verticais (⋮)</strong> no canto superior direito do Chrome.
                    </li>
                    <li>
                      Selecione a opção <strong>"Transmitir..."</strong> (Cast...).
                    </li>
                    <li>
                      O Chrome listará sua TV ou Chromecast. Selecione o dispositivo e o vídeo começará a tocar na tela grande!
                    </li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'brave' && (
                <div className="space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-white">Como habilitar o Chromecast no Navegador Brave:</div>
                  <p className="text-neutral-400 text-[11px]">
                    O Brave bloqueia a detecção de aparelhos na rede local por padrão. Para liberar:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      Copie e abra o link:{' '}
                      <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded text-amber-300">
                        brave://settings/extensions
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBraveUrl}
                        className="ml-2 underline text-amber-400 hover:text-amber-300 cursor-pointer text-[10px]"
                      >
                        {copiedBrave ? 'Copiado!' : 'Copiar Link'}
                      </button>
                    </li>
                    <li>
                      Ative a chave da opção <strong>"Media router"</strong> (Roteador de mídia).
                    </li>
                    <li>Feche e reabra o Brave. O ícone de Cast funcionará nativamente!</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'mobile' && (
                <div className="space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-white">Transmitir do celular para a TV:</div>
                  <p className="text-neutral-400 text-[11px]">
                    No celular, os navegadores web bloqueiam o Cast em conexões HTTP comuns da rede Wi-Fi.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      <strong>Opção rápida:</strong> Toque no botão <strong>"Web Video Caster"</strong> acima. É o app gratuito mais usado no Brasil e conecta em qualquer Chromecast e Smart TV na hora!
                    </li>
                    <li>
                      <strong>Opção HTTPS:</strong> Se você estiver usando o CineLocal com HTTPS ativado, abra o endereço pelo Chrome no celular.
                    </li>
                  </ul>
                </div>
              )}

              {activeGuideTab === 'smarttv' && (
                <div className="space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-white">Assistir no navegador da sua Smart TV:</div>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px]">
                    <li>Abra o aplicativo de Internet da sua Smart TV (LG webOS, Samsung Internet ou Silk Browser).</li>
                    <li>
                      Digite o endereço do seu computador na barra da TV:{' '}
                      <strong className="text-emerald-400 font-mono">{activeBaseUrl}</strong>
                    </li>
                    <li>
                      Navegue pela sua biblioteca e assista a qualquer filme ou série direto pelo controle remoto!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Todos os dispositivos devem estar no mesmo Wi-Fi.</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
