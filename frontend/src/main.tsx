import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { WeatherProvider } from "./contexts/WeatherContext";
import { InsightsProvider } from "./contexts/InsightsContext";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <WeatherProvider>
          <InsightsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <App />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </InsightsProvider>
        </WeatherProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
