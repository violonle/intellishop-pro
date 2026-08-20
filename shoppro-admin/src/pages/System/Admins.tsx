import React, { useState, useEffect } from 'react';
import { Table, Avatar, Tag, Button, Input, Space, Modal, Form, Checkbox, message, Select } from 'antd';
import { UserOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { getUserPage, toggleUserStatus } from '@/services/user';
import { getTenantPage } from '@/services/tenant';

const Admins: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tenantsLoading, setTenantsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [form] = Form.useForm();

    const fetchAdmins = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getUserPage({ pageNo: page, pageSize, isAdminOnly: true });
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

    const fetchTenants = async () => {
        setTenantsLoading(true);
        try {
            const res = await getTenantPage({ pageNo: 1, pageSize: 100 });
            const response = res as any;
            if (response && response.records) {
                setTenants(response.records);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTenantsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            fetchTenants();
        }
    }, [isModalOpen]);

    const columns = [
        {
            title: '管理员',
            dataIndex: 'username',
            key: 'username',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div>
                        <div className="font-bold">{record.realName || text}</div>
                        <div className="text-xs text-gray-400">ID: {record.id}</div>
                    </div>
                </Space>
            )
        },
        {
            title: '角色', dataIndex: 'role', key: 'role', render: (role: number | string) => {
                // 仅支持三种管理员角色 + admin向后兼容
                const roleMap: Record<string | number, { label: string; color: string }> = {
                    // 字符串格式
                    'super_admin': { label: '超级管理员', color: 'red' },
                    'platform_admin': { label: '平台管理员', color: 'blue' },
                    'enterprise_admin': { label: '企业管理员', color: 'green' },
                    'admin': { label: '超级管理员', color: 'red' },  // 向后兼容
                };
                const roleInfo = roleMap[role] || { label: '未知角色', color: 'default' };
                return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
            }
        },
        { title: '邮箱', dataIndex: 'email', key: 'email' },
        { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt' },
        {
            title: '状态', dataIndex: 'status', key: 'status', render: (status: number, record: any) => (
                <Tag
                    color={status === 1 ? 'success' : 'error'}
                    className="cursor-pointer"
                    onClick={() => handleToggleStatus(record.id)}
                >
                    {status === 1 ? 'Active' : 'Locked'}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => {
                // 超级管理员和admin不显示权限设置
                const isSuperAdmin = ['super_admin', 'admin'].includes(record.role);
                if (isSuperAdmin) {
                    return <span className="text-gray-400">-</span>;
                }
                return (
                    <a onClick={() => {
                        setCurrentAdmin(record);
                        setIsPermModalOpen(true);
                    }}>权限设置</a>
                );
            }
        }
    ];

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleUserStatus(id);
            message.success('状态已更新');
            fetchAdmins(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async () => {
        try {
            await form.validateFields();
            // TODO: 调用创建管理员API
            // await createAdmin(values);
            message.success('管理员创建成功');
            setIsModalOpen(false);
            form.resetFields();
            fetchAdmins(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('创建管理员失败:', error);
        }
    };

    const handlePermSave = () => {
        message.success('权限已更新');
        setIsPermModalOpen(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">管理员账号管理</h2>
                <Space>
                    <Input placeholder="搜索管理员" prefix={<SearchOutlined />} />
                    <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={() => setIsModalOpen(true)}>新增管理员</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => fetchAdmins(page, pageSize),
                }}
            />

            {/* Add Admin Modal */}
            <Modal title="新增管理员" open={isModalOpen} onOk={handleAdd} onCancel={() => { setIsModalOpen(false); form.resetFields(); }}>
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="userId"
                        label="ID"
                        rules={[
                            { required: true, message: '请输入管理员ID' },
                            { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持英文、数字和下划线' }
                        ]}
                        tooltip="管理员登录ID，仅支持英文、数字和下划线"
                    >
                        <Input placeholder="例如: admin_001" />
                    </Form.Item>
                    <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
                        <Input placeholder="请输入真实姓名" />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="请输入邮箱地址" />
                    </Form.Item>
                    <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                        <Select placeholder="选择角色">
                            <Select.Option value="super_admin">超级管理员</Select.Option>
                            <Select.Option value="platform_admin">平台管理员</Select.Option>
                            <Select.Option value="enterprise_admin">企业管理员</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}>
                        {({ getFieldValue }) =>
                            getFieldValue('role') === 'enterprise_admin' ? (
                                <Form.Item
                                    name="enterpriseId"
                                    label="关联企业"
                                    rules={[{ required: true, message: '企业管理员必须关联一个企业' }]}
                                    help="该管理员仅能管理此企业的数据"
                                    className="animate-fade-in"
                                >
                                    <Select placeholder="选择关联企业" loading={tenantsLoading}>
                                        {tenants.map(t => (
                                            <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>

            {/* Permission Modal */}
            <Modal
                title={`权限配置 - ${currentAdmin?.realName || '管理员'}`}
                open={isPermModalOpen}
                onOk={handlePermSave}
                onCancel={() => {
                    setIsPermModalOpen(false);
                    setCurrentAdmin(null);
                }}
                width={600}
            >
                {currentAdmin && (
                    <>
                        <div className="bg-blue-50 p-4 rounded mb-4">
                            <div className="flex items-center text-blue-800 text-sm mb-2">
                                <SafetyCertificateOutlined className="mr-2" />
                                <strong>角色：</strong>
                                <Tag color={currentAdmin.role === 'platform_admin' ? 'blue' : 'green'} className="ml-2">
                                    {currentAdmin.role === 'platform_admin' ? '平台管理员' : '企业管理员'}
                                </Tag>
                            </div>
                            {currentAdmin.role === 'enterprise_admin' && (
                                <div className="text-orange-600 text-xs mt-2">
                                    ⚠️ 企业管理员的数据访问范围仅限于关联企业
                                </div>
                            )}
                        </div>

                        <div className="mb-2 font-semibold">可配置权限模块：</div>
                        <Checkbox.Group className="flex flex-col gap-3">
                            {currentAdmin.role === 'platform_admin' ? (
                                // 平台管理员的9个权限模块
                                <>
                                    <Checkbox value="tenancy" defaultChecked>
                                        <strong>租户管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（租户列表）</span>
                                    </Checkbox>
                                    <Checkbox value="user_management" defaultChecked>
                                        <strong>用户管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（所有用户）</span>
                                    </Checkbox>
                                    <Checkbox value="company_management" defaultChecked>
                                        <strong>公司管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（所有公司）</span>
                                    </Checkbox>
                                    <Checkbox value="product_management" defaultChecked>
                                        <strong>商品管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（所有商品）</span>
                                    </Checkbox>
                                    <Checkbox value="subscription_management" defaultChecked>
                                        <strong>订阅管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（所有订阅）</span>
                                    </Checkbox>
                                    <Checkbox value="ai_model_management" defaultChecked>
                                        <strong>大模型管理</strong>
                                        <span className="text-gray-500 text-xs ml-2">（模型配置）</span>
                                    </Checkbox>
                                    <Checkbox value="data_report" defaultChecked>
                                        <strong>数据报表</strong>
                                        <span className="text-gray-500 text-xs ml-2">（统计分析）</span>
                                    </Checkbox>
                                    <Checkbox value="message_service" defaultChecked>
                                        <strong>消息服务</strong>
                                        <span className="text-gray-500 text-xs ml-2">（通知管理）</span>
                                    </Checkbox>
                                    <Checkbox value="operation_log" defaultChecked>
                                        <strong>操作日志</strong>
                                        <span className="text-gray-500 text-xs ml-2">（审计日志）</span>
                                    </Checkbox>
                                </>
                            ) : (
                                // 企业管理员的4个权限模块
                                <>
                                    <Checkbox value="company_management" defaultChecked>
                                        <strong>公司管理</strong>
                                        <span className="text-orange-600 text-xs ml-2">（仅关联公司）</span>
                                    </Checkbox>
                                    <Checkbox value="user_management" defaultChecked>
                                        <strong>用户管理</strong>
                                        <span className="text-orange-600 text-xs ml-2">（仅关联公司员工）</span>
                                    </Checkbox>
                                    <Checkbox value="product_management" defaultChecked>
                                        <strong>商品管理</strong>
                                        <span className="text-orange-600 text-xs ml-2">（仅关联公司商品）</span>
                                    </Checkbox>
                                    <Checkbox value="subscription_management" defaultChecked>
                                        <strong>订阅管理</strong>
                                        <span className="text-orange-600 text-xs ml-2">（仅关联公司订阅）</span>
                                    </Checkbox>
                                </>
                            )}
                        </Checkbox.Group>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Admins;
