import { useEffect, useRef, useState } from "react";
import { acquireWebRTC, apiPath } from "../utils";
import LiveVideoControls from "./LiveVideoControls";

// adapted from
export default function Room(props) {
    const [overlayText, setOverlayText] = useState("");
    const [activated, setActivated] = useState(false);
    const activatedRef = useRef(false);
    const containerRef = useRef(null);
    const [sdpOffer, setSdpOffer] = useState("");
    const videoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const room = props.room;

    function startPlayback() {
        const video = videoRef.current;
        if(!video) return;
        video.muted = false;
        video.play().catch(err => console.warn("Playback failed to start", err));
        setOverlayText("");
    }
    
    useEffect(() => {
        // connection process
        setOverlayText("Initializing stream parameters...");

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

            videoRef.current.srcObject = event.streams[0];

            if(activatedRef.current) {
                startPlayback();
            } else {
                setOverlayText("Click to start playback");
            }
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

    function onActivate() {
        activatedRef.current = true;
        setActivated(true);
        startPlayback();
    }

    return <div ref={containerRef} className="room" id={"room-" + room.id} data-room-id={room.id} tabIndex={0}>
        <div className="room-media">
            <video ref={videoRef} playsInline className="room-media-video"></video>
        </div>
        <LiveVideoControls
            videoRef={videoRef}
            containerRef={containerRef}
            activated={activated}
            statusText={overlayText}
            onActivate={onActivate}
        />
    </div>
}
