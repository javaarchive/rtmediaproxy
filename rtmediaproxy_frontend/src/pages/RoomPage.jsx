import { Link } from 'react-router-dom';

export default function RoomPage() {
  return (
    <>
      <h1>Ruh roh</h1>
      <p>
        Well I have no idea how you reached this but typically you want to go to a room by it's id with "/room/roomIdHere". Perhaps you want to <Link to="/">go back to the home page</Link>?
      </p>
    </>
  );
}
