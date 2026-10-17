'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  Table, Button, Tag, Switch, Input, Select, Space, Popconfirm, Tooltip, Card, Statistic,
  Empty, Collapse, message,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, ReloadOutlined, CodeOutlined,
  SettingOutlined, UndoOutlined, SearchOutlined,
} from '@ant-design/icons';
import AdFormModal from './AdFormModal';
import { PAGES, PLACEMENTS, PLACEMENT_LABEL, STATUS_META } from './adOptions';

const PAGE_LABEL = Object.fromEntries(PAGES.map((p) => [p.value, p.label]));
const fmt = (n) => Number(n || 0).toLocaleString();

export default function ManageAdsPage() {
  const [msg, msgHolder] = message.useMessage();
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState({ open: false, ad: null });
  const [filters, setFilters] = useState({ search: '', placement: undefined, type: undefined, status: undefined });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch('/api/ads', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/ads/stats', { credentials: 'include', cache: 'no-store' }),
      ]);
      const list = await listRes.json().catch(() => ({}));
      const summary = await statsRes.json().catch(() => ({}));
      if (!listRes.ok) throw new Error(list.message || 'Could not load ads');
      setAds(list.advertisements || []);
      setStats(summary.stats || null);
    } catch (err) {
      msg.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [msg]);

  useEffect(() => { load(); }, [load]);

  const call = async (id, url, options, successText) => {
    setBusyId(id);
    try {
      const res = await fetch(url, { credentials: 'include', ...options });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Something went wrong');
      msg.success(successText || data.message);
      await load();
    } catch (err) {
      msg.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return ads.filter((ad) =>
      (!q || ad.name.toLowerCase().includes(q) || (ad.network || '').toLowerCase().includes(q)) &&
      (!filters.placement || ad.placement === filters.placement) &&
      (!filters.type || ad.type === filters.type) &&
      (!filters.status || ad.status === filters.status)
    );
  }, [ads, filters]);

  const columns = [
    {
      title: 'Ad',
      key: 'ad',
      render: (_, ad) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-20 h-12 shrink-0 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {ad.type === 'image' && ad.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.imagePath} alt="" className="w-full h-full object-cover" />
            ) : (
              <CodeOutlined className="text-xl text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 truncate max-w-[220px]">{ad.name}</div>
            <div className="text-xs text-gray-500">
              {ad.type === 'image' ? 'Image banner' : `${ad.network || 'Network'} code · ${ad.renderMode === 'inline' ? 'on page' : 'isolated'}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Placement',
      key: 'placement',
      render: (_, ad) => (
        <div>
          <div className="text-gray-800">{PLACEMENT_LABEL[ad.placement] || ad.placement}</div>
          <div className="text-xs text-gray-500">{ad.size === 'responsive' ? 'Responsive' : ad.size}</div>
        </div>
      ),
    },
    {
      title: 'Targeting',
      key: 'targeting',
      render: (_, ad) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {ad.pages?.length ? ad.pages.map((p) => <Tag key={p}>{PAGE_LABEL[p] || p}</Tag>) : <Tag>All pages</Tag>}
          {ad.devices !== 'all' && <Tag color="purple">{ad.devices === 'mobile' ? 'Mobile' : 'Desktop'}</Tag>}
        </div>
      ),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, ad) => (
        <div className="text-xs text-gray-600 whitespace-nowrap">
          {ad.startDate || ad.endDate ? (
            <>
              <div>From: {ad.startDate ? dayjs(ad.startDate).format('YYYY-MM-DD HH:mm') : 'now'}</div>
              <div>Until: {ad.endDate ? dayjs(ad.endDate).format('YYYY-MM-DD HH:mm') : 'no end'}</div>
            </>
          ) : 'Always'}
          <div className="text-gray-400">Weight {ad.weight}</div>
        </div>
      ),
    },
    {
      title: 'Performance',
      key: 'stats',
      sorter: (a, b) => a.impressions - b.impressions,
      render: (_, ad) => (
        <div className="text-xs whitespace-nowrap">
          <div><span className="text-gray-500">Views</span> <b>{fmt(ad.impressions)}</b></div>
          <div><span className="text-gray-500">Clicks</span> <b>{ad.type === 'image' ? fmt(ad.clicks) : '—'}</b></div>
          {ad.type === 'image' && <div><span className="text-gray-500">CTR</span> <b>{ad.ctr}%</b></div>}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, ad) => (
        <Space direction="vertical" size={4}>
          <Tag color={STATUS_META[ad.status]?.color}>{STATUS_META[ad.status]?.label || ad.status}</Tag>
          <Switch
            size="small"
            checked={ad.isActive}
            loading={busyId === ad._id}
            onChange={() => call(ad._id, `/api/ads/${ad._id}/toggle`, { method: 'PATCH' })}
          />
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      render: (_, ad) => (
        <Space size={2}>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => setModal({ open: true, ad })} />
          </Tooltip>
          <Tooltip title="Duplicate (created paused)">
            <Button type="text" icon={<CopyOutlined />} onClick={() => call(ad._id, `/api/ads/${ad._id}/duplicate`, { method: 'POST' })} />
          </Tooltip>
          <Popconfirm title="Reset views and clicks to 0?" onConfirm={() => call(ad._id, `/api/ads/${ad._id}/reset-stats`, { method: 'POST' })}>
            <Tooltip title="Reset stats"><Button type="text" icon={<UndoOutlined />} /></Tooltip>
          </Popconfirm>
          <Popconfirm
            title="Delete this ad?"
            description="This cannot be undone."
            okButtonProps={{ danger: true }}
            okText="Delete"
            onConfirm={() => call(ad._id, `/api/ads/${ad._id}`, { method: 'DELETE' })}
          >
            <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      {msgHolder}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Ads</h1>
          <p className="text-gray-500 text-sm">
            Your own banners and third-party ad network code (Adsterra, PropellerAds, Monetag, ...). Changes go live within a minute.
          </p>
        </div>
        <Space wrap>
          <Link href="/dashboard/settings?tab=ads"><Button icon={<SettingOutlined />}>Ad settings</Button></Link>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} className="bg-[#174fa2]" onClick={() => setModal({ open: true, ad: null })}>
            New ad
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card size="small"><Statistic title="Live ads" value={stats?.live ?? 0} valueStyle={{ color: '#16a34a' }} /></Card>
        <Card size="small"><Statistic title="Paused / scheduled" value={`${stats?.paused ?? 0} / ${stats?.scheduled ?? 0}`} /></Card>
        <Card size="small"><Statistic title="Total views" value={stats?.impressions ?? 0} /></Card>
        <Card size="small"><Statistic title="Banner clicks" value={stats?.clicks ?? 0} /></Card>
        <Card size="small"><Statistic title="Click-through rate" value={stats?.ctr ?? 0} suffix="%" precision={2} /></Card>
      </div>

      <Card size="small">
        <div className="flex flex-col lg:flex-row gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by name or network"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="lg:max-w-xs"
          />
          <Select allowClear placeholder="Placement" value={filters.placement} onChange={(v) => setFilters((f) => ({ ...f, placement: v }))}
            options={PLACEMENTS.map((p) => ({ value: p.value, label: p.label }))} className="lg:w-48" />
          <Select allowClear placeholder="Type" value={filters.type} onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={[{ value: 'image', label: 'Image banner' }, { value: 'code', label: 'Network code' }]} className="lg:w-40" />
          <Select allowClear placeholder="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label }))} className="lg:w-36" />
        </div>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={visible}
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty description={ads.length ? 'No ads match these filters' : 'No ads yet'}>
                {!ads.length && (
                  <Button type="primary" className="bg-[#174fa2]" icon={<PlusOutlined />} onClick={() => setModal({ open: true, ad: null })}>
                    Create your first ad
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </Card>

      <Collapse
        items={[{
          key: 'guide',
          label: 'How to add a third-party ad network (Adsterra, PropellerAds, Monetag ...)',
          children: (
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
              <li>Sign up with the network and add <b>everestkit.com</b> as your website.</li>
              <li>If they give you an <b>ads.txt</b> line, paste it in <Link href="/dashboard/settings?tab=ads" className="text-blue-600">Settings → Ads → ads.txt</Link>.</li>
              <li>Create an ad unit (e.g. Banner 728×90) and copy its code.</li>
              <li>Click <b>New ad</b> → <b>Ad network code</b>, paste the code, pick the same size, and choose a placement.</li>
              <li>Banners: keep <b>Isolated frame</b>. Popunder / Social bar / Push: choose placement <b>Page script</b>.</li>
              <li>If a site-verification snippet is needed, paste it in <Link href="/dashboard/settings?tab=code" className="text-blue-600">Settings → Code injection → Head</Link>.</li>
            </ol>
          ),
        }]}
      />

      <AdFormModal
        open={modal.open}
        ad={modal.ad}
        onClose={() => setModal({ open: false, ad: null })}
        onSaved={(_, text) => { setModal({ open: false, ad: null }); msg.success(text); load(); }}
      />
    </div>
  );
}
