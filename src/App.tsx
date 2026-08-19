import type { ReactNode } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Users from "./pages/Users";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // Navegação global simples para rotas protegidas
  return (
    <div className="min-h-screen bg-muted/20">
      <nav className="bg-white border-b px-8 py-4 flex gap-6 items-center shadow-sm">
        <span className="font-bold text-xl mr-4">Viero Stock</span>
        <Link to="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
        <Link to="/produtos" className="text-sm font-medium hover:text-primary">Catálogo</Link>
        <Link to="/estoque" className="text-sm font-medium hover:text-primary">Estoque</Link>
        <Link to="/usuarios" className="text-sm font-medium hover:text-primary">Usuários</Link>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Sair
        </Button>
      </nav>
      {children}
    </div>
  );
};

// Precisamos simular o Button aqui no App.tsx para o menu não quebrar
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/produtos" element={<PrivateRoute><Products /></PrivateRoute>} />
        
        {/* Nova Rota de Estoque */}
        <Route path="/estoque" element={<PrivateRoute><Inventory /></PrivateRoute>} />

        <Route path="/usuarios" element={<PrivateRoute><Users /></PrivateRoute>} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        <Route path="/usuarios" element={<PrivateRoute><Users /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}