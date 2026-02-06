import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
                    <Link to={`/admin/room/${room.roomId}`}>{room.roomId}</Link>
                </li>
            ))}</ul> : <p>No rooms found...yet?</p>
        }
        </>
    );
}
