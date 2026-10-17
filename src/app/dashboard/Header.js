'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaUserCircle, FaChevronRight, FaEnvelope, FaComments, FaFlag } from 'react-icons/fa';
import { MdNotifications } from 'react-icons/md';
import { SettingOutlined, LogoutOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Breadcrumb, Dropdown, Badge, Avatar, AutoComplete, Input, Popover, Empty, Button } from 'antd';
import { markAdminBrowser } from '../components/ads/adsClient';
import useDashboardNotifications, { getSeenAt, markAllSeen, refreshNotifications } from './useDashboardNotifications';

// Pages the header search can jump to.
const PAGES = [
  { label: 'Dashboard overview', href: '/dashboard', keywords: 'home stats overview' },
  { label: 'All users', href: '/dashboard/user-management', keywords: 'users accounts roles', adminOnly: true },
  { label: 'Moderators', href: '/dashboard/mod-management', keywords: 'moderators staff', adminOnly: true },
  { label: 'Add blog post', href: '/dashboard/blog/add', keywords: 'write new article post blog' },
  { label: 'Edit blog posts', href: '/dashboard/blog/edit', keywords: 'articles posts blog edit' },
  { label: 'Messages', href: '/dashboard/messages', keywords: 'contact inbox enquiries' },
  { label: 'Live chat', href: '/dashboard/chat', keywords: 'chat visitors support' },
  { label: 'All comments', href: '/dashboard/comments', keywords: 'comments moderation' },
  { label: 'Reported comments', href: '/dashboard/comments/reported', keywords: 'reported spam flags' },
  { label: 'Comment settings', href: '/dashboard/comments/settings', keywords: 'comments settings' },
  { label: 'Services', href: '/dashboard/services', keywords: 'services offers' },
  { label: 'Client management', href: '/dashboard/client-management', keywords: 'clients projects customers' },
  { label: 'Manage ads', href: '/dashboard/ads', keywords: 'ads advertising adsterra banner popup monetization', adminOnly: true },
  { label: 'Analytics', href: '/dashboard/analytics', keywords: 'traffic cloudflare visitors' },
  { label: 'Audit log', href: '/dashboard/audit-logs', keywords: 'audit history activity security log', adminOnly: true },
  { label: 'Settings – code injection', href: '/dashboard/settings?tab=code', keywords: 'header footer script css javascript code', adminOnly: true },
  { label: 'Settings – ads', href: '/dashboard/settings?tab=ads', keywords: 'ads.txt popup sticky ad settings', adminOnly: true },
  { label: 'Settings – system status', href: '/dashboard/settings?tab=system', keywords: 'libreoffice converter tools system', adminOnly: true },
  { label: 'My profile', href: '/dashboard/profile', keywords: 'profile password account sessions' },
];

