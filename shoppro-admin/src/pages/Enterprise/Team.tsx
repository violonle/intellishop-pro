import React from 'react';
import { Tree, Card, Row, Col, Input, Button, Table, Tag, Avatar, Space } from 'antd';
import { SearchOutlined, UserAddOutlined, ApartmentOutlined } from '@ant-design/icons';

import { getDepartmentTree, getDepartmentMembers } from '@/services/department';

const { DirectoryTree } = Tree;

const TeamManagement: React.FC = () => {
    const [treeData, setTreeData] = React.useState<any[]>([]);
    const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
    const [, setSelectedKeys] = React.useState<React.Key[]>([]);

    React.useEffect(() => {
        getDepartmentTree().then((res: any) => {
            setTreeData(Array.isArray(res) ? res : (res?.records || []));
        }).catch(() => {
            setTreeData([]);
        });
    }, []);

    const onSelect = (keys: React.Key[], _info: any) => {
        setSelectedKeys(keys);
        if (keys.length > 0) {
            getDepartmentMembers(keys[0] as string).then((res: any) => {
                setTeamMembers(Array.isArray(res) ? res : (res?.records || []));
            });
        }
    };
    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#1677ff' }}>{text[0]}</Avatar>
                    <span className="font-medium">{text}</span>
                </Space>
            ),
        },
        { title: '职位', dataIndex: 'position', key: 'position' },
        { title: '部门', dataIndex: 'department', key: 'department', render: (text: string) => <Tag>{text}</Tag> },
        { title: '邮箱', dataIndex: 'email', key: 'email' },
        { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'Active' ? 'success' : 'default'}>{status}</Tag> },
        { title: '操作', key: 'action', render: () => <Button type="link" size="small" style={{ padding: 0 }}>编辑</Button> },
    ];

    return (
        <div className="animate-fade-in h-full">
            <Row gutter={24} className="h-full">
                <Col span={6} className="h-full">
                    <Card title="组织架构" className="h-[calc(100vh-140px)] shadow-sm" bodyStyle={{ padding: '12px' }} extra={<Button type="text" icon={<ApartmentOutlined />} />}>
                        <Input placeholder="搜索部门" prefix={<SearchOutlined />} className="mb-4" />
                        <DirectoryTree
                            multiple
                            defaultExpandAll
                            treeData={treeData}
                            onSelect={onSelect}
                            className="bg-transparent"
                        />
                    </Card>
                </Col>
                <Col span={18}>
                    <Card className="h-[calc(100vh-140px)] shadow-sm" bodyStyle={{ padding: '24px' }}>
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-bold">部门人员 ({teamMembers.length})</h3>
                            <Space>
                                <Input placeholder="搜索人员" prefix={<SearchOutlined />} />
                            <Button type="primary" icon={<UserAddOutlined />} disabled>添加成员</Button>
                            </Space>
                        </div>
                        <Table columns={columns} dataSource={teamMembers} rowKey="id" pagination={{ pageSize: 8 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TeamManagement;
