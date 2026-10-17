'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Segmented, Button, Tag, Skeleton, Empty, Alert, Table, Tooltip as AntTooltip } from 'antd';
import {
  ReloadOutlined, UserOutlined, FileTextOutlined, MailOutlined, CommentOutlined,
  WechatOutlined, TeamOutlined, FundProjectionScreenOutlined, AppstoreOutlined,
  PlusOutlined, EyeOutlined, LikeOutlined, WarningOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// Categorical slots 1-3 (validated: CVD ΔE 9.2, aqua < 3:1 contrast → table view provided).
const SERIES = [
  { key: 'users', label: 'New users', color: '#2a78d6' },
  { key: 'messages', label: 'Messages', color: '#eb6834' },
  { key: 'comments', label: 'Comments', color: '#1baf7a' },
];

const fmt = (n) => new Intl.NumberFormat().format(n || 0);
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const ACTION_LABEL = (a) => a.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function Kpi({ icon, label, value, sub, href, accent, alert }) {
  const body = (
    <div className={`h-full rounded-xl border bg-white p-4 transition hover:shadow-md ${alert ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${accent}14`, color: accent }}>
          {icon}
        </div>
      </div>
      {sub && <div className={`mt-2 text-xs ${alert ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

function Panel({ title, extra, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {extra}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function DashboardHome() {
  const [days, setDays] = useState(7);
  const [view, setView] = useState('Chart');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState(null);
  const [converters, setConverters] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/overview?days=${days}`, { credentials: 'include', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Could not load the overview');
      setData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json()).then((j) => setRole(j?.data?.user?.role || null)).catch(() => {});
    fetch('/api/convert/health').then((r) => r.json()).then(setConverters).catch(() => setConverters({ error: true }));
  }, []);

  const isAdmin = role === 'admin';
  const d = data;

  const chartData = d && {
    labels: d.series.users.map((p) => shortDate(p.date)),
    datasets: SERIES.map((s) => ({
      label: s.label,
      data: d.series[s.key].map((p) => p.count),
      borderColor: s.color,
      backgroundColor: s.color,
      borderWidth: 2,
      pointRadius: d.series.days <= 14 ? 4 : 0,
      pointHoverRadius: 6,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      tension: 0.3,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, color: '#4b5563' } },
      tooltip: { backgroundColor: '#111827', padding: 10, titleColor: '#fff', bodyColor: '#e5e7eb', usePointStyle: true },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', maxRotation: 0, autoSkipPadding: 12 } },
      y: { beginAtZero: true, ticks: { precision: 0, color: '#6b7280' }, grid: { color: '#f1f1ef' }, border: { display: false } },
    },
  };

  const tableRows = d ? d.series.users.map((p, i) => ({
    key: p.date, date: shortDate(p.date),
    users: p.count, messages: d.series.messages[i].count, comments: d.series.comments[i].count,
  })) : [];

  const attention = d ? [
    d.messages.new > 0 && { text: `${d.messages.new} new message${d.messages.new > 1 ? 's' : ''} waiting for a reply`, href: '/dashboard/messages' },
    d.chat.unread > 0 && { text: `${d.chat.unread} unread live chat message${d.chat.unread > 1 ? 's' : ''}`, href: '/dashboard/chat' },
    d.comments.reported > 0 && { text: `${d.comments.reported} reported comment${d.comments.reported > 1 ? 's' : ''} to review`, href: '/dashboard/comments/reported' },
    d.clients.overdue > 0 && { text: `${d.clients.overdue} client project${d.clients.overdue > 1 ? 's are' : ' is'} past the deadline`, href: '/dashboard/client-management' },
    isAdmin && converters && !converters.error && (!converters.libreoffice || !converters.python) && { text: 'Some document converters are not installed on the server', href: '/dashboard/settings?tab=system' },
  ].filter(Boolean) : [];

  return (
    <div className="p-4 md:p-6 space-y-5 bg-gray-50 min-h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500">
            Everything happening on Everestkit{d ? ` · updated ${new Date(d.generatedAt).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/blog/add"><Button icon={<PlusOutlined />}>New post</Button></Link>
          {isAdmin && <Link href="/dashboard/ads"><Button icon={<FundProjectionScreenOutlined />}>New ad</Button></Link>}
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} action={<Button size="small" onClick={load}>Retry</Button>} />}

      {!d && loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-xl border border-gray-200 bg-white p-4"><Skeleton active paragraph={{ rows: 1 }} /></div>)}
        </div>
      ) : d && (
        <>
          {attention.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-800"><WarningOutlined /> Needs your attention</div>
              <ul className="space-y-1">
                {attention.map((a) => (
                  <li key={a.text}>
                    <Link href={a.href} className="text-sm text-amber-900 hover:underline">{a.text} <ArrowRightOutlined className="text-xs" /></Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi icon={<UserOutlined />} accent="#2a78d6" label="Users" value={fmt(d.users.total)}
              sub={`+${fmt(d.users.newThisWeek)} this week · ${d.users.admins} admin, ${d.users.moderators} mod`} href={isAdmin ? '/dashboard/user-management' : undefined} />
            <Kpi icon={<FileTextOutlined />} accent="#174fa2" label="Blog posts" value={fmt(d.blogs.total)}
              sub={`${fmt(d.blogs.views)} views · ${fmt(d.blogs.likes)} likes`} href="/dashboard/blog/edit" />
            <Kpi icon={<MailOutlined />} accent="#eb6834" label="Messages" value={fmt(d.messages.total)}
              sub={d.messages.new ? `${d.messages.new} new — reply now` : 'All answered'} alert={d.messages.new > 0} href="/dashboard/messages" />
            <Kpi icon={<CommentOutlined />} accent="#1baf7a" label="Comments" value={fmt(d.comments.total)}
              sub={d.comments.reported ? `${d.comments.reported} reported · ${d.comments.spam} spam` : `${d.comments.spam} marked spam`} alert={d.comments.reported > 0} href="/dashboard/comments" />
            <Kpi icon={<WechatOutlined />} accent="#008300" label="Live chat" value={fmt(d.chat.activeDevices)}
              sub={d.chat.unread ? `${d.chat.unread} unread messages` : 'Visitors active in the last 24h'} alert={d.chat.unread > 0} href="/dashboard/chat" />
            <Kpi icon={<TeamOutlined />} accent="#7c3aed" label="Clients" value={fmt(d.clients.total)}
              sub={`${d.clients.active} active · ${d.clients.completed} completed`} href="/dashboard/client-management" />
            <Kpi icon={<AppstoreOutlined />} accent="#0891b2" label="Services" value={fmt(d.services.total)}
              sub={`${d.services.active} active on the site`} href="/dashboard/services" />
            <Kpi icon={<FundProjectionScreenOutlined />} accent="#d92026" label="Ads" value={`${fmt(d.ads.active)} / ${fmt(d.ads.total)}`}
              sub={`${fmt(d.ads.impressions)} views · ${fmt(d.ads.clicks)} clicks · ${d.ads.ctr}% CTR`} href={isAdmin ? '/dashboard/ads' : undefined} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Panel
              className="xl:col-span-2"
              title="Activity"
              extra={
                <div className="flex flex-wrap items-center gap-2">
                  <Segmented size="small" value={days} onChange={setDays} options={[{ label: '7d', value: 7 }, { label: '30d', value: 30 }, { label: '90d', value: 90 }]} />
                  <Segmented size="small" value={view} onChange={setView} options={['Chart', 'Table']} />
                </div>
              }
            >
              {view === 'Chart' ? (
                <div className="h-72"><Line data={chartData} options={chartOptions} aria-label="New users, messages and comments per day" /></div>
              ) : (
                <Table size="small" dataSource={[...tableRows].reverse()} pagination={{ pageSize: 7, hideOnSinglePage: true }}
                  columns={[
                    { title: 'Date', dataIndex: 'date' },
                    ...SERIES.map((s) => ({ title: s.label, dataIndex: s.key, align: 'right' })),
                  ]} />
              )}
            </Panel>

            <Panel title="Latest messages" extra={<Link href="/dashboard/messages" className="text-sm text-[#174fa2]">View all</Link>}>
              {d.messages.latest.length ? (
                <ul className="divide-y divide-gray-100 -my-2">
                  {d.messages.latest.map((m) => (
                    <li key={m._id}>
                      <Link href={`/dashboard/messages/${m._id}`} className="flex items-start justify-between gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate">{m.name}</div>
                          <div className="text-xs text-gray-500 truncate">{m.service || m.email}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <Tag color={m.status === 'new' ? 'red' : m.status === 'responded' ? 'green' : 'default'} className="mr-0">{m.status}</Tag>
                          <div className="text-[11px] text-gray-400 mt-1">{timeAgo(m.createdAt)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No messages yet" />}
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Top posts by views" extra={<Link href="/dashboard/blog/edit" className="text-sm text-[#174fa2]">Manage</Link>}>
              {d.blogs.top.length ? (
                <ol className="space-y-3">
                  {d.blogs.top.map((b, i) => {
                    const max = d.blogs.top[0].viewCount || 1;
                    return (
                      <li key={b._id}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate text-gray-800"><span className="text-gray-400 mr-1">{i + 1}.</span>{b.title}</span>
                          <span className="shrink-0 tabular-nums text-gray-600"><EyeOutlined className="mr-1 text-gray-400" />{fmt(b.viewCount)}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-[#2a78d6]" style={{ width: `${Math.max(2, ((b.viewCount || 0) / max) * 100)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No posts yet"><Link href="/dashboard/blog/add"><Button type="primary">Write the first post</Button></Link></Empty>}
            </Panel>

            <Panel title="Latest posts">
              {d.blogs.latest.length ? (
                <ul className="divide-y divide-gray-100 -my-2">
                  {d.blogs.latest.map((b) => (
                    <li key={b._id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                      <Link href={`/dashboard/blog/edit/${b._id}`} className="truncate text-gray-800 hover:text-[#174fa2]">{b.title}</Link>
                      <span className="shrink-0 text-xs text-gray-400">{timeAgo(b.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No posts yet" />}
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span><LikeOutlined /> {fmt(d.blogs.likes)} likes</span>
                <span>↗ {fmt(d.blogs.shares)} shares</span>
              </div>
            </Panel>

            {isAdmin ? (
              <Panel title="Recent admin activity" extra={<Link href="/dashboard/audit-logs" className="text-sm text-[#174fa2]">Audit log</Link>}>
                {d.recentActivity.length ? (
                  <ul className="space-y-3">
                    {d.recentActivity.map((log) => (
                      <li key={log._id} className="flex gap-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#174fa2]" />
                        <div className="min-w-0">
                          <div className="text-gray-800">{ACTION_LABEL(log.action)}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {log.performedBy?.username || log.performedBy?.email || 'System'} · {timeAgo(log.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No activity recorded yet" />}
              </Panel>
            ) : (
              <Panel title="Quick links">
                <div className="grid grid-cols-2 gap-2">
                  {[['Messages', '/dashboard/messages'], ['Live chat', '/dashboard/chat'], ['Reported comments', '/dashboard/comments/reported'], ['Add post', '/dashboard/blog/add']].map(([l, h]) => (
                    <Link key={h} href={h}><Button block>{l}</Button></Link>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {isAdmin && converters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>System:</span>
              {converters.error ? <Tag color="red">Backend unreachable</Tag> : (
                <>
                  <AntTooltip title="Word / Excel / PowerPoint → PDF"><Tag color={converters.libreoffice ? 'green' : 'red'}>LibreOffice {converters.libreoffice ? 'OK' : 'missing'}</Tag></AntTooltip>
                  <AntTooltip title="PDF → Word / Excel / PowerPoint"><Tag color={converters.python ? 'green' : 'red'}>PDF converters {converters.python ? 'OK' : 'missing'}</Tag></AntTooltip>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
