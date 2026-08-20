import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Spin, message, Statistic, Row, Col } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getTenantDetail } from '@/services/tenant';

const EnterpriseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [enterprise, setEnterprise] = useState<any>(null);

    useEffect(() => {
        const fetchEnterprise = async () => {
            if (!id) {
                message.error('企业ID不存在');
                navigate('/enterprise/list');
                return;
            }

            setLoading(true);
            try {
                const res = await getTenantDetail(id);
                setEnterprise(res);
            } catch (error) {
                console.error(error);
                message.error('加载企业信息失败');
            } finally {
                setLoading(false);
            }
        };
        fetchEnterprise();
    }, [id, navigate]);

    if (loading) {
        return <Spin spinning={true} className="flex justify-center items-center min-h-screen" />;
    }

    if (!enterprise) {
        return <div>企业不存在</div>;
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <div>
                        <h2 className="text-2xl font-bold m-0">{enterprise.name}</h2>
                        <span className="text-gray-500">企业详情</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button icon={<TeamOutlined />} onClick={() => navigate(`/enterprise/team/${id}`)}>
                        团队管理
                    </Button>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/enterprise/edit/${id}`)}>
                        编辑企业
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* 统计卡片 */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic title="员工数量" value={enterprise.employeeCount || 0} suffix="人" />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="产品数量" value={enterprise.productCount || 0} suffix="个" />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="客户数量" value={enterprise.customerCount || 0} suffix="个" />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="状态"
                                value={enterprise.status === 1 ? '正常' : '停用'}
                                valueStyle={{ color: enterprise.status === 1 ? '#3f8600' : '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* 基本信息 */}
                <Card title="基本信息" bordered={false} className="shadow-sm">
                    <Descriptions column={2}>
                        <Descriptions.Item label="企业名称">{enterprise.name}</Descriptions.Item>
                        <Descriptions.Item label="企业代码">{enterprise.code || '-'}</Descriptions.Item>
                        <Descriptions.Item label="联系人">{enterprise.contactPerson || '-'}</Descriptions.Item>
                        <Descriptions.Item label="联系电话">{enterprise.contactPhone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{enterprise.email || '-'}</Descriptions.Item>
                        <Descriptions.Item label="地址" span={2}>{enterprise.address || '-'}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{enterprise.createdAt || '-'}</Descriptions.Item>
                        <Descriptions.Item label="更新时间">{enterprise.updatedAt || '-'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* 配置信息 */}
                <Card title="配置信息" bordered={false} className="shadow-sm">
                    <Descriptions column={2}>
                        <Descriptions.Item label="行业类型">{enterprise.industry || '-'}</Descriptions.Item>
                        <Descriptions.Item label="企业规模">{enterprise.scale || '-'}</Descriptions.Item>
                        <Descriptions.Item label="备注" span={2}>{enterprise.remark || '-'}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>
        </div>
    );
};

export default EnterpriseDetail;
