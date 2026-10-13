import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, PictureInPicture2, Volume1, Volume2, VolumeX } from "lucide-react";

const HIDE_DELAY_MS = 3000;

const fullscreenSupported = typeof document !== "undefined" && (
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    (typeof HTMLVideoElement !== "undefined" && "webkitEnterFullscreen" in HTMLVideoElement.prototype)
);
const pipSupported = typeof document !== "undefined" && !!document.pictureInPictureEnabled;

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

/**
 * Overlay that sits above a live video. Before `activated` it only captures the first user
 * interaction (needed to unmute/autoplay). Afterwards it acts as auto-hiding player controls:
 * shown on mouse hover (desktop) or toggled by a tap (touch).
 */
export default function LiveVideoControls({ videoRef, containerRef, activated, statusText, onActivate }) {
    const [visible, setVisible] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPip, setIsPip] = useState(false);

    const hideTimerRef = useRef(null);
    const hoveringBarRef = useRef(false);
    const draggingRef = useRef(false);
    const pointerTypeRef = useRef("mouse");

    const clearHideTimer = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    const show = useCallback(() => {
        setVisible(true);
        clearHideTimer();
        hideTimerRef.current = setTimeout(() => {
            hideTimerRef.current = null;
            if (!hoveringBarRef.current && !draggingRef.current) {
                setVisible(false);
            }
        }, HIDE_DELAY_MS);
    }, [clearHideTimer]);

    const hide = useCallback(() => {
        clearHideTimer();
        setVisible(false);
    }, [clearHideTimer]);

    useEffect(() => clearHideTimer, [clearHideTimer]);

    useEffect(() => {
        if (activated) show();
    }, [activated, show]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const syncVolume = () => {
            setVolume(video.volume);
            setMuted(video.muted);
        };
        const onEnterPip = () => setIsPip(true);
        const onLeavePip = () => setIsPip(false);
        const onFullscreenChange = () => setIsFullscreen(!!getFullscreenElement());
        // iOS Safari only supports fullscreen on the <video> element itself
        const onIosBeginFullscreen = () => setIsFullscreen(true);
        const onIosEndFullscreen = () => setIsFullscreen(false);

        syncVolume();
        video.addEventListener("volumechange", syncVolume);
        video.addEventListener("enterpictureinpicture", onEnterPip);
        video.addEventListener("leavepictureinpicture", onLeavePip);
        video.addEventListener("webkitbeginfullscreen", onIosBeginFullscreen);
        video.addEventListener("webkitendfullscreen", onIosEndFullscreen);
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        return () => {
            video.removeEventListener("volumechange", syncVolume);
            video.removeEventListener("enterpictureinpicture", onEnterPip);
            video.removeEventListener("leavepictureinpicture", onLeavePip);
            video.removeEventListener("webkitbeginfullscreen", onIosBeginFullscreen);
            video.removeEventListener("webkitendfullscreen", onIosEndFullscreen);
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
        };
    }, [videoRef]);

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (getFullscreenElement()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else if (container?.requestFullscreen) {
            container.requestFullscreen().catch(err => console.warn("Fullscreen request failed", err));
        } else if (container?.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
        }
    }, [containerRef, videoRef]);

    const togglePip = useCallback(() => {
        const video = videoRef.current;
        if (!video || !pipSupported) return;
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(err => console.warn("Exiting picture-in-picture failed", err));
        } else {
            video.requestPictureInPicture().catch(err => console.warn("Picture-in-picture request failed", err));
        }
    }, [videoRef]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.muted || video.volume === 0) {
            if (video.volume === 0) video.volume = 1;
            video.muted = false;
        } else {
            video.muted = true;
        }
    }, [videoRef]);

    function onVolumeInput(event) {
        const video = videoRef.current;
        if (!video) return;
        const value = Number(event.target.value);
        video.volume = value;
        video.muted = value === 0;
    }

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !activated) return;

        const onKeyUp = (event) => {
            if (event.target instanceof HTMLInputElement && event.key.startsWith("Arrow")) return;
            const key = event.key.toLowerCase();
            if (key === "f") toggleFullscreen();
            else if (key === "p") togglePip();
            else if (key === "m") toggleMute();
            else return;
            show();
        };
        container.addEventListener("keyup", onKeyUp);
        return () => container.removeEventListener("keyup", onKeyUp);
    }, [containerRef, activated, toggleFullscreen, togglePip, toggleMute, show]);

    function onPointerDown(event) {
        pointerTypeRef.current = event.pointerType;
    }

    function onPointerMove(event) {
        if (activated && event.pointerType === "mouse") show();
    }

    function onPointerLeave(event) {
        if (activated && event.pointerType === "mouse" && !draggingRef.current) hide();
    }

    function onBackgroundClick(event) {
        if (event.target.closest(".live-controls-bar")) return;
        if (!activated) {
            onActivate();
            return;
        }
        if (pointerTypeRef.current === "mouse") {
            show();
        } else if (visible) {
            hide();
        } else {
            show();
        }
    }

    function onBackgroundDoubleClick(event) {
        if (!activated || pointerTypeRef.current !== "mouse") return;
        if (event.target.closest(".live-controls-bar")) return;
        toggleFullscreen();
    }

    function onBarPointerEnter(event) {
        if (event.pointerType === "mouse") hoveringBarRef.current = true;
    }

    function onBarPointerLeave(event) {
        if (event.pointerType !== "mouse") return;
        hoveringBarRef.current = false;
        show();
    }

    function onSliderPointerDown() {
        draggingRef.current = true;
        clearHideTimer();
        window.addEventListener("pointerup", () => {
            draggingRef.current = false;
            show();
        }, { once: true });
    }

    const effectiveVolume = muted ? 0 : volume;
    const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;
    const controlsShown = activated && visible;

    return <div
        className={"room-overlay" + (activated && !visible ? " room-overlay-idle" : "")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onBackgroundClick}
        onDoubleClick={onBackgroundDoubleClick}
    >
        {statusText && <span className="room-overlay-text">{statusText}</span>}
        {activated && <div
            className={"live-controls-bar" + (controlsShown ? " live-controls-visible" : "")}
            onPointerEnter={onBarPointerEnter}
            onPointerLeave={onBarPointerLeave}
            onPointerDown={show}
        >
            <div className="live-controls-group">
                <button type="button" className="live-controls-btn" onClick={toggleMute} title={effectiveVolume === 0 ? "Unmute (m)" : "Mute (m)"} aria-label={effectiveVolume === 0 ? "Unmute" : "Mute"}>
                    <VolumeIcon size={22} />
                </button>
                <input
                    type="range"
                    className="live-controls-volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={effectiveVolume}
                    onInput={onVolumeInput}
                    onChange={onVolumeInput}
                    onPointerDown={onSliderPointerDown}
                    style={{ "--volume-fill": `${effectiveVolume * 100}%` }}
                    aria-label="Volume"
                />
                <span className="live-controls-live-badge"><span className="live-controls-live-dot" />LIVE</span>
            </div>
            <div className="live-controls-group">
                {pipSupported && <button type="button" className="live-controls-btn" onClick={togglePip} title={isPip ? "Exit picture-in-picture (p)" : "Picture-in-picture (p)"} aria-label="Picture-in-picture">
                    <PictureInPicture2 size={22} />
                </button>}
                {fullscreenSupported && <button type="button" className="live-controls-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"} aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                    {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                </button>}
            </div>
        </div>}
    </div>;
}
