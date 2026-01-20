import React from "react";
import { useAuth } from "./AuthProvider";

export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user?.permissions?.includes(permission)) {
    return <>{fallback ?? <p className="muted">无权限：{permission}</p>}</>;
  }

  return <>{children}</>;
}

