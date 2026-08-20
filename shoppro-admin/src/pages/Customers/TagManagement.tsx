import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Tag, message } from 'antd';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import customerService, { type CustomerDTO } from '@/services/customer';

const TagManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [selectedTag, setSelectedTag] = useState('');

    useEffect(() => { customerService.getCustomers({ pageNo: 1, pageSize: 100 }).then((page: any) => setCustomers(page?.records || [])).catch(() => message.error('客户标签加载失败')); }, []);
    const tags = useMemo(() => {
        const counts = new Map<string, number>();
        customers.forEach(customer => (customer.tags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));
        return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    }, [customers]);
    const matching = selectedTag ? customers.filter(customer => customer.tags?.includes(selectedTag)) : [];

    return <div className="space-y-6 animate-fade-in font-sans"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/customers')} /><div><h1 className="text-2xl font-black">标签管理</h1><p className="text-xs text-slate-500 mt-1">标签来源于客户真实数据</p></div></div><Button type="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => message.info('标签创建接口尚未接入')}>新建标签</Button></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-3xl border border-slate-200 p-6"><h2 className="font-bold mb-4">客户标签</h2>{tags.length === 0 ? <Empty description="暂无客户标签数据" /> : <div className="flex flex-wrap gap-3">{tags.map(item => <button key={item.name} onClick={() => setSelectedTag(item.name)} className={`px-3 py-2 rounded-xl border ${selectedTag === item.name ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200'}`}><Tag bordered={false}>{item.name}</Tag><span className="text-xs text-slate-400">{item.count}</span></button>)}</div>}</div><div className="bg-white rounded-3xl border border-slate-200 p-6"><h2 className="font-bold mb-4">{selectedTag ? `${selectedTag}（${matching.length}）` : '请选择标签'}</h2>{matching.length === 0 ? <Empty description="暂无匹配客户" /> : <div className="space-y-3">{matching.map(customer => <button key={customer.id} onClick={() => navigate(`/customers/detail?id=${customer.id}`)} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50"><div className="font-bold text-sm">{customer.name}</div><div className="text-xs text-slate-500 mt-1">{customer.company || '暂无企业信息'}</div></button>)}</div>}</div></div>
    </div>;
};

export default TagManagementPage;
