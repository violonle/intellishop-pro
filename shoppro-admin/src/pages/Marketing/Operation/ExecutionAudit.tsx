import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Tag, Select, DatePicker, Statistic, Space, message } from 'antd';
import { BarChartOutlined, ArrowUpOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getSopAudits, type SopAuditRecord, type SopAuditResponse } from '@/services/operation';

const { RangePicker } = DatePicker;

const ExecutionAudit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SopAuditRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<{ status?: string; ruleName?: string }>({});
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getSopAudits({
        page: pagination.current,
        size: pagination.pageSize,
        ...filters
      });
      
      const data = response as unknown as SopAuditResponse;
      if (data && data.records) {
        setData(data.records);
        setPagination(prev => ({ ...prev, total: data.total }));
        calculateStats(data.records);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('获取审计数据失败:', error);
      message.error('获取审计数据失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: SopAuditRecord[]) => {
    setStats({
      total: records.length,
      success: records.filter(r => r.status === 'success').length,
      failed: records.filter(r => r.status === 'failed').length,
      pending: records.filter(r => r.status === 'pending' || r.status === 'running').length
    });
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      success: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
      pending: { color: 'processing', text: '处理中', icon: <ClockCircleOutlined /> },
      running: { color: 'warning', text: '执行中', icon: <WarningOutlined /> }
    };
    const c = config[status] || config.pending;
    return <Tag color={c.color} icon={c.icon}>{c.text}</Tag>;
  };

  const getTargetTypeText = (type: string) => {
    const map: Record<string, string> = {
      customer: '客户',
      lead: '线索',
      order: '订单',
      task: '任务'
    };
    return map[type] || type;
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(prev => ({ 
      ...prev, 
      current: paginationConfig.current, 
      pageSize: paginationConfig.pageSize 
    }));
  };

  const columns: ColumnsType<SopAuditRecord> = [
    {
      title: '执行时间',
      dataIndex: 'executedAt',
      key: 'executedAt',
      width: 180,
      sorter: (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
    },
    {
      title: '触发事件',
      dataIndex: 'triggerEvent',
      key: 'triggerEvent',
      render: (event: string) => {
        const map: Record<string, string> = {
          manual: '手动',
          scheduled: '定时',
          event: '事件触发'
        };
        return map[event] || event;
      }
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (type: string) => <Tag>{getTargetTypeText(type)}</Tag>
    },
    {
      title: '目标名称',
      dataIndex: 'targetName',
      key: 'targetName',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (ms: number) => `${ms}ms`,
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      render: (msg: string | null) => msg ? <span className="text-red-500">{msg}</span> : '-'
    }
  ];

  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';
  const avgDuration = data.length > 0 ? Math.round(data.reduce((sum, r) => sum + r.duration, 0) / data.length) : 0;

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic 
              title="总执行次数" 
              value={stats.total} 
              prefix={<BarChartOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="成功" 
              value={stats.success} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="失败" 
              value={stats.failed} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="成功率" 
              value={successRate} 
              suffix="%" 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card>
            <Statistic 
              title="平均执行耗时" 
              value={avgDuration} 
              suffix="ms"
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-500 mb-2">今日执行</div>
                <div className="text-2xl font-bold">{stats.total > 0 ? Math.ceil(stats.total / 7) : 0}</div>
              </div>
              <div className="text-green-500 flex items-center">
                <ArrowUpOutlined /> 8%
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="执行记录" className="mb-4">
        <div className="mb-4 flex justify-between">
          <Space>
            <Select 
              placeholder="规则名称" 
              style={{ width: 200 }} 
              allowClear
              onChange={(value) => handleFilterChange('ruleName', value)}
            >
              <Select.Option value="新客户欢迎流程">新客户欢迎流程</Select.Option>
              <Select.Option value="线索超时提醒">线索超时提醒</Select.Option>
              <Select.Option value="订单完成通知">订单完成通知</Select.Option>
            </Select>
            <Select 
              placeholder="执行状态" 
              style={{ width: 120 }} 
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
              <Select.Option value="pending">处理中</Select.Option>
            </Select>
          </Space>
          <RangePicker />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ 
            ...pagination, 
            showSizeChanger: true, 
            showTotal: (total) => `共 ${total} 条` 
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ExecutionAudit;
