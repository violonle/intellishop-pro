import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Select, Row, Col, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getTenantDetail, updateTenant } from '@/services/tenant';

const { TextArea } = Input;
const { Option } = Select;

const EnterpriseEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchEnterprise = async () => {
            if (!id) {
                message.error('企业ID不存在');
                navigate('/enterprise/list');
                return;
            }

            setFetching(true);
            try {
                const res = await getTenantDetail(id);
                const enterprise = res as any;
                form.setFieldsValue({
                    name: enterprise.name,
                    code: enterprise.code,
                    contactPerson: enterprise.contactPerson,
                    contactPhone: enterprise.contactPhone,
                    email: enterprise.email,
                    address: enterprise.address,
                    industry: enterprise.industry,
                    scale: enterprise.scale,
                    status: enterprise.status,
                    remark: enterprise.remark
                });
            } catch (error) {
                console.error(error);
                message.error('加载企业信息失败');
            } finally {
                setFetching(false);
            }
        };
        fetchEnterprise();
    }, [id, form, navigate]);

    const onFinish = async (values: any) => {
        if (!id) return;

        setLoading(true);
        try {
            await updateTenant(id, values);
            message.success('企业信息更新成功！');
            navigate(`/enterprise/detail/${id}`);
        } catch (error) {
            console.error(error);
            message.error('企业信息更新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <div>
                        <h2 className="text-2xl font-bold m-0">编辑企业</h2>
                        <span className="text-gray-500">修改企业基本信息</span>
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
                    <Card title="基本信息" bordered={false} className="shadow-sm mb-6">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="name" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
                                    <Input placeholder="请输入企业名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="code" label="企业代码">
                                    <Input placeholder="请输入企业代码" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="contactPerson" label="联系人">
                                    <Input placeholder="请输入联系人姓名" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="contactPhone" label="联系电话">
                                    <Input placeholder="请输入联系电话" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="email" label="邮箱">
                                    <Input placeholder="请输入邮箱地址" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="status" label="状态">
                                    <Select placeholder="请选择状态">
                                        <Option value={1}>正常</Option>
                                        <Option value={0}>停用</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="address" label="地址">
                            <Input placeholder="请输入企业地址" />
                        </Form.Item>
                    </Card>

                    <Card title="其他信息" bordered={false} className="shadow-sm">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="industry" label="行业类型">
                                    <Select placeholder="请选择行业类型">
                                        <Option value="technology">科技</Option>
                                        <Option value="finance">金融</Option>
                                        <Option value="education">教育</Option>
                                        <Option value="healthcare">医疗</Option>
                                        <Option value="retail">零售</Option>
                                        <Option value="manufacturing">制造</Option>
                                        <Option value="other">其他</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="scale" label="企业规模">
                                    <Select placeholder="请选择企业规模">
                                        <Option value="1-50">1-50人</Option>
                                        <Option value="51-200">51-200人</Option>
                                        <Option value="201-500">201-500人</Option>
                                        <Option value="501-1000">501-1000人</Option>
                                        <Option value="1000+">1000人以上</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="remark" label="备注">
                            <TextArea rows={4} placeholder="请输入备注信息" />
                        </Form.Item>
                    </Card>
                </Form>
            </Spin>
        </div>
    );
};

export default EnterpriseEdit;
