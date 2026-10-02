package com.cinelocal.app;

import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;
import androidx.fragment.app.FragmentActivity;
import androidx.mediarouter.app.MediaRouteChooserDialogFragment;
import androidx.mediarouter.app.MediaRouteControllerDialogFragment;
import androidx.mediarouter.media.MediaRouteSelector;
import androidx.mediarouter.media.MediaRouter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.cast.MediaInfo;
import com.google.android.gms.cast.MediaLoadRequestData;
import com.google.android.gms.cast.MediaMetadata;
import com.google.android.gms.cast.MediaStatus;
import com.google.android.gms.cast.framework.CastContext;
import com.google.android.gms.cast.framework.CastSession;
import com.google.android.gms.cast.framework.SessionManager;
import com.google.android.gms.cast.framework.SessionManagerListener;
import com.google.android.gms.cast.framework.media.RemoteMediaClient;

@CapacitorPlugin(name = "GoogleCast")
public class GoogleCastPlugin extends Plugin {

    private CastContext castContext;
    private CastSession currentSession;
    private RemoteMediaClient remoteMediaClient;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable progressUpdater;

    private final SessionManagerListener<CastSession> sessionManagerListener = new SessionManagerListener<CastSession>() {
        @Override
        public void onSessionStarting(@NonNull CastSession session) {
            notifySessionEvent("starting", session);
        }

        @Override
        public void onSessionStarted(@NonNull CastSession session, @NonNull String sessionId) {
            currentSession = session;
            setupRemoteMediaClient(session);
            notifySessionEvent("started", session);
        }

        @Override
        public void onSessionStartFailed(@NonNull CastSession session, int error) {
            currentSession = null;
            notifySessionEvent("start_failed", session);
        }

        @Override
        public void onSessionEnding(@NonNull CastSession session) {
            notifySessionEvent("ending", session);
        }

        @Override
        public void onSessionEnded(@NonNull CastSession session, int error) {
            currentSession = null;
            stopProgressUpdater();
            notifySessionEvent("ended", session);
        }

        @Override
        public void onSessionResuming(@NonNull CastSession session, @NonNull String sessionId) {
            notifySessionEvent("resuming", session);
        }

        @Override
        public void onSessionResumed(@NonNull CastSession session, boolean wasSuspended) {
            currentSession = session;
            setupRemoteMediaClient(session);
            notifySessionEvent("resumed", session);
        }

        @Override
        public void onSessionResumeFailed(@NonNull CastSession session, int error) {
            currentSession = null;
            notifySessionEvent("resume_failed", session);
        }

        @Override
        public void onSessionSuspended(@NonNull CastSession session, int reason) {
            notifySessionEvent("suspended", session);
        }
    };

    @Override
    public void load() {
        super.load();
        mainHandler.post(() -> {
            try {
                castContext = CastContext.getSharedInstance(getContext());
                if (castContext != null) {
                    SessionManager sm = castContext.getSessionManager();
                    sm.addSessionManagerListener(sessionManagerListener, CastSession.class);
                    currentSession = sm.getCurrentCastSession();
                    if (currentSession != null) {
                        setupRemoteMediaClient(currentSession);
                    }
                }
            } catch (Exception e) {
                // Play services may be unavailable or updating
            }
        });
    }

    private void setupRemoteMediaClient(CastSession session) {
        remoteMediaClient = session.getRemoteMediaClient();
        if (remoteMediaClient != null) {
            remoteMediaClient.registerCallback(new RemoteMediaClient.Callback() {
                @Override
                public void onStatusUpdated() {
                    notifyMediaStatus();
                }
            });
            startProgressUpdater();
        }
    }

    private void startProgressUpdater() {
        stopProgressUpdater();
        progressUpdater = new Runnable() {
            @Override
            public void run() {
                if (remoteMediaClient != null && currentSession != null && currentSession.isConnected()) {
                    long streamPosition = remoteMediaClient.getApproximateStreamPosition();
                    long duration = remoteMediaClient.getStreamDuration();
                    boolean isPlaying = remoteMediaClient.isPlaying();

                    JSObject ret = new JSObject();
                    ret.put("currentTime", streamPosition / 1000.0);
                    ret.put("duration", duration / 1000.0);
                    ret.put("isPlaying", isPlaying);
                    ret.put("playerState", remoteMediaClient.getPlayerState());
                    notifyListeners("castMediaProgress", ret);

                    mainHandler.postDelayed(this, 1000);
                }
            }
        };
        mainHandler.post(progressUpdater);
    }

    private void stopProgressUpdater() {
        if (progressUpdater != null) {
            mainHandler.removeCallbacks(progressUpdater);
            progressUpdater = null;
        }
    }

    private void notifySessionEvent(String eventName, CastSession session) {
        JSObject ret = new JSObject();
        ret.put("event", eventName);
        ret.put("isConnected", session != null && session.isConnected());
        if (session != null) {
            CastDevice device = session.getCastDevice();
            if (device != null) {
                ret.put("deviceName", device.getFriendlyName());
                ret.put("deviceId", device.getDeviceId());
            }
        }
        notifyListeners("castSessionStateChanged", ret);
    }

