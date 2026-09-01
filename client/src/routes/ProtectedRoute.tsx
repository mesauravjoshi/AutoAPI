// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// import VerifyToken from "@/pages/VerifyToken";

export default function ProtectedRoute() {
  const { user } = useAuth();
  console.log(user);
  
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
