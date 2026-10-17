'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tag, Avatar, Skeleton, Popconfirm, Empty, Alert, Descriptions, message } from 'antd';
import {
  UserOutlined, LockOutlined, LaptopOutlined, SafetyOutlined, LogoutOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { markAdminBrowser } from '../../components/ads/adsClient';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const when = (d) => (d ? new Date(d).toLocaleString() : '—');

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstError = Array.isArray(json.errors) ? json.errors[0]?.msg : null;
    throw new Error(firstError || json.message || 'Request failed');
  }
  return json;
}

export default function ProfilePage() {
  const [msg, msgHolder] = message.useMessage();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState(null);
  const [devices, setDevices] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const loadUser = useCallback(async () => {
    try {
      const json = await api('/api/users/me');
      setUser(json.data.user);
      profileForm.setFieldsValue({ username: json.data.user.username, email: json.data.user.email });
    } catch (err) {
      setError(err.message);
    }
  }, [profileForm]);

  const loadSecurity = useCallback(async () => {
    const [s, d] = await Promise.allSettled([api('/api/users/sessions'), api('/api/users/trusted-devices')]);
    setSessions(s.status === 'fulfilled' ? s.value.data.sessions : []);
    setDevices(d.status === 'fulfilled' ? d.value.data.devices : []);
  }, []);

  useEffect(() => { loadUser(); loadSecurity(); }, [loadUser, loadSecurity]);

  const saveProfile = async (values) => {
    setSavingProfile(true);
    try {
      const json = await api('/api/users/update-profile', { method: 'PATCH', body: JSON.stringify(values) });
      setUser((u) => ({ ...u, ...json.data.user }));
      msg.success('Profile updated');
    } catch (err) {
      msg.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (values) => {
    setSavingPassword(true);
    try {
      await api('/api/users/change-password', { method: 'POST', body: JSON.stringify(values) });
      msg.success('Password changed — please sign in again');
      markAdminBrowser(false);
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err) {
      msg.error(err.message);
      setSavingPassword(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await api(`/api/users/sessions/${sessionId}`, { method: 'DELETE' });
      msg.success('Session signed out');
      loadSecurity();
    } catch (err) { msg.error(err.message); }
  };

  const removeDevice = async (fingerprint) => {
    try {
      await api(`/api/users/trusted-devices/${encodeURIComponent(fingerprint)}`, { method: 'DELETE' });
      msg.success('Device removed');
      loadSecurity();
    } catch (err) { msg.error(err.message); }
  };

  if (error) return <div className="p-6"><Alert type="error" showIcon message={error} /></div>;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl">
      {msgHolder}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Avatar size={64} className="bg-[#174fa2] text-2xl">{user.username?.charAt(0).toUpperCase()}</Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {user.email} <Tag color={user.role === 'admin' ? 'red' : 'blue'} className="capitalize">{user.role}</Tag>
              </div>
            </div>
          </>
        ) : <Skeleton.Avatar active size={64} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={<span><UserOutlined /> Account details</span>} size="small">
          {user ? (
            <>
              <Descriptions column={1} size="small" className="mb-4">
                <Descriptions.Item label="Member since">{when(user.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Last login">{when(user.lastLogin)}</Descriptions.Item>
              </Descriptions>
              <Form form={profileForm} layout="vertical" onFinish={saveProfile} requiredMark={false}>
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    { required: true, message: 'Username is required' },
                    { min: 3, max: 30, message: 'Username must be 3–30 characters' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and underscores only' },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                  <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={savingProfile} className="bg-[#174fa2]">Save details</Button>
              </Form>
            </>
          ) : <Skeleton active />}
        </Card>

        <Card title={<span><LockOutlined /> Change password</span>} size="small">
          <Alert type="info" showIcon className="mb-4" message="Changing your password signs you out everywhere, including this browser." />
          <Form form={passwordForm} layout="vertical" onFinish={changePassword} requiredMark={false}>
            <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: 'Enter your current password' }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New password"
              rules={[
                { required: true, message: 'Enter a new password' },
                { pattern: PASSWORD_RULE, message: 'At least 8 characters with upper & lower case, a number and a symbol' },
              ]}
              hasFeedback
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm new password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Confirm the new password' },
                ({ getFieldValue }) => ({
                  validator: (_, v) => (!v || getFieldValue('newPassword') === v ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingPassword} className="bg-[#174fa2]">Change password</Button>
          </Form>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={<span><LaptopOutlined /> Active sessions</span>} size="small">
          {!sessions ? <Skeleton active /> : sessions.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No session details available" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <li key={s.sessionId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800">
                      {s.deviceInfo || 'Unknown device'} {s.current && <Tag color="green">This browser</Tag>}
                    </div>
                    <div className="text-xs text-gray-500">{s.ip} · {s.location !== 'Unknown' ? `${s.location} · ` : ''}signed in {when(s.createdAt)}</div>
                  </div>
                  {!s.current && (
                    <Popconfirm title="Sign out this session?" okText="Sign out" onConfirm={() => revokeSession(s.sessionId)}>
                      <Button size="small" icon={<LogoutOutlined />}>Sign out</Button>
                    </Popconfirm>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={<span><SafetyOutlined /> Trusted devices</span>} size="small">
          {!devices ? <Skeleton active /> : devices.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No trusted devices" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {devices.map((d) => (
                <li key={d.fingerprint} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800">{d.name || 'Device'}</div>
                    <div className="text-xs text-gray-500">Last used {when(d.lastUsed)}</div>
                  </div>
                  <Popconfirm title="Remove this device?" description="It will be treated as a new device at next login." okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => removeDevice(d.fingerprint)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
