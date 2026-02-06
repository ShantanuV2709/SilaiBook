import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import ClothStock from "./pages/ClothStock";
import ClothUsage from "./pages/ClothUsage";
import Payments from "./pages/Payments";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Expenses from "./pages/Expenses";
import StockManagement from "./pages/StockManagement";
import Owners from "./pages/Owners";
import Settings from "./pages/Settings";
import Invoice from "./pages/Invoice";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import { ThemeProvider } from "./context/ThemeContext";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTE */}
          <Route path="/" element={<Login />} />

          {/* PROTECTED + LAYOUT ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/cloth-stock" element={<ClothStock />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/cloth-usage" element={<ClothUsage />} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invoice/:id" element={<Invoice />} />
          </Route>

        </Routes>
      </BrowserRouter>
      {/* Persistent Chat Widget */}
      <ChatWidget />
    </ThemeProvider>
  );
}