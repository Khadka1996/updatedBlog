'use client';

import { useCallback, useEffect, useState } from 'react';
import { Table, Select, Input, Button, Tag, Tooltip, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const label = (a) => a.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const colorFor = (action) => {
  if (/FAILED|DELETE|DELETED|REVOKED|UNUSUAL|SPAM|DEACTIVATED|REJECTED/.test(action)) return 'red';
  if (/LOGIN|LOGOUT|REGISTER|SIGNUP/.test(action)) return 'blue';
  if (/AD_|SETTINGS/.test(action)) return 'purple';
  if (/CHANGED|UPDATED|EDITED/.test(action)) return 'orange';
  return 'green';
};

const describe = (meta) => {
  if (!meta || typeof meta !== 'object') return '';
  if (Array.isArray(meta.changed)) return meta.changed.length ? `Changed: ${meta.changed.join(', ')}` : 'No changes';
  return Object.entries(meta)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
};

export default function AuditLogPage() {
  const [msg, msgHolder] = message.useMessage();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 25, action: undefined, search: '' });
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: query.page, limit: query.limit });
      if (query.action) params.set('action', query.action);
      if (query.search) params.set('search', query.search);
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: 'include', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (res.status === 403) throw new Error('Only admins can view the audit log');
      if (!res.ok || !json.success) throw new Error(json.message || 'Could not load the audit log');
      setRows(json.data.logs);
      setTotal(json.data.total);
      setActions(json.data.actions);
    } catch (err) {
      msg.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, msg]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === searchInput.trim() ? q : { ...q, search: searchInput.trim(), page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const columns = [
    {
      title: 'When',
      dataIndex: 'createdAt',
      width: 170,
      render: (v) => <Tooltip title={new Date(v).toString()}><span className="whitespace-nowrap text-gray-700">{new Date(v).toLocaleString()}</span></Tooltip>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 190,
      render: (a) => <Tag color={colorFor(a)}>{label(a)}</Tag>,
    },
    {
      title: 'By',
      key: 'by',
      width: 220,
      render: (_, l) => l.performedBy ? (
        <div className="leading-tight">
          <div className="font-medium text-gray-800">{l.performedBy.username}</div>
          <div className="text-xs text-gray-500">{l.performedBy.email}{l.performedBy.role && l.performedBy.role !== 'user' ? ` · ${l.performedBy.role}` : ''}</div>
        </div>
      ) : <span className="text-gray-400">Deleted user</span>,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, l) => (
        <div className="text-sm text-gray-600 break-words">
          {l.targetModel && <span className="text-gray-400 mr-1">[{l.targetModel}]</span>}
          {describe(l.metadata) || '—'}
        </div>
      ),
    },
    {
      title: 'IP / device',
      key: 'ip',
      width: 170,
      render: (_, l) => (
        <Tooltip title={l.userAgent}>
          <span className="text-xs text-gray-500 font-mono">{l.ipAddress || '—'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {msgHolder}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500">Logins, role changes, deletions, ad and settings changes — who did what, and when.</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by user email, username or IP"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="md:max-w-sm"
        />
        <Select
          allowClear
          showSearch
          placeholder="All actions"
          value={query.action}
          onChange={(action) => setQuery((q) => ({ ...q, action, page: 1 }))}
          options={actions.map((a) => ({ value: a, label: label(a) }))}
          className="md:w-64"
        />
        <span className="text-sm text-gray-500 md:ml-auto">{total.toLocaleString()} entr{total === 1 ? 'y' : 'ies'}</span>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        size="middle"
        scroll={{ x: 960 }}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [25, 50, 100],
          onChange: (page, limit) => setQuery((q) => ({ ...q, page, limit })),
        }}
        locale={{ emptyText: 'No audit entries match these filters' }}
      />
    </div>
  );
}
