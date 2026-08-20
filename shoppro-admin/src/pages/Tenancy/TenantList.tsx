import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Card, Typography, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface Tenant {
    id: string;
    name: string;
    code: string;
    contact: string;
    phone: string;
    plan: '标准版' | '专业版' | '企业版';
    status: 'Active' | 'Suspended' | 'Pending';
    expireDate: string;
}

import { getTenantPage } from '@/services/tenant';

const TenantList: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getTenantPage({ page, size: pageSize });
            const response = res as any;
            if (response && response.records) {
                setData(response.records);
                setPagination({ ...pagination, current: page, pageSize, total: response.total });
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, pagination.pageSize);
    };

    const columns = [
        {
            title: '租户名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <a onClick={() => navigate('/enterprise/info')} className="font-medium text-primary hover:underline cursor-pointer">{text}</a>,
        },
        {
            title: '租户编码',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag>{text}</Tag>,
        },
        {
            title: '联系人',
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: '联系电话',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '订阅版本',
            dataIndex: 'plan',
            key: 'plan',
            render: (plan: string) => {
                let color = 'geekblue';
                if (plan === '企业版') color = 'purple';
                if (plan === '标准版') color = 'default';
                return <Tag color={color}>{plan}</Tag>;
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'success';
                if (status === 'Suspended') color = 'error';
                if (status === 'Pending') color = 'warning';
                return <Tag color={color} icon={status === 'Active' ? <CheckCircleOutlined /> : null}>{status}</Tag>;
            }
        },
        {
            title: '到期时间',
            dataIndex: 'expireDate',
            key: 'expireDate',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Tenant) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/enterprise/edit/${record.id}`)} />
                    </Tooltip>
                    {record.status === 'Active' ? (
                        <Tooltip title="Suspend">
                            <Button type="text" danger icon={<StopOutlined />} />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Activate">
                            <Button type="text" className="text-green-600" icon={<CheckCircleOutlined />} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
                <Title level={4} className="!mb-0">租户列表</Title>
                <Space>
                    <Input placeholder="搜索租户名称/编码" prefix={<SearchOutlined className="text-gray-400" />} className="w-64 rounded-full" />
                    <Button icon={<ReloadOutlined />} onClick={handleSearch} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tenancy/provision')}>
                        开通租户
                    </Button>
                </Space>
            </div>

            <Card bordered={false} className="shadow-sm rounded-lg" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => fetchData(page, pageSize),
                        showSizeChanger: true,
                        showQuickJumper: true
                    }}
                    className="custom-table"
                />
            </Card>
        </div>
    );
};

export default TenantList;
