import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
  forbiddenRedirect = "/",
}) {
  const { user, isAuthLoading } = useContext(AuthContext) || {};

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={forbiddenRedirect} replace />;
    }
  }

  return children;
}
