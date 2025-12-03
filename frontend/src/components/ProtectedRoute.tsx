import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user } = useAuth();
  console.log("ProtectedRoute user:", user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
