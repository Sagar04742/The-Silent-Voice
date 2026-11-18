import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Home from "./pages/Home";
import { Login, Register } from "./pages/Auth";

// Everything except /login and /register requires a signed-in user.
function Protected({ children }) {
  const { user, authReady } = useApp();
  const location = useLocation();
  if (!authReady) return <div className="splash" role="status" aria-label="Loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

// Signed-in users have no business on the login pages.
function PublicOnly({ children }) {
  const { user, authReady } = useApp();
  if (!authReady) return <div className="splash" role="status" aria-label="Loading"><div className="spinner" /></div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
