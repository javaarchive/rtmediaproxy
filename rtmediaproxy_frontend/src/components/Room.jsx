import { set } from "astro:schema";
import { useEffect, useRef, useState } from "react";
import { acquireWebRTC, apiPath } from "../utils";

// adapted from
export default function Room(props) {
    const [overlayText, setOverlayText] = useState("");
    const [hasControls , setHasControls] = useState(true);
    const [sdpOffer, setSdpOffer] = useState("");
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const room = props.room;
    
    useEffect(() => {
        // connection process
        setOverlayText("Initializing stream parameters...");
        // allow controls during this stage for debug
        setHasControls(true);

        const RTCPeerConnectionUniversial = acquireWebRTC();

        peerConnectionRef.current = new RTCPeerConnectionUniversial();

        return () => {
            // cleanup code
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        
    }, [props.room]);

    useEffect(() => {
        if(!peerConnectionRef.current) return;

        /** @type {RTCPeerConnection} */
        const peerConnection = peerConnectionRef.current;

        const onTrack = (event) => {
            if(!videoRef.current) {
                console.warn("videoRef is null when got track event");
                return;
            }

            setOverlayText("Click to start playback");

            videoRef.current.srcObject = event.streams[0];
        };

        peerConnection.addEventListener("track", onTrack);

        peerConnection.addTransceiver("audio", { direction: "recvonly" });
        peerConnection.addTransceiver("video", { direction: "recvonly" });

        peerConnection.createOffer().then((offer) => {

            // stereo hack, I've seen this quite a bit atp
            // this is the broadcast box code but without handling video layers properly atm
            offer["sdp"] = offer["sdp"].replace("useinbandfec=1", "useinbandfec=1;stereo=1");
            setSdpOffer(offer["sdp"]);
            console.log("offer", offer);

            peerConnection.setLocalDescription(offer);

            setOverlayText("Connecting to service...");
        
            fetch(apiPath("/api/whep"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/sdp",
                    "Authorization": `Bearer ${room.id}`
                },
                body: offer["sdp"]
            }).then(response => {

                return response.text();
            }).then(answer => {
                console.log("answer", answer);
                setOverlayText("Connected to service. Waiting for stream...");
                peerConnection.setRemoteDescription({
                    sdp: answer,
                    type: "answer"
                });
            });
        })

        return () => {
            peerConnection.removeEventListener("track", onTrack);
        };
        

    }, [peerConnectionRef])

    if(room.structType !== "public" || room.type !== "room") {
        console.warn("Invalid room data", room);
        return <div>Invalid room data</div>;
    }

    function onUserInteraction(event) {
        if(videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play();
            setOverlayText("");
        }
    }

    function onKeyUp(event) {
        // check for F key
        if(event.key === "f"){
            console.log("fullscreen");
            if(videoRef.current) {
                if(document.fullscreenElement == videoRef.current) {
                    document.exitFullscreen();
                } else {
                    videoRef.current.requestFullscreen();
                }
            }
        }else if(event.key == "p"){
            // request pip
            if(videoRef.current) {
                videoRef.current.requestPictureInPicture();
            }
        }
    }

    return <div className="room" id={"room-" + room.id} data-room-id={room.id} onKeyUp={onKeyUp} onTouchEnd={onUserInteraction} tabIndex={0}>
        <div className="room-media">
            <video ref={videoRef} controls={hasControls} className="room-media-video"></video>
        </div>
        <div className="room-overlay" onClick={onUserInteraction} onMouseDownCapture={onUserInteraction}>
            <span className="room-overlay-text">
                {overlayText}
            </span>
        </div>
    </div>
}