import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, CopyOutlined, BarChartOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';

interface ChannelCode {
  id: number;
  name: string;
  code: string;
  type: string;
  targetUrl: string;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
}

const ChannelCodeManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChannelCode[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChannelCode | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await request<ChannelCode[]>({ url: '/acquisition/channels', method: 'get' }) as unknown as ChannelCode[];
      setData(result || []);
    } catch (error) {
      console.error('获取渠道码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ChannelCode) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request({ url: `/acquisition/channels/${id}`, method: 'delete' });
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await request({
        url: editingRecord ? `/acquisition/channels/${editingRecord.id}` : '/acquisition/channels',
        method: editingRecord ? 'put' : 'post',
        data: values
      });
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const columns: ColumnsType<ChannelCode> = [
    {
      title: '渠道名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '渠道码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Space>
          <span>{code}</span>
          <CopyOutlined onClick={() => copyToClipboard(code)} style={{ cursor: 'pointer', color: '#1890ff' }} />
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'qrcode': 'blue',
          'link': 'green',
          'poster': 'orange'
        };
        const labelMap: Record<string, string> = {
          'qrcode': '二维码',
          'link': '链接',
          'poster': '海报'
        };
        return <Tag color={colorMap[type] || 'default'}>{labelMap[type] || type}</Tag>;
      }
    },
    {
      title: '目标URL',
      dataIndex: 'targetUrl',
      key: 'targetUrl',
      ellipsis: true,
    },
    {
      title: '扫码数',
      dataIndex: 'scanCount',
      key: 'scanCount',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalScans = data.reduce((sum, item) => sum + item.scanCount, 0);
  const activeCount = data.filter(item => item.isActive).length;

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic title="渠道码总数" value={data.length} prefix={<QrcodeOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总扫码次数" value={totalScans} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="启用中" value={activeCount} valueStyle={{ color: '#3f8600' }} prefix={<EyeOutlined />} />
          </Card>
        </Col>
      </Row>

      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建渠道码
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingRecord ? '编辑渠道码' : '创建渠道码'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="渠道名称" rules={[{ required: true, message: '请输入渠道名称' }]}>
            <Input placeholder="例如：官网首页引流" />
          </Form.Item>
          <Form.Item name="code" label="渠道码" rules={[{ required: true, message: '请输入渠道码' }]}>
            <Input placeholder="例如：OFFICIAL_WEB" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="选择渠道类型">
              <Select.Option value="qrcode">二维码</Select.Option>
              <Select.Option value="link">链接</Select.Option>
              <Select.Option value="poster">海报</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetUrl" label="目标URL" rules={[{ required: true, message: '请输入目标URL' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="isActive" label="状态" initialValue={true}>
            <Select>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChannelCodeManagement;
