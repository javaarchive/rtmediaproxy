import DiscordRoomRedirector from '../components/DiscordRoomRedirector';
import { Link } from 'react-router-dom';

export default function DiscordPage() {
  return (
    <>
      <h1>Welcome to your Discord Activity!</h1>
      <DiscordRoomRedirector />
      <br />
      <p>Not actually in Discord? Click <Link to="/">here</Link> to return to the application.</p>
    </>
  );
}
