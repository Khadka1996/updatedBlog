// client/src/app/logins/page.js
'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

function LoginContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
