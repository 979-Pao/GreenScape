import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from './App.jsx';
import { CartProvider } from './context/CartContext';
import ItemList from './pages/ItemList.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import './styles.css';

const router = createBrowserRouter([
  { path: '/', element: <AppShell />, children: [
    { index: true, element: <ItemList /> },
    { path: 'items', element: <ItemList /> },
    { path: 'items/:id', element: <ItemDetail /> },
    { path: 'carrito', element: <CartPage /> },
  ]},
]);

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <RouterProvider router={router} />
  </CartProvider>
);