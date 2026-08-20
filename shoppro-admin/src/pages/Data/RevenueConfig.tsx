import React, { useState, useEffect } from 'react';
import { Table, Card, Button, InputNumber, Typography, message } from 'antd';
import { SyncOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const RevenueConfig: React.FC = () => {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch('/api/ai/revenue/configs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setConfigs(json.data);
        } catch (e) {
            message.error('加载收入运营配置失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRow = async (record: any) => {
        try {
            const token = localStorage.getItem('token') || '';
            await fetch(`/api/ai/revenue/configs/${record.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            message.success(`${record.stageName} 基准参数已更新`);
            loadConfigs();
        } catch (e) {
            message.error('保存失败');
        }
    };

    const columns = [
        {
            title: '销售漏斗阶段',
            dataIndex: 'stageName',
            key: 'stageName',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: '基准转化率 (0.0 - 1.0)',
            dataIndex: 'benchmarkConversionRate',
            key: 'benchmarkConversionRate',
            render: (val: number, record: any) => (
                <InputNumber
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={val}
                    onChange={(newVal) => {
                        record.benchmarkConversionRate = newVal;
                        setConfigs([...configs]);
                    }}
                />
            )
        },
        {
            title: '健康最大停留天数 (超出预警)',
            dataIndex: 'maxStayDays',
            key: 'maxStayDays',
            render: (val: number, record: any) => (
                <InputNumber
                    min={1}
                    max={60}
                    value={val}
                    addonAfter="天"
                    onChange={(newVal) => {
                        record.maxStayDays = newVal;
                        setConfigs([...configs]);
                    }}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => handleSaveRow(record)}>
                    保存
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>📊 收入运营与管道阶段基准配置 (Revenue Ops)</Title>
                        <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            配置销售管道各阶段的基准转化率与停留超时预警天数，驱动移动端管道健康度热力图与商机卡单预警。
                        </Paragraph>
                    </div>
                    <Button icon={<SyncOutlined />} onClick={loadConfigs}>刷新数据</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={configs}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default RevenueConfig;
