import { RoomLoader } from "./RoomLoader";

const PREFIX = "/room/";

export default function RoomLoaderAutomatic() {

    let roomId = decodeURIComponent(location.pathname.slice(PREFIX.length));
    
    return (
        <RoomLoader roomId={roomId} />
    );
}