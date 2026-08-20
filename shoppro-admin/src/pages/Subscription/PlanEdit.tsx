import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, InputNumber, Select, Divider, message, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { getSubscriptionPlan, updateSubscriptionPlan } from '@/services/subscription';

const { Option } = Select;

const PlanEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id || isNaN(Number(id))) return;
            setFetching(true);
            try {
                const res = await getSubscriptionPlan(Number(id));
                const response = res as any;
                if (response) {
                    form.setFieldsValue(response);
                }
            } catch (error) {
                console.error(error);
                message.error('获取计划详情失败');
            } finally {
                setFetching(false);
            }
        };
        fetchPlan();
    }, [id, form]);

    const onFinish = async (values: any) => {
        if (!id || isNaN(Number(id))) {
            message.warning('无效的计划ID');
            return;
        }
        setLoading(true);
        try {
            await updateSubscriptionPlan(Number(id), values);
            message.success('订阅计划配置已保存');
            navigate('/subscription/plans');
        } catch (error) {
            console.error(error);
            message.error('保存失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                <h2 className="text-2xl font-bold m-0">编辑订阅计划 ID: {id}</h2>
            </div>

            <Spin spinning={fetching}>
                <Card bordered={false} className="shadow-lg rounded-xl">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                    >
                        <Divider>基本信息</Divider>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item name="name" label="计划名称" rules={[{ required: true }]}>
                                <Input placeholder="如：标准版" />
                            </Form.Item>
                            <Form.Item name="price" label="年度价格说明" rules={[{ required: true }]}>
                                <Input placeholder="如：¥ 9,999/年" />
                            </Form.Item>
                        </div>

                        <Divider>团队与协作限制</Divider>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item name="teamLimit" label="支持团队数量" help="允许创建的独立业务团队数">
                                <InputNumber className="w-full" suffix="个" min={0} />
                            </Form.Item>
                            <Form.Item name="memberPerTeam" label="单团队人数上限">
                                <InputNumber className="w-full" suffix="人" min={0} />
                            </Form.Item>
                        </div>

                        <Divider>业务权益配置</Divider>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item name="productLimit" label="商品管理数量上限">
                                <InputNumber className="w-full" suffix="SPU" min={0} />
                            </Form.Item>
                            <Form.Item name="kbLimit" label="知识库条目限制">
                                <InputNumber className="w-full" suffix="条" min={0} />
                            </Form.Item>
                        </div>

                        <Divider>AI 与数据能力</Divider>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item name="aiModel" label="AI 分析大模型">
                                <Select>
                                    <Option value="GPT-3.5">GPT-3.5 Turbo (基础版)</Option>
                                    <Option value="GPT-4">GPT-4 (专业版)</Option>
                                    <Option value="GPT-4-Turbo">GPT-4 Turbo (旗舰版)</Option>
                                    <Option value="Claude-3">Claude 3 Opus</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="dataScope" label="数据分析权限范围">
                                <Select>
                                    <Option value="basic">基础报表 (仅概览)</Option>
                                    <Option value="advanced">进阶分析 (趋势/对比)</Option>
                                    <Option value="all">全量深度挖掘 (预测/归因)</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item name="description" label="详细描述">
                            <Input.TextArea rows={3} placeholder="简要描述该计划的适用对象及核心优势" />
                        </Form.Item>

                        <Divider />

                        <div className="flex justify-end gap-4">
                            <Button onClick={() => navigate(-1)}>取消</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                保存配置
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
};

export default PlanEdit;
