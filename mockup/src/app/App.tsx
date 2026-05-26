import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CatalogoPage from './pages/CatalogoPage';
import InstituicoesPage from './pages/InstituicoesPage';
import PlanosPage from './pages/PlanosPage';
import MinhaContaPage from './pages/MinhaContaPage';
import NotificacoesPage from './pages/NotificacoesPage';
import BuscaPage from './pages/BuscaPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/instituicoes" element={<InstituicoesPage />} />
        <Route path="/planos" element={<PlanosPage />} />
        <Route path="/minha-conta" element={<MinhaContaPage />} />
        <Route path="/notificacoes" element={<NotificacoesPage />} />
        <Route path="/busca" element={<BuscaPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
