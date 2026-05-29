import React, { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Star,
  ShieldAlert,
  Globe,
  MessageSquare,
  ShoppingBag,
  Check,
  Mail,
  ChevronRight,
  ChevronLeft,
  Eye,
  ShieldCheck,
  ShoppingCart,
  User,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';

import { getProduct, getProducts } from '../services/productService';
import { useCart } from './CartContext';

const formatPrice = (price) => Number(price || 0).toFixed(2);

const ProductDetails = ({ onNavigate, productId }) => {
  const { cartCount, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [relatedApiProducts, setRelatedApiProducts] = useState([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState('');

  const displayProduct = product;
  const thumbnails = displayProduct?.thumbnailUrls?.length
    ? displayProduct.thumbnailUrls
    : displayProduct?.imageUrl ? [displayProduct.imageUrl] : [];

  const specs = displayProduct?.specifications || [];

  const features = [
    displayProduct?.freeShipping ? 'Free shipping is available' : 'Shipping options are available from supplier',
    displayProduct?.isNegotiable ? 'Price is negotiable for bulk orders' : 'Fixed price listing',
    displayProduct?.warranty,
    `${displayProduct?.stockQuantity || 0} units in stock`,
  ];

  const relatedProducts = useMemo(() => (
    relatedApiProducts.map((item) => ({
      id: item.id,
      img: item.imageUrl,
      title: item.title,
      price: `${formatPrice(item.price)}`,
    }))
  ), [relatedApiProducts]);

  const youMayLike = relatedProducts.slice(0, 5);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true);
        setProductError('');

        const [productData, relatedData] = await Promise.all([
          productId ? getProduct(productId) : getProducts({ page: 1, pageSize: 1 }).then((data) => data.items[0] || null),
          getProducts({ page: 1, pageSize: 6 }),
        ]);

        if (!isMounted) return;

        if (productData) {
          setProduct(productData);
          setActiveImage(productData.thumbnailUrls?.[0] || productData.imageUrl || '');
        }

        setRelatedApiProducts((relatedData.items || []).filter((item) => item.id !== productData?.id));
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load product details:', error);
        setProductError('Product details are unavailable because the API request failed.');
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const activeIdx = thumbnails.indexOf(activeImage);
  const goNext = () => setActiveImage(thumbnails[(activeIdx + 1) % thumbnails.length]);
  const goPrev = () => setActiveImage(thumbnails[(activeIdx - 1 + thumbnails.length) % thumbnails.length]);

  if (isLoadingProduct) {
    return (
      <main className="bg-[#f7f8fa] py-10 md:py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
        <p className="text-brand-gray font-medium">Loading product details...</p>
      </main>
    );
  }

  if (productError || !displayProduct) {
    return (
      <main className="bg-[#f7f8fa] py-10 md:py-20 text-center px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-3">Product Not Available</h2>
          <p className="text-brand-gray mb-8 leading-relaxed">
            {productError || "We couldn't find the product details you requested. It may have been removed or is temporarily unavailable."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('products')}
              className="bg-brand-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Explore Products
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="text-brand-blue font-semibold hover:underline"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f8fa] py-0 md:py-6 text-brand-dark font-sans">
      <div className="container max-w-[1200px] mx-auto md:px-4">

        {/* Breadcrumbs - desktop only */}
        <div className="text-sm text-brand-gray mb-5 flex-wrap items-center gap-2 select-none hidden md:flex">
          <span className="hover:text-brand-blue cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="hover:text-brand-blue cursor-pointer transition-colors" onClick={() => onNavigate('products')}>Clothings</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="hover:text-brand-blue cursor-pointer transition-colors" onClick={() => onNavigate('products')}>Men's wear</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-brand-gray font-medium">Summer clothing</span>
        </div>

        {/* ====== MOBILE PRODUCT VIEW ====== */}
        <div className="md:hidden">
          <div className="bg-white pb-5 border-b border-gray-200">
            {/* Mobile header: back + cart + user */}
            <div className="flex items-center justify-between py-3 px-4 mb-2">
              <button onClick={() => onNavigate('products')} className="text-brand-dark p-1 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingCart
                    size={20}
                    className="text-brand-dark cursor-pointer"
                    onClick={() => onNavigate('cart')}
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
                <User size={20} className="text-brand-dark cursor-pointer hover:text-brand-blue" onClick={() => onNavigate('login')} />
              </div>
            </div>

            <div className="relative mb-4">
              <div className="h-[300px] flex items-center justify-center p-4 overflow-hidden select-none">
                <img src={activeImage || displayProduct.imageUrl} alt={displayProduct.title} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="absolute bottom-4 right-4 bg-black/30 rounded-full px-2.5 py-1.5 flex items-center gap-4 shadow-sm z-10 backdrop-blur-sm">
                <ArrowLeft size={16} className="text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
                <ArrowRight size={16} className="text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); goNext(); }} />
              </div>
            </div>

            <div className="px-4">
              {/* Rating row */}
              <div className="flex items-center gap-3 text-xs select-none mb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < 4 ? 'text-[#ff9017] fill-[#ff9017]' : 'text-gray-300'} />)}
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1 text-brand-gray"><MessageSquare size={12} /> 32 reviews</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1 text-brand-gray"><ShoppingBag size={12} /> 154 sold</span>
              </div>

              {/* Product title */}
              <h1 className="text-base font-bold text-brand-dark mb-1">{displayProduct.title}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[#eb001b] font-bold text-xl">${formatPrice(displayProduct.price)}</span>
                <span className="text-xs text-brand-gray">(50-100 pcs)</span>
              </div>

              {/* Add to Cart + heart */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    addToCart(displayProduct, quantity);
                    alert('Added to cart!');
                  }}
                  className="flex-1 bg-brand-blue hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-sm cursor-pointer transition-colors"
                >
                  Add to Cart
                </button>
                <button className="w-12 h-12 border border-brand-blue rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors bg-white">
                  <Heart size={20} className="text-brand-blue" />
                </button>
              </div>

              {/* Attributes */}
              <div className="flex flex-col gap-2.5 text-sm mb-4">
                {[{ k: 'Condition', v: 'Brand new' }, { k: 'Category', v: displayProduct.category || 'Marketplace item' }, { k: 'Warranty', v: displayProduct?.warranty }, { k: 'Stock', v: displayProduct.stockQuantity }].map((a, i) => (
                  <div key={i} className="flex"><span className="w-24 flex-shrink-0 text-brand-gray">{a.k}</span><span className="text-brand-dark">{a.v}</span></div>
                ))}
              </div>

              {/* Description */}
              <div className="text-sm text-brand-gray leading-relaxed mb-2">
                {displayProduct.description}
              </div>
              <span className="text-brand-blue font-semibold text-sm cursor-pointer block">Read more</span>
            </div>
          </div>

          {/* Mobile Supplier Card (combining info and badges) */}
          <div className="border border-gray-200 rounded-lg mx-4 mt-4 mb-6 bg-white overflow-hidden">
            {/* Info */}
            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-11 h-11 bg-[#c5f2f2] text-[#4ca2a2] rounded-md font-bold text-xl flex items-center justify-center flex-shrink-0">R</div>
              <div className="flex-1">
                <span className="block text-[11px] text-brand-gray">Supplier</span>
                <span className="text-sm font-semibold text-brand-dark">{displayProduct.supplier?.companyName || 'Supplier'}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>

            {/* Divider line */}
            <hr className="border-gray-200 mx-4" />

            {/* Badges */}
            <div className="px-4 py-3.5 flex flex-wrap items-center gap-4 text-xs text-brand-gray select-none bg-white">
              <span className="flex items-center gap-1"><img src={`https://flagcdn.com/w20/${(displayProduct.supplier?.country || 'de').toLowerCase()}.png`} alt={displayProduct.supplier?.country || 'DE'} className="w-5" /> {displayProduct.supplier?.city || 'Supplier region'}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-gray-400" /> {displayProduct.supplier?.isVerified ? 'Verified' : 'Supplier'}</span>
              <span className="flex items-center gap-1"><Globe size={14} className="text-gray-400" /> {displayProduct.supplier?.worldwideShipping ? 'Worldwide shipping' : 'Shipping'}</span>
            </div>
          </div>

          {/* Similar products */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-brand-dark mb-3 px-1">Similar products</h2>
            <div className="flex overflow-x-auto no-scrollbar gap-3 px-1 pb-2">
              {relatedProducts.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-md p-3 flex-shrink-0 w-[150px] cursor-pointer" onClick={() => onNavigate('product-details', { productId: p.id })}>
                  <img src={p.img} alt={p.title} className="w-full h-24 object-contain mb-2" />
                  <p className="font-bold text-sm mb-0.5">{p.price}</p>
                  <p className="text-brand-gray text-xs line-clamp-2">{p.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ====== DESKTOP PRODUCT INFO BLOCK ====== */}
        <div className="bg-white border border-gray-200 rounded-md p-6 mb-6 shadow-sm hidden md:block">
          <div className="grid grid-cols-12 gap-8">

            {/* Left Column: Image Gallery (Span 5) */}
            <div className="col-span-12 md:col-span-5 flex flex-col">
              {/* Big active preview */}
              <div className="h-[250px] md:h-[380px] w-full border border-gray-200 rounded-md flex items-center justify-center p-4 bg-white relative overflow-hidden select-none">
                <img
                  src={activeImage || displayProduct.imageUrl}
                  alt="Active product view"
                  className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                />
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-6 gap-2 mt-3 select-none">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(thumb)}
                    className={`h-[56px] border rounded-md flex items-center justify-center p-1 cursor-pointer bg-white transition-all overflow-hidden ${activeImage === thumb ? 'border-brand-blue border-2 shadow-sm' : 'border-gray-200 hover:border-brand-blue'
                      }`}
                  >
                    <img src={thumb} alt={`Thumbnail ${idx}`} className="max-h-full max-w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column: Details (Span 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col">
              {/* Stock status */}
              <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm mb-2 select-none">
                <Check size={16} />
                <span>In stock</span>
              </div>

              {/* Product Title */}
              <h1 className="text-lg md:text-xl font-bold leading-tight text-brand-dark mb-3">
                {displayProduct.title}
              </h1>

              {/* Reviews & Orders */}
              <div className="flex items-center gap-4 text-xs select-none mb-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      size={14}
                      className={sIdx < 4 ? 'text-[#ff9017] fill-[#ff9017]' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-[#ff9017] font-bold ml-1.5">{displayProduct.rating.toFixed(1)}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <div className="flex items-center gap-1.5 text-brand-gray">
                  <MessageSquare size={13} />
                  <span>{displayProduct.ratingCount} reviews</span>
                </div>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <div className="flex items-center gap-1.5 text-brand-gray">
                  <ShoppingBag size={13} />
                  <span>{displayProduct.totalOrders} sold</span>
                </div>
              </div>

              {/* Pricing peach container */}
              <div className="bg-[#fff0df] rounded-md p-4 flex justify-between select-none mb-5">
                <div className="flex-1">
                  <span className="block text-[#eb001b] font-bold text-lg leading-tight">${formatPrice(displayProduct.price)}</span>
                  <span className="text-[11px] text-brand-gray mt-1 block">50-100 pcs</span>
                </div>
                <div className="w-px bg-gray-200 self-stretch mx-3"></div>
                <div className="flex-1">
                  <span className="block text-brand-dark font-bold text-base leading-tight">${formatPrice(displayProduct.price * 0.92)}</span>
                  <span className="text-[11px] text-brand-gray mt-1 block">100-700 pcs</span>
                </div>
                <div className="w-px bg-gray-200 self-stretch mx-3"></div>
                <div className="flex-1">
                  <span className="block text-brand-dark font-bold text-base leading-tight">${formatPrice(displayProduct.price * 0.82)}</span>
                  <span className="text-[11px] text-brand-gray mt-1 block">700+ pcs</span>
                </div>
              </div>

              {/* Attributes table */}
              <div className="flex flex-col text-sm text-brand-dark select-none mt-1">
                <hr className="border-gray-200 mb-3" />

                <div className="flex items-baseline">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Price:</span>
                  <span className="text-brand-dark">{displayProduct?.isNegotiable ? 'Negotiable' : 'Fixed price'}</span>
                </div>

                <hr className="border-gray-200 my-3" />

                <div className="flex items-baseline">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Type:</span>
                  <span className="text-brand-dark">{displayProduct.category || 'Marketplace item'}</span>
                </div>
                <div className="flex items-baseline mt-3">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Material:</span>
                  <span className="text-brand-dark">{specs[0]?.value || 'See specifications'}</span>
                </div>
                <div className="flex items-baseline mt-3">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Design:</span>
                  <span className="text-brand-dark">Modern nice</span>
                </div>

                <hr className="border-gray-200 my-3" />

                <div className="flex items-baseline">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Customization:</span>
                  <span className="text-brand-dark max-w-[200px] leading-snug">Customized logo and design custom packages</span>
                </div>
                <div className="flex items-baseline mt-3">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Protection:</span>
                  <span className="text-brand-dark">Refund Policy</span>
                </div>
                <div className="flex items-baseline mt-3">
                  <span className="w-32 flex-shrink-0 text-brand-gray">Warranty:</span>
                  <span className="text-brand-dark">{displayProduct?.warranty}</span>
                </div>

                <hr className="border-gray-200 mt-3" />
              </div>
            </div>

            {/* Right Column: Supplier Info Card & Main Action Buttons (Span 3) */}
            <div className="col-span-12 md:col-span-3 flex flex-col gap-4 select-none">

              {/* Supplier Info box */}
              <div className="border border-gray-200 rounded-md p-4 flex flex-col gap-4 bg-white shadow-sm">
                {/* Header row */}
                <div className="flex gap-3 items-center">
                  <div className="w-11 h-11 bg-[#c5f2f2] text-[#4ca2a2] rounded-md font-bold text-xl flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <span className="block text-[11px] text-brand-gray">Supplier</span>
                    <span className="text-sm font-semibold text-brand-dark">{displayProduct.supplier?.companyName || 'Supplier'}</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Contact properties */}
                <div className="flex flex-col gap-2.5 text-xs text-brand-gray">
                  <div className="flex items-center gap-2">
                    <img src={`https://flagcdn.com/w20/${(displayProduct.supplier?.country || 'de').toLowerCase()}.png`} alt={displayProduct.supplier?.country || 'DE'} className="w-5 h-auto object-cover rounded-sm" />
                    <span>{displayProduct.supplier?.country || 'DE'}, {displayProduct.supplier?.city || 'Berlin'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#a5b2c7]" />
                    <span>{displayProduct.supplier?.isVerified ? 'Verified Seller' : 'Seller'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-[#a5b2c7]" />
                    <span>{displayProduct.supplier?.worldwideShipping ? 'Worldwide shipping' : 'Shipping available'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 hover:bg-gray-100 border-r border-gray-300"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-1 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="px-3 py-1 hover:bg-gray-100 border-l border-gray-300"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Primary Button Options */}
                <button
                  onClick={() => {
                    addToCart(displayProduct, quantity);
                    alert('Added to cart!');
                  }}
                  className="bg-brand-blue hover:bg-blue-700 text-white rounded-md py-2.5 font-semibold text-sm shadow-sm transition-colors text-center cursor-pointer"
                >
                  Add to Cart
                </button>
                <button className="border border-gray-300 hover:border-brand-blue text-brand-blue rounded-md py-2.5 font-semibold text-sm shadow-sm transition-colors text-center cursor-pointer bg-white">
                  Seller's profile
                </button>
              </div>

              {/* Heart save */}
              <div className="flex items-center justify-center gap-2 text-brand-blue font-bold text-sm hover:underline cursor-pointer py-1.5 transition-colors">
                <Heart size={16} />
                <span>Save for later</span>
              </div>
            </div>

          </div>
        </div>

        {/* Details Bottom Block: Description + Recommended (Sidebar) - desktop only */}
        <div className="hidden md:grid grid-cols-12 gap-6 mb-6">

          {/* Main Description Column (Span 9) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col bg-white border border-gray-200 rounded-md p-6 shadow-sm">
            {/* Tabs Bar */}
            <div className="flex border-b border-gray-200 mb-6 select-none overflow-x-auto no-scrollbar">
              {['description', 'reviews', 'shipping', 'about seller'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 md:px-5 py-3 text-xs md:text-sm font-semibold capitalize transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === tab
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-brand-gray hover:text-brand-dark'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Description Tab Body */}
            {activeTab === 'description' && (
              <div className="flex flex-col gap-6">
                <div className="text-brand-gray text-sm leading-relaxed flex flex-col gap-4">
                  <p>
                    {displayProduct.description}
                  </p>
                  <p>
                    This listing is loaded from the product catalog and includes live pricing, stock, supplier, warranty, and specification information where available.
                  </p>
                </div>

                {/* Specs Table */}
                <div className="max-w-[560px] border border-gray-200 rounded-md overflow-hidden text-sm">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex border-b border-gray-200 last:border-0">
                      <div className="w-[180px] bg-gray-50 text-brand-gray p-3 font-medium border-r border-gray-200 select-none">
                        {spec.name}
                      </div>
                      <div className="flex-1 p-3 text-brand-dark font-medium">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bullets List */}
                <div className="flex flex-col gap-2.5 text-sm text-brand-gray">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Check size={16} className="text-gray-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other tabs placeholders */}
            {activeTab !== 'description' && (
              <div className="text-brand-gray text-sm py-8 text-center italic select-none">
                Additional information about {activeTab} will be pulled dynamically from database.
              </div>
            )}
          </div>

          {/* Right Sidebar: "You may like" (Span 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col bg-white border border-gray-200 rounded-md p-4 shadow-sm h-fit">
            <h3 className="font-bold text-base text-brand-dark mb-4 select-none">
              You may like
            </h3>
            <div className="flex flex-col gap-4">
              {youMayLike.map((item) => (
                <div key={item.id} className="flex gap-3 items-center group cursor-pointer" onClick={() => onNavigate('product-details', { productId: item.id })}>
                  {/* Thumbnail box */}
                  <div className="w-[80px] h-[80px] border border-gray-100 rounded-md flex items-center justify-center p-1.5 flex-shrink-0 bg-white overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 `}
                    />
                  </div>
                  {/* Info details */}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-brand-dark line-clamp-2 leading-tight group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs text-brand-gray mt-1 block font-medium">
                      {item.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, 1);
                        alert('Added to cart!');
                      }}
                      className="mt-2 text-brand-blue text-[10px] font-bold border border-brand-blue px-2 py-0.5 rounded hover:bg-brand-blue hover:text-white transition-all uppercase"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Related Products Grid Block - desktop only */}
        <div className="bg-white border border-gray-200 rounded-md p-6 mb-6 shadow-sm hidden md:block">
          <h2 className="font-bold text-lg text-brand-dark mb-5 select-none">
            Related products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col group cursor-pointer select-none"
                onClick={() => onNavigate('product-details', { productId: p.id })}
              >
                {/* Image wrapper */}
                <div className="h-[140px] border border-gray-100 rounded-md flex items-center justify-center p-3 mb-3 bg-white overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className={`max-h-[90%] max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-110 `}
                  />
                </div>
                {/* Details */}
                <h4 className="text-sm text-brand-gray group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                  {p.title}
                </h4>
                <span className="text-sm font-semibold text-brand-gray mt-1">
                  {p.price}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p, 1);
                    alert('Added to cart!');
                  }}
                  className="mt-3 bg-white border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all text-[11px] font-bold py-1 px-2 rounded w-fit uppercase"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vibrant Blue Promo Banner */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-md p-5 md:p-7 text-white flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 shadow-md relative overflow-hidden select-none hidden md:flex">
          <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-white opacity-[0.03] transform skew-x-12"></div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">Super discount on more than 100 USD</h2>
            <p className="text-white opacity-85 text-sm mt-1.5">Have you ever finally just write dummy info</p>
          </div>
          <button className="bg-[#ff9017] hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-md transition-colors shadow-md flex-shrink-0 cursor-pointer">Shop now</button>
        </div>

      </div>
    </main>
  );
};

export default ProductDetails;
