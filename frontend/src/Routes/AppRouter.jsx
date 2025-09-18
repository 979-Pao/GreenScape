import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Home from "../components/Home/Home";
import PlantList from "../components/Catalog/PlantList";
import BlogList from "../components/Blog/BlogList";
import BlogPost from "../components/Blog/BlogPost";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import Profile from "../components/Profile/Profile";
import CartView from "../components/Cart/CartView";
import Protected from "../components/Common/Protected";
import RoleProtected from "../components/Common/RoleProtected";
import OrderHistory from "../components/Orders/OrderHistory";
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminOrders from "../components/Admin/AdminOrders";
import AdminPurchases from "../components/Admin/AdminPurchases";
import SupplierInbox from "../components/Supplier/SupplierInbox";
import Contact from "../components/Static/Contact";

export default function AppRouter() {
  return (
    <Layout>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<PlantList />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Privadas (cliente) */}
        <Route path="/profile" // o "/perfil", pero usa SIEMPRE el mismo en toda la app
          element={<Protected><Profile /></Protected>}/>
        <Route path="/cart"
          element={<Protected><CartView /></Protected>}/>
        <Route path="/orders"
          element={<RoleProtected roles={["CLIENT"]}><OrderHistory /></RoleProtected>}/>

        {/* Privadas (admin) */}
        <Route path="/admin"
          element={<RoleProtected roles={["ADMIN"]}><AdminDashboard /></RoleProtected>}/>
        <Route path="/admin/orders"
          element={<RoleProtected roles={["ADMIN"]}><AdminOrders /></RoleProtected>}/>
        <Route path="/admin/purchases"
          element={<RoleProtected roles={["ADMIN"]}><AdminPurchases /></RoleProtected>}/>

        {/* Privadas (supplier) */}
        <Route path="/supplier/inbox"
          element={<RoleProtected roles={["SUPPLIER"]}><SupplierInbox /></RoleProtected>}/>

        {/* 404 → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

