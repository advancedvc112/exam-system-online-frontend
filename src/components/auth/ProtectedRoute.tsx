import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactElement;
}) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

