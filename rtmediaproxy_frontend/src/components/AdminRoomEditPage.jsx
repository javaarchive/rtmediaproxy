import AdminRoomEdit from "./AdminRoomEdit";

const PREFIX = "/admin/room/";

export default function AdminRoomEditPage(props) {
    let roomId = decodeURIComponent(location.pathname.slice(PREFIX.length));
    return (
        <AdminRoomEdit roomId={roomId} />
    )
}