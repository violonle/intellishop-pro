import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Car, Clock, Phone, MapPin, Mail } from 'lucide-react';
import { leadService } from '../../services/leadService';

const LeadDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchLeadDetail(Number(id));
        }
    }, [id]);

    const fetchLeadDetail = async (leadId: number) => {
        setLoading(true);
        try {
            const data = await leadService.getLeadDetail(leadId);
            // Transform to UI model
            setLead({
                id: data.id,
                name: data.title, // Map title to name
                source: data.source,
                createdAt: data.createdAt,
                priority: data.priority,
                probability: data.successProbability ? `${data.successProbability}%` : '0%',
                phone: 'N/A', // Not supported by backend
                location: 'N/A', // Not supported by backend
                email: 'N/A', // Not supported by backend
                age: '-', // Not supported
                occupation: '未知', // Not supported
                tags: data.interestedProducts || [],
                car: data.interestedProducts?.[0] || '未知',
                budget: data.estimatedValue ? `${data.estimatedValue}元` : (data.budgetRange || '-'),
                purchaseTime: data.decisionTimeline || '-',
                paymentMethod: '-',
                concerns: data.competitorInfo ? [data.competitorInfo] : [],
                notes: data.description || '无备注',
                avatar: `https://ui-avatars.com/api/?name=${data.title}&background=random`,
                timeline: [] // Not supported
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">加载中...</div>;
    if (!lead) return <div className="text-center py-10">未找到线索</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header - B2B Professional */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {lead.name}
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">ID: {lead.id}</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right mr-4 hidden sm:block">
                                <p className="text-xs text-gray-500">成交概率</p>
                                <p className="text-lg font-bold text-primary">{lead.probability}</p>
                            </div>
                            <button
                                onClick={() => navigate('/leads/follow-up', { state: { lead } })}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors"
                            >
                                写跟进
                            </button>
                            <button
                                onClick={() => navigate(`/leads/conversion/${lead.id}`)}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                转客户
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <img src={lead.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                        <span>{lead.occupation}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{lead.age}岁</span>
                                    </p>
                                </div>
                            </div>
                            {lead.priority === 'high' && (
                                <span className="px-3 py-1 bg-orange-50 text-accent text-xs font-medium rounded-full border border-orange-100">
                                    高意向
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-900 font-medium">{lead.phone}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-600">{lead.location}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-600">{lead.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-600">创建于 {lead.createdAt}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Requirements Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" />
                            购车需求
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-8 mb-6 border border-gray-100">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">意向车型</span>
                                <span className="text-sm font-bold text-gray-900">{lead.car}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">预算范围</span>
                                <span className="text-sm font-bold text-gray-900">{lead.budget}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">购车时间</span>
                                <span className="text-sm font-bold text-gray-900">{lead.purchaseTime}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">付款方式</span>
                                <span className="text-sm font-bold text-gray-900">{lead.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-900 block mb-2">关注重点</span>
                                <div className="flex flex-wrap gap-2">
                                    {lead.concerns.map((c: string) => (
                                        <span key={c} className="px-2.5 py-1 bg-blue-50 text-primary text-xs rounded-full border border-blue-100">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-900 block mb-2">销售备注</span>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                                    {lead.notes}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full">
                        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-black" />
                            跟进记录
                        </h3>
                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                            {lead.timeline.map((item: any, index: number) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ring-1 ring-gray-200 ${item.type === 'create' ? 'bg-gray-400' : 'bg-primary'
                                        }`}></div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900">{item.title}</span>
                                            <span className="text-xs text-gray-400">{item.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{item.content}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                {item.agent}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;
