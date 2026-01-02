import { DiscordMagicRedirect } from '../components/DiscordMagicRedirect';
import RoomJoin from '../components/RoomJoin';
import RoomLaunch from '../components/RoomLaunch';

export default function HomePage() {
  return (
    <>
      <h1>Welcome to rtmediaproxy!</h1>
      <p>
        A wrapper for <a href="https://github.com/Glimesh/broadcast-box/">Broadcast Box</a>.
      </p>
      <DiscordMagicRedirect />
      <h2>Join a Room</h2>
      <RoomJoin />
      <h2>Browser Stream Publisher</h2>
      <RoomLaunch />
    </>
  );
}
