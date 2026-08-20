import React, { useState, useEffect } from 'react';
import { Table, Avatar, Tag, Button, Input, Space, Modal, Form, message, Select, Popconfirm } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined, EditOutlined, LockOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getUserPage, deleteUser, updateUserInfo } from '@/services/user';
import { getTenantPage } from '@/services/tenant';

const { Option } = Select;

const UserManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [enterprises, setEnterprises] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // 筛选和排序状态
    const [filters, setFilters] = useState({
        keyword: '',
        enterpriseId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const fetchUsers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await getUserPage({
                pageNo: page,
                pageSize,
                keyword: filters.keyword,
                // TODO: 添加企业筛选和排序参数
                // enterpriseId: filters.enterpriseId,
                // sortBy: filters.sortBy,
                // sortOrder: filters.sortOrder,
            });
            const response = res as any;
            if (response && response.records) {
                // 过滤掉所有管理员角色，仅显示前端用户
                const filteredRecords = response.records.filter((user: any) =>
                    !['super_admin', 'platform_admin', 'enterprise_admin', 'admin'].includes(user.role)
                );
                setData(filteredRecords);
                setPagination({ ...pagination, current: page, pageSize, total: filteredRecords.length });
            }
        } catch (error) {
            console.error(error);
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 加载企业列表
    useEffect(() => {
        const fetchEnterprises = async () => {
            try {
                const res = await getTenantPage({ pageNo: 1, pageSize: 100 });
                const response = res as any;
                if (response?.records) {
                    setEnterprises(response.records);
                }
            } catch (error) {
                console.error('Failed to load enterprises:', error);
            }
        };
        fetchEnterprises();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const columns = [
        {
            title: '姓名',
            dataIndex: 'realName',
            key: 'realName',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div>
                        <div className="font-bold">{text || record.username}</div>
                        <div className="text-xs text-gray-400">ID: {record.id}</div>
                    </div>
                </Space>
            )
        },
        {
            title: '所属公司',
            dataIndex: 'enterpriseName',
            key: 'enterpriseName',
            render: (text: string) => text || '-'
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const roleMap: Record<string, { label: string; color: string }> = {
                    'enterprise_admin': { label: '企业管理员', color: 'green' },
                    'sales_director': { label: '销售总监', color: 'purple' },
                    'sales_manager': { label: '销售经理', color: 'blue' },
                    'sales': { label: '销售专员', color: 'cyan' },
                };
                const roleInfo = roleMap[role] || { label: '未知', color: 'default' };
                return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
            }
        },
        {
            title: '成交单数',
            dataIndex: 'orderCount',
            key: 'orderCount',
            render: (count: number) => count || 0,
            sorter: true
        },
        {
            title: '成交金额',
            dataIndex: 'orderAmount',
            key: 'orderAmount',
            render: (amount: number) => `¥${(amount || 0).toLocaleString()}`,
            sorter: true
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<LockOutlined />}
                        onClick={() => handleChangePassword(record)}
                    >
                        修改密码
                    </Button>
                    <Popconfirm
                        title="确定要删除该用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleView = (record: any) => {
        setCurrentUser(record);
        setIsViewModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setCurrentUser(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('add');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleChangePassword = (record: any) => {
        setCurrentUser(record);
        passwordForm.resetFields();
        setIsPasswordModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteUser(id);
            message.success('删除成功');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error(error);
            message.error('删除失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (modalMode === 'edit' && currentUser) {
                await updateUserInfo(currentUser.id, values);
                message.success('更新成功');
            } else {
                // TODO: 实现添加用户API
                message.success('添加成功');
            }
            setIsModalOpen(false);
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error(error);
            message.error(modalMode === 'edit' ? '更新失败' : '添加失败');
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            await passwordForm.validateFields();
            // TODO: 实现修改密码API
            message.success('密码修改成功');
            setIsPasswordModalOpen(false);
        } catch (error) {
            console.error(error);
            message.error('密码修改失败');
        }
    };

    const handleTableChange = (newPagination: any, _filters: any, sorter: any) => {
        if (sorter.field) {
            setFilters({
                ...filters,
                sortBy: sorter.field,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
            });
        }
        fetchUsers(newPagination.current, newPagination.pageSize);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">用户管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加用户
                </Button>
            </div>

            {/* 筛选区域 */}
            <div className="mb-4 p-4 bg-gray-50 rounded">
                <Space size="middle" wrap>
                    <Input
                        placeholder="搜索用户"
                        prefix={<SearchOutlined />}
                        style={{ width: 200 }}
                        value={filters.keyword}
                        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    />
                    <Select
                        placeholder="所属公司"
                        style={{ width: 200 }}
                        allowClear
                        value={filters.enterpriseId}
                        onChange={(value) => setFilters({ ...filters, enterpriseId: value })}
                    >
                        {enterprises.map(ent => (
                            <Option key={ent.id} value={ent.id}>{ent.name}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="排序方式"
                        style={{ width: 150 }}
                        value={`${filters.sortBy}_${filters.sortOrder}`}
                        onChange={(value) => {
                            const [sortBy, sortOrder] = value.split('_');
                            setFilters({ ...filters, sortBy, sortOrder });
                        }}
                    >
                        <Option value="createdAt_desc">注册时间 ↓</Option>
                        <Option value="createdAt_asc">注册时间 ↑</Option>
                        <Option value="lastLoginAt_desc">最后活跃 ↓</Option>
                        <Option value="lastLoginAt_asc">最后活跃 ↑</Option>
                        <Option value="orderCount_desc">成交单数 ↓</Option>
                        <Option value="orderCount_asc">成交单数 ↑</Option>
                    </Select>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            {/* 添加/编辑用户弹窗 */}
            <Modal
                title={modalMode === 'add' ? '添加用户' : '编辑用户'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                        <Input disabled={modalMode === 'edit'} />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="enterpriseId" label="所属公司" rules={[{ required: true, message: '请选择所属公司' }]}>
                        <Select placeholder="选择公司">
                            {enterprises.map(ent => (
                                <Option key={ent.id} value={ent.id}>{ent.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                        <Select>
                            <Option value="enterprise_admin">企业管理员</Option>
                            <Option value="sales_director">销售总监</Option>
                            <Option value="sales_manager">销售经理</Option>
                            <Option value="sales">销售专员</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看用户详情弹窗 */}
            <Modal
                title="用户详情"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentUser && (
                    <div className="space-y-2">
                        <p><strong>姓名：</strong>{currentUser.realName}</p>
                        <p><strong>用户名：</strong>{currentUser.username}</p>
                        <p><strong>邮箱：</strong>{currentUser.email}</p>
                        <p><strong>手机号：</strong>{currentUser.phone}</p>
                        <p><strong>角色：</strong>{currentUser.role}</p>
                        <p><strong>注册时间：</strong>{currentUser.createdAt}</p>
                        <p><strong>最后登录：</strong>{currentUser.lastLoginAt || '从未登录'}</p>
                    </div>
                )}
            </Modal>

            {/* 修改密码弹窗 */}
            <Modal
                title="修改密码"
                open={isPasswordModalOpen}
                onOk={handlePasswordSubmit}
                onCancel={() => setIsPasswordModalOpen(false)}
            >
                <Form layout="vertical" form={passwordForm}>
                    <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码至少6位' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
