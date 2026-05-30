import authService from '../components/Auth/authService';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api')
  .replace(/\/+$/, '')
  .replace(/\/Auth$/i, '');
const PRODUCT_URL = `${API_ROOT}/Product`;

const get = (value, pascalName, camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1)) =>
  value?.[camelName] ?? value?.[pascalName];

const normalizeSupplier = (supplier) => {
  if (!supplier) return null;

  return {
    companyName: get(supplier, 'CompanyName') || 'Supplier',
    country: get(supplier, 'Country') || '',
    city: get(supplier, 'City') || '',
    isVerified: Boolean(get(supplier, 'IsVerified')),
    worldwideShipping: Boolean(get(supplier, 'WorldwideShipping')),
  };
};

const normalizeCategory = (category) => {
  if (!category) return '';
  return typeof category === 'string' ? category : get(category, 'Name') || '';
};

const normalizeSpecs = (specifications) =>
  (specifications || []).map((spec) => ({
    name: get(spec, 'Name') || '',
    value: get(spec, 'Value') || '',
  }));

export const normalizeProduct = (product) => {
  if (!product) return null;

  return {
    id: get(product, 'Id'),
    title: get(product, 'Title') || 'Untitled product',
    description: get(product, 'Description') || '',
    price: Number(get(product, 'Price') ?? 0),
    oldPrice: get(product, 'OldPrice') == null ? null : Number(get(product, 'OldPrice')),
    imageUrl: get(product, 'ImageUrl') || '',
    thumbnailUrls: get(product, 'ThumbnailUrls') || [],
    rating: Number(get(product, 'Rating') ?? 0),
    ratingCount: Number(get(product, 'RatingCount') ?? 0),
    totalOrders: Number(get(product, 'TotalOrders') ?? 0),
    freeShipping: Boolean(get(product, 'FreeShipping')),
    stockQuantity: Number(get(product, 'StockQuantity') ?? 0),
    isNegotiable: Boolean(get(product, 'IsNegotiable')),
    warranty: get(product, 'Warranty') || 'No Warranty',
    category: normalizeCategory(get(product, 'Category')),
    supplier: normalizeSupplier(get(product, 'Supplier')),
    specifications: normalizeSpecs(get(product, 'Specifications')),
  };
};

const readJson = async (response) => {
  if (!response.ok) {
    throw new Error(`Product API request failed with status ${response.status}`);
  }

  return response.json();
};

export const getProducts = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const url = searchParams.toString() ? `${PRODUCT_URL}?${searchParams}` : PRODUCT_URL;
  const data = await fetch(url).then(readJson);
  const items = get(data, 'Items') || [];

  return {
    totalItems: Number(get(data, 'TotalItems') ?? items.length),
    page: Number(get(data, 'Page') ?? 1),
    pageSize: Number(get(data, 'PageSize') ?? items.length),
    totalPages: Number(get(data, 'TotalPages') ?? 1),
    items: items.map(normalizeProduct).filter(Boolean),
  };
};

export const getProduct = async (id) => {
  if (!id) return null;
  return fetch(`${PRODUCT_URL}/${id}`).then(readJson).then(normalizeProduct);
};

export const getHomepageSections = async () => {
  let data;

  try {
    data = await fetch(`${PRODUCT_URL}/homepage-sections`).then(readJson);
  } catch (error) {
    const catalog = await getProducts({ page: 1, pageSize: 60 });
    const byCategory = (names, take) => catalog.items
      .filter((product) => names.some((name) => product.category.toLowerCase().includes(name.toLowerCase())))
      .slice(0, take);

    return {
      dealsAndOffers: catalog.items
        .filter((product) => product.oldPrice && product.oldPrice > product.price)
        .slice(0, 5)
        .map((product) => ({
          id: product.id,
          discountPercent: Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100),
          endDate: null,
          product,
        })),
      homeAndOutdoor: byCategory(['home', 'outdoor', 'office'], 8),
      consumerElectronics: byCategory(['electronics', 'computer', 'tech', 'smart'], 8),
      recommendedItems: byCategory(['recommended', 'clothes', 'sports'], 10),
    };
  }

  const deals = get(data, 'DealsAndOffers') || [];

  return {
    dealsAndOffers: deals.map((deal) => ({
      id: get(deal, 'Id'),
      discountPercent: Number(get(deal, 'DiscountPercent') ?? 0),
      endDate: get(deal, 'EndDate'),
      product: normalizeProduct(get(deal, 'Product')),
    })),
    homeAndOutdoor: (get(data, 'HomeAndOutdoor') || []).map(normalizeProduct).filter(Boolean),
    consumerElectronics: (get(data, 'ConsumerElectronics') || []).map(normalizeProduct).filter(Boolean),
    recommendedItems: (get(data, 'RecommendedItems') || []).map(normalizeProduct).filter(Boolean),
  };
};

export const createProduct = async (productData) => {
  const response = await fetch(PRODUCT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getToken()}`
    },
    body: JSON.stringify(productData)
  });
  return readJson(response);
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${PRODUCT_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getToken()}`
    },
    body: JSON.stringify(productData)
  });
  return readJson(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${PRODUCT_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authService.getToken()}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete');
  return true;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_ROOT}/Upload`, {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header when using FormData, browser will do it with boundary
  });

  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
};
