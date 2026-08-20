import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getWelcomeMessages, 
  saveWelcomeMessage, 
  deleteWelcomeMessage,
  type WelcomeMessage as WelcomeMessageType
} from '@/services/acquisition';

const { TextArea } = Input;

const WelcomeMessageManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WelcomeMessageType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WelcomeMessageType | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getWelcomeMessages() as unknown as WelcomeMessageType[];
      if (Array.isArray(response)) {
        setData(response);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('获取欢迎语失败:', error);
      message.error('获取欢迎语失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: WelcomeMessageType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWelcomeMessage(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveWelcomeMessage({
        ...values,
        id: editingRecord?.id
      });
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const columns: ColumnsType<WelcomeMessageType> = [
    {
      title: '渠道',
      dataIndex: 'channelCodeName',
      key: 'channelCodeName',
    },
    {
      title: '欢迎语内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <span className="max-w-xs truncate block">{content}</span>
      )
    },
    {
      title: '消息类型',
      dataIndex: 'msgType',
      key: 'msgType',
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          text: { color: 'blue', text: '文本' },
          image: { color: 'green', text: '图片' },
          video: { color: 'orange', text: '视频' },
          miniprogram: { color: 'purple', text: '小程序' }
        };
        const config = map[type || 'text'] || { color: 'default', text: type || '文本' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean | undefined) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: WelcomeMessageType) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id!)}>
            <Button type="link" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'list',
      label: '欢迎语列表',
      children: (
        <>
          <div className="mb-4 flex justify-end">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加欢迎语
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
          />
        </>
      )
    },
    {
      key: 'preview',
      label: '预览效果',
      children: (
        <div className="flex justify-center">
          <div className="w-[375px] bg-gray-100 rounded-lg p-4 min-h-[600px]">
            <div className="text-center text-gray-500 text-sm mb-4">手机预览</div>
            {data.filter(w => w.isActive).slice(0, 1).map(welcome => (
              <div key={welcome.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <MessageOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">{welcome.channelCodeName}</div>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm">
                      {welcome.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-gray-400 py-8">暂无欢迎语</div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title={editingRecord ? '编辑欢迎语' : '添加欢迎语'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="channelCodeId" label="所属渠道" rules={[{ required: true, message: '请选择渠道' }]}>
            <Select placeholder="选择渠道码">
              <Select.Option value={1}>官网引流</Select.Option>
              <Select.Option value={2}>微信群</Select.Option>
              <Select.Option value={3}>线下活动</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="欢迎语内容" rules={[{ required: true, message: '请输入欢迎语内容' }]}>
            <TextArea rows={4} placeholder="请输入欢迎语内容，支持表情符号" />
          </Form.Item>
          <Form.Item name="msgType" label="消息类型" initialValue="text">
            <Select>
              <Select.Option value="text">纯文本</Select.Option>
              <Select.Option value="image">图片</Select.Option>
              <Select.Option value="video">视频</Select.Option>
              <Select.Option value="miniprogram">小程序卡片</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={1}>
            <Select>
              <Select.Option value={1}>1 - 最高</Select.Option>
              <Select.Option value={2}>2</Select.Option>
              <Select.Option value={3}>3</Select.Option>
              <Select.Option value={4}>4</Select.Option>
              <Select.Option value={5}>5 - 最低</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="状态" initialValue={true} valuePropName="checked">
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

export default WelcomeMessageManagement;
