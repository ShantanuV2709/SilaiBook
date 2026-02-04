<div align="center">

  <img src="frontend/public/logo.png" alt="SilaiBook Logo" width="200" />

  # SilaiBook
  
  **The Ultimate Digital Munshi for Modern Tailoring Businesses**
  


  <p align="center">
    <b>Streamline your tailoring shop with order tracking, customer management, inventory control, and automated financial insights.</b>
  </p>
</div>

  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

> Want to see how everything works? Check out the [Visual Project Workflow](project_workflow.md) with interactive architecture diagrams and data flow visualizations.

---


---

## 🚀 Overview

**SilaiBook** is a comprehensive shop management solution designed specifically for tailoring businesses. It replaces traditional paper registers ("Munshi") with a sleek, modern digital dashboard. Whether you are running a boutique or a large production unit, SilaiBook helps you stay organized, track payments, and manage deliverables with ease.

## ✨ Key Features

### 👔 Order Management
- **Visual Order Tracking:** Kanban-style or list view for orders.
- **Status Workflow:** Track orders from `Received` → `Cutting` → `Stitching` → `Ready` → `Delivered`.
- **Measurements:** Store detailed measurements for every customer.

### 👥 Customer CRM
- **Digital Profiles:** Save customer contact details and measurement history.
- **Order History:** View all past orders and payments for a specific client.

### 💰 Financial Tracking
- **Payment Recording:** Track advances, partial payments, and settlements.
- **Expense Manager:** Record shop expenses (Rent, Electricity, Salaries, etc.).
- **Profit & Loss:** Real-time dashboard with daily and monthly financial summaries.

### 🧵 Inventory & Stock
- **Cloth Stock:** Track fabric usage and remaining meters.
- **Low Stock Alerts:** Automatic warnings when fabric stock is running low.

### 🤝 Employee & Partner Management
- **Employee Ledger:** Track salaries, daily wages, and advances.
- **Partner Withdrawals:** Manage owner shares and drawings effortlessly.

### 📱 Modern & Responsive UI
- **Dark Mode:** Fully supported system-wide dark mode.
- **Mobile First:** Optimized layout for mobile devices with a vertical dock navigation.
- **WhatsApp Integration:** Pre-configured templates for sending order updates and payment reminders.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts (Analytics), Framer Motion (Animations)
- **Backend:** Python, FastAPI, Pydantic
- **Database:** MongoDB (via Motor/Beanie ODM)
- **State Management:** React Context API

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/ShantanuV2709/SilaiBook.git
cd SilaiBook
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```
The backend API will run at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder:
```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📁 Project Structure

```
SilaiBook/
├── backend/            # FastAPI Backend
│   ├── app/
│   │   ├── models/     # Database Models (Orders, Customers, etc.)
│   │   ├── routers/    # API Endpoints
│   │   └── main.py     # App Entry Point
│   └── scripts/        # Utility scripts (Stock fix, Data clear)
│
├── frontend/           # React Frontend
│   ├── public/         # Static assets (Logos)
│   ├── src/
│   │   ├── api/        # API Service calls
│   │   ├── components/ # Reusable UI Components
│   │   ├── context/    # Theme & State Context
│   │   ├── pages/      # Application Pages (Dashboard, Orders, etc.)
│   │   └── layouts/    # App Layouts (Sidebar, Dock)
│   └── index.css       # Global Styles & Tailwind Directives
│
└── README.md           # Project Documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <small>&copy; 2026 SilaiBook. Crafted with ❤️ for Tailors.</small>
</div>