    private void notifyMediaStatus() {
        if (remoteMediaClient == null) return;
        MediaStatus status = remoteMediaClient.getMediaStatus();
        JSObject ret = new JSObject();
        if (status != null) {
            ret.put("playerState", status.getPlayerState());
            ret.put("idleReason", status.getIdleReason());
            ret.put("currentTime", remoteMediaClient.getApproximateStreamPosition() / 1000.0);
            ret.put("duration", remoteMediaClient.getStreamDuration() / 1000.0);
            ret.put("isPlaying", remoteMediaClient.isPlaying());
        }
        notifyListeners("castMediaStatusChanged", ret);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            boolean available = (castContext != null);
            ret.put("isAvailable", available);
            ret.put("hasActiveSession", currentSession != null && currentSession.isConnected());
            if (currentSession != null && currentSession.getCastDevice() != null) {
                ret.put("deviceName", currentSession.getCastDevice().getFriendlyName());
            }
            call.resolve(ret);
        } catch (Exception e) {
            ret.put("isAvailable", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void showCastPicker(PluginCall call) {
        mainHandler.post(() -> {
            try {
                if (getActivity() instanceof FragmentActivity) {
                    FragmentActivity activity = (FragmentActivity) getActivity();
                    if (currentSession != null && currentSession.isConnected()) {
                        MediaRouteControllerDialogFragment controllerDialog = new MediaRouteControllerDialogFragment();
                        controllerDialog.show(activity.getSupportFragmentManager(), "cast_controller");
                    } else {
                        MediaRouteSelector selector = new MediaRouteSelector.Builder()
                                .addControlCategory(CastMediaControlIntent.categoryForCast(
                                        CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID))
                                .build();

                        MediaRouteChooserDialogFragment dialogFragment = new MediaRouteChooserDialogFragment();
                        dialogFragment.setRouteSelector(selector);
                        dialogFragment.show(activity.getSupportFragmentManager(), "cast_chooser");
                    }

                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                } else {
                    call.reject("Activity não é FragmentActivity");
                }
            } catch (Exception e) {
                call.reject("Erro ao abrir seletor de Cast: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void loadMedia(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("URL de mídia é obrigatória");
            return;
        }

        String title = call.getString("title", "CineLocal");
        String subtitle = call.getString("subtitle", "");
        String contentType = call.getString("contentType", "video/mp4");
        double positionSec = call.getDouble("position", 0.0);
        boolean autoplay = call.getBoolean("autoplay", true);

        mainHandler.post(() -> {
            try {
                if (currentSession == null || !currentSession.isConnected()) {
                    call.reject("Nenhum Chromecast conectado no momento");
                    return;
                }

                RemoteMediaClient client = currentSession.getRemoteMediaClient();
                if (client == null) {
                    call.reject("Cliente de mídia do Cast indisponível");
                    return;
                }

                MediaMetadata metadata = new MediaMetadata(MediaMetadata.MEDIA_TYPE_MOVIE);
                metadata.putString(MediaMetadata.KEY_TITLE, title);
                if (subtitle != null && !subtitle.isEmpty()) {
                    metadata.putString(MediaMetadata.KEY_SUBTITLE, subtitle);
                }

                MediaInfo mediaInfo = new MediaInfo.Builder(url)
                        .setStreamType(MediaInfo.STREAM_TYPE_BUFFERED)
                        .setContentType(contentType)
                        .setMetadata(metadata)
                        .build();

                MediaLoadRequestData loadRequestData = new MediaLoadRequestData.Builder()
                        .setMediaInfo(mediaInfo)
                        .setAutoplay(autoplay)
                        .setCurrentTime((long) (positionSec * 1000))
                        .build();

                client.load(loadRequestData);

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Falha ao carregar mídia no Chromecast: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void play(PluginCall call) {
        mainHandler.post(() -> {
            if (remoteMediaClient != null) {
                remoteMediaClient.play();
                call.resolve(new JSObject().put("success", true));
            } else {
                call.reject("Cast não conectado");
            }
        });
    }

    @PluginMethod
    public void pause(PluginCall call) {
        mainHandler.post(() -> {
            if (remoteMediaClient != null) {
                remoteMediaClient.pause();
                call.resolve(new JSObject().put("success", true));
            } else {
                call.reject("Cast não conectado");
            }
        });
    }

    @PluginMethod
    public void seek(PluginCall call) {
        Double positionSec = call.getDouble("position");
        if (positionSec == null) {
            call.reject("Posição é obrigatória");
            return;
        }

        mainHandler.post(() -> {
            if (remoteMediaClient != null) {
                remoteMediaClient.seek((long) (positionSec * 1000));
                call.resolve(new JSObject().put("success", true));
            } else {
                call.reject("Cast não conectado");
            }
        });
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        Double volume = call.getDouble("volume");
        if (volume == null) {
            call.reject("Volume é obrigatório");
            return;
        }

        mainHandler.post(() -> {
            try {
                if (currentSession != null && currentSession.isConnected()) {
                    currentSession.setVolume(Math.max(0.0, Math.min(1.0, volume)));
                    call.resolve(new JSObject().put("success", true));
                } else {
                    call.reject("Cast não conectado");
                }
            } catch (Exception e) {
                call.reject("Erro ao alterar volume: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        mainHandler.post(() -> {
            try {
                if (castContext != null) {
                    castContext.getSessionManager().endCurrentSession(true);
                }
                currentSession = null;
                stopProgressUpdater();
                call.resolve(new JSObject().put("success", true));
            } catch (Exception e) {
                call.reject("Erro ao desconectar: " + e.getMessage());
            }
        });
    }
}
