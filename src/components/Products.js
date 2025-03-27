import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity),
          category: newProduct.category || 'General'
        }]);

      if (error) throw error;
      
      setNewProduct({ name: '', price: '', quantity: '', category: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error.message);
    }
  };

  const updateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity),
          category: newProduct.category || 'General'
        })
        .eq('id', editingId);

      if (error) throw error;
      
      setNewProduct({ name: '', price: '', quantity: '', category: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error.message);
    }
  };

  const editProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category
    });
    setEditingId(product.id);
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error.message);
    }
  };

  return (
    <div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '1.5rem'
      }}>
        Product Management
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#4a5568'
        }}>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
              placeholder="Enter price"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
              placeholder="Enter quantity"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              Category
            </label>
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
              placeholder="Enter category"
            />
          </div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={editingId ? updateProduct : addProduct}
            style={{
              backgroundColor: editingId ? '#f6ad55' : '#68d391',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {editingId ? 'Update Product' : 'Add Product'}
          </motion.button>
          
          {editingId && (
            <button
              onClick={() => {
                setNewProduct({ name: '', price: '', quantity: '', category: '' });
                setEditingId(null);
              }}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#4a5568'
          }}>
            Product List
          </h2>
          
          <input
            type="text"
            placeholder="Search products..."
            style={{
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.25rem',
              width: '250px'
            }}
          />
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>ID</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Price</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Quantity</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      '&:hover': { backgroundColor: '#f7fafc' }
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>{product.id}</td>
                    <td style={{ padding: '0.75rem' }}>{product.name}</td>
                    <td style={{ padding: '0.75rem' }}>{product.category}</td>
                    <td style={{ padding: '0.75rem' }}>₹{product.price.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>{product.quantity}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => editProduct(product)}
                        style={{
                          backgroundColor: '#f6e05e',
                          color: '#744210',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        style={{
                          backgroundColor: '#fc8181',
                          color: '#742a2a',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;