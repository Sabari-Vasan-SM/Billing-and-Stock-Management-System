import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = () => {
    return transactions.reduce((total, transaction) => total + transaction.total_amount, 0);
  };

  const calculateTotalItemsSold = () => {
    return transactions.reduce((total, transaction) => {
      return total + transaction.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  return (
    <div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '1.5rem'
      }}>
        Sales Reports
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
          Filters
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#4a5568',
              marginBottom: '0.25rem'
            }}>
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem'
              }}
            />
          </div>
          
          <div style={{ alignSelf: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchTransactions}
              style={{
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Apply
            </motion.button>
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '0.875rem',
            color: '#718096',
            marginBottom: '0.5rem'
          }}>
            Total Sales
          </h3>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2d3748'
          }}>
            ₹{calculateTotalSales().toFixed(2)}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '0.875rem',
            color: '#718096',
            marginBottom: '0.5rem'
          }}>
            Transactions
          </h3>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2d3748'
          }}>
            {transactions.length}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '0.875rem',
            color: '#718096',
            marginBottom: '0.5rem'
          }}>
            Items Sold
          </h3>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2d3748'
          }}>
            {calculateTotalItemsSold()}
          </p>
        </motion.div>
      </div>
      
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
          Transaction History
        </h2>
        
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
        ) : transactions.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            color: '#a0aec0'
          }}>
            No transactions found for the selected date range
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>ID</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Items</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      '&:hover': { backgroundColor: '#f7fafc' }
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>{transaction.id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(transaction.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{transaction.customer_name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {transaction.items.length} items
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      ₹{transaction.total_amount.toFixed(2)}
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

export default Reports;