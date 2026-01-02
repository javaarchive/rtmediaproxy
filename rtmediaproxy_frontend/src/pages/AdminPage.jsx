import AdminRoomlist from '../components/AdminRoomlist';

export default function AdminPage() {
  return (
    <>
      <h2>Server Rooms List</h2>
      <AdminRoomlist />
      <h2>Create Room</h2>
      <form action="/admin/api/room" method="post">
        <input type="text" name="roomId" placeholder="Room ID" />
        <textarea name="desc" placeholder="Describe the room"></textarea>
        <input type="hidden" name="frontend" value="true" />
        <button type="submit">Create Room</button>
      </form>
    </>
  );
}
