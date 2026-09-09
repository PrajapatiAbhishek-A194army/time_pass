import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiMapPin,
  FiPackage,
  FiHeart,
  FiLogOut,
  FiCheck,
  FiClock,
  FiTruck,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiPrinter,
  FiCopy,
  FiRepeat,
  FiTag,
  FiShield,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import { fetchUserOrders, cancelOrder } from '../services/orderService';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../services/addressService';
import { updateUserProfile, changeUserPassword } from '../services/authService';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { addToCart, openCart, wishlistItemCount } = useCartWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'membership'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState(null);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toast / Notification
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;

    // Load Orders
    setLoadingOrders(true);
    fetchUserOrders()
      .then((res) => {
        if (res?.data) setOrders(res.data);
      })
      .catch((err) => console.warn('Orders fetch note:', err.message))
      .finally(() => setLoadingOrders(false));

    // Load Addresses
    setLoadingAddresses(true);
    fetchAddresses()
      .then((res) => {
        if (res?.data) setAddresses(res.data);
      })
      .catch((err) => console.warn('Address fetch note:', err.message))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center mb-4">
          <FiUser className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-800 mb-2">
          Atelier Access Required
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm text-center">
          Please authenticate with your SoleSphere credentials to access your collector ledger and order tracking.
        </p>
        <Button variant="luxury" size="md" onClick={() => navigate('/login')}>
          Sign In to Atelier
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Profile Update Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await updateUserProfile(profileForm);
      if (res?.data) {
        if (updateUser) updateUser(res.data);
        setProfileMsg({ success: true, text: 'Profile details updated successfully.' });
        showToast('Profile updated.');
      }
    } catch (err) {
      setProfileMsg({
        success: false,
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ success: false, text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ success: false, text: 'New password must be at least 8 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ success: true, text: res.message || 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated.');
    } catch (err) {
      setPasswordMsg({
        success: false,
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Order Cancellation Handler
  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm(`Are you sure you wish to cancel order #${orderNumber}?`)) return;

    try {
      const res = await cancelOrder(orderNumber);
      if (res?.data) {
        setOrders((prev) =>
          prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: 'CANCELLED' } : o))
        );
        if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' });
        }
        showToast(`Order #${orderNumber} cancelled successfully.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  // Reorder Handler (Pours historical items back into bag)
  const handleReorder = (order) => {
    (order.items || []).forEach((item) => {
      addToCart(
        {
          id: item.productId,
          name: item.productName || item.name,
          image: item.productImage || item.image,
          price: Number(item.price),
        },
        item.quantity,
        item.size,
        item.color
      );
    });
    showToast(`Items from #${order.orderNumber} added to your bag.`);
    openCart();
  };

  // Address Handlers
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || 'United States',
        isDefault: addr.isDefault || false,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        fullName: user.name || '',
        phone: user.phone || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: addresses.length === 0,
      });
    }
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await updateAddress(editingAddressId, addressForm);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? res.data : a))
        );
        showToast('Address updated.');
      } else {
        const res = await createAddress(addressForm);
        setAddresses((prev) => [res.data, ...prev]);
        showToast('New address added.');
      }
      setAddressModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Address deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      showToast('Default address updated.');
    } catch (err) {
      alert('Failed to set default address.');
    }
  };

  // Copy helper
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied "${text}" to clipboard.`);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ACTIVE') return o.status === 'PENDING' || o.status === 'PROCESSING';
    if (orderFilter === 'DELIVERED') return o.status === 'DELIVERED';
    if (orderFilter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="emerald" size="xs">Delivered</Badge>;
      case 'SHIPPED':
        return <Badge variant="dark" size="xs">Dispatched / In Transit</Badge>;
      case 'PROCESSING':
        return <Badge variant="accent" size="xs">Processing in Atelier</Badge>;
      case 'PENDING':
        return <Badge variant="accent" size="xs">Pending Authorization</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="xs">Cancelled</Badge>;
      default:
        return <Badge variant="light" size="xs">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dynamic Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-brand-950 text-white shadow-premium border border-brand-800 animate-slideUp">
          <FiCheck className="w-5 h-5 text-brand-400" />
          <span className="text-xs sm:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-soft ring-4 ring-brand-50">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                  {user.name}
                </h1>
                <Badge variant="emerald" size="xs">
                  {user.role || 'ATELIER MEMBER'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                <span>{user.email}</span>
                <span>•</span>
                <span className="text-brand-800 font-bold">Gold Tier</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<FiLogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pt-4 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-brand-900 text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiPackage className="w-4 h-4" /> Consignments & Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-brand-900 text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiUser className="w-4 h-4" /> Profile & Security
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'bg-brand-900 text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiMapPin className="w-4 h-4" /> Saved Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('membership')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'membership'
                ? 'bg-brand-900 text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiShield className="w-4 h-4" /> VIP Privileges
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    orderFilter === f
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'All Orders' : f === 'ACTIVE' ? 'Active / In Production' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <Link to="/catalog" className="text-xs font-bold text-brand-800 hover:underline hidden sm:block">
              + Acquire New Silhouette
            </Link>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                No Consignments Found
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                You haven't placed any orders matching this category yet.
              </p>
              <Link to="/catalog">
                <Button variant="primary" size="md">
                  Explore Footwear Archive
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isCancellable = order.status === 'PENDING' || order.status === 'PROCESSING';
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition"
                  >
                    {/* Top Row: Meta & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {order.trackingNumber && (
                            <span> • Tracking: <span className="font-mono font-semibold text-brand-800">{order.trackingNumber}</span></span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-1 sm:text-right">
                        <span className="text-xs text-slate-400">Total:</span>
                        <span className="font-display font-black text-lg text-slate-900">
                          ${Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Shoe Thumbnails */}
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            {item.productImage || item.image ? (
                              <img
                                src={item.productImage || item.image}
                                alt={item.productName || item.name}
                                className="w-12 h-12 rounded-xl object-cover bg-white"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="pr-2">
                              <h5 className="font-bold text-xs text-slate-900 truncate max-w-[140px]">
                                {item.productName || item.name}
                              </h5>
                              <span className="text-[10px] text-slate-500">
                                {item.size} • Qty {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center gap-1.5"
                      >
                        <span>View Consignment Timeline & Details</span>
                        <FiChevronRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        {isCancellable && (
                          <button
                            onClick={() => handleCancelOrder(order.orderNumber)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                          >
                            Cancel Order
                          </button>
                        )}
                        <Button
                          variant="luxury"
                          size="sm"
                          icon={<FiRepeat className="w-3.5 h-3.5" />}
                          onClick={() => handleReorder(order)}
                        >
                          Reorder All
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. PROFILE & SECURITY TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Personal Details Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
            <h3 className="font-display font-black text-lg text-slate-900 mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update your contact credentials for bespoke drop communications.
            </p>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-bold ${
                  profileMsg.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address (Identity Anchor)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email address cannot be changed directly for security integrity.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" loading={profileLoading}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Right: Change Password Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
            <h3 className="font-display font-black text-lg text-slate-900 mb-1">
              Security Credentials
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update your secret passkey. Minimum 8 characters.
            </p>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-bold ${
                  passwordMsg.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="luxury" size="md" loading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SAVED ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-black text-xl text-slate-900">
                Consignment Address Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage destination profiles for seamless 1-click acquisitions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<FiPlus className="w-4 h-4" />}
              onClick={() => handleOpenAddressModal()}
            >
              Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl p-6 border transition relative flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-brand-600 ring-2 ring-brand-100 shadow-soft'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="emerald" size="xs">
                        Default Address
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 font-medium">
                    <div>{addr.street}</div>
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div>{addr.country}</div>
                    <div className="font-mono text-slate-400 pt-1">{addr.phone}</div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-brand-700 hover:text-brand-900"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <FiCheck className="w-3.5 h-3.5" /> Active Default
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenAddressModal(addr)}
                      className="text-slate-500 hover:text-slate-800"
                      title="Edit"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-rose-500 hover:text-rose-700"
                      title="Delete"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ATELIER VIP PRIVILEGES TAB */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          {/* Gold Member Card */}
          <div className="rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 p-8 text-white shadow-premium relative overflow-hidden border border-brand-800">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-display font-extrabold text-xl">
                  S
                </div>
                <span className="font-display font-black text-xl tracking-tight">
                  SoleSphere <span className="text-emerald-400">Atelier Collective</span>
                </span>
              </div>
              <Badge variant="accent" size="sm">Gold Tier Collector</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Private Drop Window
                </span>
                <span className="font-bold text-sm text-emerald-400">12h Early Reservation</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Complimentary Courier
                </span>
                <span className="font-bold text-sm text-emerald-400">Express Priority on all $150+</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Archived Wishlist
                </span>
                <Link to="/wishlist" className="font-bold text-sm text-white hover:underline flex items-center gap-1">
                  <span>{wishlistItemCount} Silhouettes Saved</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Active Promo Vouchers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
            <h3 className="font-display font-black text-lg text-slate-900 mb-1">
              Active Privilege Vouchers
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Use these promo codes during checkout to unlock special collector concessions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-emerald-950">
                      SOLEDROP15
                    </span>
                    <Badge variant="emerald" size="xs">15% OFF</Badge>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    First-acquisition welcome concession on all premium sneakers.
                  </p>
                </div>
                <button
                  onClick={() => copyText('SOLEDROP15')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-emerald-900 hover:bg-emerald-100 transition flex items-center gap-1 shrink-0"
                >
                  <FiCopy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-brand-950">
                      WELCOME10
                    </span>
                    <Badge variant="accent" size="xs">10% OFF</Badge>
                  </div>
                  <p className="text-[11px] text-brand-800 mt-1">
                    Collector appreciation pass on any heritage classic drops.
                  </p>
                </div>
                <button
                  onClick={() => copyText('WELCOME10')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-brand-300 font-bold text-xs text-brand-900 hover:bg-brand-100 transition flex items-center gap-1 shrink-0"
                >
                  <FiCopy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADDRESS MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-premium border border-slate-200/80 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="font-display font-black text-lg text-slate-900">
                {editingAddressId ? 'Edit Address Profile' : 'Add New Consignment Destination'}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="123 Atelier Avenue, Suite 400"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ZIP / Postal *</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setAddressModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL & TIMELINE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-premium border border-slate-200/80 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-slate-900">
                    Consignment #{selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordered on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Consignment Status Progress Timeline */}
            <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Consignment Pipeline
              </h4>

              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Step 1: Confirmed */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedOrder.status !== 'CANCELLED' ? 'bg-emerald-600 text-white shadow-soft' : 'bg-rose-500 text-white'
                  }`}>
                    {selectedOrder.status === 'CANCELLED' ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">
                    {selectedOrder.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>

                {/* Step 2: Atelier Crafting */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status)
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    <FiShield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">Atelier Craft</span>
                </div>

                {/* Step 3: Courier In Transit */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    ['SHIPPED', 'DELIVERED'].includes(selectedOrder.status)
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    <FiTruck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">Dispatched</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedOrder.status === 'DELIVERED'
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    <FiPackage className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold mt-2 text-slate-800">Delivered</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Footwear Breakdown
              </h4>
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.productImage || item.image ? (
                        <img
                          src={item.productImage || item.image}
                          alt={item.productName || item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">
                          {item.productName || item.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-slate-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="max-w-xs ml-auto space-y-1.5 text-xs mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Privilege Discount</span>
                  <span>-${Number(selectedOrder.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Courier</span>
                <span className="font-bold text-slate-900">
                  {Number(selectedOrder.shippingFee) === 0 ? 'COMPLIMENTARY' : `$${Number(selectedOrder.shippingFee).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes</span>
                <span className="font-bold text-slate-900">${Number(selectedOrder.tax).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="font-display font-black text-brand-900">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                to={`/order-confirmation/${selectedOrder.orderNumber}`}
                className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
              >
                <FiPrinter className="w-3.5 h-3.5" /> Full Printable Invoice
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="luxury"
                  size="sm"
                  icon={<FiRepeat className="w-3.5 h-3.5" />}
                  onClick={() => {
                    handleReorder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                >
                  Reorder Consignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
