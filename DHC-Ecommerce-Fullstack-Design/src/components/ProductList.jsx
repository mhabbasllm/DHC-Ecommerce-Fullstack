import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Star,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  User
} from 'lucide-react';

import { getProducts } from '../services/productService';
import { useCart } from './CartContext';

const formatPrice = (price) => Number(price || 0).toFixed(2);

const ProductList = ({ onNavigate, initialSearchQuery = '' }) => {
  const { cartCount, addToCart } = useCart();
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [apiProducts, setApiProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState({
    Samsung: false,
    Apple: false,
    Pocco: false,
    Huawei: false,
    Lenovo: false,
  });
  const [selectedFeatures, setSelectedFeatures] = useState({
    Metallic: false,
    'Plastic cover': false,
    '8GB Ram': false,
    'Super power': false,
    'Large Memory': false,
  });
  const [selectedRatings, setSelectedRatings] = useState({
    '5 star': false,
    '4 star': false,
    '3 star': false,
    '2 star': false,
  });

  // Collapsible filter sections
  const [openSections, setOpenSections] = useState({
    category: true,
    brands: true,
    features: true,
    priceRange: true,
    condition: true,
    ratings: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Price range slider
  const PRICE_MIN = 0;
  const PRICE_MAX = 999999;
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);

  const handlePriceMinChange = (val) => {
    const v = Math.min(Number(val), priceMax - 1);
    setPriceMin(Math.max(PRICE_MIN, v));
  };

  const handlePriceMaxChange = (val) => {
    const v = Math.max(Number(val), priceMin + 1);
    setPriceMax(Math.min(PRICE_MAX, v));
  };

  const priceMinPercent = ((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const priceMaxPercent = ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductError('');
        const data = await getProducts({ page: 1, pageSize: 120 });

        if (!isMounted) return;
        setApiProducts(data.items);
        setTotalItems(data.totalItems);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load products:', error);
        setProductError('Showing local products while the API is unavailable.');
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const allFilteredProducts = useMemo(() => {
    let filtered = [...apiProducts];

    // Search Query Filter
    if (searchQuery && typeof searchQuery === 'string') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Brand Filter
    const activeBrands = Object.keys(selectedBrands).filter(b => selectedBrands[b]);
    if (activeBrands.length > 0) {
      filtered = filtered.filter(p => {
        const brandMatch = activeBrands.some(b =>
          p.title?.toLowerCase().includes(b.toLowerCase()) ||
          p.specifications?.some(s => s.value?.toLowerCase().includes(b.toLowerCase()))
        );
        return brandMatch;
      });
    }

    // Features Filter
    const activeFeatures = Object.keys(selectedFeatures).filter(f => selectedFeatures[f]);
    if (activeFeatures.length > 0) {
      filtered = filtered.filter(p => {
        const featMatch = activeFeatures.some(f =>
          p.title?.toLowerCase().includes(f.toLowerCase()) ||
          p.description?.toLowerCase().includes(f.toLowerCase()) ||
          p.specifications?.some(s => s.value?.toLowerCase().includes(f.toLowerCase()) || s.name?.toLowerCase().includes(f.toLowerCase()))
        );
        return featMatch;
      });
    }

    // Ratings Filter
    const minRating = Object.keys(selectedRatings)
      .filter(r => selectedRatings[r])
      .map(r => parseInt(r))
      .sort((a, b) => a - b)[0]; // Get the lowest selected rating as threshold

    if (minRating) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // Price Range Filter
    filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);

    // Verified Filter
    if (verifiedOnly) {
      filtered = filtered.filter(p => p.supplier?.isVerified);
    }

    return filtered.map((product) => ({
      ...product,
      img: product.imageUrl,
      price: formatPrice(product.price),
      oldPrice: product.oldPrice ? formatPrice(product.oldPrice) : '',
      ratingNum: product.rating.toFixed(1),
      orders: product.totalOrders,
      shipping: product.freeShipping ? 'Free Shipping' : 'Shipping calculated',
      desc: product.description,
    }));
  }, [apiProducts, searchQuery, selectedBrands, selectedFeatures, selectedRatings, priceMin, priceMax, verifiedOnly]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchQuery, selectedBrands, selectedFeatures, selectedRatings, priceMin, priceMax, verifiedOnly]);

  const products = useMemo(() => {
    const startIndex = (currentPageNumber - 1) * pageSize;
    return allFilteredProducts.slice(startIndex, startIndex + pageSize);
  }, [allFilteredProducts, currentPageNumber, pageSize]);

  const handleProductClick = (product) => {
    onNavigate('product-details', { productId: product.id });
  };

  // Dynamic filter state helpers
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));
  };

  const handleFeatureChange = (feat) => {
    setSelectedFeatures(prev => ({ ...prev, [feat]: !prev[feat] }));
  };

  const handleRatingChange = (rate) => {
    setSelectedRatings(prev => ({ ...prev, [rate]: !prev[rate] }));
  };

  const clearAllFilters = () => {
    setSelectedBrands({ Samsung: false, Apple: false, Pocco: false, Huawei: false, Lenovo: false });
    setSelectedFeatures({ Metallic: false, 'Plastic cover': false, '8GB Ram': false, 'Super power': false, 'Large Memory': false });
    setSelectedRatings({ '5 star': false, '4 star': false, '3 star': false, '2 star': false });
  };

  const activeFilters = [
    ...Object.keys(selectedBrands).filter(b => selectedBrands[b]),
    ...Object.keys(selectedFeatures).filter(f => selectedFeatures[f]),
    ...Object.keys(selectedRatings).filter(r => selectedRatings[r]),
  ];

  const removeFilter = (filter) => {
    if (selectedBrands.hasOwnProperty(filter)) {
      setSelectedBrands(prev => ({ ...prev, [filter]: false }));
    } else if (selectedFeatures.hasOwnProperty(filter)) {
      setSelectedFeatures(prev => ({ ...prev, [filter]: false }));
    } else if (selectedRatings.hasOwnProperty(filter)) {
      setSelectedRatings(prev => ({ ...prev, [filter]: false }));
    }
  };

  const youMayLike = products.slice(0, 5);

  return (
    <main className="bg-bg-main py-0 md:py-6 text-brand-dark">
      <div className="container">

        {/* ====== MOBILE PRODUCT LIST HEADER (visible < md) ====== */}
        <div className="md:hidden">
          {/* Top row: back arrow + title + cart + user */}
          <div className="flex items-center justify-between py-3 px-3">
            <button onClick={() => onNavigate('home')} className="text-brand-dark p-1 cursor-pointer">
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-base font-semibold text-brand-dark">Mobile accessory</h2>
            <div className="flex items-center gap-3">
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
              <User size={20} className="text-brand-dark cursor-pointer" />
            </div>
          </div>

          {/* Search bar */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden mb-3 mx-3 bg-white">
            <div className="pl-3 flex items-center text-gray-400"><Search size={16} /></div>
            <input
              type="text"
              className="flex-1 px-2 py-2 outline-none text-brand-dark text-sm bg-white"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 px-3 select-none">
            {['Tablets', 'Phones', 'Ipads', 'Ipod', 'Jacks', 'Cases', 'Cables'].map((cat, idx) => (
              <span key={idx} className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-md border cursor-pointer transition-colors flex-shrink-0 ${idx === 0 ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-dark border-gray-300'
                }`}>{cat}</span>
            ))}
          </div>

          {/* Sort + Filter + Grid/List toggle bar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 border-t border-b border-gray-200 bg-white select-none">
            <div className="flex items-center gap-1 text-xs font-medium text-brand-dark">
              <span>Sort: Newest</span>
              <ChevronDown size={14} />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-xs font-medium text-brand-dark cursor-pointer">
                <span>Filter ({activeFilters.length})</span>
                <SlidersHorizontal size={14} />
              </button>
              <div className="flex border border-gray-300 rounded overflow-hidden bg-white">
                <button onClick={() => setViewType('grid')} className={`p-1.5 ${viewType === 'grid' ? 'bg-[#e5f1ff] text-brand-blue' : 'text-gray-400'}`}><Grid size={16} /></button>
                <button onClick={() => setViewType('list')} className={`p-1.5 border-l border-gray-300 ${viewType === 'list' ? 'bg-[#e5f1ff] text-brand-blue' : 'text-gray-400'}`}><List size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* ====== DESKTOP BREADCRUMBS (hidden on mobile) ====== */}
        <div className="text-sm text-brand-gray mb-4 items-center gap-2 select-none hidden md:flex">
          <span className="hover:text-brand-blue cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-brand-blue cursor-pointer transition-colors">Clothings</span>
          <span>&gt;</span>
          <span className="hover:text-brand-blue cursor-pointer transition-colors">Men's wear</span>
          <span>&gt;</span>
          <span className="text-gray-400 font-medium">Summer clothing</span>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filter Panel (hidden on mobile) */}
          <aside className="w-[240px] flex-shrink-0 select-none hidden md:block">
            <div className="bg-transparent space-y-4">
              {/* Category Divider */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('category')}
                >
                  <span>Category</span>
                  {openSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.category && (
                  <ul className="space-y-2 text-sm text-brand-gray">
                    <li className="text-brand-dark font-semibold bg-[#e5f1ff] px-2 py-1.5 rounded-md cursor-pointer">Mobile accessory</li>
                    <li className="hover:text-brand-blue cursor-pointer px-2 py-1 transition-colors">Electronics</li>
                    <li className="hover:text-brand-blue cursor-pointer px-2 py-1 transition-colors">Smartphones</li>
                    <li className="hover:text-brand-blue cursor-pointer px-2 py-1 transition-colors">Modern tech</li>
                    <li className="text-brand-blue hover:underline cursor-pointer px-2 py-1">See all</li>
                  </ul>
                )}
              </div>

              {/* Brands Filter */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('brands')}
                >
                  <span>Brands</span>
                  {openSections.brands ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.brands && (
                  <div className="space-y-2.5">
                    {Object.keys(selectedBrands).map((brand) => (
                      <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={selectedBrands[brand]}
                          onChange={() => handleBrandChange(brand)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="group-hover:text-brand-blue transition-colors">{brand}</span>
                      </label>
                    ))}
                    <p className="text-brand-blue hover:underline cursor-pointer text-sm font-medium pt-1">See all</p>
                  </div>
                )}
              </div>

              {/* Features Filter */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('features')}
                >
                  <span>Features</span>
                  {openSections.features ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.features && (
                  <div className="space-y-2.5">
                    {Object.keys(selectedFeatures).map((feat) => (
                      <label key={feat} className="flex items-center gap-2.5 text-sm cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={selectedFeatures[feat]}
                          onChange={() => handleFeatureChange(feat)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="group-hover:text-brand-blue transition-colors">{feat}</span>
                      </label>
                    ))}
                    <p className="text-brand-blue hover:underline cursor-pointer text-sm font-medium pt-1">See all</p>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('priceRange')}
                >
                  <span>Price range</span>
                  {openSections.priceRange ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.priceRange && (
                  <div>
                    {/* Dual Range Slider */}
                    <div className="relative h-1 bg-gray-200 rounded-full my-6">
                      {/* Active track */}
                      <div
                        className="absolute h-full bg-brand-blue rounded-full"
                        style={{ left: `${priceMinPercent}%`, right: `${100 - priceMaxPercent}%` }}
                      ></div>
                      {/* Min thumb */}
                      <input
                        type="range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={priceMin}
                        onChange={(e) => handlePriceMinChange(e.target.value)}
                        className="price-range-input absolute w-full top-1/2 -translate-y-1/2 pointer-events-none appearance-none bg-transparent"
                        style={{ zIndex: priceMin > PRICE_MAX - 100 ? 5 : 3 }}
                      />
                      {/* Max thumb */}
                      <input
                        type="range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={priceMax}
                        onChange={(e) => handlePriceMaxChange(e.target.value)}
                        className="price-range-input absolute w-full top-1/2 -translate-y-1/2 pointer-events-none appearance-none bg-transparent"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <label className="text-xs text-brand-gray block mb-1">Min</label>
                        <input
                          type="number"
                          value={priceMin}
                          onChange={(e) => handlePriceMinChange(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md outline-none focus:border-brand-blue text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-brand-gray block mb-1">Max</label>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={(e) => handlePriceMaxChange(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md outline-none focus:border-brand-blue text-sm"
                        />
                      </div>
                    </div>
                    <button className="w-full py-1.5 border border-brand-blue text-brand-blue font-bold text-sm rounded-md hover:bg-brand-blue hover:text-white transition-all">
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Condition Filter */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('condition')}
                >
                  <span>Condition</span>
                  {openSections.condition ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.condition && (
                  <div className="space-y-2.5 text-sm text-brand-dark">
                    {['Any', 'Refurbished', 'Brand new', 'Old items'].map((cond, i) => (
                      <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="condition"
                          defaultChecked={i === 0}
                          className="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                        />
                        <span className="group-hover:text-brand-blue transition-colors">{cond}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratings Filter */}
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="flex justify-between items-center font-bold mb-3 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => toggleSection('ratings')}
                >
                  <span>Ratings</span>
                  {openSections.ratings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openSections.ratings && (
                  <div className="space-y-2.5">
                    {Object.keys(selectedRatings).map((rate, idx) => {
                      const starsCount = 5 - idx;
                      return (
                        <label key={rate} className="flex items-center gap-2.5 text-sm cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={selectedRatings[rate]}
                            onChange={() => handleRatingChange(rate)}
                            className="w-4.5 h-4.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                          />
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                size={14}
                                className={sIdx < starsCount ? 'text-[#ff9017] fill-[#ff9017]' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <div className="flex-1">
            {/* Top Action Filter Bar */}
            {/* Desktop top filter bar (hidden on mobile) */}
            <div className="hidden md:flex bg-white border border-gray-200 rounded-md px-5 py-3 flex-wrap items-center justify-between gap-3 mb-4 shadow-sm select-none">
              <div className="flex items-center gap-2 text-sm">
                <span>{allFilteredProducts.length} items in</span>
                <span className="font-bold">Mobile accessory</span>
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="group-hover:text-brand-blue transition-colors">Verified only</span>
                </label>
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none bg-white cursor-pointer hover:border-brand-blue transition-colors text-brand-dark font-medium">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Top Rated</option>
                </select>
                <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white">
                  <button onClick={() => setViewType('grid')} className={`p-2 transition-colors ${viewType === 'grid' ? 'bg-[#e5f1ff] text-brand-blue' : 'text-gray-400 hover:bg-gray-50'}`} title="Grid View"><Grid size={18} /></button>
                  <button onClick={() => setViewType('list')} className={`p-2 border-l border-gray-300 transition-colors ${viewType === 'list' ? 'bg-[#e5f1ff] text-brand-blue' : 'text-gray-400 hover:bg-gray-50'}`} title="List View"><List size={18} /></button>
                </div>
              </div>
            </div>

            {/* Active Filters / Tags */}
            {(isLoadingProducts || productError) && (
              <div className="mb-3 px-3 md:px-0 text-sm text-brand-gray">
                {isLoadingProducts ? 'Loading products...' : productError}
              </div>
            )}

            {/* Active Filters / Tags */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-3 select-none px-3 md:px-0">
                {activeFilters.map((filter) => (
                  <div
                    key={filter}
                    className="flex items-center gap-2 px-2.5 py-1 bg-white border border-brand-blue rounded-md text-[13px] md:text-sm text-[#505050] cursor-pointer"
                    onClick={() => removeFilter(filter)}
                  >
                    <span>{filter}</span>
                    <X size={14} className="text-[#8b96a5]" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Rendering Grid/List */}
            {viewType === 'list' ? (
              // List View Mode
              <div className="space-y-3 md:space-y-4 px-3 md:px-0">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white border border-gray-200 rounded-md flex overflow-hidden p-3 md:p-5 shadow-sm hover:shadow-md hover:border-brand-blue transition-all group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] flex-shrink-0 flex items-center justify-center md:border-r border-gray-100 md:pr-5 select-none overflow-hidden">
                      <img
                        src={product.img}
                        alt={product.title}
                        className={`product-list-img-${product.id} max-w-full max-h-full object-contain transition-transform duration-300`}
                      />
                    </div>
                    {/* Content Details */}
                    <div className="flex-1 pl-3 md:pl-6 flex flex-col justify-center relative">

                      {/* Favorite Badge - desktop only */}
                      <div className="absolute top-0 right-0 w-10 h-10 border border-gray-200 rounded-full items-center justify-center cursor-pointer hover:bg-red-50 hover:text-[#eb001b] hover:border-red-200 transition-colors shadow-sm bg-white hidden md:flex" onClick={(e) => e.stopPropagation()}>
                        <Heart size={18} className="text-brand-blue group-hover:scale-110 transition-transform" />
                      </div>

                      <h3 className="text-[15px] md:text-lg text-[#505050] md:font-semibold pr-0 md:pr-12 group-hover:text-brand-blue transition-colors leading-snug mb-1">
                        {product.title}
                      </h3>

                      {/* Price Details */}
                      <div className="flex items-baseline gap-2 mb-1 md:mb-2 select-none">
                        <span className="text-[16px] md:text-xl font-bold text-brand-dark">${product.price}</span>
                      </div>

                      {/* Rating & Orders */}
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-3.5 text-[13px] md:text-sm text-[#8b96a5] select-none mb-1.5 md:mb-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              size={13}
                              className={sIdx < Math.floor(product.rating) ? 'text-[#ff9017] fill-[#ff9017]' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-[#ff9017] ml-0.5">{product.ratingNum}</span>
                        <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-gray-300 rounded-full mx-1"></span>
                        <span>{product.orders} orders</span>
                      </div>

                      {/* Free Shipping label */}
                      <span className="text-[#00b517] text-[13px] md:text-sm">{product.shipping}</span>

                      {/* Description - desktop only */}
                      <p className="text-[#505050] text-sm leading-relaxed max-w-[620px] line-clamp-2 hidden md:block mt-2">
                        {product.desc}
                      </p>

                      <div className="flex items-center gap-4 mt-4 select-none">
                        <span className="text-brand-blue font-bold text-sm hover:underline cursor-pointer hidden md:inline" onClick={() => handleProductClick(product)}>
                          View details
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                            alert('Added to cart!');
                          }}
                          className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View Mode (Image 5 representation)
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5 px-2 md:px-0">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white border border-gray-200 rounded-md p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-blue transition-all group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="h-[180px] w-full flex items-center justify-center p-3 select-none mb-4 overflow-hidden">
                      <img
                        src={product.img}
                        alt={product.title}
                        className={`product-grid-img-${product.id} max-h-[85%] max-w-[85%] object-contain transition-transform duration-300`}
                      />
                    </div>
                    {/* Details */}
                    <div>
                      {/* Price Grid */}
                      <div className="flex items-baseline justify-between select-none mb-2 border-t border-gray-100 pt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-brand-dark">${product.price}</span>
                          {product.oldPrice && <span className="text-xs text-gray-400 line-through">${product.oldPrice}</span>}
                        </div>
                        <div className="flex gap-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                              alert('Added to cart!');
                            }}
                            className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-blue-50 text-brand-blue hover:border-brand-blue transition-colors shadow-sm bg-white"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={15} />
                          </div>
                          <div className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-red-50 hover:text-[#eb001b] hover:border-red-200 transition-colors shadow-sm bg-white">
                            <Heart size={15} className="text-brand-blue" />
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 text-xs select-none mb-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              size={12}
                              className={sIdx < Math.floor(product.rating) ? 'text-[#ff9017] fill-[#ff9017]' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-[#ff9017] font-bold">{product.ratingNum}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                        {product.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="hidden md:flex flex-wrap items-center justify-center md:justify-end gap-3 border-t border-gray-200 mt-8 pt-5 select-none">
              <div>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none bg-white cursor-pointer hover:border-brand-blue transition-colors text-brand-dark font-medium"
                >
                  <option value={10}>Show 10</option>
                  <option value={20}>Show 20</option>
                  <option value={50}>Show 50</option>
                </select>
              </div>
              <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white text-sm font-semibold shadow-sm">
                <button
                  disabled={currentPageNumber === 1}
                  onClick={() => setCurrentPageNumber(prev => Math.max(1, prev - 1))}
                  className="p-2.5 hover:bg-gray-50 border-r border-gray-300 text-brand-dark flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.ceil(allFilteredProducts.length / pageSize) }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPageNumber(idx + 1)}
                    className={`px-4 py-2 border-r border-gray-300 flex items-center justify-center transition-colors ${currentPageNumber === idx + 1 ? 'bg-[#e5f1ff] text-brand-blue' : 'hover:bg-gray-50 text-brand-dark'}`}
                  >
                    {idx + 1}
                  </button>
                )).slice(0, 5) /* Show max 5 pages for now */}
                <button
                  disabled={currentPageNumber === Math.ceil(allFilteredProducts.length / pageSize)}
                  onClick={() => setCurrentPageNumber(prev => Math.min(Math.ceil(allFilteredProducts.length / pageSize), prev + 1))}
                  className="p-2.5 hover:bg-gray-50 text-brand-dark flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ====== YOU MAY ALSO LIKE (all devices) ====== */}
        <div className="mt-6 mb-8">
          <h2 className="text-[18px] md:text-xl font-bold text-brand-dark mb-4 px-3 md:px-0">You may also like</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-2.5 md:gap-4 pb-3 px-3 md:px-0">
            {youMayLike.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 w-[140px] md:w-[200px]"
                onClick={() => handleProductClick(item)}
              >
                <div className="h-28 md:h-36 w-full flex items-center justify-center mb-3">
                  <img src={item.img} alt={item.title} className="max-w-full max-h-full object-contain" />
                </div>
                <p className="font-bold text-[15px] md:text-base text-[#1c1c1c] mb-0.5">${item.price}</p>
                <p className="text-[#8b96a5] text-[13px] md:text-sm truncate">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

export default ProductList;
