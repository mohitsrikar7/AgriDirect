import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MandiDashboard from "./pages/farmer/MandiDashboard";
import MyOrders from "./pages/customer/MyOrders";
import Cart from "./pages/customer/Cart";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Payment from "./pages/customer/Payment";
import PaymentSuccess from "./pages/customer/PaymentSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/customer/Profile";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import ProductDetail from "./pages/customer/ProductDetail";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main className="relative min-h-screen">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dashboards */}
              <Route
                path="/farmer"
                element={
                  <ProtectedRoute role="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <ProtectedRoute role="farmer">
                    <FarmerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer"
                element={
                  <ProtectedRoute role="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute role="customer">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute role="customer">
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/payment/:orderId"
                element={
                  <ProtectedRoute role="customer">
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/payment-success"
                element={
                  <ProtectedRoute role="customer">
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/mandi"
                element={
                  <ProtectedRoute role="farmer">
                    <MandiDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/product/:id"
                element={<ProductDetail />}
              />
              <Route
                path="/customer/cart"
                element={
                  <ProtectedRoute role="customer">
                    <Cart />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}


export default App;
