import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Card, Typography, Tooltip, Avatar } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, TeamOutlined, ShopOutlined, ScanOutlined, AuditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getTenantPage } from '@/services/tenant';
import { useCompany } from '@/contexts/CompanyContext';

const { Title } = Typography;

const CompanyList: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const { setCurrentCompanyId } = useCompany();

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getTenantPage({
                pageNo: page,
                pageSize,
                name: searchText
            });
            const response = res as any;
            if (response && response.records) {
                setData(response.records);
                setPagination({ ...pagination, current: page, pageSize, total: response.total });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, pagination.pageSize);
    };

    const columns = [
        {
            title: '公司名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <a onClick={() => navigate(`/enterprise/info?id=${record.id}`)} className="font-bold text-primary hover:underline flex items-center gap-2">
                    <Avatar shape="square" size="small" icon={<ShopOutlined />} className="bg-blue-100 text-blue-600" />
                    {text}
                </a>
            ),
        },
        {
            title: '租户编码',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag>{text}</Tag>,
        },
        {
            title: '负责人',
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: '联系电话',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '商品数量',
            dataIndex: 'productCount',
            key: 'productCount',
            align: 'center' as const,
            render: (count: number, record: any) => (
                <a onClick={() => navigate(`/enterprise/product?company=${record.code}`)} className="text-primary hover:underline font-bold">
                    {count || 0}
                </a>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (record: any) => (
                <Space size="middle">
                    <Tooltip title="获客管理">
                        <Button
                            type="text"
                            icon={<ScanOutlined />}
                            className="text-green-500 hover:text-green-600"
                            onClick={() => {
                                setCurrentCompanyId(Number(record.id));
                                navigate('/marketing/acquisition/dashboard');
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="运营助手">
                        <Button
                            type="text"
                            icon={<AuditOutlined />}
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => {
                                setCurrentCompanyId(Number(record.id));
                                navigate('/marketing/operation/sop');
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="查看详情">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/enterprise/detail/${record.id}`)} />
                    </Tooltip>
                    <Tooltip title="编辑信息">
                        <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/enterprise/edit/${record.id}`)} />
                    </Tooltip>
                    <Tooltip title="核心团队管理">
                        <Button type="text" className="text-blue-600" icon={<TeamOutlined />} onClick={() => navigate(`/enterprise/team/${record.id}`)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
                <Title level={4} className="!mb-0">公司列表</Title>
                <Space>
                    <Input
                        placeholder="搜索公司名称/负责人"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="w-64 rounded-full"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="primary" onClick={handleSearch}>查询</Button>
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
                    }}
                />
            </Card>
        </div>
    );
};

export default CompanyList;
