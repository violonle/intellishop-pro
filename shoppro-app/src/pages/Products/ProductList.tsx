import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

// Types
interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock' | 'pre_sale';
    image: string;
    description: string;
}

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lowStockCount: 0,
        categoryCount: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        category: '全部分类',
        status: '全部状态'
    });

    useEffect(() => {
        fetchProducts();
        productService.getProductStatistics().then((data: any) => setStats(data));
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts({
                pageNo: 1,
                pageSize: 50, // Get more for grid view
                search: filters.search || undefined,
                status: filters.status !== '全部状态' ? getStatusKey(filters.status) : undefined,
                // category: filters.category !== '全部分类' ? ... : undefined // Need category ID mapping if strict
            });

            // Map Backend Product to Frontend Product Interface
            const mappedProducts: Product[] = data.items.map((item: any) => ({
                id: item.id.toString(),
                name: item.name,
                sku: item.sku || 'N/A',
                category: item.categoryId ? '默认分类' : '未分类', // Placeholder until category map
                brand: item.brand || '未知',
                price: item.price,
                cost: item.costPrice || 0,
                stock: item.stockQuantity || 0,
                minStock: item.minStock || 0,
                status: mapBackendStatusToFrontend(item.status, item.stockQuantity, item.minStock),
                image: item.images ? item.images.split(',')[0] : `https://ui-avatars.com/api/?name=${item.name}&background=random`,
                description: item.description || ''
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const mapBackendStatusToFrontend = (status: string, stock: number, minStock: number): any => {
        if (stock <= 0) return 'out_of_stock';
        if (stock <= minStock) return 'low_stock';
        return status === '1' || status === 'active' ? 'active' : 'inactive';
    };

    const getStatusBadge = (status: string) => {
        const map: any = {
            'active': { text: '在售', class: 'bg-green-100 text-green-800' },
            'inactive': { text: '下架', class: 'bg-gray-100 text-gray-800' },
            'low_stock': { text: '库存不足', class: 'bg-yellow-100 text-yellow-800' },
            'out_of_stock': { text: '缺货', class: 'bg-red-100 text-red-800' },
            'pre_sale': { text: '预售', class: 'bg-blue-100 text-blue-800' }
        };
        const info = map[status] || map['active'];
        return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${info.class}`}>{info.text}</span>;
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await productService.updateProduct(Number(product.id), {
                status: product.status === 'active' ? 'inactive' : 'active'
            });
            window.alert(product.status === 'active' ? '产品已下架' : '产品已上架');
            await fetchProducts();
        } catch (error: any) {
            window.alert(error.message || '产品状态更新失败');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) || product.sku.toLowerCase().includes(filters.search.toLowerCase());
        const matchCategory = filters.category === '全部分类' || product.category === filters.category;
        const matchStatus = filters.status === '全部状态' || product.status === getStatusKey(filters.status);
        return matchSearch && matchCategory && matchStatus;
    });

    // Helper to map UI status to data status
    function getStatusKey(uiStatus: string) {
        const map: any = { '在售': 'active', '下架': 'inactive', '库存不足': 'low_stock', '缺货': 'out_of_stock', '预售': 'pre_sale' };
        return map[uiStatus] || '';
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">产品管理</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/catalog')} className="whitespace-nowrap bg-white text-teal-600 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 flex items-center shadow-sm transition-all text-sm group">
                                <svg className="w-4 h-4 mr-1.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                产品图册
                            </button>
                            <button onClick={() => navigate('/products/new')} className="whitespace-nowrap bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 flex items-center shadow-sm transition-all text-sm">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                新增产品
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Bar - Single Row */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-4 divide-x divide-gray-100">
                        <div className="px-4 flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">产品总数</p>
                                <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                        </div>
                        <div className="px-4 flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">在售产品</p>
                                <p className="text-lg font-bold text-gray-900">{stats.activeProducts}</p>
                            </div>
                        </div>
                        <div className="px-4 flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">库存不足</p>
                                <p className="text-lg font-bold text-gray-900 text-yellow-600">{stats.lowStockCount}</p>
                            </div>
                        </div>
                        <div className="px-4 flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">产品分类</p>
                                <p className="text-lg font-bold text-gray-900">{stats.categoryCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI 实时决策建议 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">实时决策建议</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                        <div className="p-8 text-center text-gray-400 text-sm">
                            暂无实时建议，需先配置产品分析数据源
                        </div>
                    </div>
                </div>


                {/* Optimized Filters (Full Width for max space efficiency) */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px] sm:min-w-[300px]">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索产品名称、SKU、品牌..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary w-full outline-none transition-all text-sm"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        </div>

                        {/* Filters Group */}
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none bg-no-repeat bg-[right_8px_center] bg-[length:14px] bg-white text-gray-700 min-w-[120px]"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")' }}
                            >
                                <option>全部分类</option>
                                <option>智能手机</option>
                                <option>笔记本电脑</option>
                                <option>平板电脑</option>
                                <option>智能手表</option>
                                <option>耳机音响</option>
                            </select>

                            <select
                                className="border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none bg-no-repeat bg-[right_8px_center] bg-[length:14px] bg-white text-gray-700 min-w-[120px]"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")' }}
                            >
                                <option>全部标签</option>
                                <option>热销</option>
                                <option>新品</option>
                                <option>清仓</option>
                                <option>高利润</option>
                            </select>

                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none bg-no-repeat bg-[right_8px_center] bg-[length:14px] bg-white text-gray-700 min-w-[120px]"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")' }}
                            >
                                <option>全部状态</option>
                                <option>在售</option>
                                <option>下架</option>
                                <option>库存不足</option>
                                <option>预售</option>
                            </select>
                        </div>

                        <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <button className="whitespace-nowrap bg-indigo-50 text-primary border border-primary/20 px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 flex items-center transition-all group">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                AI洞察
                            </button>
                            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content Area (Product Grid/List) */}
                <div className="">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p className="text-gray-500">正在为您加载产品库...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 text-3xl">📭</div>
                            <p className="text-gray-500 font-medium">未找到匹配的产品</p>
                            <button onClick={() => setFilters({ search: '', category: '全部分类', status: '全部状态' })} className="mt-4 text-primary hover:underline text-sm font-semibold">重置筛选</button>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/products/${product.id}`)}>
                                        <div className="relative h-40 bg-gray-50 overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-gray-200 select-none group-hover:scale-110 transition-transform duration-500 opacity-60">
                                                {product.sku.substring(0, 2).toUpperCase()}
                                            </div>
                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-100 opacity-40" />
                                            <div className="absolute top-3 right-3">
                                                {getStatusBadge(product.status)}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-3">
                                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-tight uppercase">SKU: {product.sku}</p>
                                                <p className="text-xs text-gray-500 mt-1">{product.category} · {product.brand}</p>
                                            </div>

                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 mr-0.5">¥</span>
                                                    <span className="text-xl font-black text-gray-900 tracking-tight">{product.price.toLocaleString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">当前库存</p>
                                                    <p className={`text-sm font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-700'}`}>{product.stock}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-3 border-t border-gray-50">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
                                                    className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); void handleToggleStatus(product); }}
                                                    className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
                                                >
                                                    {product.status === 'active' ? '下架' : '上架'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* List view logic here if needed, keeping it consistent with the compact goal */}
                                {/* [Existing list view table but refined inside the container] */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">产品详情</th>
                                                <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">库存状态</th>
                                                <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">销售价格</th>
                                                <th className="px-5 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredProducts.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-300 opacity-50">IMG</div>
                                                                <img src={product.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5 tracking-tight uppercase">{product.sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-900'}`}>{product.stock}</span>
                                                                {getStatusBadge(product.status)}
                                                            </div>
                                                            <p className="text-[10px] text-gray-400">{product.category}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-bold text-gray-900">¥{product.price.toLocaleString()}</p>
                                                        <p className="text-[10px] text-gray-400">毛利: ¥{(product.price - product.cost).toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); void productService.deleteProduct(Number(product.id)).then(() => { window.alert('产品已删除'); fetchProducts(); }).catch((error: any) => window.alert(error.message || '产品删除失败')); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </main >
        </div >
    );
};

export default ProductList;
