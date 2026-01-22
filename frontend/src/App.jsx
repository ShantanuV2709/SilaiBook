import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import ClothStock from "./pages/ClothStock";
import ClothUsage from "./pages/ClothUsage";
import Payments from "./pages/Payments";
import Orders from "./pages/Orders";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
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
          <Route path="/cloth-usage" element={<ClothUsage />} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/orders" element={<Orders />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
