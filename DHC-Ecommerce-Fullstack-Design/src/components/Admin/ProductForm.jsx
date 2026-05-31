import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Link as LinkIcon, Upload, X, Package, CheckCircle } from 'lucide-react';
import { uploadImage } from '../../services/productService';
import Swal from 'sweetalert2';

const ProductForm = ({ editingProduct, suppliers, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        oldPrice: '',
        imageUrl: '',
        stockQuantity: '',
        categoryId: 1,
        supplierId: suppliers[0]?.id || '',
        freeShipping: false,
        isNegotiable: false,
        warranty: '1 Year Warranty'
    });

    const [imageSource, setImageSource] = useState('link'); // 'link' or 'upload'
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                title: editingProduct.title,
                description: editingProduct.description,
                price: editingProduct.price,
                oldPrice: editingProduct.oldPrice || '',
                imageUrl: editingProduct.imageUrl,
                stockQuantity: editingProduct.stockQuantity,
                categoryId: 1,
                supplierId: suppliers.find(s => s.companyName === editingProduct.supplier?.companyName)?.id || suppliers[0]?.id || '',
                freeShipping: editingProduct.freeShipping,
                isNegotiable: editingProduct.isNegotiable,
                warranty: editingProduct.warranty
            });
            setPreviewUrl(editingProduct.imageUrl);
            setImageSource('link');
        }

        if (!editingProduct && suppliers[0]?.id) {
            setFormData(prev => prev.supplierId ? prev : { ...prev, supplierId: suppliers[0].id });
        }
    }, [editingProduct, suppliers]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, imageUrl: url });
        setPreviewUrl(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            if (imageSource === 'upload' && selectedFile) {
                const uploadResult = await uploadImage(selectedFile);
                finalImageUrl = uploadResult.imageUrl;
            }

            if (!finalImageUrl && imageSource === 'link') {
                Swal.fire('Error', 'Please provide an image URL or upload a file.', 'error');
                setIsUploading(false);
                return;
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                price: parseFloat(formData.price),
                oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
                stockQuantity: parseInt(formData.stockQuantity),
                thumbnailUrls: [finalImageUrl]
            };

            await onSubmit(payload);
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire('Error', 'Failed to save product.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={onClose}
                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-brand-blue hover:border-brand-blue transition-all shadow-sm"
                >
                    <X size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h1>
                    <p className="text-sm text-gray-500">{editingProduct ? 'Update existing product details and pricing' : 'Create a new listing in your catalog'}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Side - Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide uppercase text-[10px]">Product Information</label>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 ml-1">Product Title</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            placeholder="e.g. Premium Wireless Headphones"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 ml-1">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue h-40 resize-none transition-all leading-relaxed"
                                            placeholder="Describe your product's key features and specifications..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide uppercase text-[10px]">Pricing & Value</label>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 ml-1">Discounted Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number" step="0.01" required
                                                className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold text-brand-dark"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 ml-1">Original Price (Old)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number" step="0.01"
                                                className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-gray-500"
                                                value={formData.oldPrice}
                                                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Media & Logistics */}
                        <div className="space-y-8">
                            {/* Image Preview & Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4 tracking-wide uppercase text-[10px]">Product Visualization</label>

                                <div className="mb-6 aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group shadow-inner">
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => { setPreviewUrl(''); setFormData({ ...formData, imageUrl: '' }); setSelectedFile(null); }}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                                <ImageIcon size={32} className="opacity-30" />
                                            </div>
                                            <p className="text-sm font-bold">Preview will appear here</p>
                                            <p className="text-xs mt-1">Upload a file or paste a URL</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setImageSource('link')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${imageSource === 'link' ? 'bg-white text-brand-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <LinkIcon size={16} /> Image Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageSource('upload')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${imageSource === 'upload' ? 'bg-white text-brand-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Upload size={16} /> File Upload
                                    </button>
                                </div>

                                {imageSource === 'link' ? (
                                    <input
                                        type="text"
                                        placeholder="Paste high-quality image URL..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm"
                                        value={formData.imageUrl}
                                        onChange={handleUrlChange}
                                    />
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="product-image-upload"
                                        />
                                        <label
                                            htmlFor="product-image-upload"
                                            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-brand-blue text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-brand-blue/20"
                                        >
                                            <Camera size={20} />
                                            {selectedFile ? 'Change Selected Image' : 'Select Product Image'}
                                        </label>
                                        {selectedFile && <p className="text-xs text-gray-500 mt-2 text-center font-medium italic">Selected: {selectedFile.name}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 ml-1">Supplier Source</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm font-medium"
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    >
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 ml-1">Available Stock</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm font-medium"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                <div
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.freeShipping ? 'bg-green-50 border-green-200 ring-2 ring-green-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                                    onClick={() => setFormData({ ...formData, freeShipping: !formData.freeShipping })}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.freeShipping ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 leading-tight">Free Shipping</p>
                                            <p className="text-[10px] text-gray-500">Global Delivery</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.freeShipping ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                        {formData.freeShipping && <CheckCircle size={14} strokeWidth={3} />}
                                    </div>
                                </div>

                                <div
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.isNegotiable ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                                    onClick={() => setFormData({ ...formData, isNegotiable: !formData.isNegotiable })}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isNegotiable ? 'bg-brand-blue text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                                            <LinkIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 leading-tight">Negotiable</p>
                                            <p className="text-[10px] text-gray-500">B2B Friendly</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.isNegotiable ? 'bg-brand-blue border-brand-blue text-white' : 'border-gray-300'}`}>
                                        {formData.isNegotiable && <CheckCircle size={14} strokeWidth={3} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 px-8 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 px-8 py-4 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-blue/25 disabled:opacity-50 flex items-center justify-center gap-3 font-sans"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Syncing with Catalog...</span>
                                </>
                            ) : (
                                <>
                                    <Package size={20} />
                                    <span>{editingProduct ? 'Update Product Details' : 'Publish to Storefront'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
