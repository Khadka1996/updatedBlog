"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetchWrapper";
import {
  Table, Tag, Button, Typography, Alert,
  Input, Badge, Modal, Card, Select, Space, Drawer, Descriptions,
  message
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MailOutlined,
  CalendarOutlined,
  CrownOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [roleChanging, setRoleChanging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  // 🕐 HUMAN-READABLE TIME FUNCTION
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never logged in";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetcher(
        `/api/users?page=${pagination.page}&limit=${pagination.limit}`
      );

      const usersData = response?.data?.users ?? response?.users ?? [];
      const total = response?.pagination?.total ?? response?.total ?? usersData.length;

      setUsers(usersData);
      setPagination((p) => ({ ...p, total }));
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  // DELETE USER
  const handleDelete = async (userId, username) => {
    modal.confirm({
      title: "🚨 Delete User Account?",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to permanently delete ${username}? This action cannot be undone!`,
      okText: "Yes, Delete!",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(userId);
        try {
          await fetcher(`/api/users/${userId}`, {
            method: "DELETE",
          });

          setUsers((prev) => prev.filter((u) => u._id !== userId));
          messageApi.success(`User ${username} deleted successfully!`);
          fetchUsers();
        } catch (err) {
          console.error("Delete error:", err);
          messageApi.error(err?.response?.data?.message || "Delete failed! Please try again.");
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  // ROLE CHANGE
  const handleRoleChange = async (userId, newRole, currentRole, username) => {
    if (newRole === currentRole) return;

    modal.confirm({
      title: "🔄 Change User Role?",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to change ${username} from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
      okText: "Yes, Change Role!",
      cancelText: "Cancel",
      onOk: async () => {
        setRoleChanging(userId);
        try {
          await fetcher(`/api/users/${userId}/role`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: newRole }),
          });

          setUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
          );
          messageApi.success(`Role changed to ${newRole.toUpperCase()}!`);
        } catch (err) {
          console.error("Role change error:", err);
          messageApi.error(err?.response?.data?.message || "Role change failed!");
        } finally {
          setRoleChanging(null);
        }
      },
    });
  };

  // SHOW USER DETAILS
  const showUserDetails = (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            size="small"
            onClick={() => showUserDetails(record)}
            title="View user details"
          />
        </Space>
      ),
    },
    {
      title: "Role & Status",
      key: "roleStatus",
      render: (_, user) => (
        <Space direction="vertical" size="small">
          <Tag
            color={
              user.role === "admin" ? "red" : user.role === "moderator" ? "blue" : "green"
            }
          >
            {user.role?.toUpperCase?.() ?? String(user.role)}
          </Tag>
          <Badge status={user.active ? "success" : "error"} text={user.active ? "Active" : "Inactive"} />
        </Space>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (lastLogin) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">
            {getTimeAgo(lastLogin)}
          </Text>
        </Space>
      ),
      responsive: ['md'], // Hide on mobile
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, user) => (
        <Space size="small">
          <Select
            value={user.role}
            style={{ width: 120 }}
            size="small"
            onChange={(value) => handleRoleChange(user._id, value, user.role, user.username)}
            loading={roleChanging === user._id}
            disabled={roleChanging === user._id}
          >
            <Option value="user">User</Option>
            <Option value="moderator">Moderator</Option>
            <Option value="admin">Admin</Option>
          </Select>

          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(user._id, user.username)}
            loading={deleting === user._id}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6">
      {modalContextHolder}
      {messageContextHolder}

      <div className="mb-6">
        <Title level={2} className="!mb-2">
          <UserOutlined /> User Management
        </Title>
        <Text type="secondary">Total Users: {pagination.total}</Text>
      </div>

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

      <div className="mb-4">
        <Input
          placeholder="🔍 Search users..."
          prefix={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users.filter((user) =>
            `${user.username} ${user.email}`.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination((p) => ({ ...p, page })),
            showSizeChanger: false,
          }}
          scroll={{ x: true }}
          size="middle"
        />
      </Card>

      {/* User Details Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Username">
              <UserOutlined /> {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined /> {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={
                selectedUser.role === 'admin' ? 'red' : 
                selectedUser.role === 'moderator' ? 'blue' : 'green'
              }>
                <CrownOutlined /> {selectedUser.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge 
                status={selectedUser.active ? 'success' : 'error'} 
                text={selectedUser.active ? 'Active' : 'Inactive'} 
              />
            </Descriptions.Item>
            <Descriptions.Item label="Joined Date">
              <CalendarOutlined /> {new Date(selectedUser.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              <Space direction="vertical" size="small">
                <div>
                  <ClockCircleOutlined /> {getTimeAgo(selectedUser.lastLogin)}
                </div>
                {selectedUser.lastLogin && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(selectedUser.lastLogin).toLocaleString()}
                  </Text>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              <Text code>{selectedUser._id}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;