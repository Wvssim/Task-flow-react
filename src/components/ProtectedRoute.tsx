import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from '../hooks';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
