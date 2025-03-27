🚀 Project Overview:

 Deployment link 👇
 https://billing-and-stock-management-system.vercel.app/
 
🎨 Frontend
Built with React ⚛️ (Functional Components & Hooks)

State Management using useState & useEffect

Modern UI with:

🎭 Framer Motion for animations

📱 Responsive design for all screen sizes

🔄 Scrollable modals for mobile compatibility

⚙️ Backend Integration
🛢 Supabase for database operations

🔄 Real-time data sync

📊 Custom SQL functions for inventory management

📄 PDF Generation
🖨 jsPDF for professional invoices

📑 jspdf-autotable for well-formatted tables

🧾 Automatic tax calculations

🔗 QR Code Payments
🏦 UPI QR Code generation (qrcode.react)

💰 Pre-filled payment amount

🆔 UPI ID: sabarivasan1239@okhdfcbank

⚠️ Error Handling
🛡 Robust error handling for database operations

🛠 Graceful fallbacks for missing columns

🔔 User-friendly error messages

🗄 Database Schema
📦 Products Table
Column	Type
id	Primary Key
name	String
price	Number
quantity	Number
category	String
created_at	Timestamp
💳 Transactions Table
Column	Type
id	Primary Key
customer_name	String
customer_phone	String
total_amount	Number
payment_method	String (Optional)
items	JSON Array (Purchased Items)
created_at	Timestamp
