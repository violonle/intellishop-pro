import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Badge, Button, Avatar, List, Tag, Row, Col, message, Spin } from 'antd';
import { EditOutlined, ShopOutlined, TeamOutlined, EnvironmentOutlined, PhoneOutlined, DeleteOutlined } from '@ant-design/icons';
import { getEnterpriseMembers, getTenantDetail, removeEnterpriseMember } from '@/services/tenant';
import { useSearchParams } from 'react-router-dom';

const EnterpriseInfo: React.FC = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [loading, setLoading] = useState(false);
    const [enterprise, setEnterprise] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);

    const fetchData = async (tenantId: string) => {
        setLoading(true);
        try {
            const [detail, memberResponse] = await Promise.all([
                getTenantDetail(tenantId),
                getEnterpriseMembers(tenantId),
            ]);
            setEnterprise(detail);
            const list = memberResponse as unknown as any;
            setMembers(Array.isArray(list) ? list : (list?.records || []));
        } catch (error) {
            console.error(error);
            message.error('企业信息加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const handleRemove = async (userId: number) => {
        if (!id) return;
        try {
            await removeEnterpriseMember(id, userId);
            setMembers(current => current.filter(member => member.id !== userId));
            message.success('成员已移除');
        } catch {
            message.error('成员移除失败');
        }
    };

    if (loading) return <Spin className="flex justify-center mt-20" />;
    if (!enterprise) return <div className="text-center mt-20 text-gray-400">请选择需查看的企业</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="relative bg-gradient-to-r from-[#001529] to-[#003a70] h-48 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                    <div className="w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center p-2">
                        <ShopOutlined className="text-5xl text-primary" />
                    </div>
                    <div className="mb-1">
                        <h1 className="text-3xl font-bold text-white mb-1">{enterprise.name || enterprise.shortName || '未命名企业'}</h1>
                        <div className="flex gap-3 text-white/80">
                            <span className="flex items-center gap-1"><EnvironmentOutlined /> {enterprise.address || '暂无地址'}</span>
                            <span className="flex items-center gap-1"><PhoneOutlined /> {enterprise.phone || enterprise.contactPhone || '暂无电话'}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-6 right-8"><Button type="primary" icon={<EditOutlined />}>编辑资料</Button></div>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    <Card title="企业概况" bordered={false} className="shadow-sm rounded-lg mb-6">
                        <Descriptions column={2} size="middle" bordered>
                            <Descriptions.Item label="企业名称">{enterprise.name || enterprise.shortName || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="租户编码">{enterprise.code || enterprise.socialCode || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="订阅版本"><Tag>{enterprise.plan || '未配置'}</Tag></Descriptions.Item>
                            <Descriptions.Item label="状态"><Badge status="processing" text={enterprise.status || '暂无'} /></Descriptions.Item>
                            <Descriptions.Item label="联系人">{enterprise.contact || enterprise.contactName || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="联系邮箱">{enterprise.email || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="员工规模">{members.length}</Descriptions.Item>
                            <Descriptions.Item label="企业法人">{enterprise.legalPerson || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="办公地址" span={2}>{enterprise.address || '暂无'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                    <Card title="订阅与资源" bordered={false} className="shadow-sm rounded-lg">
                        <Descriptions column={2}>
                            <Descriptions.Item label="生效日期">{enterprise.startDate || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="到期日期">{enterprise.expireDate || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="AI Token">{enterprise.aiTokenLimit || '暂无'}</Descriptions.Item>
                            <Descriptions.Item label="存储">{enterprise.storageLimit || '暂无'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={`企业成员（${members.length}）`} bordered={false} className="shadow-sm rounded-lg h-full">
                        <List
                            locale={{ emptyText: '暂无成员' }}
                            dataSource={members}
                            renderItem={(member) => (
                                <List.Item actions={member.id ? [<Button key="remove" type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(member.id)} />] : []}>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: '#1677ff' }} icon={<TeamOutlined />} />}
                                        title={member.name || member.realName || member.username || '未命名成员'}
                                        description={`${member.role || '未设置角色'}${member.email ? ` | ${member.email}` : ''}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EnterpriseInfo;
