'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const DynamicLoginForm = dynamic(
  () => import('./LoginForm'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
      </div>
    )
  }
);

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <DynamicLoginForm />
    </Suspense>
  );
}