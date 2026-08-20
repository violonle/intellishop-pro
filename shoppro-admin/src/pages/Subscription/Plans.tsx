import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionPlans } from '@/services/subscription';

const { Title, Text } = Typography;

const Plans: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await getSubscriptionPlans();
            const response = res as any;
            if (response && Array.isArray(response)) {
                setPlans(response);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-[500px]"><Spin size="large" /></div>;
    }

    const displayPlans = plans;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center mb-10">
                <Title level={2}>订阅计划管理</Title>
                <Text type="secondary" className="text-lg">配置不同版本的定价策略、资源限制与AI能力权益</Text>
            </div>

            {displayPlans.length === 0 ? <div className="text-center text-slate-500 py-16">暂无订阅计划</div> : <Row gutter={24}>
                {displayPlans.map((plan, index) => (
                    <Col span={8} key={plan.id || plan.name}>
                        <Card
                            hoverable
                            className={`h-full border-t-4 ${index === 1 ? 'border-primary shadow-lg transform scale-105 z-10' : 'border-gray-200'}`}
                        >
                            <div className="text-center mb-6">
                                <Title level={3}>{plan.name}</Title>
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {plan.price}
                                </div>
                                <Text type="secondary">{plan.description}</Text>
                            </div>

                            <div className="space-y-3 px-4 mb-8">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">团队数量</span>
                                    <span className="font-medium">{plan.teamCount} 个</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">单团人数</span>
                                    <span className="font-medium">{plan.memberCount} 人</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">AI 模型</span>
                                    <Tag color={plan.color}>{plan.aiModel}</Tag>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <Button type={index === 1 ? 'primary' : 'default'} block size="large" onClick={() => navigate(`/subscription/plans/edit/${plan.id || plan.name}`)}>
                                    编辑详细配置
                                </Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>}
            {plans.length === 0 && (
                <div className="text-center mt-4">
                    <Text type="warning">注意：当前显示的是本地默认配置，后端数据库未返回数据。</Text>
                </div>
            )}
        </div>
    );
};

export default Plans;
