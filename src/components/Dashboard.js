import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const navItemVariants = {
    hover: { scale: 1.02, backgroundColor: 'rgba(74, 85, 104, 0.5)' },
    tap: { scale: 0.98 }
  };

  const logoutButtonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, backgroundColor: '#c53030' },
    tap: { scale: 0.95 }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          width: '16rem',
          height: '100%',
          background: 'linear-gradient(to bottom, #1a202c, #2d3748)',
          color: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ padding: '1.5rem', paddingBottom: '0.5rem' }}>
          <motion.h2 
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              lineHeight: '1.75rem'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Billing and Stock Management
          </motion.h2>
          <motion.p 
            style={{
              fontSize: '0.875rem',
              color: '#a0aec0',
              marginTop: '0.25rem'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Admin Panel
          </motion.p>
        </div>
        
        <nav style={{
  flex: 1,
  padding: '0 1rem',
  paddingTop: '1.5rem',
  paddingBottom: '1.5rem',
  overflowY: 'auto'
}}>
  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <motion.li
      whileHover="hover"
      whileTap="tap"
      variants={navItemVariants}
      style={{ listStyle: 'none' }}
    >
      <Link
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          color: 'white',
          textDecoration: 'none',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ marginRight: '0.75rem', fontSize: '1.125rem' }}>📦</span>
        <span>Products</span>
      </Link>
    </motion.li>

    <motion.li
      whileHover="hover"
      whileTap="tap"
      variants={navItemVariants}
      style={{ listStyle: 'none' }}
    >
      <Link
        to="/dashboard/billing"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          color: 'white',
          textDecoration: 'none',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ marginRight: '0.75rem', fontSize: '1.125rem' }}>🧾</span>
        <span>Billing</span>
      </Link>
    </motion.li>

    <motion.li
      whileHover="hover"
      whileTap="tap"
      variants={navItemVariants}
      style={{ listStyle: 'none' }}
    >
      <Link
        to="/dashboard/reports"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          color: 'white',
          textDecoration: 'none',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ marginRight: '0.75rem', fontSize: '1.125rem' }}>📊</span>
        <span>Reports</span>
      </Link>
    </motion.li>
  </ul>
</nav>
        
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #4a5568'
        }}>
          <motion.button
            onClick={handleLogout}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={logoutButtonVariants}
            onMouseEnter={() => setIsHoveringLogout(true)}
            onMouseLeave={() => setIsHoveringLogout(false)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: '#e53e3e',
              color: 'white',
              borderRadius: '0.375rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, transform 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <AnimatePresence mode="wait">
              {isHoveringLogout ? (
                <motion.span
                  key="logout-text"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  Logout <span style={{ marginLeft: '0.5rem' }}>👋</span>
                </motion.span>
              ) : (
                <motion.span
                  key="default-text"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s',
        marginLeft: isSidebarOpen ? '16rem' : 0
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem'
          }}>
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Toggle sidebar"
            >
              <svg 
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: '#4a5568'
                }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{ position: 'relative' }}
              >
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600
                  }}>
                    A
                  </div>
                  <span style={{ fontWeight: 500 }}>Admin</span>
                </button>
              </motion.div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '1.5rem'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              padding: '1.5rem',
              height: '100%'
            }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;