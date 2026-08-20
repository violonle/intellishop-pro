import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { productService, type Product } from '../../services/productService';

const LeadForm: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        productService.getProducts({ pageNo: 1, pageSize: 100, status: 'active' })
            .then(data => setProducts(data.items || []))
            .catch(error => console.error('Failed to load products', error));
    }, []);


    // Form state match backend DTO
    // Backend requires: title (mandatory)
    // Frontend has: name, phone, address, car, budget min/max
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        car: '',
        budgetMin: '',
        budgetMax: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await leadService.createLead({
                title: `${formData.name}的购车意向`, // Map name to title
                description: `联系电话: ${formData.phone}, 地址: ${formData.address}`, // Store extra info in description
                interestedProducts: [formData.car],
                budgetRange: `${formData.budgetMin}-${formData.budgetMax}万`,
                source: 'Manual Entry',
                priority: 'medium',
                status: 'new'
            });
            navigate('/leads');
        } catch (error) {
            console.error('Failed to create lead', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:text-primary">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">新建线索</h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-20">
                {/* Basic Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                        基本信息
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">客户姓名 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                placeholder="请输入客户姓名"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">手机号码 <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="请输入手机号码"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">所在地区 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="请输入所在地区"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                        购车需求
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">意向车型 <span className="text-red-500">*</span></label>
                            <select
                                name="car"
                                value={formData.car}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900 appearance-none"
                            >
                                <option value="">请选择</option>
                                {products.map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">预算下限(万)</label>
                                <input
                                    type="number"
                                    name="budgetMin"
                                    value={formData.budgetMin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">预算上限(万)</label>
                                <input
                                    type="number"
                                    name="budgetMax"
                                    value={formData.budgetMax}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 px-4 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {submitting ? '提交中...' : '保存线索'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;
