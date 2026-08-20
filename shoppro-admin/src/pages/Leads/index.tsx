import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Tag, Progress, message, Modal, Empty } from 'antd';
import {
    Plus,
    Upload,
    Search,
    RotateCcw,
    Target,
    UserCheck,
    Flame,
    Clock,
    UserPlus,
    Eye,
    Share2,
    SlidersHorizontal,
    Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '@/services/lead';
import { getUserPage } from '@/services/user';

interface LeadItem {
    id: string;
    name: string;
    source: string;
    product: string;
    winRate: number;
    budget: string;
    owner: string;
    ownerId?: number;
    updatedAt: string;
}

export const LeadsPage: React.FC = () => {
    const [searchVal, setSearchVal] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | undefined>();
    const [assignees, setAssignees] = useState<any[]>([]);
    const [assigneesLoading, setAssigneesLoading] = useState(false);
    const [leads, setLeads] = useState<LeadItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        highIntent: 0,
        toFollow: 0,
        unassigned: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        loadLeads();
    }, [sourceFilter]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const data: any = await leadService.getLeads({
                pageNo: 1,
                pageSize: 20,
                keyword: searchVal || undefined,
                source: sourceFilter === 'all' ? undefined : sourceFilter
            }).catch(() => null);

            const records = data?.items || (Array.isArray(data) ? data : (data?.records || []));
            if (records.length > 0) {
                const mapped: LeadItem[] = records.map((item: any) => ({
                    id: String(item.id),
                    name: item.title || item.name || '潜在企业客户',
                    source: item.source || '未标注',
                    product: item.interestedProducts?.[0] || item.product || '暂无',
                    winRate: item.successProbability ?? item.winRate ?? 0,
                    budget: item.estimatedValue != null ? `¥ ${item.estimatedValue.toLocaleString()}` : (item.budget || '暂无'),
                    owner: item.ownerName || item.owner || '未分配',
                    ownerId: item.assignedTo || item.ownerId,
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '暂无'
                }));
                setLeads(mapped);
                setStats({
                    total: data.total || mapped.length,
                    highIntent: mapped.filter(l => l.winRate >= 70).length,
                    toFollow: mapped.filter(l => l.winRate >= 50 && l.winRate < 70).length,
                    unassigned: mapped.filter(l => !l.owner || l.owner === '未分配').length
                });
            } else {
                setLeads([]);
                setStats({
                    total: 0,
                    highIntent: 0,
                    toFollow: 0,
                    unassigned: 0
                });
            }
        } catch (error) {
            console.error('Failed to load leads', error);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignees = async () => {
        setAssigneesLoading(true);
        try {
            const data: any = await getUserPage({ pageNo: 1, pageSize: 100 });
            const records = data?.records || data?.items || (Array.isArray(data) ? data : []);
            setAssignees(records.filter((item: any) =>
                ['sales_director', 'sales_manager', 'sales'].includes(String(item.role || '').toLowerCase())
            ));
        } catch (error) {
            console.error('Failed to load assignees', error);
            setAssignees([]);
        } finally {
            setAssigneesLoading(false);
        }
    };

    const openAssignModal = (lead: LeadItem) => {
        setSelectedLead(lead);
        setSelectedAssigneeId(lead.ownerId);
        setAssignModalOpen(true);
        if (assignees.length === 0) loadAssignees();
    };

    const handleAssign = async () => {
        if (!selectedLead || !selectedAssigneeId) {
            message.warning('请选择实际的销售负责人');
            return;
        }
        try {
            await leadService.assignLead(selectedLead.id, selectedAssigneeId);
            message.success(`线索【${selectedLead.name}】已成功分配`);
            setAssignModalOpen(false);
            await loadLeads();
        } catch (error: any) {
            message.error(error.message || '线索分配失败');
        }
    };

    const filteredLeads = leads.filter(l => {
        if (!searchVal) return true;
        return l.name.toLowerCase().includes(searchVal.toLowerCase()) || l.product.toLowerCase().includes(searchVal.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏与操作 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        销售线索中心
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        集中管理潜在商机线索，AI 自动评分并优先推送高意向资源
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        icon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => navigate('/agents/leads')}
                        className="!rounded-xl !text-xs !h-9 !border-blue-200 hover:!border-blue-500"
                    >
                        SDR 智能分配
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/leads/create')}
                        className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-5"
                    >
                        新建线索
                    </Button>
                </div>
            </div>

            {/* 4 大核心指标卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="px-7 py-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center">
                    <div className="flex items-center gap-6">
                        <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">全部线索总数</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</div>
                        </div>
                    </div>
                </div>

                <div className="px-7 py-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center">
                    <div className="flex items-center gap-6">
                        <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <Flame className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">高意向转化池</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.highIntent}</div>
                        </div>
                    </div>
                </div>

                <div className="px-7 py-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center">
                    <div className="flex items-center gap-6">
                        <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">今日待跟进</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.toFollow}</div>
                        </div>
                    </div>
                </div>

                <div className="px-7 py-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center">
                    <div className="flex items-center gap-6">
                        <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">公海未分配</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.unassigned}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 搜索与过滤栏 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <Input
                            placeholder="搜索线索名称、企业或意向产品..."
                            prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
                            className="!rounded-xl !w-full sm:!w-72 !bg-slate-50 dark:!bg-slate-800/40 text-xs"
                        />
                        <Select
                            value={sourceFilter}
                            onChange={setSourceFilter}
                            options={[
                                { label: '全部来源渠道', value: 'all' },
                                { label: '官网渠道', value: '官网' },
                                { label: '线下活动', value: '活动' },
                                { label: '客户转介绍', value: '转介绍' },
                                { label: '短视频获客', value: '抖音' }
                            ]}
                            className="!rounded-xl !w-36 text-xs"
                        />
                        <Button
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => { setSearchVal(''); setSourceFilter('all'); }}
                            className="!rounded-xl !text-xs"
                        >
                            重置
                        </Button>
                    </div>
                </div>

                {/* 线索列表 */}
                <div className="space-y-3 pt-2">
                    {filteredLeads.length === 0 ? (
                        <Empty description="暂无符合条件的销售线索数据" className="py-12" />
                    ) : (
                        filteredLeads.map((lead) => (
                            <div
                                key={lead.id}
                                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800/80 bg-white dark:bg-[#111622] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                                            {lead.name}
                                        </h4>
                                        <Tag className="!rounded-md !text-[10px] !bg-blue-50 !text-blue-600 !border-blue-200">
                                            {lead.source}
                                        </Tag>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                                        <span>意向产品：<strong className="text-slate-700 dark:text-slate-300">{lead.product}</strong></span>
                                        <span>预算范围：<strong className="text-slate-700 dark:text-slate-300">{lead.budget}</strong></span>
                                        <span>负责人：{lead.owner}</span>
                                        <span>更新时间：{lead.updatedAt}</span>
                                    </div>
                                </div>

                                {/* AI 胜率与操作 */}
                                <div className="flex items-center gap-6 justify-between md:justify-end">
                                    <div className="w-28 text-center">
                                        <div className="text-[10px] text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                                            <Target className="w-3 h-3 text-blue-600" /> AI 预测赢率
                                        </div>
                                        <Progress
                                            percent={lead.winRate}
                                            size="small"
                                            status="active"
                                            strokeColor={{ '0%': '#2563EB', '100%': '#06B6D4' }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="small"
                                            icon={<Eye className="w-3.5 h-3.5" />}
                                            onClick={() => navigate(`/leads/detail?id=${lead.id}`)}
                                            className="!rounded-lg text-xs"
                                        >
                                            详情
                                        </Button>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<Share2 className="w-3.5 h-3.5" />}
                                            onClick={() => openAssignModal(lead)}
                                            className="!rounded-lg !bg-blue-600 !text-xs"
                                        >
                                            分配
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 分配线索弹窗 */}
            <Modal
                title="分配线索跟进人员"
                open={assignModalOpen}
                onOk={handleAssign}
                onCancel={() => setAssignModalOpen(false)}
                okText="确认分配"
                cancelText="取消"
            >
                <div className="py-4 space-y-4 text-xs font-sans">
                    <p>正在为 <b>{selectedLead?.name}</b> 指派负责销售人员：</p>
                    <Select
                        className="w-full !rounded-xl"
                        value={selectedAssigneeId}
                        onChange={setSelectedAssigneeId}
                        loading={assigneesLoading}
                        placeholder="请选择企业内销售负责人"
                        options={assignees.map((item: any) => ({
                            label: `${item.realName || item.username}（${item.role || '销售'}）`,
                            value: item.id
                        }))}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default LeadsPage;
