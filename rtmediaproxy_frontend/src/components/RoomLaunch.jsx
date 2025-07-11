import { useState } from "react";

function RoomLaunch() {
  const [roomkey, setRoomKey] = useState("");
  return (
    <div>
      <input
        type="password"
        placeholder="Secret Room Key"
        value={roomkey}
        name="room-key"
        onChange={e => setRoomKey(e.target.value)}
      />
      <button onClick={() => (location.href = `/publish/${roomkey}`)} title="Do not share the link to the publish page with anyone you to do not trust as it literally contains your stream key.">Publish</button>
    </div>
  );
}

export default RoomLaunch;
