import type { ReactNode } from "react"; // <-- Adicionado o "type" aqui
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route 
          path="/produtos" 
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}