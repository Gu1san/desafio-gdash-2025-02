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
import App from "./App";
import { InsightsProvider } from "./contexts/InsightsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <WeatherProvider>
        <InsightsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Layout com sidebar */}
              <Route
                element={
                  <ProtectedRoute>
                    <App />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/weather" element={<div>Weather</div>} />
                <Route path="/settings" element={<div>Settings</div>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </InsightsProvider>
      </WeatherProvider>
    </AuthProvider>
  </React.StrictMode>
);
