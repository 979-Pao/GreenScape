import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Home from "../components/Home/Home";
import PlantList from "../components/Catalog/PlantList";
import PublicBlogList from "../components/Blog/BlogList";
import BlogPost from "../components/Blog/BlogPost";
import AdminBlogList from "../components/Pages/BlogList";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import Profile from "../components/Profile/Profile";
import CartView from "../components/Cart/CartView";
import Protected from "../components/Common/Protected";
import RoleProtected from "../components/Common/RoleProtected";
import OrderHistory from "../components/Orders/OrderHistory";
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminOrders from "../components/Admin/AdminOrders";
import SupplierInbox from "../components/Supplier/SupplierInbox";
import Contact from "../components/Static/Contact";
import AdminPlantForm from "../components/Admin/forms/AdminPlantForm";
import AdminUserForm from "../components/Admin/forms/AdminUserForm";
import AdminBlogForm from "../components/Admin/forms/AdminBlogForm";
import AdminPurchaseForm from "../components/Admin/forms/AdminPurchaseForm";
import AdminProfileForm from "../components/Admin/forms/AdminProfileForm";
import ClientProfileForm from "../components/Profile/ClientProfileForm";
import SupplierProfileForm from "../components/Profile/SupplierProfileForm";
import AdminPlantsList from "../components/Pages/PlantsList";
import AdminUsersList from "../components/Pages/UsersList";
import AdminPurchasesList from "../components/Pages/PurchasesList";

export default function AppRouter() {
  return (
    <Layout>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<PlantList />} />
        <Route path="/blog" element={<PublicBlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Privadas (cliente) */}
        <Route
          path="/client/me"
          element={<RoleProtected roles={["CLIENT"]}><ClientProfileForm /></RoleProtected>}
        />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/cart" element={<Protected><CartView /></Protected>} />
        <Route path="/orders" element={<RoleProtected roles={["CLIENT"]}><OrderHistory /></RoleProtected>}/>
        <Route path="/mi-historial" element={<RoleProtected roles={["CLIENT"]}><OrderHistory /></RoleProtected>}/>

        {/* Privadas (admin) */}
        <Route path="/admin/plants/new" element={<RoleProtected roles={["ADMIN"]}><AdminPlantForm /></RoleProtected>}/>
        <Route path="/admin/users/new" element={<RoleProtected roles={["ADMIN"]}><AdminUserForm /></RoleProtected>}/>
        <Route path="/admin/blog/new" element={<RoleProtected roles={["ADMIN"]}><AdminBlogForm /></RoleProtected>}/>
        <Route path="/admin/purchase/new" element={<RoleProtected roles={["ADMIN"]}><AdminPurchaseForm /></RoleProtected>}/>
        <Route path="/admin/me" element={<RoleProtected roles={["ADMIN"]}><AdminProfileForm /></RoleProtected>} />
        <Route path="/admin/orders" element={<RoleProtected roles={["ADMIN"]}><AdminOrders /></RoleProtected>} />

        {/* Listas Admin */}
        <Route path="/admin/plants" element={<RoleProtected roles={["ADMIN"]}><AdminPlantsList /></RoleProtected>}/>
        <Route path="/admin/blog" element={<RoleProtected roles={["ADMIN"]}><AdminBlogList /></RoleProtected>}/>
        <Route path="/admin/users" element={<RoleProtected roles={["ADMIN"]}><AdminUsersList /></RoleProtected>}/>
        <Route path="/admin/purchases" element={<RoleProtected roles={["ADMIN"]}><AdminPurchasesList /></RoleProtected>}/>
        <Route path="/admin" element={<RoleProtected roles={["ADMIN"]}><AdminDashboard /></RoleProtected>} />

        {/* Privadas (supplier) */}
        <Route path="/supplier/me" element={<RoleProtected roles={["SUPPLIER"]}><SupplierProfileForm /></RoleProtected>}/>
        <Route path="/supplier/inbox" element={<RoleProtected roles={["SUPPLIER"]}><SupplierInbox /></RoleProtected>}/>

        {/* 404 → home */}
        <Route path="*" element={<Navigate to="/" replace />} /> </Routes>
    </Layout>
  );
}