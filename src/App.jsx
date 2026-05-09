import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Cadastro from "./pages/Cadastro";
import ListaMoods from "./pages/ListaMoods";
import CriarMood from "./pages/CriarMood";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/moods" />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/moods" element={<ListaMoods />} />
        <Route path="/moods/novo" element={<CriarMood />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}