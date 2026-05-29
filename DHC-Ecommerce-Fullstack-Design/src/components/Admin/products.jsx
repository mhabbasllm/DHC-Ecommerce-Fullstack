import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/productService';

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

const AdminProducts = () => {
  const [productsList, setProductsList] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductError('');
        const data = await getProducts({ page: 1, pageSize: 50 });

        if (!isMounted) return;

        if (data.items.length) {
          setProductsList(data.items.map((product) => ({
            id: product.id,
            name: product.title,
            price: formatPrice(product.price),
            stock: product.stockQuantity,
            category: product.category || 'Uncategorized',
          })));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load admin products:', error);
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

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };
  
  const handleDeleteProduct = (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      setProductsList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.get('name'),
      price: formData.get('price'),
      stock: formData.get('stock'),
      category: formData.get('category'),
    };
    
    if (editingProduct) {
      setProductsList(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProductsList(prev => [newProduct, ...prev]);
    }
    
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Product List Header */}
      <div className="flex justify-between items-center mb-6">
         <div>
           <h2 className="text-xl font-bold text-brand-dark">Products Management</h2>
           <p className="text-sm text-gray-500">{isLoadingProducts ? 'Loading products from API...' : productError || 'View, edit and add new products to your store.'}</p>
         </div>
         <button 
           onClick={() => { setEditingProduct(null); setIsProductFormOpen(true); }}
           className="bg-brand-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-bold text-sm transition-colors shadow-sm"
         >
           + Add Product
         </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {productsList.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-dark">{prod.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">{prod.category}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-dark">{prod.price}</td>
                  <td className="px-6 py-4 text-gray-500">{prod.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEditProduct(prod)} className="text-brand-blue hover:underline text-sm font-medium transition-colors cursor-pointer">Edit</button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:underline text-sm font-medium transition-colors cursor-pointer">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productsList.length === 0 && <div className="p-8 text-center text-gray-500">No products found. Add one above!</div>}
        </div>
      </div>

      {/* Product Modal Form */}
      {isProductFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-brand-dark mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Product Name</label>
                <input type="text" name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Blue T-Shirt" className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-brand-blue transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Category</label>
                <input type="text" name="category" defaultValue={editingProduct?.category} required placeholder="e.g. Clothing" className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-brand-blue transition-colors" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Price</label>
                  <input type="text" name="price" defaultValue={editingProduct?.price} required placeholder="$0.00" className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-brand-blue transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Stock Quantity</label>
                  <input type="number" name="stock" defaultValue={editingProduct?.stock} required min="0" placeholder="0" className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-brand-blue transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-gray-200">
                <button type="button" onClick={() => setIsProductFormOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
