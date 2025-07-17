import { useEffect, useState } from "react";

export default function AdminRoomEdit(props) {
    const [room, setRoom] = useState(null);
    useEffect(() => {
        fetch(`/admin/api/room/${props.roomId}`, {
            credentials: "same-origin"
        })
            .then(resp => resp.json())
            .then(setRoom);
    }, [props.roomId]);
    return (
        <div>
            <h2>Room Details</h2>
            {/*
                Show room info
            */}
            {room && (
                <div>
                    <p>Room ID: {props.roomId}</p>
                    <p>Description: {room.desc}</p>
                    <p>Created At: {room.createdAt}</p>
                    <h3>Features:</h3>
                    <ul>
                        {
                            room.features.length > 0 ? room.features.map(feature => (
                                <li key={feature}>{feature}</li>
                            )) : <li>No extra features enabled for this room.</li>
                        }
                    </ul>
                    <h3>Linked Channels:</h3>
                    <ul>
                        {
                            room.channels.length > 0 ? room.channels.map(channel => (
                                <li key={channel}>{channel}</li>
                            )) : <li>No channels linked to this room.</li>
                        }
                    </ul>
                    <h3>Linked Keys:</h3>
                    <ul>
                        {
                            room.keys.length > 0 ? room.keys.map(key => (
                                <li key={key} className="stream-key">{key}</li>
                            )) : <li>No stream keys created for this room.</li>
                        }
                    </ul>
                    <h3>Make changes to the room:</h3>
                    <form action={`/admin/api/room/${encodeURIComponent(props.roomId)}`} method="post">
                        <input type="hidden" name="frontend" value="true" />
                        <label htmlFor="key">Key of attribute to change:</label>
                        <select name="key">
                            <option value="channels">Channels</option>
                            <option value="keys">Keys</option>
                            <option value="features">Features</option>
                        </select>
                        <label htmlFor="value">Value to change to:</label>
                        <input type="text" name="value" placeholder="Value" />
                        <label htmlFor="delete">Delete value?</label>
                        <input type="checkbox" name="delete" />
                        <button type="submit">Update</button>
                    </form>
                </div>
            )}
        </div>
    );
}