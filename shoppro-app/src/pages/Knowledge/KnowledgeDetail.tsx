import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import type { Knowledge } from '../../services/knowledgeService';

const KnowledgeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [article, setArticle] = useState<Knowledge | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await knowledgeService.getKnowledgeDetail(Number(id));
                setArticle(data);
                // Increment view count
                await knowledgeService.incrementView(Number(id));
            } catch (error) {
                console.error('Failed to load article', error);
                // navigate('/knowledge'); // Optional: redirect on error
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    useEffect(() => {
        // Scroll progress listener
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (scrollTop / docHeight) * 100;
            setProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">加载文档中...</div>;
    if (!article) return <div className="p-12 text-center text-gray-500">文档不存在</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 h-1 bg-[#4640DE] z-50 transition-all duration-300" style={{ width: `${progress}%` }}></div>

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900 truncate max-w-xs">{article.title}</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => window.print()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="打印">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
                    <span className="cursor-pointer hover:text-[#4640DE]" onClick={() => navigate('/dashboard')}>首页</span>
                    <span>/</span>
                    <span className="cursor-pointer hover:text-[#4640DE]" onClick={() => navigate('/knowledge')}>知识库</span>
                    <span>/</span>
                    <span className="text-gray-900">{article.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Content */}
                    <article className="lg:col-span-3 bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
                        <div className="prose max-w-none">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-[#4640DE]">{article.title}</h1>
                            <div className="mb-4 text-sm text-gray-500">
                                {article.updatedAt && <span>更新于: {article.updatedAt}</span>}
                            </div>
                            {/* Render HTML content safely */}
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>
                    </article>

                    {/* Table of Contents (Sidebar) - Simplified placeholder since we can't parse HTML headers easily without a library */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">关于</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                正在阅读: {article.title}
                            </p>
                            <div className="text-xs text-gray-500">
                                浏览次数: {article.viewCount || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeDetail;
