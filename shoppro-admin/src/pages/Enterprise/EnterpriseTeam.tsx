import React, { useState, useEffect } from 'react';
import { Table, Card, Button, message, Tag, Space, Modal, Form, Select } from 'antd';
import { ArrowLeftOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getTenantDetail } from '@/services/tenant';
import { getUserPage } from '@/services/user';
import { addEnterpriseMember, removeEnterpriseMember } from '@/services/enterprise';

const { Option } = Select;

const EnterpriseTeam: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [enterprise, setEnterprise] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                message.error('企业ID不存在');
                navigate('/enterprise/list');
                return;
            }

            setLoading(true);
            try {
                const enterpriseRes = await getTenantDetail(id);
                setEnterprise(enterpriseRes);

                const usersRes = await getUserPage({
                    pageNo: 1,
                    pageSize: 100,
                    enterpriseId: Number(id)
                });
                const usersData = usersRes as any;
                if (usersData?.records) {
                    setMembers(usersData.records);
                }
            } catch (error) {
                console.error(error);
                message.error('加载团队信息失败');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const columns = [
        {
            title: '姓名',
            dataIndex: 'realName',
            key: 'realName',
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '手机',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const roleMap: Record<string, { color: string; text: string }> = {
                    'enterprise_admin': { color: 'red', text: '企业管理员' },
                    'admin': { color: 'orange', text: '管理员' },
                    'sales_director': { color: 'blue', text: '销售总监' },
                    'sales_manager': { color: 'green', text: '销售经理' },
                    'sales': { color: 'cyan', text: '销售' },
                    'user': { color: 'default', text: '普通用户' },
                };
                const roleInfo = roleMap[role] || { color: 'default', text: role };
                return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? '正常' : '停用'}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (record: any) => (
                <Space>
                    <Button type="link" size="small" onClick={() => navigate(`/tenancy/users?id=${record.id}`)}>
                        查看
                    </Button>
                    <Button type="link" size="small" danger onClick={() => handleRemoveMember(record.id)}>
                        移除
                    </Button>
                </Space>
            )
        }
    ];

    const handleAddMember = () => {
        setIsModalVisible(true);
    };

    const handleRemoveMember = (userId: number) => {
        Modal.confirm({
            title: '确认移除',
            content: '确定要将该成员从团队中移除吗？',
            onOk: async () => {
                try {
                    await removeEnterpriseMember(Number(id), userId);
                    message.success('成员移除成功');
                    setMembers(prev => prev.filter(m => m.id !== userId));
                } catch (error) {
                    message.error('移除失败');
                }
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            await addEnterpriseMember(Number(id), {
                userId: values.userId,
                role: values.role
            });
            message.success('成员添加成功');
            setIsModalVisible(false);
            form.resetFields();
            const usersRes = await getUserPage({
                pageNo: 1,
                pageSize: 100,
                enterpriseId: Number(id)
            });
            const usersData = usersRes as any;
            if (usersData?.records) {
                setMembers(usersData.records);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <div>
                        <h2 className="text-2xl font-bold m-0">{enterprise?.name || '企业'} - 团队管理</h2>
                        <span className="text-gray-500">管理企业团队成员</span>
                    </div>
                </div>
                <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddMember}>
                    添加成员
                </Button>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `共 ${total} 名成员`
                    }}
                />
            </Card>

            <Modal
                title="添加团队成员"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="userId"
                        label="选择用户"
                        rules={[{ required: true, message: '请选择用户' }]}
                    >
                        <Select placeholder="请选择要添加的用户" showSearch>
                            {members.map(member => (
                                <Option key={member.id} value={member.id}>
                                    {member.realName || member.username}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            <Option value="enterprise_admin">企业管理员</Option>
                            <Option value="admin">管理员</Option>
                            <Option value="sales_director">销售总监</Option>
                            <Option value="sales_manager">销售经理</Option>
                            <Option value="sales">销售</Option>
                            <Option value="user">普通用户</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EnterpriseTeam;
