import Room from "./Room";
import { apiPath } from "../utils";
import { useEffect, useState } from "react";

export function RoomLoader(props) {
    const roomId = props.roomId;
    const [room, setRoom] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setRoom(null);
        fetch(apiPath(`/api/room/${roomId}`))
            .then(response => {
                if(response.status === 404) {
                    setNotFound(true);
                    throw new Error("Not Found");
                }
                return response.json()
            })
            .then(data => {
                setRoom(data);
            });
    }, [props.roomId]);

    return <div className="room-loader">
        {
            room != null && <>
                {room.features && room.features.includes("legacy") && <>
                    Legacy Support not initalized
                </>}
                {!room.features || !room.features.includes("legacy") && <>
                    <Room room={room} />
                </>}

            </>
        }
        {
            notFound && <>
                <div className="room-loader-not-found">
                    Room not found. Check spelling perhaps?
                </div>
            </>
        }
    </div>


}