import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin, Empty, Tag, Space, Select } from 'antd';
import {
    UserAddOutlined,
    ScanOutlined,
    TransactionOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getGlobalAcquisitionStats, getChannelDistribution, getSalesRanking } from '@/services/acquisition';
import { useCompany } from '@/contexts/CompanyContext';

const { Text } = Typography;

const AcquisitionDashboard: React.FC = () => {
    const { currentCompanyId, isSuperAdmin } = useCompany();
    const [stats, setStats] = useState<any>(null);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (isSuperAdmin && !currentCompanyId) {
            setStats(null);
            setDistribution([]);
            setRanking([]);
            return;
        }

        setLoading(true);
        try {
            const [statsRes, distRes, rankRes] = await Promise.all([
                getGlobalAcquisitionStats(currentCompanyId),
                getChannelDistribution(currentCompanyId),
                getSalesRanking(currentCompanyId)
            ]);

            // Assume the service returns the raw data from Axios/Request
            const statsData = (statsRes as any).data || (statsRes as any);
            const distData = (distRes as any).data || (distRes as any);
            const rankData = (rankRes as any).data || (rankRes as any);

            setStats(statsData);
            setDistribution(distData || []);
            setRanking(rankData || []);
        } catch (error) {
            console.error('Failed to fetch acquisition stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentCompanyId]);

    const channelOption = {
        title: { text: '渠道来源分布', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '50%',
                data: distribution.length > 0 ? distribution : [
                    { value: 0, name: '暂无数据' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    const columns = [
        { title: '建议姓名', dataIndex: 'name', key: 'name' },
        { title: '产生扫码', dataIndex: 'scans', key: 'scans', sorter: (a: any, b: any) => a.scans - b.scans },
        { title: '成功转化', dataIndex: 'conversions', key: 'conversions', sorter: (a: any, b: any) => a.conversions - b.conversions },
        {
            title: '转化率',
            dataIndex: 'rate',
            key: 'rate',
            render: (_: any, record: any) => {
                const rate = record.scans > 0 ? ((record.conversions / record.scans) * 100).toFixed(1) : 0;
                return <Tag color={Number(rate) > 20 ? 'green' : 'orange'}>{rate}%</Tag>;
            }
        },
    ];

    if (isSuperAdmin && !currentCompanyId) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-lg shadow-sm">
                <Empty description="请在上方选择一家企业以查看获客看板数据" />
            </div>
        );
    }

    if (loading && !stats) {
        return <div className="flex justify-center items-center h-[500px]"><Spin size="large" /></div>;
    }

    const statCards = [
        { title: '累计扫码量', value: stats?.totalScans || 0, icon: <ScanOutlined />, color: '#1890ff' },
        { title: '总转化量', value: stats?.totalLeads || 0, icon: <UserAddOutlined />, color: '#52c41a' },
        { title: '平均转化率', value: stats?.totalScans > 0 ? ((stats.totalLeads / stats.totalScans) * 100).toFixed(1) + '%' : '0%', icon: <TransactionOutlined />, color: '#faad14' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">全域获客看板</h2>
                    <Text type="secondary">多渠道获客效果实时追踪与分析</Text>
                </div>
                <Space>
                    <Select defaultValue="30d" style={{ width: 120 }}>
                        <Select.Option value="7d">最近7天</Select.Option>
                        <Select.Option value="30d">最近30天</Select.Option>
                        <Select.Option value="all">全部时间</Select.Option>
                    </Select>
                </Space>
            </div>

            <Row gutter={16}>
                {statCards.map((item, index) => (
                    <Col span={8} key={index}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-all">
                            <Statistic
                                title={<span className="text-gray-500 font-medium">{item.title}</span>}
                                value={item.value}
                                prefix={<div className="p-2 rounded-lg mr-2" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</div>}
                                valueStyle={{ color: '#1f1f1f', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={16}>
                <Col span={10}>
                    <Card title="渠道来源分布" variant="borderless" className="shadow-sm">
                        <ReactECharts option={channelOption} style={{ height: '350px' }} />
                    </Card>
                </Col>
                <Col span={14}>
                    <Card title="流量引流榜单" variant="borderless" className="shadow-sm">
                        <Table
                            columns={columns}
                            dataSource={ranking}
                            pagination={{ pageSize: 5 }}
                            loading={loading}
                            rowKey={(record) => record.name + record.scans}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AcquisitionDashboard;
