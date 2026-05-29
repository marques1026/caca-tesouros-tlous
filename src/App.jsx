import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { JogoProvider } from './context/JogoContext.jsx';
import Opening from './pages/Opening.jsx';
import Map from './pages/Map.jsx';
import Quiz from './pages/Quiz.jsx';
import Inventory from './pages/Inventory.jsx';
import FinalPuzzle from './pages/FinalPuzzle.jsx';
import Conclusion from './pages/Conclusion.jsx';
import StatusBanner from './components/StatusBanner.jsx';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [gpsAtivo, setGpsAtivo] = useState(false);
  const [posicaoJogador, setPosicaoJogador] = useState(null);

  useEffect(() => {
    const online = () => setOnline(true);
    const offline = () => setOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsAtivo(true);
        setPosicaoJogador({ lat: pos.coords.latitude, lng: pos.coords.longitude });

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsAtivo(true);
            setPosicaoJogador({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => setGpsAtivo(false),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );
      },
      () => setGpsAtivo(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <JogoProvider>
      <BrowserRouter>
        <StatusBanner online={online} gpsAtivo={gpsAtivo} />
        <Routes>
          <Route path="/" element={<Opening />} />
          <Route path="/mapa" element={<Map gpsAtivo={gpsAtivo} posicaoJogador={posicaoJogador} />} />
          <Route path="/quiz/:idPonto" element={<Quiz />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/enigma-final" element={<FinalPuzzle />} />
          <Route path="/conclusao" element={<Conclusion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NavBar />
      </BrowserRouter>
    </JogoProvider>
  );
}
