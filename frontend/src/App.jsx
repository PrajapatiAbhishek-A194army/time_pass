import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartWishlistProvider } from './context/CartWishlistContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartWishlistProvider>
          <AppRoutes />
        </CartWishlistProvider>
      </AuthProvider>
    </Router>
  );
}