const ICONS = { message: <FaEnvelope className="text-blue-600" />, chat: <FaComments className="text-green-600" />, comment: <FaFlag className="text-red-500" /> };

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const Header = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const { items, loading } = useDashboardNotifications();
  const seenAt = getSeenAt();
  const unread = items.filter((i) => new Date(i.time).getTime() > seenAt).length;
  const displayName = user?.name || user?.username || 'Admin';

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.slice(1).map((part, i) => {
      const href = `/${parts.slice(0, i + 2).join('/')}`;
      const isId = /^[a-f0-9]{24}$/i.test(part);
      const name = isId ? 'Details' : part.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        title: i === parts.length - 2
          ? <span className="text-[#174fa2] font-medium">{name}</span>
          : <Link href={href} className="hover:text-[#174fa2]">{name}</Link>,
        name,
      };
    });
  }, [pathname]);

  const searchOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PAGES
      .filter((p) => !p.adminOnly || user?.role === 'admin')
      .filter((p) => !q || `${p.label} ${p.keywords}`.toLowerCase().includes(q))
      .map((p) => ({ value: p.href, label: p.label }));
  }, [search, user?.role]);

  const goTo = (href) => {
    setSearch('');
    router.push(href);
  };

  const logout = () => {
    markAdminBrowser(false);
    fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
      .finally(() => { window.location.href = '/login'; });
  };

  const userMenuItems = [
    { key: 'profile', label: <Link href="/dashboard/profile" className="flex items-center gap-2"><FaUserCircle className="text-gray-500" />My Profile</Link> },
    ...(user?.role === 'admin'
      ? [{ key: 'settings', label: <Link href="/dashboard/settings" className="flex items-center gap-2"><SettingOutlined />Settings</Link> }]
      : []),
    { type: 'divider' },
    { key: 'logout', label: <button type="button" onClick={logout} className="flex items-center gap-2 text-red-500 w-full"><LogoutOutlined />Logout</button> },
  ];

  const bellContent = (
    <div className="w-80 max-w-[85vw]">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="font-semibold text-gray-800">Notifications</span>
        <div className="flex items-center gap-1">
          <Button size="small" type="text" icon={<ReloadOutlined />} onClick={() => refreshNotifications()} aria-label="Refresh" />
          {unread > 0 && <Button size="small" type="link" onClick={markAllSeen}>Mark all read</Button>}
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto -mx-1">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" />
        ) : (
          items.map((n) => {
            const isNew = new Date(n.time).getTime() > seenAt;
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setBellOpen(false)}
                className={`flex gap-3 px-2 py-2.5 rounded-md hover:bg-gray-50 ${isNew ? 'bg-blue-50/60' : ''}`}
              >
                <div className="mt-1">{ICONS[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  {n.description && <p className="text-xs text-gray-500 truncate">{n.description}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
      {user?.role === 'admin' && (
        <div className="pt-2 border-t border-gray-100 text-center">
          <Link href="/dashboard/audit-logs" onClick={() => setBellOpen(false)} className="text-sm text-[#174fa2] hover:underline">
            View audit log
          </Link>
        </div>
      )}
    </div>
  );

  const searchBox = (className) => (
    <AutoComplete
      className={className}
      options={searchOptions}
      value={search}
      onChange={setSearch}
      onSelect={goTo}
      popupMatchSelectWidth={280}
    >
      <Input
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Go to page…"
        allowClear
        onPressEnter={() => searchOptions[0] && goTo(searchOptions[0].value)}
      />
    </AutoComplete>
  );

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex flex-col sticky top-0 z-50">
      <div className="flex items-center justify-between w-full gap-3">
        <div className="hidden md:block min-w-0">
          <Breadcrumb
            separator={<FaChevronRight className="text-gray-400 text-xs mt-1" />}
            items={[{ title: <Link href="/dashboard" className="hover:text-[#174fa2]">Dashboard</Link> }, ...breadcrumbs.map(({ title }) => ({ title }))]}
            className="text-sm"
          />
        </div>
        <h1 className="text-lg font-semibold text-gray-800 md:hidden truncate">
          {breadcrumbs.slice(-1)[0]?.name || 'Dashboard'}
        </h1>

        <div className="flex items-center gap-3">
          {searchBox('hidden md:block w-56 lg:w-72')}

          <Popover
            content={bellContent}
            trigger="click"
            placement="bottomRight"
            open={bellOpen}
            onOpenChange={setBellOpen}
            arrow={false}
          >
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Notifications">
              <Badge count={unread} size="small" overflowCount={99}>
                <MdNotifications size={22} className={unread > 0 ? 'text-[#174fa2]' : 'text-gray-500'} />
              </Badge>
            </button>
          </Popover>

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-full p-1 pr-2 transition-colors">
              <Avatar size="default" src={user?.avatar} className="bg-[#174fa2]">
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-medium text-gray-700">{displayName}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>

      <div className="md:hidden mt-2">{searchBox('w-full')}</div>
    </header>
  );
};

export default Header;
