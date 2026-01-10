import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Heart, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore, useCartStore } from '../lib/store';
import toast from 'react-hot-toast';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemsCount } = useCartStore();
  const navigate = useNavigate();
  const cartItemsCount = getItemsCount();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Site Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.jpeg" 
              alt="NVM - Ndingoho Vendor Markets" 
              className="h-12 w-auto transition-transform group-hover:scale-105 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-display font-bold text-nvm-green-primary leading-tight group-hover:text-nvm-green-dark transition-colors">
                NVM
              </span>
              <span className="text-[10px] md:text-xs text-nvm-gold-primary font-semibold leading-tight -mt-0.5">
                Ndingoho Vendor Markets
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-nvm-green-primary transition">
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-nvm-green-primary transition">
              Marketplace
            </Link>
            <Link to="/vendors" className="text-gray-700 hover:text-nvm-green-primary transition">
              Vendors
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="p-2 text-gray-700 hover:text-nvm-green-primary transition">
                  <Heart className="w-6 h-6" />
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-nvm-green-primary transition">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-nvm-earth-terracotta text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-nvm-green-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-nvm-green-primary" />
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to={user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard'}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-nvm-green-primary font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-light transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-nvm-green-primary">
                Home
              </Link>
              <Link to="/marketplace" className="text-gray-700 hover:text-nvm-green-primary">
                Marketplace
              </Link>
              <Link to="/vendors" className="text-gray-700 hover:text-nvm-green-primary">
                Vendors
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="text-gray-700 hover:text-nvm-green-primary">
                    Cart ({cartItemsCount})
                  </Link>
                  <Link to="/dashboard" className="text-gray-700 hover:text-nvm-green-primary">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-left text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-nvm-green-primary">
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-nvm-green-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
