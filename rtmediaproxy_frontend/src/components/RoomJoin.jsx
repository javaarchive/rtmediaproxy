import { useState } from "react";

function RoomJoin() {
  const [roomId, setRoomId] = useState("");
  return (
    <div>
      <input
        type="text"
        placeholder="Room Name"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
      />
      <button onClick={() => (location.href = `/room/${roomId}`)}>Join Room</button>
    </div>
  );
}

export default RoomJoin;
