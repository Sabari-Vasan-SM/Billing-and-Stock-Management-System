Billing System for Velavan Super Stores
 
 Deployment link 👇
 https://billing-and-stock-management-system.vercel.app/
 
Frontend:

Built with React using functional components and hooks

State management using React's useState and useEffect

Modern UI with:

Framer Motion for animations

Responsive design for all screen sizes

Scrollable modals for mobile compatibility

Backend Integration

Supabase for database operations

Real-time data synchronization

Custom SQL functions for inventory management

PDF Generation

jsPDF library for creating professional invoices

jspdf-autotable for well-formatted product tables

Automatic tax calculations

QR Code Payments

Dynamic UPI QR code generation using qrcode.react

Pre-filled payment amount

Display of UPI ID (sabarivasan1239@okhdfcbank)

Error Handling

Robust error handling for database operations

Graceful fallbacks for missing database columns

User-friendly error messages  

Database Schema
The system uses two main tables:

Products Table

Copy
- id (primary key)
- name
- price
- quantity
- category
- created_at
Transactions Table

Copy
- id (primary key)
- customer_name
- customer_phone
- total_amount
- payment_method (optional)
- items (JSON array of purchased items)
- created_at
