import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Switch, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getAutomationRules, 
  createAutomationRule, 
  updateAutomationRule, 
  deleteAutomationRule, 
  toggleAutomationRule,
  type AutomationRule 
} from '@/services/operation';

const AutomationRules: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AutomationRule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AutomationRule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAutomationRules() as unknown as AutomationRule[];
      if (Array.isArray(response)) {
        setData(response);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('获取规则失败:', error);
      message.error('获取规则失败');
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

  const handleEdit = (record: AutomationRule) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleToggle = async (record: AutomationRule) => {
    try {
      await toggleAutomationRule(record.id!);
      setData(prev => prev.map(item => 
        item.id === record.id ? { ...item, isActive: !item.isActive } : item
      ));
      message.success(record.isActive ? '规则已停用' : '规则已启用');
    } catch (error) {
      console.error('切换状态失败:', error);
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAutomationRule(id);
      setData(prev => prev.filter(item => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        const updated = await updateAutomationRule(editingRecord.id!, values) as unknown as AutomationRule;
        setData(prev => prev.map(item => item.id === editingRecord.id ? updated : item));
        message.success('更新成功');
      } else {
        const created = await createAutomationRule(values) as unknown as AutomationRule;
        setData(prev => [...prev, created]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const getTriggerEventText = (event: string) => {
    const map: Record<string, { text: string; color: string }> = {
      manual: { text: '手动触发', color: 'default' },
      lead_created: { text: '线索创建', color: 'blue' },
      customer_created: { text: '客户创建', color: 'green' },
      lead_overdue: { text: '线索超时', color: 'orange' },
      order_completed: { text: '订单完成', color: 'purple' },
      follow_up_due: { text: '跟进到期', color: 'red' }
    };
    return map[event] || { text: event, color: 'default' };
  };

  const columns: ColumnsType<AutomationRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AutomationRule) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{name}</span>
          <span className="text-gray-400 text-xs">{record.description}</span>
        </Space>
      )
    },
    {
      title: '触发事件',
      dataIndex: 'triggerEvent',
      key: 'triggerEvent',
      render: (event: string) => {
        const config = getTriggerEventText(event);
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '执行次数',
      dataIndex: 'executionCount',
      key: 'executionCount',
      sorter: (a, b) => (a.executionCount || 0) - (b.executionCount || 0),
    },
    {
      title: '最后执行',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      render: (time: string | null | undefined) => time || '-'
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean, record: AutomationRule) => (
        <Switch
          checked={active}
          onChange={() => handleToggle(record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AutomationRule) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            <SettingOutlined />
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record.id!)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const activeRules = data.filter(r => r.isActive);
  const totalExecutions = data.reduce((sum, r) => sum + (r.executionCount || 0), 0);

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.length}</div>
            <div className="text-gray-500">规则总数</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{activeRules.length}</div>
            <div className="text-gray-500">启用中</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{totalExecutions}</div>
            <div className="text-gray-500">总执行次数</div>
          </div>
        </Card>
      </div>

      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建规则
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingRecord ? '编辑规则' : '创建规则'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="例如：新客户欢迎流程" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="规则的简单描述" />
          </Form.Item>
          <Form.Item name="triggerEvent" label="触发事件" rules={[{ required: true, message: '请选择触发事件' }]}>
            <Select placeholder="选择触发条件">
              <Select.Option value="manual">手动触发</Select.Option>
              <Select.Option value="lead_created">线索创建时</Select.Option>
              <Select.Option value="customer_created">客户创建时</Select.Option>
              <Select.Option value="lead_overdue">线索超时</Select.Option>
              <Select.Option value="order_completed">订单完成时</Select.Option>
              <Select.Option value="follow_up_due">跟进到期时</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="conditions" label="触发条件">
            <Input.TextArea rows={2} placeholder='JSON格式，如 {"days": 3}' />
          </Form.Item>
          <Form.Item name="actions" label="执行动作">
            <Input.TextArea rows={3} placeholder='JSON格式，如 [{"type":"send_message"}]' />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0}>
            <Input type="number" placeholder="数值越大越优先" />
          </Form.Item>
          <Form.Item name="isActive" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AutomationRules;
