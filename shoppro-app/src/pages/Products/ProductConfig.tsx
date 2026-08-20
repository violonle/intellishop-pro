import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductConfig: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [comparisons, setComparisons] = useState({
        model1: true,
        model2: false,
        model3: false
    });

    const categories = [
        { id: 'all', label: '全部配置' },
        { id: 'engine', label: '动力系统' },
        { id: 'safety', label: '安全配置' },
        { id: 'comfort', label: '舒适配置' },
        { id: 'tech', label: '科技配置' }
    ];

    const configData = [
        {
            category: 'engine',
            name: '发动机',
            values: ['2.0T 四缸涡轮增压', '2.0T 四缸涡轮增压', '3.0T V6涡轮增压']
        },
        {
            category: 'engine',
            name: '最大功率(kW)',
            values: ['185', '185', '250']
        },
        {
            category: 'engine',
            name: '最大扭矩(N·m)',
            values: ['370', '370', '500']
        },
        {
            category: 'engine',
            name: '变速箱',
            values: ['7速S tronic双离合', '7速S tronic双离合', '8速tiptronic手自一体']
        },
        {
            category: 'safety',
            name: 'ABS防抱死',
            values: ['●', '●', '●']
        },
        {
            category: 'safety',
            name: '主动刹车系统',
            values: ['○', '●', '●']
        },
        {
            category: 'comfort',
            name: '座椅加热',
            values: ['●', '●', '●']
        },
        {
            category: 'comfort',
            name: '座椅通风',
            values: ['○', '◐', '●']
        },
        {
            category: 'tech',
            name: '中控屏尺寸',
            values: ['10.1英寸', '10.1英寸', '10.1英寸']
        },
        {
            category: 'tech',
            name: 'HUD抬头显示',
            values: ['○', '○', '●']
        }
    ];

    const filteredConfigs = configData.filter(item => {
        const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleComparison = (key: keyof typeof comparisons) => {
        setComparisons(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getValueClass = (val: string) => {
        if (val === '●') return 'text-green-600 font-bold text-lg';
        if (val === '○') return 'text-red-400 font-bold text-lg';
        if (val === '◐') return 'text-yellow-500 font-bold text-lg';
        return 'text-gray-900';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">产品详细配置</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                导出配置
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索配置项..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveFilter(cat.id)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${activeFilter === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">车型配置对比</h2>
                            <button onClick={() => setComparisons({ model1: false, model2: false, model3: false })} className="text-sm text-blue-600 hover:text-blue-700">清除选择</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-200 w-64 min-w-[200px] sticky left-0 z-10">
                                        配置项目
                                    </th>
                                    <th className={`p-4 text-center border-b border-gray-200 min-w-[240px] ${comparisons.model1 ? 'bg-blue-50/30' : ''}`}>
                                        <div className="space-y-2">
                                            <input type="checkbox" checked={comparisons.model1} onChange={() => toggleComparison('model1')} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <div className="font-semibold text-gray-900">豪华致雅型</div>
                                            <div className="text-xs text-gray-500">2.0T 四缸涡轮增压</div>
                                            <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">¥41.98万</div>
                                        </div>
                                    </th>
                                    <th className={`p-4 text-center border-b border-gray-200 min-w-[240px] ${comparisons.model2 ? 'bg-blue-50/30' : ''}`}>
                                        <div className="space-y-2">
                                            <input type="checkbox" checked={comparisons.model2} onChange={() => toggleComparison('model2')} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <div className="font-semibold text-gray-900">豪华动感型</div>
                                            <div className="text-xs text-gray-500">2.0T 四缸涡轮增压</div>
                                            <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">¥44.38万</div>
                                        </div>
                                    </th>
                                    <th className={`p-4 text-center border-b border-gray-200 min-w-[240px] ${comparisons.model3 ? 'bg-blue-50/30' : ''}`}>
                                        <div className="space-y-2">
                                            <input type="checkbox" checked={comparisons.model3} onChange={() => toggleComparison('model3')} className="rounded text-blue-600 focus:ring-blue-500" />
                                            <div className="font-semibold text-gray-900">quattro 豪华致雅</div>
                                            <div className="text-xs text-gray-500">3.0T V6涡轮增压</div>
                                            <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">¥50.98万</div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredConfigs.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100">
                                            {item.name}
                                        </td>
                                        <td className={`p-4 text-center text-sm border-r border-gray-100 ${comparisons.model1 ? 'bg-blue-50/10' : ''}`}>
                                            <span className={getValueClass(item.values[0])}>{item.values[0]}</span>
                                        </td>
                                        <td className={`p-4 text-center text-sm border-r border-gray-100 ${comparisons.model2 ? 'bg-blue-50/10' : ''}`}>
                                            <span className={getValueClass(item.values[1])}>{item.values[1]}</span>
                                        </td>
                                        <td className={`p-4 text-center text-sm ${comparisons.model3 ? 'bg-blue-50/10' : ''}`}>
                                            <span className={getValueClass(item.values[2])}>{item.values[2]}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center">
                                <span className="text-green-600 font-bold mr-2">●</span>
                                <span className="text-gray-600">标准配置</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-yellow-500 font-bold mr-2">◐</span>
                                <span className="text-gray-600">选装配置</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-red-400 font-bold mr-2">○</span>
                                <span className="text-gray-600">无此配置</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200">
                        获取报价
                    </button>
                    <button className="flex-1 bg-white text-gray-700 border border-gray-200 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
                        预约试驾
                    </button>
                    <button className="flex-1 bg-white text-gray-700 border border-gray-200 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
                        联系经销商
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductConfig;
