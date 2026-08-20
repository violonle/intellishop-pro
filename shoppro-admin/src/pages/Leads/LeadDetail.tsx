import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Tag, message } from 'antd';
import { ArrowLeft, Plus, UserCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import leadService, { type LeadDTO } from '@/services/lead';
import request from '@/utils/request';

const LeadDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const id = params.get('id');
    const [lead, setLead] = useState<LeadDTO | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [recordOpen, setRecordOpen] = useState(false);
    const [recordContent, setRecordContent] = useState('');

    const load = async () => {
        if (!id) return;
        try {
            const [data, followUps] = await Promise.all([
                leadService.getLeadDetail(id),
                request<any[]>({ url: `/follow-ups/lead/${id}`, method: 'get' })
            ]);
            setLead(data as unknown as LeadDTO);
            setRecords((followUps as unknown as any[]) || []);
        } catch { message.error('线索加载失败'); }
    };
    useEffect(() => { load(); }, [id]);

    const convert = async () => {
        if (!id) return;
        try { await request({ url: `/leads/${id}/convert`, method: 'post', data: {} }); message.success('已转为客户'); navigate('/customers'); }
        catch { message.error('转客户失败'); }
    };

    const addRecord = async () => {
        if (!id || !recordContent.trim()) return;
        try {
            await request({ url: '/follow-ups', method: 'post', data: { leadId: Number(id), title: '销售跟进', type: 'other', content: recordContent } });
            setRecordOpen(false); setRecordContent(''); await load(); message.success('跟进记录已保存');
        } catch { message.error('跟进记录保存失败'); }
    };

    if (!id) return <div className="p-8 text-center text-slate-400">缺少线索ID</div>;
    if (!lead) return <div className="p-8 text-center text-slate-400">加载中或线索不存在</div>;

    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between"><Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/leads')}>返回线索列表</Button><div className="flex gap-2"><Button icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setRecordOpen(true)}>添加跟进</Button><Button type="primary" icon={<UserCheck className="w-3.5 h-3.5" />} onClick={convert}>转为客户</Button></div></div>
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 p-6 space-y-5"><div className="flex justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-900 dark:text-white">{lead.title}</h1><p className="text-sm text-slate-500 mt-2">{lead.description || '暂无描述'}</p></div><Tag color="blue">{lead.status || '未设置状态'}</Tag></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div>来源：{lead.source || '暂无'}</div><div>阶段：{(lead as any).stage || '暂无'}</div><div>预计金额：{lead.estimatedValue ?? '暂无'}</div><div>成交概率：{lead.successProbability ?? 0}%</div></div><div className="flex items-center gap-3"><Select value={lead.status} onChange={async value => { try { await leadService.updateStatus(Number(id), value); setLead({ ...lead, status: value }); } catch { message.error('状态更新失败'); } }} options={['new','contacted','qualified','proposal','negotiation','won','lost'].map(value => ({ value, label: value }))} /></div></div>
        <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 p-6"><h2 className="font-bold mb-4">跟进记录（{records.length}）</h2>{records.length === 0 ? <p className="text-sm text-slate-400">暂无跟进记录</p> : <div className="space-y-4">{records.map(record => <div key={record.id} className="border-l-2 border-blue-200 pl-4"><div className="flex justify-between text-sm"><b>{record.title}</b><span className="text-slate-400">{record.createdAt || ''}</span></div><p className="text-sm text-slate-600 mt-1">{record.content}</p></div>)}</div>}</div>
        <Modal open={recordOpen} title="添加跟进记录" onCancel={() => setRecordOpen(false)} onOk={addRecord} okText="保存"><Input.TextArea rows={5} value={recordContent} onChange={event => setRecordContent(event.target.value)} placeholder="记录客户反馈和下一步计划" /></Modal>
    </div>;
};

export default LeadDetailPage;
