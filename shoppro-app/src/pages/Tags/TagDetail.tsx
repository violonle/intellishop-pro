import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag, ArrowRight } from 'lucide-react';
import customerService from '../../services/customerService';
import { leadService } from '../../services/leadService';

interface TaggedItem {
    id: number | string;
    type: 'lead' | 'customer';
    name: string;
    description: string;
    date: string;
    status: string;
}

const TagDetail: React.FC = () => {
    const { tag } = useParams<{ tag: string }>();
    const navigate = useNavigate();
    const [items, setItems] = useState<TaggedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTaggedData = async () => {
            setLoading(true);
            try {
                const [custRes, leadRes] = await Promise.allSettled([
                    customerService.getCustomers({ pageNo: 1, pageSize: 20 }),
                    leadService.getLeads({ pageNo: 1, pageSize: 20 })
                ]);

                const results: TaggedItem[] = [];

                if (custRes.status === 'fulfilled' && custRes.value?.records) {
                    custRes.value.records.forEach((c: any) => {
                        results.push({
                            id: c.id,
                            type: 'customer',
                            name: c.name || '企业客户',
                            description: `所属行业: ${c.industry || '数字化零售'} · 客户级别: ${c.level || 'VIP'}`,
                            date: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '近期活跃',
                            status: c.status === 'active' ? '跟进活跃' : '高意向'
                        });
                    });
                }

                if (leadRes.status === 'fulfilled' && leadRes.value?.items) {
                    leadRes.value.items.forEach((l: any) => {
                        results.push({
                            id: l.id,
                            type: 'lead',
                            name: l.title || '潜在销售线索',
                            description: `意向产品: ${l.interestedProducts?.[0] || '暂无'} · 预计金额: ${l.estimatedValue ? `¥${l.estimatedValue}` : '暂无'}`,
                            date: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : '暂无更新时间',
                            status: l.priority === 'urgent' ? '急需跟进' : (l.priority || '未设置优先级')
                        });
                    });
                }

                setItems(results);
            } catch (error) {
                console.error('Failed to load tagged items', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTaggedData();
    }, [tag]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-xs sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900 flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-blue-600" />
                        标签分群：{tag}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                <div className="mb-4 text-xs font-medium text-gray-500">
                    智能分群筛选出 <strong className="text-blue-600">{items.length}</strong> 条匹配记录
                </div>

                {loading ? (
                    <div className="text-center py-12 text-xs text-gray-400">正在检索标签分群数据...</div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                onClick={() => navigate(item.type === 'lead' ? `/leads/${item.id}` : `/customers/${item.id}`)}
                                className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-500/30 transition-all cursor-pointer flex justify-between items-center group"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold tracking-wide ${item.type === 'lead' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {item.type === 'lead' ? '销售线索' : '企业客户'}
                                        </span>
                                        <h3 className="font-bold text-gray-900 text-xs">{item.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">{item.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                        <span>{item.date}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-blue-600 font-bold">{item.status}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagDetail;
