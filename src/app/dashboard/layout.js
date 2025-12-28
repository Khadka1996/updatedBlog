'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, theme, ConfigProvider, Spin, Result, Button, notification } from 'antd';
import { 
  LoadingOutlined, 
  LockOutlined, 
  WarningOutlined, 
  LoginOutlined 
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthGuard from '../contexts/AuthGuard';

const { Content } = Layout;

const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

const TOKEN_REFRESH_THRESHOLD = 300000; // 5 minutes before expiry

const DashboardLayout = ({ children }) => {
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [authState, setAuthState] = useState({
    loading: true,
    error: null,
    user: null
  });
  const router = useRouter();

  // Clear auth data and force logout
  const clearAuthData = useCallback(() => {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setAuthState({ loading: false, error: ERROR_CODES.UNAUTHORIZED, user: null });
  }, []);

  // Verify session and handle token refresh
  const verifySession = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (!refreshResponse.ok) throw new Error(ERROR_CODES.UNAUTHORIZED);

        const retryResponse = await fetch('/api/users/me', { credentials: 'include' });
        if (!retryResponse.ok) throw new Error(ERROR_CODES.UNAUTHORIZED);

        const { data } = await retryResponse.json();
        return setAuthState({ loading: false, error: null, user: data.user });
      }

      if (response.ok) {
        const { data } = await response.json();
        
        if (data.expiresAt) {
          const expiresIn = new Date(data.expiresAt).getTime() - Date.now();
          const refreshTime = Math.max(0, expiresIn - TOKEN_REFRESH_THRESHOLD);
          setTimeout(() => {
            fetch('/api/auth/refresh', { 
              method: 'POST', 
              credentials: 'include' 
            }).catch(console.error);
          }, refreshTime);
        }

        setAuthState({ loading: false, error: null, user: data.user });
      } else {
        throw new Error(
          response.status === 403 ? ERROR_CODES.FORBIDDEN : 
          response.status === 503 ? ERROR_CODES.MAINTENANCE_MODE : 
          ERROR_CODES.NETWORK_ERROR
        );
      }
    } catch (error) {
      console.error('Session error:', error);
      clearAuthData();
      if (!window.location.pathname.startsWith('/login')) {
        notification.error({
          message: 'Session Error',
          description: error.message,
          placement: 'topRight'
        });
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      }
    }
  }, [router, clearAuthData]);

  // Initialize session check
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Loading state
  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: colorPrimary }} spin />}
          tip="Loading dashboard..."
          size="large"
        />
      </div>
    );
  }

  // Error state
  if (authState.error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Result
          status={
            authState.error === ERROR_CODES.FORBIDDEN ? '403' : 
            authState.error === ERROR_CODES.MAINTENANCE_MODE ? 'warning' : 
            'error'
          }
          icon={
            authState.error === ERROR_CODES.FORBIDDEN ? <LockOutlined /> : 
            authState.error === ERROR_CODES.MAINTENANCE_MODE ? <WarningOutlined /> : 
            null
          }
          title={
            authState.error === ERROR_CODES.FORBIDDEN ? 'Access Denied' : 
            authState.error === ERROR_CODES.MAINTENANCE_MODE ? 'Maintenance Mode' : 
            'Session Error'
          }
          subTitle={
            authState.error === ERROR_CODES.FORBIDDEN
              ? "You don't have permission to access this dashboard"
              : authState.error === ERROR_CODES.MAINTENANCE_MODE
              ? 'System is under maintenance. Please try again later.'
              : 'Your session has expired. Please login again.'
          }
          extra={
            <Button 
              type="primary" 
              icon={<LoginOutlined />}
              onClick={() => {
                clearAuthData();
                router.push('/login');
              }}
            >
              Return to Login
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: colorBgContainer,
            headerPadding: '0 24px',
            headerHeight: 64,
          },
        },
      }}
    >
      <AuthGuard 
        allowedRoles={['admin', 'moderator']} 
        userRole={authState.user?.role}
        onUnauthorized={() => {
          clearAuthData();
          router.push('/');
        }}
      >
        <Layout className="min-h-screen">
          <Sidebar 
            user={authState.user} 
            collapsed={collapsed} 
            setCollapsed={setCollapsed}
          />
          <Layout className={`transition-all ${collapsed ? 'ml-20' : 'ml-64'}`}>
            <Header 
              user={authState.user} 
              collapsed={collapsed}
              onLogout={() => {
                fetch('/api/users/logout', { 
                  method: 'POST', 
                  credentials: 'include' 
                }).finally(clearAuthData);
              }}
            />
            <Content className="m-4 overflow-auto">
              <div 
                className="p-4 md:p-6 h-full" 
                style={{ 
                  background: colorBgContainer,
                  borderRadius: 8,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                }}
              >
                {children}
              </div>
            </Content>
          </Layout>
        </Layout>
      </AuthGuard>
    </ConfigProvider>
  );
};

export default DashboardLayout;