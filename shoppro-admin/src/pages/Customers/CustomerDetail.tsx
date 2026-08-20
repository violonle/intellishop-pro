import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Tag, message } from 'antd';
import { ArrowLeft, Edit3, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import customerService, { type CustomerDTO } from '@/services/customer';
import request from '@/utils/request';

const CustomerDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const id = params.get('id');
    const [customer, setCustomer] = useState<CustomerDTO | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [editing, setEditing] = useState(false);
    const [recordOpen, setRecordOpen] = useState(false);
    const [content, setContent] = useState('');

    const load = async () => {
        if (!id) return;
        try {
            const [data, followUps] = await Promise.all([
                customerService.getCustomerDetail(id),
                request<any[]>({ url: `/follow-ups/customer/${id}`, method: 'get' })
            ]);
            setCustomer(data as unknown as CustomerDTO); setRecords((followUps as unknown as any[]) || []);
        } catch { message.error('客户加载失败'); }
    };
    useEffect(() => { load(); }, [id]);

    const save = async () => {
        if (!customer?.id) return;
        try { await customerService.updateCustomer(customer.id, customer); setEditing(false); message.success('客户资料已保存'); } catch { message.error('客户资料保存失败'); }
    };
    const addRecord = async () => {
        if (!id || !content.trim()) return;
        try { await request({ url: '/follow-ups', method: 'post', data: { customerId: Number(id), title: '客户跟进', type: 'other', content } }); setRecordOpen(false); setContent(''); await load(); message.success('跟进记录已保存'); } catch { message.error('跟进记录保存失败'); }
    };

    if (!id) return <div className="p-8 text-center text-slate-400">缺少客户ID</div>;
    if (!customer) return <div className="p-8 text-center text-slate-400">加载中或客户不存在</div>;
    return <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center"><Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/customers')}>返回客户列表</Button><div className="flex gap-2"><Button icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditing(true)}>编辑客户</Button><Button type="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setRecordOpen(true)}>跟进客户</Button></div></div>
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 p-6 space-y-5"><div className="flex justify-between"><div><h1 className="text-2xl font-black text-slate-900 dark:text-white">{customer.name}</h1><p className="text-sm text-slate-500 mt-2">{customer.company || '暂无企业信息'}</p></div><Tag color="blue">{customer.level || '未设置等级'}</Tag></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div>联系人：{customer.name}</div><div>电话：{customer.phone || '暂无'}</div><div>邮箱：{customer.email || '暂无'}</div><div>状态：{customer.status || '暂无'}</div></div>{editing && <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Input value={customer.name} onChange={event => setCustomer({ ...customer, name: event.target.value })} placeholder="客户名称" /><Input value={customer.phone || ''} onChange={event => setCustomer({ ...customer, phone: event.target.value })} placeholder="联系电话" /><Input value={customer.email || ''} onChange={event => setCustomer({ ...customer, email: event.target.value })} placeholder="邮箱" /><Input value={customer.company || ''} onChange={event => setCustomer({ ...customer, company: event.target.value })} placeholder="企业" /><Button type="primary" onClick={save}>保存</Button></div>}</div>
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 p-6"><h2 className="font-bold mb-4">跟进记录（{records.length}）</h2>{records.length === 0 ? <p className="text-sm text-slate-400">暂无跟进记录</p> : <div className="space-y-4">{records.map(record => <div key={record.id} className="border-l-2 border-blue-200 pl-4"><div className="flex justify-between text-sm"><b>{record.title}</b><span className="text-slate-400">{record.createdAt || ''}</span></div><p className="text-sm text-slate-600 mt-1">{record.content}</p></div>)}</div>}</div>
        <Modal open={recordOpen} title="添加跟进记录" onCancel={() => setRecordOpen(false)} onOk={addRecord} okText="保存"><Input.TextArea rows={5} value={content} onChange={event => setContent(event.target.value)} placeholder="记录客户反馈和下一步计划" /></Modal>
    </div>;
};

export default CustomerDetailPage;
