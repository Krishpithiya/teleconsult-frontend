"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "doctor" | "patient")[];
}

// Wrap any page that needs role-based access control:
// <RoleGuard allowedRoles={["patient"]}> ... </RoleGuard>

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard if wrong role
      if (user.role === "admin")   router.replace("/dashboard/admin");
      if (user.role === "doctor")  router.replace("/dashboard/doctor");
      if (user.role === "patient") router.replace("/dashboard/patient");
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // Show spinner while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Wrong role — render nothing (redirect in progress)
  if (user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
};

export default RoleGuard;