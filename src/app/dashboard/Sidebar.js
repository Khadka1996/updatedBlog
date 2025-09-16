'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Layout, Menu, Button, Avatar, Divider, Tooltip, theme, Badge } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  FileAddOutlined,
  EditOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BookOutlined,
  BarChartOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  MessageOutlined,
  CommentOutlined,
  NotificationOutlined,
  WechatOutlined
} from '@ant-design/icons';
const { Sider } = Layout;

const Sidebar = ({ user, collapsed, setCollapsed }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState(['user-management']);
  
  // Mock data for notifications - replace with real data
  const [notificationCounts, setNotificationCounts] = useState({
    messages: 5,
    reportedComments: 3,
    liveChats: 2
  });

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: 'user-management',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        {
          key: 'users',
          label: <Link href="/dashboard/user-management">All Users</Link>,
        },
        {
          key: 'moderators',
          label: <Link href="/dashboard/mod-management">Moderators</Link>,
        },
      ],
    },
    {
      key: 'blog',
      icon: <FileOutlined />,
      label: 'Blog Management',
      children: [
        {
          key: 'add-blog',
          icon: <PlusOutlined />,
          label: <Link href="/dashboard/blog/add">Add Blog Post</Link>,
        },
        {
          key: 'edit-blog',
          icon: <EditOutlined />,
          label: <Link href="/dashboard/blog/edit">Edit Blog Posts</Link>,
        },
      ],
    },
    {
      key: 'communication',
      icon: <MailOutlined />,
      label: 'Communication',
      children: [
        {
          key: 'messages',
          icon: (
            <Badge count={notificationCounts.messages} size="small" offset={[5, 0]}>
              <MessageOutlined />
            </Badge>
          ),
          label: <Link href="/dashboard/messages">Messages</Link>,
        },
        {
          key: 'live-chat',
          icon: (
            <Badge count={notificationCounts.liveChats} size="small" offset={[5, 0]}>
              <WechatOutlined />
            </Badge>
          ),
          label: <Link href="/dashboard/chat">Live Chat</Link>,
        },
      ],
    },
    {
      key: 'comments',
      icon: <CommentOutlined />,
      label: 'Comment Management',
      children: [
        {
          key: 'all-comments',
          label: <Link href="/dashboard/comments">All Comments</Link>,
        },
        {
          key: 'reported-comments',
          icon: (
            <Badge count={notificationCounts.reportedComments} size="small" offset={[5, 0]}>
              <NotificationOutlined />
            </Badge>
          ),
          label: <Link href="/dashboard/comments/reported">Reported Comments</Link>,
        },
        {
          key: 'comment-settings',
          label: <Link href="/dashboard/comments/settings">Settings</Link>,
        },
      ],
    },
    {
      key: 'services',
      icon: <AppstoreOutlined />,
      label: <Link href="/dashboard/services">Services</Link>,
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/client-management">Client Management</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard/analytics">Analytics</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/settings">Settings</Link>,
    },
  ];

  return (
    <Sider
      width={256}
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
      className="!bg-[#25609A] "

      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.15)',
        
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Collapse Button */}
        <div className="flex items-center justify-between p-4">
          {!collapsed ? (
            <div className="text-white font-bold text-lg">Admin Panel</div>
          ) : null}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: '#fff',
            }}
          />
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="flex items-center p-4 mb-2">
            <Avatar 
              size="large" 
              src={user?.avatar} 
              icon={<UserOutlined />}
              className="mr-3"
            />
            <div>
              <div className="text-white font-medium">{user?.name}</div>
              <div className="text-gray-400 text-xs">{user?.role}</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center p-4">
            <Avatar 
              size="default" 
              src={user?.avatar} 
              icon={<UserOutlined />}
            />
          </div>
        )}

        <Divider className="bg-gray-600 m-0" />

        {/* Main Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          className="!bg-[#25609A]"

          style={{
            borderRight: 0,
            flex: 1,
            overflow: 'auto',
          }}
          onClick={({ key }) => setSelectedKey(key)}
        />

        {/* Footer/Logout */}
        <div className="p-4">
          <Tooltip title="Logout" placement="right" trigger={collapsed ? ['hover'] : []}>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              className="w-full"
              onClick={() => {
            fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
              .then(() => window.location.href = '/login');
          }}
            >
              {!collapsed && 'Logout'}
            </Button>
          </Tooltip>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;