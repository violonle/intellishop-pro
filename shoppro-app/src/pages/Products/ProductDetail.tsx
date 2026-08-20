import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';

// Types
interface StockRecord {
    id: number;
    date: string;
    type: '入库' | '出库' | '调整';
    change: string;
    balance: number;
    remark: string;
    operator: string;
}

interface ProductDetailData {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    reservedStock: number;
    status: 'active' | 'inactive' | 'pre_sale';
    image: string;
    description: string;
    totalSales: number;
    totalRevenue: number;
    avgRating: number;
    reviewCount: number;
    returnRate: number;
    stockRecords: StockRecord[];
    relatedProducts: { id: string; name: string; price: number; image: string }[];
}

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [formData, setFormData] = useState<Partial<ProductDetailData>>({});

    // Stock Modal
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockOperation, setStockOperation] = useState<'in' | 'out' | 'adjust'>('in');
    const [stockForm, setStockForm] = useState({ quantity: '', remark: '' });

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const data = await productService.getProductDetail(Number(id));

            // Transform backend data to UI
            const productData: ProductDetailData = {
                id: data.id.toString(),
                name: data.name,
                sku: data.sku || 'N/A',
                category: data.categoryName || '默认分类',
                brand: data.brand || '未知',
                price: data.price,
                cost: data.costPrice || 0,
                stock: data.stockQuantity,
                minStock: data.minStock || 0,
                reservedStock: 0, // Not in backend yet
                status: (data.status as any) === 'active' || (data.status as any) === '1' ? 'active' : 'inactive', // Simple map
                image: data.images ? data.images.split(',')[0] : `https://ui-avatars.com/api/?name=${data.name}&background=random&size=400`,
                description: data.description || '暂无描述',
                totalSales: data.salesCount || 0,
                totalRevenue: (data.salesCount || 0) * data.price, // Estimate
                avgRating: 0,
                reviewCount: 0,
                returnRate: 0,
                stockRecords: [],
                relatedProducts: []
            };
            setProduct(productData);
            setFormData(productData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!product) return;
        try {
            await productService.updateProduct(Number(product.id), {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                stockQuantity: formData.stock,
                status: formData.status === 'active' ? 'active' : 'inactive'
            });
            await fetchProductDetail();
            setIsEditing(false);
        } catch (error) {
            console.error('产品保存失败', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('确定要删除这个产品吗？此操作不可恢复。')) {
            try {
                await productService.deleteProduct(Number(id));
                navigate('/products');
            } catch (error) {
                console.error('产品删除失败', error);
            }
        }
    };

    const openStockModal = (type: 'in' | 'out' | 'adjust') => {
        setStockOperation(type);
        setStockForm({ quantity: '', remark: '' });
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async () => {
        if (!stockForm.quantity || !product) return;

        const qty = parseInt(stockForm.quantity);

        try {
            await productService.updateStock(
                Number(product.id),
                qty,
                stockOperation === 'adjust' ? 'set' : stockOperation as 'in' | 'out'
            );

            // Refresh data
            fetchProductDetail();
            setIsStockModalOpen(false);
        } catch (error) {
            console.error('Stock update failed', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
    if (!product) return <div className="p-8 text-center text-gray-500">产品不存在</div>;

    const getStockTypeClass = (type: string) => {
        const map: any = {
            '入库': 'bg-green-100 text-green-800',
            '出库': 'bg-red-100 text-red-800',
            '调整': 'bg-yellow-100 text-yellow-800'
        };
        return map[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`px-4 py-2 border rounded-lg flex items-center text-sm ${isEditing ? 'bg-[#4640DE] text-white border-transparent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isEditing ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    )}
                                </svg>
                                {isEditing ? '保存更改' : '编辑产品'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                                            <img src={product.image} alt={product.name} className="h-80 w-full object-cover object-center" />
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {/* Thumbnails placeholder */}
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg shrink-0"></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                readOnly={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                                <input
                                                    type="text"
                                                    name="sku"
                                                    value={formData.sku || ''}
                                                    onChange={handleInputChange}
                                                    readOnly={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">产品状态</label>
                                                <select
                                                    name="status"
                                                    value={formData.status || 'active'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent appearance-none'}`}
                                                >
                                                    <option value="active">在售</option>
                                                    <option value="inactive">下架</option>
                                                    <option value="pre_sale">预售</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
                                                <select
                                                    name="category"
                                                    value={formData.category || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent appearance-none'}`}
                                                >
                                                    <option>智能手机</option>
                                                    <option>笔记本电脑</option>
                                                    <option>平板电脑</option>
                                                    <option>智能手表</option>
                                                    <option>耳机音响</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    value={formData.brand || ''}
                                                    onChange={handleInputChange}
                                                    readOnly={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">销售价格</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price || 0}
                                                    onChange={handleInputChange}
                                                    readOnly={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">成本价格</label>
                                                <input
                                                    type="number"
                                                    name="cost"
                                                    value={formData.cost || 0}
                                                    onChange={handleInputChange}
                                                    readOnly={!isEditing}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">产品描述</label>
                                            <textarea
                                                rows={4}
                                                name="description"
                                                value={formData.description || ''}
                                                onChange={handleInputChange}
                                                readOnly={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg outline-none ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-[#4640DE]' : 'border-transparent bg-transparent'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Management */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">库存管理</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">当前库存</label>
                                    <input type="number" value={product.stock} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">最低库存</label>
                                    <input type="number" value={product.minStock} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">预留库存</label>
                                    <input type="number" value={product.reservedStock} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button onClick={() => openStockModal('in')} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                                    入库
                                </button>
                                <button onClick={() => openStockModal('out')} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                                    出库
                                </button>
                                <button onClick={() => openStockModal('adjust')} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    调整
                                </button>
                            </div>
                        </div>

                        {/* Stock Records */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">库存记录</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量变化</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结余</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {product.stockRecords.map(record => (
                                            <tr key={record.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockTypeClass(record.type)}`}>
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${record.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{record.change}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.balance}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.remark}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.operator}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">产品统计</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">总销量</span>
                                    <span className="text-lg font-semibold text-gray-900">{product.totalSales.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">总收入</span>
                                    <span className="text-lg font-semibold text-gray-900">¥{product.totalRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">平均评分</span>
                                    <span className="text-lg font-semibold text-gray-900">{product.avgRating}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">评价数量</span>
                                    <span className="text-lg font-semibold text-gray-900">{product.reviewCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">退货率</span>
                                    <span className="text-lg font-semibold text-gray-900">{product.returnRate}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">快捷操作</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <span className="mr-2">📊</span> 查看销售数据
                                </button>
                                <button className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <span className="mr-2">💬</span> 查看用户评价
                                </button>
                                <button className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <span className="mr-2">🆚</span> 竞品分析
                                </button>
                                <button className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                                    <span className="mr-2">📑</span> 生成报告
                                </button>
                            </div>
                        </div>

                        {/* Related Products */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">相关产品</h3>
                            <div className="space-y-4">
                                {product.relatedProducts.map(rel => (
                                    <div key={rel.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate(`/products/${rel.id}`)}>
                                        <img src={rel.image} alt={rel.name} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{rel.name}</p>
                                            <p className="text-sm text-gray-500">¥{rel.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Stock Operation Modal */}
            {isStockModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {stockOperation === 'in' ? '入库' : stockOperation === 'out' ? '出库' : '库存调整'}
                            </h3>
                            <button onClick={() => setIsStockModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
                                <input
                                    type="number"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#4640DE]"
                                    placeholder="请输入数量"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                                <textarea
                                    rows={3}
                                    value={stockForm.remark}
                                    onChange={(e) => setStockForm(prev => ({ ...prev, remark: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#4640DE]"
                                    placeholder="请输入备注信息"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
                                <button onClick={handleStockSubmit} className="px-4 py-2 bg-[#4640DE] text-white rounded-lg hover:bg-opacity-90">确认</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
