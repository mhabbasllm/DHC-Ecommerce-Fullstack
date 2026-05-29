import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Tag, Box, DollarSign, Camera } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import adminService from '../../services/adminService';
import Swal from 'sweetalert2';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // For dropdowns
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    oldPrice: '',
    imageUrl: '',
    stockQuantity: '',
    categoryId: 1, // Default to Hygiene for now or fetch list
    supplierId: '',
    freeShipping: false,
    isNegotiable: false,
    warranty: '1 Year Warranty'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodData, suppData] = await Promise.all([
        getProducts({ pageSize: 100 }),
        adminService.getSuppliers()
      ]);
      setProducts(prodData.items);
      setSuppliers(suppData);
      if (suppData.length > 0) {
        setFormData(prev => ({ ...prev, supplierId: suppData[0].id }));
      }
    } catch (error) {
      console.error('Data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || '',
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
      categoryId: 1, // You might need to fetch the actual ID
      supplierId: suppliers.find(s => s.companyName === product.supplier?.companyName)?.id || suppliers[0]?.id || '',
      freeShipping: product.freeShipping,
      isNegotiable: product.isNegotiable,
      warranty: product.warranty
    });
    setShowModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        thumbnailUrls: [formData.imageUrl]
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        Swal.fire('Updated!', 'Product saved.', 'success');
      } else {
        await createProduct(payload);
        Swal.fire('Created!', 'Product added.', 'success');
      }
      setShowModal(false);
      fetchData(); // Refresh list to get accurate data
    } catch (error) {
      Swal.fire('Error', 'Save failed.', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">View and update your product catalog</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
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

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue h-32"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Current Price</label>
                      <input
                        type="number" step="0.01" required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Old Price (Optional)</label>
                      <input
                        type="number" step="0.01"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                        value={formData.oldPrice}
                        onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Supplier</label>
                    <select
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    >
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                      <input
                        type="number" required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.freeShipping} onChange={e => setFormData({ ...formData, freeShipping: e.target.checked })} className="rounded text-brand-blue" />
                      <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isNegotiable} onChange={e => setFormData({ ...formData, isNegotiable: e.target.checked })} className="rounded text-brand-blue" />
                      <span className="text-sm font-medium text-gray-700">Price Negotiable</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100 flex-shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
                  {editingProduct ? 'Save Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
