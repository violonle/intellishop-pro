import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, DatePicker, Steps, message, Divider, Typography, Row, Col } from 'antd';
import { UserOutlined, ShopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createTenant } from '@/services/tenant';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Provision: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                code: values.code,
                contact: values.contact,
                phone: values.phone,
                address: values.address,
                plan: values.plan === 'Standard' ? '标准版' : values.plan === 'Pro' ? '专业版' : '企业版',
                status: 1,
                expireDate: values.startDate ? dayjs(values.startDate).add(Number(values.duration), 'year').toISOString() : undefined
            };

            await createTenant(payload);
            message.success('租户开通成功！');
            navigate('/tenancy/list');
        } catch (error) {
            console.error(error);
            message.error('租户开通失败');
        } finally {
            setLoading(false);
        }
    };

    const next = async () => {
        try {
            if (currentStep === 0) {
                await form.validateFields(['name', 'code', 'contact', 'phone', 'address']);
            } else if (currentStep === 1) {
                await form.validateFields(['plan', 'startDate', 'duration']);
            }
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="mb-6">
                <Button type="link" onClick={() => navigate(-1)} className="px-0 text-gray-500 mb-2">← 返回列表</Button>
                <Title level={3} className="!mb-1">开通新租户</Title>
                <Text type="secondary">为新客户配置SaaS环境、管理员账号及订阅方案</Text>
            </div>

            <Card bordered={false} className="shadow-md rounded-xl">
                <Steps
                    current={currentStep}
                    className="mb-10 px-10 py-4 bg-gray-50 rounded-lg"
                    items={[
                        { title: '基本信息', icon: <ShopOutlined />, description: '企业基本资料' },
                        { title: '订阅配置', icon: <SafetyCertificateOutlined />, description: '版本与期限' },
                        { title: '管理员设置', icon: <UserOutlined />, description: '初始账号' },
                    ]}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="px-4 md:px-20"
                    size="large"
                    initialValues={{ plan: 'Standard', duration: '1', startDate: dayjs() }}
                >
                    {/* Step 1: Basic Info */}
                    <div className={currentStep === 0 ? 'block' : 'hidden'}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="name" label="企业名称" rules={[{ required: true }]}>
                                    <Input placeholder="输入企业全称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="code" label="租户编码 (Domain Prefix)" rules={[{ required: true }]}>
                                    <Input addonBefore="http://" addonAfter=".shoppro.com" placeholder="unique-code" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="contact" label="联系人姓名" rules={[{ required: true }]}>
                                    <Input placeholder="联系人" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                                    <Input placeholder="手机号码" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="address" label="企业地址">
                            <Input.TextArea rows={3} placeholder="详细办公地址" />
                        </Form.Item>
                    </div>

                    {/* Step 2: Subscription */}
                    <div className={currentStep === 1 ? 'block' : 'hidden'}>
                        <Form.Item name="plan" label="选择订阅版本" rules={[{ required: true }]}>
                            <Select placeholder="请确认选择版本">
                                <Option value="Standard">标准版 (Standard) - ¥ 9,999/年</Option>
                                <Option value="Pro">专业版 (Professional) - ¥ 19,999/年</Option>
                                <Option value="Enterprise">企业版 (Enterprise) - 定制报价</Option>
                            </Select>
                        </Form.Item>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="startDate" label="生效日期" rules={[{ required: true }]}>
                                    <DatePicker className="w-full" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="duration" label="订阅时长" rules={[{ required: true }]}>
                                    <Select placeholder="选择时长">
                                        <Option value="1">1年</Option>
                                        <Option value="2">2年</Option>
                                        <Option value="3">3年</Option>
                                        <Option value="5">5年</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {/* Step 3: Admin Account */}
                    <div className={currentStep === 2 ? 'block' : 'hidden'}>
                        <Card className="bg-blue-50 border-blue-100 mb-6">
                            <div className="flex items-start gap-3">
                                <UserOutlined className="text-primary mt-1" />
                                <div>
                                    <h4 className="font-bold text-blue-900">初始管理员账号设置</h4>
                                    <p className="text-blue-700 text-sm">请设置企业超级管理员的登录账号与密码。该账号拥有系统最高权限。</p>
                                </div>
                            </div>
                        </Card>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="adminUsername" label="管理员用户名" rules={[{ required: true }]}>
                                    <Input placeholder="建议使用 admin 或企业简称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="adminEmail" label="管理员邮箱" rules={[{ required: true, type: 'email' }]}>
                                    <Input placeholder="接收系统通知" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="adminPassword" label="管理员密码" rules={[{ required: true, message: '请输入管理员密码' }]}>
                            <Input.Password placeholder="设置登录密码" />
                        </Form.Item>
                    </div>

                    <Divider />

                    <div className="flex justify-end gap-3">
                        {currentStep > 0 && (
                            <Button onClick={prev} size="large">
                                上一步
                            </Button>
                        )}
                        {currentStep < 2 && (
                            <Button type="primary" onClick={next} size="large">
                                下一步
                            </Button>
                        )}
                        {currentStep === 2 && (
                            <Button type="primary" htmlType="submit" size="large" loading={loading} className="bg-primary">
                                提交并开通
                            </Button>
                        )}
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Provision;
