import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Ye component kisi bhi private page ko "wrap" karega.
// Agar user login nahi hai, to use /login par bhej dega.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Jab tak hum check kar rahe hain (token valid hai ya nahi),
  // tab tak ek simple loading dikhate hain, warna flash of
  // "redirect to login" dikh jayega galti se.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <p className="text-ink-muted font-sans">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
