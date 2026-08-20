import React, { useEffect, useState } from 'react';
import { Button, Tag, message } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dealService } from '@/services/deal';

const DealDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const id = params.get('id');
    const [detail, setDetail] = useState<any>(null);
    useEffect(() => { if (id) dealService.getDealDetail(id).then(setDetail).catch(() => message.error('订单加载失败')); }, [id]);
    if (!id) return <div className="p-8 text-center text-slate-400">缺少订单ID</div>;
    if (!detail) return <div className="p-8 text-center text-slate-400">加载中或订单不存在</div>;
    const order = detail.order || detail;
    return <div className="space-y-6 animate-fade-in"><div className="flex justify-between items-center"><Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/deals')}>返回订单列表</Button><Tag color="blue">状态 {order.status ?? '暂无'}</Tag></div><div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5"><h1 className="text-2xl font-black">订单 {order.orderNo || order.id}</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div>客户ID：{order.customerId ?? '暂无'}</div><div>销售ID：{order.userId ?? '暂无'}</div><div>订单金额：{order.totalAmount ?? '暂无'}</div><div>支付金额：{order.payAmount ?? '暂无'}</div></div><div className="border-t pt-4 text-sm text-slate-600">支付方式：{order.paymentMethod || '暂无'}　创建时间：{order.createdAt || '暂无'}</div></div><div className="bg-white rounded-3xl border border-slate-200 p-6"><h2 className="font-bold mb-4">订单明细</h2>{detail.items?.length ? <div className="space-y-2">{detail.items.map((item: any) => <div key={item.id} className="flex justify-between text-sm"><span>产品ID {item.productId}</span><span>数量 {item.quantity}　金额 {item.totalPrice ?? item.price ?? '暂无'}</span></div>)}</div> : <p className="text-sm text-slate-400">暂无订单明细</p>}</div></div>;
};

export default DealDetailPage;
