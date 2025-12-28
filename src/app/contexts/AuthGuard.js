'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ 
  allowedRoles, 
  userRole, 
  children, 
  onUnauthorized 
}) {
  const router = useRouter();

  useEffect(() => {
    if (!userRole) {
      router.push('/login');
    } else if (!allowedRoles.includes(userRole)) {
      onUnauthorized?.();
    }
  }, [userRole, allowedRoles, router, onUnauthorized]);

  return <>{children}</>;
}