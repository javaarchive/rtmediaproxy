import { useState, useEffect } from "react";

export default function AdminRoomlist() {
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        fetch("/admin/api/rooms", {
            credentials: "same-origin"
        })
            .then(resp => resp.json())
            .then(setRooms);
    }, []);
    return (
        <>
        {
            rooms.length > 0 ? <ul>
            {rooms.map(room => (
                <li key={room.roomId}>
                    <a href={`/admin/room/${room.roomId}`}>{room.roomId}</a>
                </li>
            ))}</ul> : <p>No rooms found...yet?</p>
        }
        </>
    );
}