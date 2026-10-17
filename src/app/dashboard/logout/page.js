'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Result, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { markAdminBrowser } from '../../components/ads/adsClient';

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    markAdminBrowser(false);
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Result
        icon={<LogoutOutlined className="text-[#174fa2]" />}
        title="Sign out of the dashboard?"
        subTitle="You will need to sign in again to manage the site."
        extra={[
          <Button key="cancel" onClick={() => router.back()}>Stay signed in</Button>,
          <Button key="logout" type="primary" danger loading={loading} onClick={logout}>Sign out</Button>,
        ]}
      />
    </div>
  );
}
