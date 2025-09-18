import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Routes/AppRouter.jsx";
import AuthProvider from "./Context/AuthContext.jsx";

import "./assets/base.css";
import "./index.css";
import "./assets/plantshop.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
