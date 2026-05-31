import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Box, Eye } from 'lucide-react';
import { getProduct, getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import adminService from '../../services/adminService';
import authService from '../Auth/authService';
import Swal from 'sweetalert2';

import ProductForm from './ProductForm';

const AdminProducts = ({ onNavigate, routeAction, routeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingProduct, setEditingProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (routeAction === 'new') {
      setEditingProduct(null);
      setView('form');
      return;
    }

    if (routeAction === 'edit' && routeId) {
      const loadProduct = async () => {
        try {
          setFormLoading(true);
          const product = products.find(p => p.id === routeId) || await getProduct(routeId);
          setEditingProduct(product);
          setView('form');
        } catch (error) {
          console.error('Failed to load product for editing:', error);
          Swal.fire('Error', 'Product could not be loaded.', 'error');
          goToList();
        } finally {
          setFormLoading(false);
        }
      };

      loadProduct();
      return;
    }

    setEditingProduct(null);
    setView('list');
  }, [routeAction, routeId, products]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all products (no owner filtering)
      const params = { pageSize: 100 };

      const [prodData, suppData] = await Promise.all([
        getProducts(params),
        adminService.getSuppliers()
      ]);
      setProducts(prodData.items);
      setSuppliers(suppData);
    } catch (error) {
      console.error('Data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    onNavigate('admin', { adminTab: 'products', adminAction: 'edit', adminId: product.id });
  };

  const goToList = () => {
    onNavigate('admin', { adminTab: 'products' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: "This will permanently remove the item from catalog.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        Swal.fire('Deleted!', 'Product removed.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Deletion failed.', 'error');
      }
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        Swal.fire('Updated!', 'Product saved.', 'success');
      } else {
        await createProduct(payload);
        Swal.fire('Created!', 'Product added.', 'success');
      }
      goToList();
      fetchData();
    } catch (error) {
      console.error('Save failed:', error);
      throw error; // Re-throw to be handled by ProductForm
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    if (formLoading) {
      return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">Loading product...</div>;
    }

    return (
      <ProductForm
        editingProduct={editingProduct}
        suppliers={suppliers}
        onClose={goToList}
        onSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">View and update your product catalog</p>
        </div>
        <button
          onClick={() => onNavigate('admin', { adminTab: 'products', adminAction: 'new' })}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by title or category..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Inventory</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic font-medium">Loading catalog...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No products found.</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-brand-dark">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="max-w-[200px] sm:max-w-xs truncate font-bold text-gray-900">{p.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-brand-blue px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">${p.price.toFixed(2)}</div>
                    {p.oldPrice && <div className="text-[10px] text-red-500 line-through">${p.oldPrice.toFixed(2)}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-medium ${p.stockQuantity < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                      <Box size={14} />
                      {p.stockQuantity} in stock
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onNavigate('product-details', { productId: p.id })} className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                      <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
