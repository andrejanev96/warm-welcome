import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OnboardingProgressProvider } from "../context/OnboardingContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return isAuthenticated ? (
    <OnboardingProgressProvider>{children}</OnboardingProgressProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
