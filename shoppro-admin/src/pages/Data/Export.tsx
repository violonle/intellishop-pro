import React, { useState } from 'react';
import { Card, Select, Button, message } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const DataExport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataType, setDataType] = useState<'customers' | 'leads'>('customers');
    const [format, setFormat] = useState<'excel' | 'csv'>('excel');

    const handleExport = async () => {
        if (dataType === 'leads' && format === 'csv') {
            message.info('线索当前仅支持 Excel 导出');
            return;
        }
        setLoading(true);
        try {
            const path = dataType === 'customers'
                ? `/export/customers/${format}`
                : '/export/leads/excel';
            const response = await request.get(path, { responseType: 'blob' });
            const blob = response as unknown as Blob;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${dataType}_${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'xlsx'}`;
            link.click();
            URL.revokeObjectURL(url);
            message.success('导出完成');
        } catch (error) {
            message.error(error instanceof Error ? error.message : '导出失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">数据导出中心</h2>
            </div>

            <Card className="shadow-sm">
                <div className="flex gap-4 items-end mb-8 bg-gray-50 p-6 rounded-lg">
                    <div className="w-1/4">
                        <label className="block text-gray-500 mb-2">数据类型</label>
                        <Select className="w-full" value={dataType} onChange={setDataType}>
                            <Select.Option value="customers">客户数据</Select.Option>
                            <Select.Option value="leads">线索数据</Select.Option>
                        </Select>
                    </div>
                    <div className="w-1/4">
                        <label className="block text-gray-500 mb-2">导出格式</label>
                        <Select className="w-full" value={format} onChange={setFormat}>
                            <Select.Option value="excel">Excel (.xlsx)</Select.Option>
                            <Select.Option value="csv">CSV (.csv)</Select.Option>
                        </Select>
                    </div>
                    <Button type="primary" icon={<FileExcelOutlined />} loading={loading} onClick={handleExport}>
                        创建导出任务
                    </Button>
                </div>

                <div className="text-sm text-gray-500 border-t border-gray-100 pt-4">
                    当前导出直接生成文件；后台暂未提供可持久化的导出任务历史接口。
                </div>
            </Card>
        </div>
    );
};

export default DataExport;
