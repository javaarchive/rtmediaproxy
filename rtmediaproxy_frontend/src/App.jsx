import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiscordPage from './pages/DiscordPage';
import RoomPage from './pages/RoomPage';
import RoomViewPage from './pages/RoomViewPage';
import AdminPage from './pages/AdminPage';
import AdminRoomPage from './pages/AdminRoomPage';

function Layout({ children, fluid = false }) {
  const [searchParams] = useSearchParams();
  const isFullscreen = searchParams.has('fullscreen');
  
  useEffect(() => {
    const main = document.getElementById('main');
    if (main && isFullscreen) {
      main.classList.remove('container');
      main.classList.remove('container-fluid');
      main.classList.add('container-fullscreen');
    }
  }, [isFullscreen]);

  const containerClass = isFullscreen ? 'container-fullscreen' : (fluid ? 'container-fluid' : 'container');

  return (
    <main className={containerClass} id="main">
      {children}
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/discord" element={<Layout><DiscordPage /></Layout>} />
      <Route path="/room" element={<Layout fluid><RoomPage /></Layout>} />
      <Route path="/room/:roomId" element={<Layout fluid><RoomViewPage /></Layout>} />
      <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
      <Route path="/admin/room/:roomId" element={<Layout><AdminRoomPage /></Layout>} />
    </Routes>
  );
}
