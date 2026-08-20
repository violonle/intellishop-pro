import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Link,
    Share2,
    Maximize2,
    X,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';

const ProductImageGallery: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'official'>('exterior');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = {
        exterior: [
            { src: 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80', title: '正侧面 45°' },
            { src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80', title: '正前脸' },
            { src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80', title: '正后方' },
            { src: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80', title: '左侧面' },
        ],
        interior: [
            { src: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80', title: '驾驶舱全景' },
            { src: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80', title: '中控大屏' },
            { src: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80', title: '后排空间' },
        ],
        official: [
            { src: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80', title: '官方宣传图 1' },
            { src: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80', title: '官方宣传图 2' },
        ]
    };

    const currentImages = images[activeTab];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-semibold text-gray-900">图库 - 2024款 宝马 X5</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <Link className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white px-4 py-3 flex gap-4 overflow-x-auto border-b border-gray-100">
                {(['exterior', 'interior', 'official'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {tab === 'exterior' ? '外观' : tab === 'interior' ? '内饰' : '官图'}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    {currentImages.map((img, index) => (
                        <div
                            key={index}
                            className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer"
                            onClick={() => openLightbox(index)}
                        >
                            <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-medium truncate">{img.title}</p>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    ))}
                    {/* Add Placeholder */}
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs">上传更多</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 pb-safe">
                <button className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
                    <Download className="w-5 h-5" />
                    <span>打包下载全套图库</span>
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">共 {currentImages.length} 张图片，大小 12.5MB</p>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    <div className="flex items-center justify-between px-4 py-4 text-white/80">
                        <span className="text-sm">{currentImageIndex + 1} / {currentImages.length}</span>
                        <button onClick={() => setLightboxOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center bg-black">
                        <img
                            src={currentImages[currentImageIndex].src}
                            alt={currentImages[currentImageIndex].title}
                            className="max-w-full max-h-full object-contain"
                        />

                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="px-6 py-8 text-white">
                        <h3 className="text-lg font-medium mb-1">{currentImages[currentImageIndex].title}</h3>
                        <div className="flex items-center gap-4 mt-4">
                            <button className="flex-1 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">原图下载</button>
                            <button className="flex-1 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">分享给客户</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;
