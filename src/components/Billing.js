import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const billRef = useRef();

  // Shop details
  const shopDetails = {
    name: "Velavan Super Stores",
    address: "Salagapalayam, Kavindapadi",
    phone: "1234567890",
    gstin: "AGGH2131",
    upiId: "sabarivasan1239@okhdfcbank"
  };

  useEffect(() => {
    fetchProducts();
    ensurePaymentMethodColumnExists();
  }, []);

  const ensurePaymentMethodColumnExists = async () => {
    try {
      const { data: columns, error } = await supabase
        .rpc('get_columns', { table_name: 'transactions' });
      
      if (error) throw error;
      
      if (!columns.some(col => col.column_name === 'payment_method')) {
        const { error: alterError } = await supabase
          .rpc('add_payment_method_column');
        
        if (alterError) throw alterError;
      }
    } catch (error) {
      console.error('Error ensuring payment_method column exists:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const availableQuantity = product.quantity - (existingItem ? existingItem.quantity : 0);
    
    if (availableQuantity <= 0) {
      alert('Not enough stock available');
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = cart.find(item => item.id === productId);
    const currentInCart = cartItem ? cartItem.quantity : 0;
    const available = product.quantity - (currentInCart - (cartItem ? cartItem.quantity : 0));
    
    if (newQuantity > available) {
      alert(`Only ${available} items available in stock`);
      newQuantity = available;
    }
    
    setCart(cart.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Shop header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(shopDetails.name, 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(shopDetails.address, 105, 22, { align: 'center' });
    doc.text(`Phone: ${shopDetails.phone} | GSTIN: ${shopDetails.gstin}`, 105, 27, { align: 'center' });
    
    // Bill info
    doc.setFontSize(12);
    doc.text(`Bill No: ${Math.floor(Math.random() * 10000)}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 14, 45);
    if (customerPhone) doc.text(`Phone: ${customerPhone}`, 14, 50);
    
    // Bill items table
    autoTable(doc, {
      startY: 60,
      head: [['Item', 'Price', 'Qty', 'Total']],
      body: cart.map(item => [
        item.name,
        `₹${item.price.toFixed(2)}`,
        item.quantity,
        `₹${(item.price * item.quantity).toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 }
      }
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${calculateTotal().toFixed(2)}`, 140, finalY);
    doc.text(`Tax (5%): ₹${(calculateTotal() * 0.05).toFixed(2)}`, 140, finalY + 5);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ₹${(calculateTotal() * 1.05).toFixed(2)}`, 140, finalY + 12);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for your purchase!', 105, finalY + 25, { align: 'center' });
    doc.text('Please visit again', 105, finalY + 30, { align: 'center' });
    
    // Save the PDF
    doc.save(`bill_${Date.now()}.pdf`);
  };

  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  });

  const handleDownload = () => {
    generatePDF();
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      // First verify all products still have sufficient stock
      const verificationPromises = cart.map(async (item) => {
        const { data: product, error } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.id)
          .single();
        
        if (error) throw error;
        if (product.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${item.name}. Only ${product.quantity} available.`);
        }
        return true;
      });
      
      await Promise.all(verificationPromises);
      
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          customer_name: customerName || 'Walk-in Customer',
          customer_phone: customerPhone || '',
          total_amount: calculateTotal(),
          payment_method: paymentMethod,
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;
      
      // Update product quantities
      const updatePromises = cart.map(async (item) => {
        const { error } = await supabase.rpc('decrement_product_quantity', {
          product_id: item.id,
          amount: item.quantity
        });
        
        if (error) throw error;
      });
      
      await Promise.all(updatePromises);
      
      // Print/download bill
      handleDownload();
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('');
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error('Error completing sale:', error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '1.5rem'
      }}>
        Billing System
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Product Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#4a5568'
          }}>
            Products
          </h2>
          
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.25rem',
              marginBottom: '1rem'
            }}
          />
          
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {filteredProducts.map(product => {
                const cartItem = cart.find(item => item.id === product.id);
                const availableQuantity = product.quantity - (cartItem ? cartItem.quantity : 0);
                
                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => availableQuantity > 0 && addToCart(product)}
                    style={{
                      backgroundColor: availableQuantity > 0 ? '#f0fff4' : '#fff5f5',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      padding: '1rem',
                      cursor: availableQuantity > 0 ? 'pointer' : 'not-allowed',
                      opacity: availableQuantity > 0 ? 1 : 0.7
                    }}
                  >
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#2d3748'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#4a5568' }}>
                      ₹{product.price.toFixed(2)}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: availableQuantity > 0 ? '#38a169' : '#e53e3e'
                    }}>
                      {availableQuantity > 0 ? `${availableQuantity} available` : 'Out of stock'}
                    </p>
                    {cartItem && (
                      <p style={{ fontSize: '0.75rem', color: '#3182ce' }}>
                        {cartItem.quantity} in cart
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Cart and Customer Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#4a5568'
          }}>
            Cart
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#4a5568',
                marginBottom: '0.25rem'
              }}>
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.25rem'
                }}
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#4a5568',
                marginBottom: '0.25rem'
              }}>
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.25rem'
                }}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div style={{
            flex: 1,
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            overflowY: 'auto',
            minHeight: '200px'
          }}>
            {cart.length === 0 ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#a0aec0'
              }}>
                No items in cart
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.5rem' }}>{item.name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            style={{
                              backgroundColor: '#e2e8f0',
                              border: 'none',
                              width: '24px',
                              height: '24px',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            -
                          </button>
                          <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            style={{
                              backgroundColor: '#e2e8f0',
                              border: 'none',
                              width: '24px',
                              height: '24px',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            backgroundColor: '#fed7d7',
                            color: '#e53e3e',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontWeight: '600' }}>Subtotal:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600' }}>Tax (5%):</span>
              <span>₹{(calculateTotal() * 0.05).toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              <span>Total:</span>
              <span>₹{(calculateTotal() * 1.05).toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                style={{
                  flex: 1,
                  backgroundColor: cart.length === 0 ? '#cbd5e0' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Choose Payment
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={cart.length === 0}
                style={{
                  flex: 1,
                  backgroundColor: cart.length === 0 ? '#cbd5e0' : '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Download Bill (PDF)
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#2d3748',
              textAlign: 'center'
            }}>
              Payment Options
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: `2px solid ${paymentMethod === 'cash' ? '#4f46e5' : '#e2e8f0'}`,
                  backgroundColor: paymentMethod === 'cash' ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                💵 Cash Payment
              </button>
              
              <button
                onClick={() => setPaymentMethod('upi')}
                style={{
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: `2px solid ${paymentMethod === 'upi' ? '#4f46e5' : '#e2e8f0'}`,
                  backgroundColor: paymentMethod === 'upi' ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📱 UPI Payment
              </button>
            </div>
            
            {paymentMethod === 'upi' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.375rem',
                  border: '1px dashed #cbd5e1'
                }}>
                  <QRCode 
                    value={`upi://pay?pa=${shopDetails.upiId}&pn=${shopDetails.name}&am=${(calculateTotal() * 1.05).toFixed(2)}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p style={{ textAlign: 'center', color: '#64748b' }}>
                  Scan to pay via UPI
                </p>
                <p style={{
                  backgroundColor: '#f1f5f9',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace',
                  color: '#334155'
                }}>
                  {shopDetails.upiId}
                </p>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                  Amount: ₹{(calculateTotal() * 1.05).toFixed(2)}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (paymentMethod) {
                    completeSale();
                    setShowPaymentModal(false);
                  } else {
                    alert('Please select a payment method');
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Confirm Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hidden bill for printing */}
      <div style={{ display: 'none' }}>
        <div ref={billRef} style={{ 
          padding: '20px', 
          maxWidth: '500px', 
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif'
        }}>
          {/* Bill Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2d3748'
            }}>
              {shopDetails.name}
            </h1>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '14px',
              color: '#4a5568'
            }}>
              {shopDetails.address}
            </p>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '12px',
              color: '#718096'
            }}>
              Phone: {shopDetails.phone} | GSTIN: {shopDetails.gstin}
            </p>
          </div>
          
          {/* Bill Info */}
          <div style={{ 
            marginBottom: '20px', 
            borderBottom: '1px solid #e2e8f0', 
            paddingBottom: '10px'
          }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Bill No:</strong> {Math.floor(Math.random() * 10000)}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Customer:</strong> {customerName || 'Walk-in Customer'}
            </p>
            {customerPhone && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Phone:</strong> {customerPhone}
              </p>
            )}
          </div>
          
          {/* Bill Items */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#2d3748',
                color: 'white'
              }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white'
                }}>
                  <td style={{ padding: '8px' }}>{item.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Totals */}
          <div style={{ 
            textAlign: 'right', 
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '10px'
          }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Subtotal:</strong> ₹{calculateTotal().toFixed(2)}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Tax (5%):</strong> ₹{(calculateTotal() * 0.05).toFixed(2)}
            </p>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              <strong>Total:</strong> ₹{(calculateTotal() * 1.05).toFixed(2)}
            </p>
          </div>
          
          {/* Payment Method */}
          {paymentMethod && (
            <div style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8fafc',
              borderRadius: '0.375rem'
            }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Payment Method:</strong> {paymentMethod === 'cash' ? 'Cash' : 'UPI'}
              </p>
              {paymentMethod === 'upi' && (
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#64748b' }}>
                  UPI ID: {shopDetails.upiId}
                </p>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div style={{ 
            marginTop: '30px', 
            textAlign: 'center', 
            fontSize: '12px',
            color: '#718096'
          }}>
            <p>Thank you for your purchase!</p>
            <p>Please visit again</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;