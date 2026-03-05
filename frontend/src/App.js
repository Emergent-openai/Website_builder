import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "@/App.css";
import { ProtectedRoute, PublicOnlyRoute, RootRedirect } from "@/components/auth/RouteGuards";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import BuilderPage from "@/pages/BuilderPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <div className="min-h-screen" data-testid="creative-studio-app">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/auth"
                element={(
                  <PublicOnlyRoute>
                    <AuthPage />
                  </PublicOnlyRoute>
                )}
              />
              <Route
                path="/dashboard"
                element={(
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/builder/:projectId"
                element={(
                  <ProtectedRoute>
                    <BuilderPage />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
