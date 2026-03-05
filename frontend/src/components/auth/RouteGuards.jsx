import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";


const LoadingScreen = () => (
  <div className="builder-shell flex min-h-screen items-center justify-center text-white" data-testid="auth-loading-screen">
    <div className="panel-shell rounded-[2.1rem] px-7 py-6">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_24px_rgba(99,102,241,0.8)]" />
        <span className="text-sm font-medium text-zinc-200">Restoring your workspace…</span>
      </div>
    </div>
  </div>
);


export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/auth" />;
  }

  return children;
};


export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
};


export const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Navigate replace to={isAuthenticated ? "/dashboard" : "/auth"} />;
};