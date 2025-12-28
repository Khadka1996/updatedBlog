'use client';
import { useEffect, useState } from 'react';
import { fetcher } from '@/lib/fetchWrapper';
import { Table, Tag, Button, Typography, Alert, Dropdown, Input, Badge, App, Modal, Spin, Select } from 'antd';
import { 
  SearchOutlined, 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { modal } = App.useApp();

  // Fetch users with pagination
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetcher(
        `/api/users?page=${pagination.page}&limit=${pagination.limit}`
      );
      setUsers(response.data.users);
      setPagination({
        ...pagination,
        total: response.pagination.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  // Delete user (soft delete)
  const handleDelete = async (userId) => {
    modal.confirm({
      title: 'Deactivate User?',
      icon: <ExclamationCircleOutlined />,
      content: 'User will be marked as inactive but can be restored later.',
      okType: 'danger',
      onOk: async () => {
        try {
          await fetcher(`/api/users/${userId}`, { method: 'DELETE' });
          setUsers(users.filter(user => user._id !== userId));
        } catch (err) {
          setError(err.response?.data?.message || err.message);
        }
      }
    });
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetcher(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={
          role === 'admin' ? 'red' : 
          role === 'moderator' ? 'blue' : 'green'
        }>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'User', value: 'user' },
        { text: 'Moderator', value: 'moderator' },
        { text: 'Admin', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Active' : 'Inactive'} 
        />
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <div className="flex gap-2">
          <Select
            defaultValue={user.role}
            style={{ width: 120 }}
            onChange={(value) => handleRoleChange(user._id, value)}
          >
            <Option value="user">User</Option>
            <Option value="moderator">Moderator</Option>
            <Option value="admin">Admin</Option>
          </Select>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(user._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-4">
        <UserOutlined /> User Management
      </Title>

      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          closable 
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <div className="mb-4 flex justify-between">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Text strong>Total Users: {pagination.total}</Text>
      </div>

      <Table
        columns={columns}
        dataSource={users.filter(user => 
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
        )}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: (page) => setPagination({ ...pagination, page }),
          showSizeChanger: false,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default UserManagement;