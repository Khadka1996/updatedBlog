'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Input, Segmented, Button, Tag, Popconfirm, Tooltip, Avatar, message } from 'antd';
import {
  SearchOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined, ReloadOutlined, FlagOutlined, LikeOutlined, SettingOutlined,
} from '@ant-design/icons';

const STATUS = [
  { label: 'All', value: 'all' },
  { label: 'Reported', value: 'reported' },
  { label: 'Spam', value: 'spam' },
  { label: 'Clean', value: 'clean' },
];

export default function AllCommentsPage() {
  const [msg, msgHolder] = message.useMessage();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState({ page: 1, limit: 20, status: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: query.page, limit: query.limit, status: query.status });
      if (query.search) params.set('search', query.search);
      const res = await fetch(`/api/admin/comments?${params}`, { credentials: 'include', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Could not load comments');
      setRows(json.data.comments);
      setTotal(json.data.total);
    } catch (err) {
      msg.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, msg]);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === searchInput.trim() ? q : { ...q, search: searchInput.trim(), page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const act = async (id, url, method) => {
    setBusyId(id);
    try {
      const res = await fetch(url, { method, credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Action failed');
      msg.success(json.message || 'Done');
      await load();
    } catch (err) {
      msg.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      title: 'Comment',
      key: 'content',
      render: (_, c) => (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <Avatar size="small" className="bg-[#174fa2]">{(c.user?.username || '?').charAt(0).toUpperCase()}</Avatar>
            <span className="font-medium text-gray-800">{c.user?.username || 'Deleted user'}</span>
            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            {c.parentComment && <Tag className="mr-0">Reply</Tag>}
            {c.isEdited && <Tag className="mr-0">Edited</Tag>}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap break-words line-clamp-4">{c.content}</p>
        </div>
      ),
    },
    {
      title: 'On post',
      key: 'blog',
      width: 220,
      render: (_, c) => c.blog
        ? <Link href={`/blogs/${c.blog._id}`} target="_blank" className="text-[#174fa2] hover:underline line-clamp-2">{c.blog.title}</Link>
        : <span className="text-gray-400">Deleted post</span>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_, c) => (
        <div className="flex flex-col gap-1 items-start">
          {c.isSpam ? <Tag color="red">Spam</Tag> : c.reportedCount > 0 ? <Tag color="orange" icon={<FlagOutlined />}>Reported ×{c.reportedCount}</Tag> : <Tag color="green">Clean</Tag>}
          <span className="text-xs text-gray-500"><LikeOutlined /> {c.likesCount} · {c.repliesCount} replies</span>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      render: (_, c) => (
        <div className="flex gap-1">
          <Tooltip title={c.isSpam ? 'Not spam' : 'Mark as spam'}>
            <Button
              type="text"
              loading={busyId === c._id}
              icon={c.isSpam ? <CheckCircleOutlined className="text-green-600" /> : <StopOutlined className="text-orange-500" />}
              onClick={() => act(c._id, `/api/admin/comments/${c._id}/spam`, 'PATCH')}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this comment?"
            description="Replies to it will also be removed."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => act(c._id, `/api/admin/comments/${c._id}`, 'DELETE')}
          >
            <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {msgHolder}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Comments</h1>
          <p className="text-sm text-gray-500">Every comment across the blog — search, mark spam or delete.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/comments/reported"><Button icon={<FlagOutlined />}>Reported</Button></Link>
          <Link href="/dashboard/comments/settings"><Button icon={<SettingOutlined />}>Settings</Button></Link>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search comment text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="md:max-w-sm"
        />
        <Segmented options={STATUS} value={query.status} onChange={(status) => setQuery((q) => ({ ...q, status, page: 1 }))} />
        <span className="text-sm text-gray-500 md:ml-auto">{total.toLocaleString()} comment{total === 1 ? '' : 's'}</span>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        scroll={{ x: 820 }}
        rowClassName={(c) => (c.isSpam ? 'bg-red-50/40' : '')}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (page, limit) => setQuery((q) => ({ ...q, page, limit })),
        }}
        locale={{ emptyText: query.search || query.status !== 'all' ? 'No comments match these filters' : 'No comments yet' }}
      />
    </div>
  );
}
