import { useParams } from 'react-router-dom';
import { RoomLoader } from '../components/RoomLoader';

export default function RoomViewPage() {
  const { roomId } = useParams();
  
  return (
    <RoomLoader roomId={roomId} />
  );
}
