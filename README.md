# 🚀 DHC-Ecommerce-Fullstack

A high-performance, real-time Fullstack E-commerce platform built with **ASP.NET Core 8 Web API** and **React**. This project features a robust administrative dashboard, real-time notifications, and a seamless shopping experience.

---

## 🌟 Key Features

### 🛡️ Core Infrastructure
- **Role-Based Authentication**: Secure JWT-based authentication for Admins and Customers.
- **Identity Membership**: Integrated ASP.NET Core Identity for user management and secure password hashing.
- **Auto-Seeding**: Automatic database seeding for roles, admin users, categories, and initial product catalog.

### 📊 Admin Dashboard (Real-Time)
- **Persistent Routing**: Deep linking for admin tabs (e.g., `/admin/products`) ensures the view is maintained after page refreshes.
- **Live Statistics**: Dynamic dashboard showing total sales, order counts, and user growth without page refreshes.
- **SignalR Integration**: Instant notifications for new orders and system activities.
- **Persistent Notification Center**: Database-driven management to track system alerts across sessions.
- **Standalone Inventory Management**: A premium, full-page product management system (Add/Edit/Delete) with high-quality image previews.

### 🛒 Customer Experience
- **Real-Time Order Tracking**: Customers receive instant UI updates (via SignalR) when their order status changes.
- **Smart Shopping Cart**: Persistent cart with coupon support and tax calculation.
- **Responsive Design**: Fully optimized for mobile and desktop using modern CSS and Tailwind.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: .NET 8 Web API
- **Database**: SQLite (Development) / SQL Server (Production Ready)
- **ORM**: Entity Framework Core (Code First)
- **Real-Time**: ASP.NET Core SignalR
- **Security**: JWT Bearer Token, ASP.NET Identity

### **Frontend**
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: Custom State-based Router with URL Persistence
- **Icons**: Lucide React
- **Notifications**: SweetAlert2, Persistent Notifications
- **Styling**: Vanilla CSS & Tailwind CSS

---

## 🚦 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- SQL Server

### Backend Setup
1. Navigate to the API folder:
   ```bash
   cd "App API/App API"
   ```
2. Update the connection string in `appsettings.json`.
3. Apply migrations and seed data:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the Design folder:
   ```bash
   cd "DHC-Ecommerce-Fullstack-Design"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots
*(Add your stunning screenshots here or use descriptive text)*

- **Admin Dashboard**: Real-time sales metrics and recent order feed.
- **Notification Dropdown**: Quick access to unread system alerts.
- **Product Workspace**: Premium full-page editor for the digital catalog.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the MIT License.
