'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Table, Button, Input, Modal, Form, Select, Card,
  Avatar, Divider, Tabs, Typography, Tag, Progress,
  Badge, Popconfirm, Space, Upload, message, DatePicker,
  notification,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, SearchOutlined, UploadOutlined, DownloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const { Option } = Select;
const { Title, Text } = Typography;

const ClientManagement = () => {
  // State Management
  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewing, setIsViewing] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Fetch clients from backend
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/client', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch clients (Status: ${response.status})`);
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Fetch clients error:', error);
      notification.error({
        message: 'Error',
        description: `Failed to fetch clients: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Enhanced Modal Handling
  const showModal = (client = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
    if (client) {
      form.setFieldsValue({
        name: client.name,
        email: client.email,
        phone: client.phone,
        country: client.country,
        projectName: client.project.name,
        description: client.project.description || '',
        completed: client.project.completed,
        deadline: client.project.deadline ? dayjs(client.project.deadline) : null,
        progress: Number(client.project.progress),
        budget: Number(client.project.budget),
      });
    } else {
      form.resetFields();
      // Set default values for new clients
      form.setFieldsValue({
        completed: false,
        progress: 0,
        budget: 0,
      });
    }
  };

  // Client CRUD Operations
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const clientData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        project: {
          name: values.projectName,
          description: values.description || '',
          completed: values.completed || false,
          deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
          progress: Number(values.progress),
          budget: Number(values.budget),
        },
      };

      console.log('Sending client data:', clientData); // Debug log

      setLoading(true);
      const url = editingClient ? `/api/client/${editingClient._id}` : '/api/client';
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `Failed to save client (Status: ${response.status})`);
      }

      const savedClient = await response.json();
      if (editingClient) {
        setClients((prev) =>
          prev.map((c) => (c._id === editingClient._id ? savedClient : c))
        );
      } else {
        setClients((prev) => [...prev, savedClient]);
      }

      setIsModalOpen(false);
      notification.success({
        message: 'Success',
        description: editingClient ? 'Client updated successfully' : 'Client added successfully',
      });
      fetchClients(); // Refresh list
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.errorFields) {
        // Handle form validation errors
        const errorMessages = error.errorFields.map((field) => `${field.name.join('.')}: ${field.errors.join(', ')}`).join('; ');
        notification.error({
          message: 'Validation Error',
          description: `Please fix the following errors: ${errorMessages}`,
        });
      } else {
        notification.error({
          message: 'Error',
          description: `Failed to save client: ${error.message || 'Unknown error'}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete client (Status: ${response.status})`);
      }
      setClients((prev) => prev.filter((client) => client._id !== id));
      notification.success({
        message: 'Success',
        description: 'Client deleted successfully',
      });
    } catch (error) {
      console.error('Delete client error:', error);
      notification.error({
        message: 'Error',
        description: `Failed to delete client: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete clients (Status: ${response.status})`);
      }

      setClients((prev) => prev.filter((client) => !selectedRows.includes(client._id)));
      setSelectedRows([]);
      notification.success({
        message: 'Success',
        description: `${selectedRows.length} clients deleted successfully`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      notification.error({
        message: 'Error',
        description: `Failed to delete clients: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV Import
  const beforeUpload = (file) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error('Please upload a CSV file!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File must be smaller than 2MB');
      return false;
    }

    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target.result;
        const response = await fetch('/api/client/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to import clients (Status: ${response.status})`);
        }

        await fetchClients();
        notification.success({
          message: 'Success',
          description: `${file.name} imported successfully`,
        });
      } catch (error) {
        console.error('Import clients error:', error);
        notification.error({
          message: 'Error',
          description: `Failed to import clients: ${error.message}`,
        });
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
    return false;
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const response = await fetch('/api/client/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to export clients (Status: ${response.status})`);
      }
      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notification.success({
        message: 'Success',
        description: 'Clients exported successfully',
      });
    } catch (error) {
      console.error('Export clients error:', error);
      notification.error({
        message: 'Error',
        description: `Failed to export clients: ${error.message}`,
      });
    }
  };

  // Filter clients based on active tab and search
  const filteredClients = useMemo(() => {
    let filtered = [...clients];
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((client) => !client.project.completed);
        break;
      case 'completed':
        filtered = filtered.filter((client) => client.project.completed);
        break;
      case 'priority':
        filtered = filtered.filter(
          (client) =>
            !client.project.completed &&
            dayjs(client.project.deadline).isBefore(dayjs().add(7, 'day'))
        );
        break;
      default:
        break;
    }
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filtered = filtered.filter(
        (client) =>
          (client.name?.toLowerCase().includes(searchTerm) || false) ||
          (client.email?.toLowerCase().includes(searchTerm) || false) ||
          (client.phone?.toLowerCase().includes(searchTerm) || false) ||
          (client.country?.toLowerCase().includes(searchTerm) || false) ||
          (client.project.name?.toLowerCase().includes(searchTerm) || false)
      );
    }
    return filtered;
  }, [clients, activeTab, search]);

  // Table columns
  const columns = [
    {
      title: 'Client',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar
            size="small"
            style={{
              backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              color: 'white',
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.phone}</div>
          <Tag color="geekblue">{record.country}</Tag>
        </div>
      ),
    },
    {
      title: 'Project',
      dataIndex: ['project', 'name'],
      key: 'project',
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary">
            Budget: ${Number(record.project.budget).toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 200,
      render: (_, record) => {
        const isOverdue =
          !record.project.completed &&
          dayjs(record.project.deadline).isBefore(dayjs());
        return (
          <div>
            <Progress
              percent={Number(record.project.progress)}
              status={
                record.project.completed ? 'success' :
                isOverdue ? 'exception' : 'active'
              }
              size="small"
              strokeColor={isOverdue ? '#ff4d4f' : undefined}
            />
            <div className="flex justify-between items-center mt-1">
              <Text type={isOverdue ? 'danger' : 'secondary'} className="text-xs">
                {record.project.deadline
                  ? dayjs(record.project.deadline).format('MMM D, YYYY')
                  : 'N/A'}
              </Text>
              {isOverdue && (
                <Tag color="red" className="text-xs">Overdue</Tag>
              )}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.project.progress - b.project.progress,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: false },
        { text: 'Completed', value: true },
      ],
      onFilter: (value, record) => record.project.completed === value,
      render: (_, record) => {
        const isOverdue =
          !record.project.completed &&
          dayjs(record.project.deadline).isBefore(dayjs());
        return (
          <Tag
            color={
              record.project.completed ? 'green' :
              isOverdue ? 'red' : 'orange'
            }
            className="flex items-center gap-1"
          >
            {record.project.completed ? 'Completed' :
             isOverdue ? 'Overdue' : 'Active'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setIsViewing(record)}
            className="text-blue-500"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className="text-green-500"
          />
          <Popconfirm
            title="Delete this client?"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tabs configuration
  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-1">
          <TeamOutlined /> All Clients
        </span>
      ),
    },
    {
      key: 'active',
      label: (
        <span className="flex items-center gap-1">
          <Badge status="processing" /> Active Projects
        </span>
      ),
    },
    {
      key: 'completed',
      label: (
        <span className="flex items-center gap-1">
          <Badge status="success" /> Completed
        </span>
      ),
    },
    {
      key: 'priority',
      label: (
        <span className="flex items-center gap-1">
          <Badge status="error" /> High Priority
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="!mb-0 flex items-center gap-2">
            <TeamOutlined className="text-blue-500" />
            Client Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="flex items-center"
          >
            Add Client
          </Button>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, phone, country, or project..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                className="max-w-md"
              />
            </div>
            <Space>
              {selectedRows.length > 0 && (
                <Popconfirm
                  title={`Delete ${selectedRows.length} selected clients?`}
                  onConfirm={handleBulkDelete}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Selected
                  </Button>
                </Popconfirm>
              )}
              <Upload
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept=".csv"
                disabled={importLoading}
              >
                <Button icon={<UploadOutlined />} loading={importLoading}>
                  Import
                </Button>
              </Upload>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                Export
              </Button>
            </Space>
          </div>
        </Card>

        {/* Tabbed View */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4"
        />

        {/* Client Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredClients}
            rowKey="_id"
            rowSelection={{
              selectedRowKeys: selectedRows,
              onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys),
            }}
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `${total} clients`,
            }}
            className="overflow-x-auto"
          />
        </Card>

        {/* Client Form Modal */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              {editingClient ? (
                <>
                  <EditOutlined className="text-blue-500" />
                  Edit Client
                </>
              ) : (
                <>
                  <PlusOutlined className="text-green-500" />
                  Add New Client
                </>
              )}
            </span>
          }
          open={isModalOpen}
          onOk={handleOk}
          onCancel={() => setIsModalOpen(false)}
          confirmLoading={loading}
          width={800}
          okText={editingClient ? 'Update' : 'Create'}
          cancelText="Cancel"
          destroyOnClose
        >
          <Form form={form} layout="vertical" preserve={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Client Name"
                rules={[{ required: true, message: 'Please enter client name' }]}
              >
                <Input placeholder="John Doe" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input placeholder="john@example.com" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^\+?\d[\d\s-]{8,}$/, message: 'Please enter a valid phone number' },
                ]}
              >
                <Input placeholder="+1234567890" />
              </Form.Item>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select showSearch placeholder="Select country">
                  <Option value="USA">United States</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="Canada">Canada</Option>
                  <Option value="Australia">Australia</Option>
                  <Option value="India">India</Option>
                  <Option value="Nepal">Nepal</Option>
                  <Option value="Others">Others</Option>
                </Select>
              </Form.Item>
            </div>
            <Divider orientation="left" className="!mt-8">
              <span className="flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-500" />
                Project Details
              </span>
            </Divider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="projectName"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Website Redesign" />
              </Form.Item>
              <Form.Item
                name="budget"
                label="Budget ($)"
                rules={[
                  { required: true, message: 'Please enter budget' },
                  {
                    validator: (_, value) =>
                      value >= 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Budget must be non-negative')),
                  },
                ]}
              >
                <Input type="number" placeholder="5000" prefix="$" min={0} />
              </Form.Item>
              <Form.Item
                name="progress"
                label="Progress (%)"
                rules={[
                  { required: true, message: 'Please enter progress' },
                  {
                    validator: (_, value) =>
                      value >= 0 && value <= 100
                        ? Promise.resolve()
                        : Promise.reject(new Error('Progress must be between 0 and 100')),
                  },
                ]}
              >
                <Input type="number" placeholder="75" suffix="%" min={0} max={100} />
              </Form.Item>
              <Form.Item
                name="completed"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
                initialValue={false}
              >
                <Select placeholder="Select status">
                  <Option value={false}>In Progress</Option>
                  <Option value={true}>Completed</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="deadline"
                label="Deadline"
                rules={[{ required: true, message: 'Please select deadline' }]}
              >
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  showToday={false}
                />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Project Description">
              <Input.TextArea rows={4} placeholder="Project goals, requirements, etc." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Client Detail Modal */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              {isViewing ? `Client: ${isViewing.name}` : 'Client Details'}
            </span>
          }
          open={!!isViewing}
          footer={null}
          onCancel={() => setIsViewing(null)}
          width={800}
          className="client-detail-modal"
        >
          {isViewing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="flex flex-col items-center">
                  <Avatar
                    size={120}
                    style={{
                      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                      fontSize: 48,
                    }}
                    className="mb-4"
                  >
                    {isViewing.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Title level={3} className="!mb-1 text-center">{isViewing.name}</Title>
                  <Text type="secondary" className="text-center block mb-4">{isViewing.email}</Text>
                  <div className="w-full space-y-3">
                    <div className="flex justify-between">
                      <Text strong>Phone:</Text>
                      <Text>{isViewing.phone}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Country:</Text>
                      <Tag color="geekblue">{isViewing.country}</Tag>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Created:</Text>
                      <Text>{dayjs(isViewing.createdAt).format('MMM D, YYYY')}</Text>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <Card
                  title={
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">Project:</span>
                      {isViewing.project.name}
                    </span>
                  }
                  className="h-full"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Text strong>Status:</Text>
                      <Tag
                        color={isViewing.project.completed ? 'green' : 'orange'}
                        className="flex items-center gap-1"
                      >
                        {isViewing.project.completed ? 'Completed' : 'Active'}
                      </Tag>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Budget:</Text>
                      <Text>${Number(isViewing.project.budget).toLocaleString()}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Deadline:</Text>
                      <Text>
                        {dayjs(isViewing.project.deadline).format('MMM D, YYYY')}
                        <Text type="secondary" className="ml-2">
                          ({dayjs(isViewing.project.deadline).fromNow()})
                        </Text>
                      </Text>
                    </div>
                    <div>
                      <Text strong>Progress:</Text>
                      <Progress
                        percent={Number(isViewing.project.progress)}
                        status={isViewing.project.completed ? 'success' : 'active'}
                        strokeColor={isViewing.project.completed ? undefined : '#1890ff'}
                        className="mt-2"
                      />
                    </div>
                    {isViewing.project.description && (
                      <div>
                        <Text strong>Description:</Text>
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          {isViewing.project.description}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-6">
                      <Button onClick={() => setIsViewing(null)}>Close</Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsViewing(null);
                          showModal(isViewing);
                        }}
                      >
                        Edit Client
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ClientManagement;