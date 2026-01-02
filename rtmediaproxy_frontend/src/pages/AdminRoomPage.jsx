import { useParams } from 'react-router-dom';
import AdminRoomEdit from '../components/AdminRoomEdit';

export default function AdminRoomPage() {
  const { roomId } = useParams();
  
  return (
    <AdminRoomEdit roomId={roomId} />
  );
}
