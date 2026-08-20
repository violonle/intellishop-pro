import React from 'react';
import { Table, Card, Button, Input, Space, Tag, Tabs, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProductPage, updateProduct } from '@/services/product';

const ProductList: React.FC = () => {
    const navigate = useNavigate();

    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [pagination, setPagination] = React.useState({ current: 1, pageSize: 10, total: 0 });

    const fetchProducts = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getProductPage({
                pageNo: page,
                pageSize,
                // Add filters if needed
                // company: companyFilter 
            });
            const response = res as any;
            if (response && response.records) {
                setProducts(response.records);
                setPagination({ ...pagination, current: page, pageSize, total: response.total });
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const handleTakeOffline = async (record: any) => {
        try {
            await updateProduct(record.id, { status: 'inactive' });
            message.success('商品已下架');
            fetchProducts(pagination.current, pagination.pageSize);
        } catch (error: any) {
            message.error(error.message || '商品下架失败');
        }
    };

    const columns = [
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <a className="text-primary font-medium">{text}</a>
        },
        {
            title: '所属公司',
            dataIndex: 'company',
            key: 'company',
            render: (text: string) => <Tag>{text}</Tag>
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `¥ ${price.toLocaleString()}`
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => <span className={stock < 10 ? 'text-red-50' : ''}>{stock}</span>
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={status === 'On Sale' ? 'green' : 'red'}>{status}</Tag>
        },
        {
            title: '操作',
            key: 'action',
            render: (record: any) => (
                <Space>
                    <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/enterprise/product/edit/${record.id}`)}>编辑</Button>
                    <Button type="link" size="small" danger style={{ padding: 0 }} onClick={() => handleTakeOffline(record)} disabled={record.status !== 'On Sale' && record.status !== 'active'}>下架</Button>
                </Space>
            )
        }
    ];

    const handleAddProduct = () => {
        navigate('/enterprise/product/add');
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">企业商品库</h2>
                <Space>
                    <Input placeholder="输入商品名称" prefix={<SearchOutlined />} />
                    <Button icon={<FilterOutlined />}>筛选</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>新增商品</Button>
                </Space>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Tabs defaultActiveKey="1" items={[
                    { key: '1', label: '全部商品' },
                    { key: '2', label: '销售中' },
                    { key: '3', label: '已下架' },
                    { key: '4', label: '库存预警' },
                ]} />
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => fetchProducts(page, pageSize),
                    }}
                />
            </Card>
        </div>
    );
};

export default ProductList;
