import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, InputNumber, Upload, message, Row, Col, Divider, Space, Radio, Switch, Spin } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct } from '@/services/product';
import { getAllActiveCategories } from '@/services/category';
import { getTenantPage } from '@/services/tenant';

const { TextArea } = Input;
const { Option } = Select;

const ProductEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const initData = async () => {
            if (!id) {
                message.error('商品ID不存在');
                navigate('/enterprise/product');
                return;
            }

            setFetching(true);
            try {
                const [productRes, catRes, tenantRes] = await Promise.all([
                    getProductById(Number(id)),
                    getAllActiveCategories(),
                    getTenantPage({ pageNo: 1, pageSize: 100 })
                ]);

                // 处理商品数据
                const productData = productRes as any;
                if (productData) {
                    form.setFieldsValue({
                        name: productData.name,
                        categoryId: productData.categoryId,
                        sku: productData.sku,
                        brand: productData.brand,
                        price: productData.price,
                        originalPrice: productData.marketPrice,
                        cost: productData.costPrice,
                        description: productData.description,
                        stock: productData.stockQuantity,
                        minStock: productData.minStock,
                        isFeatured: productData.isFeatured === 1,
                        status: productData.status === 1 ? 'online' : 'offline',
                        tenantId: productData.tenantId
                    });

                    // 处理图片
                    if (productData.images && Array.isArray(productData.images)) {
                        const images = productData.images.map((url: string, index: number) => ({
                            uid: `-${index}`,
                            name: `image-${index}.png`,
                            status: 'done',
                            url: url
                        }));
                        setFileList(images);
                    }
                }

                // 处理分类数据
                const catData = catRes as any;
                if (Array.isArray(catData)) {
                    setCategories(catData);
                } else if (catData?.data) {
                    setCategories(catData.data);
                }

                // 处理租户数据
                const tenantData = tenantRes as any;
                if (tenantData?.records) {
                    setTenants(tenantData.records);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                message.error('加载商品数据失败');
            } finally {
                setFetching(false);
            }
        };
        initData();
    }, [id, form, navigate]);

    const onFinish = async (values: any) => {
        if (!id) return;

        setLoading(true);
        try {
            const payload = {
                name: values.name,
                categoryId: values.categoryId,
                sku: values.sku || `SKU-${Date.now()}`,
                brand: values.brand || 'ShopPro',
                price: values.price,
                marketPrice: values.originalPrice,
                costPrice: values.cost,
                description: values.description,
                stockQuantity: values.stock,
                minStock: values.minStock || 10,
                isFeatured: values.isFeatured ? 1 : 0,
                status: values.status === 'online' ? 1 : 0,
                images: fileList.map((f: any) => f.url || f.response?.url || f.thumbUrl).filter(Boolean),
                tenantId: values.tenantId
            };

            await updateProduct(Number(id), payload);
            message.success('商品更新成功！');
            navigate('/enterprise/product');
        } catch (error) {
            console.error(error);
            message.error('商品更新失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        const processedList = newFileList.map((file: any) => {
            if (file.response && file.response.url) {
                return { ...file, url: file.response.url };
            }
            return file;
        });
        setFileList(processedList);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <div>
                        <h2 className="text-2xl font-bold m-0">编辑商品</h2>
                        <span className="text-gray-500">修改商品信息</span>
                    </div>
                </div>
                <Space>
                    <Button onClick={() => navigate(-1)}>取消</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
                        保存修改
                    </Button>
                </Space>
            </div>

            <Spin spinning={fetching}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Main Info */}
                        <div className="md:col-span-2 space-y-6">
                            <Card title="基本信息" bordered={false} className="shadow-sm rounded-xl">
                                <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                                    <Input placeholder="请输入商品标题" />
                                </Form.Item>

                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item name="categoryId" label="商品分类" rules={[{ required: true, message: '请选择分类' }]}>
                                            <Select placeholder="选择分类" showSearch optionFilterProp="label">
                                                {categories.map(cat => (
                                                    <Option key={cat.id} value={cat.id} label={cat.name}>{cat.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="brand" label="品牌">
                                            <Input placeholder="如：ShopPro" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="isFeatured" label="精品推荐" valuePropName="checked">
                                            <Switch />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="description" label="商品介绍">
                                    <TextArea rows={6} placeholder="详细描述商品的规格、功能亮点及使用场景..." showCount maxLength={1000} />
                                </Form.Item>
                            </Card>

                            <Card title="商品图册" bordered={false} className="shadow-sm rounded-xl">
                                <Form.Item name="images" help="建议尺寸：800x800像素，支持 JPG/PNG 格式">
                                    <Upload
                                        action="/api/files/upload"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={handleUploadChange}
                                        name="file"
                                    >
                                        {fileList.length >= 8 ? null : uploadButton}
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </div>

                        {/* Right Column: Pricing & Specs */}
                        <div className="space-y-6">
                            <Card title="归属与定价" bordered={false} className="shadow-sm rounded-xl">
                                <Form.Item name="tenantId" label="所属租户" rules={[{ required: true, message: '请选择所属租户' }]}>
                                    <Select placeholder="选择归属租户" showSearch optionFilterProp="label">
                                        {tenants.map(t => (
                                            <Option key={t.id} value={t.id} label={t.name}>{t.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="price" label="销售价格 (CNY)" rules={[{ required: true, message: '请输入价格' }]}>
                                    <InputNumber
                                        className="w-full"
                                        formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                                        min={0}
                                    />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="cost" label="成本价">
                                            <InputNumber className="w-full" min={0} prefix="¥" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="originalPrice" label="划线价">
                                            <InputNumber className="w-full" min={0} prefix="¥" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Divider />

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="stock" label="库存数量" rules={[{ required: true }]}>
                                            <InputNumber className="w-full" min={0} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="minStock" label="最低库存预警">
                                            <InputNumber className="w-full" min={0} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="sku" label="SKU 编码">
                                    <Input placeholder="自动生成或手动输入" />
                                </Form.Item>
                            </Card>

                            <Card title="发布状态" bordered={false} className="shadow-sm rounded-xl">
                                <Form.Item name="status" label="上架设置">
                                    <Radio.Group className="w-full flex flex-col gap-2">
                                        <Radio value="online" className="border p-3 rounded-lg hover:border-primary flex items-center">
                                            <span className="font-bold text-green-600 mr-2">●</span> 立即上架销售
                                        </Radio>
                                        <Radio value="offline" className="border p-3 rounded-lg hover:border-primary flex items-center">
                                            <span className="font-bold text-gray-400 mr-2">●</span> 放入仓库 (下架)
                                        </Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Card>
                        </div>
                    </div>
                </Form>
            </Spin>
        </div>
    );
};

export default ProductEdit;
