import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RoomJoin() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  
  return (
    <div>
      <input
        type="text"
        placeholder="Room Name"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
      />
      <button onClick={() => navigate(`/room/${roomId}`)}>Join Room</button>
    </div>
  );
}

export default RoomJoin;
