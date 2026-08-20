import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, type Product } from '../../services/productService';

const ProductCatalog: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [activeBrand, setActiveBrand] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productService.getProducts({ pageNo: 1, pageSize: 100, status: 'active' })
            .then(result => setProducts(result.items || []))
            .catch(error => console.error('加载产品失败', error))
            .finally(() => setLoading(false));
    }, []);

    const brands = useMemo(() => ['all', ...Array.from(new Set(products.map(product => product.brand).filter(Boolean) as string[]))], [products]);
    const filteredProducts = activeBrand === 'all' ? products : products.filter(product => product.brand === activeBrand);

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10 px-4 py-4">
                <div className="flex items-center space-x-3"><button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">←</button><div><h1 className="text-xl font-bold text-gray-900">产品图册</h1><p className="text-sm text-gray-500">产品展示与配置</p></div></div>
            </div>
            <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                {brands.map(brand => <button key={brand} onClick={() => setActiveBrand(brand)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeBrand === brand ? 'bg-[#4640DE] text-white' : 'bg-gray-100 text-gray-700'}`}>{brand === 'all' ? '全部品牌' : brand}</button>)}
            </div>
            {filteredProducts.length === 0 ? <div className="px-4 py-16 text-center text-gray-400">暂无产品数据</div> : <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{filteredProducts.map(product => <button key={product.id} onClick={() => navigate(`/products/${product.id}`)} className="text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md"><div className="h-40 bg-gray-100 flex items-center justify-center">{product.images ? <img src={product.images.split(',')[0]} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-gray-400">暂无图片</span>}</div><div className="p-4"><h2 className="font-bold text-gray-900">{product.name}</h2><p className="text-sm text-gray-500 mt-1">{product.brand || '未设置品牌'} {product.model || ''}</p><p className="text-blue-600 font-bold mt-3">¥{product.price ?? '暂无价格'}</p></div></button>)}</div>}
        </div>
    );
};

export default ProductCatalog;
