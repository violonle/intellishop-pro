import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const ProductAdd: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category: '',
        subcategory: '',
        summary: '',
        description: '',
        tags: '',
        price: '',
        cost: '',
        stock: '',
        unit: '个',
        industry: '',
        status: 'active',
        highlights: ''
    });

    const [specs, setSpecs] = useState([{ name: '', value: '' }]);
    const [image, setImage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpec = () => setSpecs([...specs, { name: '', value: '' }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productService.createProduct({
                name: formData.name,
                sku: formData.code,
                categoryId: 0, // Placeholder
                brand: 'Unknown',
                model: '',
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.cost),
                stockQuantity: parseInt(formData.stock),
                minStock: 0,
                description: formData.description + '\n' + formData.summary,
                status: formData.status as any,
                features: formData.tags,
                specifications: JSON.stringify(specs)
            });
            navigate('/products');
        } catch (error) {
            console.error(error);
            alert('保存失败');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">新增产品</h1>
                                <p className="text-sm text-gray-500 mt-1">添加新产品到产品库</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                                取消
                            </button>
                            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm">
                                保存产品
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">

                    {/* Basic Info */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">产品名称 *</label>
                                <input name="name" value={formData.name} onChange={handleChange} required placeholder="例：iPhone 15 Pro" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">产品编码 *</label>
                                <input name="code" value={formData.code} onChange={handleChange} required placeholder="例：PROD-2025-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">产品分类 *</label>
                                <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                                    <option value="">-- 选择产品分类 --</option>
                                    <option value="electronics">电子产品</option>
                                    <option value="software">软件/服务</option>
                                    <option value="hardware">硬件设备</option>
                                    <option value="consulting">咨询服务</option>
                                    <option value="other">其他</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">子分类</label>
                                <input name="subcategory" value={formData.subcategory} onChange={handleChange} placeholder="例：手机" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">产品描述</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">简介</label>
                            <input name="summary" value={formData.summary} onChange={handleChange} placeholder="产品简短介绍" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">详细描述</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="输入产品详细描述..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">产品标签</label>
                            <input name="tags" value={formData.tags} onChange={handleChange} placeholder="用逗号分隔多个标签，例：高端,创新,AI" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">产品图片</h2>
                        {!image ? (
                            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                <span className="text-4xl text-gray-400 block mb-2">🖼️</span>
                                <span className="text-sm text-gray-600 block">点击上传图片</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="relative inline-block">
                                <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                                <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        )}
                    </div>

                    {/* Price & Stock */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">价格和库存</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">销售价格 (¥) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">成本价 (¥)</label>
                                <input type="number" name="cost" value={formData.cost} onChange={handleChange} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">库存数量 *</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">配置参数</h2>
                            <button type="button" onClick={addSpec} className="text-blue-600 text-sm font-medium hover:text-blue-700">+ 添加参数</button>
                        </div>
                        <div className="space-y-3">
                            {specs.map((spec, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                                    <input
                                        placeholder="参数名称"
                                        value={spec.name}
                                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                    />
                                    <div className="flex space-x-2">
                                        <input
                                            placeholder="参数值"
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button type="button" onClick={() => removeSpec(index)} className="text-red-500 hover:text-red-600 px-2">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sales Info */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">销售信息</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">适用行业</label>
                                <input name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">产品状态 *</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                                    <option value="active">上架</option>
                                    <option value="draft">草稿</option>
                                    <option value="discontinued">停产</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">销售亮点</label>
                            <textarea name="highlights" value={formData.highlights} onChange={handleChange} rows={3} placeholder="输入产品销售重点..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProductAdd;
