import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Space, Button, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { getLogPage } from '@/services/log';

const Logs: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [searchText, setSearchText] = useState('');

    const fetchLogs = async (page = 1, pageSize = 15) => {
        setLoading(true);
        try {
            const res = await getLogPage({
                pageNo: page,
                pageSize,
                username: searchText
            });
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

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = () => {
        fetchLogs(1, pagination.pageSize);
    };

    const handleExport = () => {
        message.success('日志导出任务已创建');
    };

    const columns = [
        { title: '时间', dataIndex: 'createdAt', width: 200 },
        { title: '操作人', dataIndex: 'username', width: 150 },
        { title: 'IP地址', dataIndex: 'ipAddress', width: 150 },
        { title: '模块', dataIndex: 'module', render: (text: string) => <Tag>{text}</Tag>, width: 120 },
        { title: '操作内容', dataIndex: 'action' },
        {
            title: '结果',
            dataIndex: 'result',
            render: (result: string) => (
                <Tag color={result === 'SUCCESS' ? 'green' : 'red'}>
                    {result === 'SUCCESS' ? 'Success' : 'Failed'}
                </Tag>
            ),
            width: 100
        },
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">操作日志审计</h2>
                <Space>
                    <Input
                        placeholder="搜索操作人"
                        prefix={<SearchOutlined />}
                        className="w-64"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="primary" onClick={handleSearch}>搜索</Button>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>导出日志</Button>
                </Space>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => fetchLogs(page, pageSize),
                        showSizeChanger: true,
                        showQuickJumper: true
                    }}
                    size="small"
                />
                {data.length === 0 && !loading && (
                    <div className="py-10 text-center text-gray-400">暂无日志记录</div>
                )}
            </Card>
        </div>
    );
};

export default Logs;
