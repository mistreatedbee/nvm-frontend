import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Navbar } from '../components/Navbar';
import { useCartStore, useAuthStore, useLoginPromptStore } from '../lib/store';
import { addressesAPI, cartAPI, checkoutAPI, helpAPI, logisticsAPI, ordersAPI, isAuthRequiredError, getErrorMessage } from '../lib/api';
import { formatRands, TAX_RATE } from '../lib/currency';
import { FileText, MapPin, CheckCircle, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  lat?: string;
  lng?: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { clearCart: clearLocalCart, syncFromServer: syncCartStore } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [createdInvoices, setCreatedInvoices] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardApplied, setGiftCardApplied] = useState(0);
  const [appliedGiftCardCode, setAppliedGiftCardCode] = useState('');
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [helpSuggestions, setHelpSuggestions] = useState<any[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [quotedShipping, setQuotedShipping] = useState<number | null>(null);
  const [qtyUpdatingByProductId, setQtyUpdatingByProductId] = useState<Record<string, boolean>>({});
  const checkoutIdempotencyKeyRef = useRef('');
  const debugCheckout = import.meta.env.DEV || localStorage.getItem('DEBUG_CHECKOUT') === 'true';
  const [availableMethods, setAvailableMethods] = useState<{ delivery: boolean; pickup: boolean }>({
    delivery: true,
    pickup: true
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      try {
        const res = await cartAPI.get();
        const items = res.data?.data?.items || [];
        setCartItems(items);
        if (!items.length) {
          navigate('/cart');
        }
      } catch (_error) {
        toast.error('Failed to load cart');
        navigate('/cart');
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    addressesAPI.get().then((res) => {
      const addresses = res.data?.data?.addresses || [];
      setSavedAddresses(addresses);
      const defaultAddress = addresses.find((address: any) => address.isDefault);
      if (defaultAddress?._id) {
        setSelectedAddressId(defaultAddress._id);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.priceSnapshot || 0) * Number(item.qty || 0), 0),
    [cartItems]
  );
  const [previewTotals, setPreviewTotals] = useState<{
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  } | null>(null);

  const shipping =
    deliveryMethod === 'PICKUP'
      ? 0
      : previewTotals?.deliveryFee ?? quotedShipping ?? (cartItems.length ? 50 : 0);
  const tax = previewTotals?.tax ?? subtotal * TAX_RATE;
  const totalBeforeDiscount = subtotal + shipping + tax;
  const totalDiscount = Math.min(
    totalBeforeDiscount,
    promoDiscount + giftCardApplied,
    previewTotals?.discount ?? Infinity
  );
  const total = previewTotals?.total ?? Math.max(0, totalBeforeDiscount - totalDiscount);

  const handleCheckoutQuantityChange = async (productId: string, delta: number) => {
    if (qtyUpdatingByProductId[productId]) return;
    const current = cartItems.find((entry: any) => String(entry.productId) === String(productId));
    if (!current) return;

    const nextQty = Number(current.qty || 0) + delta;
    setQtyUpdatingByProductId((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = nextQty <= 0
        ? await cartAPI.remove(productId)
        : await cartAPI.update(productId, nextQty);
      const items = response.data?.data?.items || [];
      setCartItems(items);
      if (!items.length) {
        toast('Your cart is empty');
        navigate('/cart');
      }
      syncCartStore().catch(() => {});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update quantity');
    } finally {
      setQtyUpdatingByProductId((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const refreshPreview = async (addressPayload: any, effectiveDeliveryMethod: 'DELIVERY' | 'PICKUP') => {
    try {
      if (!cartItems.length) return;
      const discountAmount = promoDiscount + giftCardApplied;
      const res = await checkoutAPI.preview({
        address: addressPayload,
        deliveryMethod: effectiveDeliveryMethod,
        discount: discountAmount
      });
      const data = res.data?.data;
      if (data) {
        const methods = Array.isArray(data.deliveryOptions)
          ? data.deliveryOptions.map((opt: any) => opt.method)
          : [];
        setAvailableMethods({
          delivery: methods.includes('DELIVERY'),
          pickup: methods.includes('PICKUP')
        });

        setPreviewTotals({
          deliveryFee: Number(data.deliveryFee || 0),
          tax: Number(data.tax || 0),
          discount: Number(data.discount || 0),
          total: Number(data.total || 0)
        });
        if (effectiveDeliveryMethod === 'DELIVERY') {
          setQuotedShipping(Number(data.deliveryFee || 0));
        }
      }
    } catch (error: any) {
      setPreviewTotals(null);
      const message =
        error.response?.data?.message ||
        'We could not calculate an accurate total for this address. Please update your address or choose collection where available.';
      toast.error(message);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setCheckoutError('');
    setHelpSuggestions([]);
    try {
      if (!checkoutIdempotencyKeyRef.current) {
        checkoutIdempotencyKeyRef.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }
      if (debugCheckout) {
        console.info('[checkout] submit start', { idempotencyKey: checkoutIdempotencyKeyRef.current });
      }
      if (!isAuthenticated) {
        useLoginPromptStore.getState().open();
        return;
      }
      const freshCartRes = await cartAPI.get();
      const freshCartItems = freshCartRes.data?.data?.items || [];
      if (!freshCartItems.length) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }

      let shippingAddressPayload: any = {
        fullName: data.fullName,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country || 'South Africa',
        zipCode: data.zipCode,
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined
      };
      if (selectedAddressId) {
        const selected = savedAddresses.find((address: any) => String(address._id) === String(selectedAddressId));
        if (selected) {
          shippingAddressPayload = {
            fullName: selected.name,
            phone: selected.phone,
            street: selected.addressLine1,
            city: selected.city,
            state: selected.province,
            country: data.country || 'South Africa',
            zipCode: selected.postalCode
          };
        }
      }

      await refreshPreview(shippingAddressPayload, deliveryMethod);

      const orderData = {
        items: freshCartItems.map((item: any) => ({
          product: item.productId,
          quantity: item.qty,
          price: item.priceSnapshot,
        })),
        shippingAddress: shippingAddressPayload,
        billingAddress: shippingAddressPayload,
        paymentMethod: 'INVOICE',
        deliveryMethod,
        promoCode: appliedPromoCode || undefined,
        giftCardCode: appliedGiftCardCode || undefined
      };

      const orderRes = await ordersAPI.create(orderData, {
        idempotencyKey: checkoutIdempotencyKeyRef.current
      });
      if (debugCheckout) {
        console.info('[checkout] order response', {
          idempotencyKey: checkoutIdempotencyKeyRef.current,
          orderId: orderRes.data?.data?._id
        });
      }
      setCreatedOrderId(orderRes.data?.data?._id || '');
      setCreatedInvoices(orderRes.data?.invoices || []);

      if (isAuthenticated && saveAddressForNextTime && !selectedAddressId) {
        await addressesAPI.add({
          label: 'Checkout',
          name: shippingAddressPayload.fullName,
          phone: shippingAddressPayload.phone,
          addressLine1: shippingAddressPayload.street,
          city: shippingAddressPayload.city,
          province: shippingAddressPayload.state,
          postalCode: shippingAddressPayload.zipCode,
          isDefault: savedAddresses.length === 0
        });
      }

      await cartAPI.clear();
      await clearLocalCart();
      setStep('success');
      checkoutIdempotencyKeyRef.current = '';
      toast.success('Order placed. Invoice generated.');
    } catch (error: any) {
      if (isAuthRequiredError(error)) {
        useLoginPromptStore.getState().open();
        return;
      }
      const message = getErrorMessage(error, 'Failed to place order');
      setCheckoutError(message);
      toast.error(message);
      try {
        const normalized = String(message).toLowerCase();
        const category = /(payment|invoice|eft|proof|card)/i.test(normalized) ? 'PAYMENTS' : 'ORDERS';
        const faqRes = await helpAPI.getFaqs({ q: message, category, page: 1, limit: 4 });
        setHelpSuggestions(faqRes.data?.data || []);
      } catch {
        setHelpSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyPromo = async () => {
    try {
      if (!promoCode.trim()) return;
      const res = await checkoutAPI.applyPromo(promoCode.trim(), subtotal);
      setPromoDiscount(Number(res.data?.data?.discount || 0));
      setAppliedPromoCode(String(res.data?.data?.code || promoCode.trim().toUpperCase()));
      toast.success('Promo code applied');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Promo code invalid');
      setPromoDiscount(0);
      setAppliedPromoCode('');
    }
  };

  const applyGiftCard = async () => {
    try {
      if (!giftCardCode.trim()) return;
      const res = await checkoutAPI.redeemGiftCard(giftCardCode.trim(), Math.max(0, totalBeforeDiscount - promoDiscount));
      setGiftCardApplied(Number(res.data?.data?.applied || 0));
      setAppliedGiftCardCode(giftCardCode.trim().toUpperCase());
      toast.success('Gift card applied');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gift card invalid');
      setGiftCardApplied(0);
      setAppliedGiftCardCode('');
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-white rounded-xl border" />
            <div className="h-48 bg-white rounded-xl border" />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-xl max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-nvm-dark-900 mb-4">Order Successful!</h2>
          <p className="text-gray-600 mb-8">
            Your order was created with Invoice Payment (Manual EFT). Download your invoice and upload proof of payment after transfer.
          </p>
          <div className="space-y-3">
            {createdInvoices.find((inv) => inv.type === 'CUSTOMER') && (
              <Link
                to="/customer/invoices"
                className="block px-8 py-3 min-h-[44px] bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
              >
                View/Download Invoice
              </Link>
            )}
            {createdOrderId && (
              <button
                onClick={() => navigate(`/orders/${createdOrderId}/track`)}
                className="px-8 py-3 min-h-[44px] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go To Order & Upload POP
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        {!!checkoutError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800 font-semibold mb-1">Checkout issue: {checkoutError}</p>
            <p className="text-sm text-red-700 mb-2">
              You can check related guidance below, open <Link to="/help" className="underline font-semibold">Help Center</Link>, or contact <Link to="/support" className="underline font-semibold">Support</Link>.
            </p>
            {!helpSuggestions.length ? (
              <p className="text-xs text-red-700">No specific FAQ suggestions found yet.</p>
            ) : (
              <div className="space-y-1">
                {helpSuggestions.map((faq) => (
                  <div key={faq._id} className="text-xs text-red-900 bg-white border border-red-100 rounded px-2 py-1.5">
                    {faq.question}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-nvm-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-nvm-green-600" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Use Saved Address</label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg"
                      >
                        <option value="">Enter a new address</option>
                        {savedAddresses.map((address: any) => (
                          <option key={address._id} value={address._id}>
                            {address.label || address.name} - {address.addressLine1}, {address.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Name is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="+27 12 345 6789"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      {...register('street', { required: 'Address is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="123 Main Street"
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="Johannesburg"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                    <input
                      type="text"
                      {...register('state', { required: 'Province is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="Gauteng"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      {...register('zipCode', { required: 'Postal code is required' })}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="2000"
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (optional)</label>
                    <input
                      type="text"
                      {...register('lat')}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="-26.2041"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (optional)</label>
                    <input
                      type="text"
                      {...register('lng')}
                      disabled={Boolean(selectedAddressId)}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="28.0473"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => {
                        setDeliveryMethod(e.target.value as 'DELIVERY' | 'PICKUP');
                        setPreviewTotals(null);
                      }}
                      className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg"
                    >
                      <option value="DELIVERY" disabled={!availableMethods.delivery}>
                        Delivery
                      </option>
                      <option value="PICKUP" disabled={!availableMethods.pickup}>
                        Pickup / Collection
                      </option>
                    </select>
                    {!availableMethods.pickup && (
                      <p className="mt-1 text-xs text-gray-500">
                        Pickup is not available for every item in your cart.
                      </p>
                    )}
                  </div>
                  {isAuthenticated && !selectedAddressId && (
                    <div className="md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={saveAddressForNextTime}
                          onChange={(e) => setSaveAddressForNextTime(e.target.checked)}
                        />
                        Save this address for next checkout
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-nvm-gold-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-nvm-gold-600" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-4 border-2 border-nvm-green-400 bg-nvm-green-50 rounded-lg">
                    <div className="w-5 h-5 rounded-full border-4 border-nvm-green-primary bg-white" />
                    <div className="ml-4">
                      <p className="font-semibold">Pay via Invoice (Manual EFT)</p>
                      <p className="text-sm text-gray-600">Invoice is generated instantly with vendor banking details.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
              >
                <h2 className="text-xl font-display font-bold">Discounts</h2>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <button type="button" onClick={applyPromo} className="px-4 py-3 bg-gray-900 text-white rounded-lg">Apply</button>
                </div>
                {appliedPromoCode && <p className="text-sm text-green-700">Applied promo: {appliedPromoCode} (-{formatRands(promoDiscount)})</p>}
                <div className="flex gap-2">
                  <input
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Gift card code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <button type="button" onClick={applyGiftCard} className="px-4 py-3 bg-gray-900 text-white rounded-lg">Redeem</button>
                </div>
                {appliedGiftCardCode && <p className="text-sm text-green-700">Applied gift card: {appliedGiftCardCode} (-{formatRands(giftCardApplied)})</p>}
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 min-h-[44px] bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Place Order - ${formatRands(total)}`}
              </button>
            </form>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item: any) => (
                  <div key={String(item.productId)} className="flex gap-3">
                    <img
                      src={item.imageSnapshot || item.product?.image || '/placeholder-product.png'}
                      alt={item.titleSnapshot}
                      loading="lazy"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{item.titleSnapshot}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCheckoutQuantityChange(String(item.productId), -1)}
                          disabled={Boolean(qtyUpdatingByProductId[String(item.productId)])}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-gray-700 min-w-[20px] text-center">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleCheckoutQuantityChange(String(item.productId), 1)}
                          disabled={Boolean(qtyUpdatingByProductId[String(item.productId)])}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-nvm-gold-primary">{formatRands(item.priceSnapshot * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatRands(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">{formatRands(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT ({TAX_RATE * 100}%)</span>
                  <span className="font-semibold">{formatRands(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discounts</span>
                  <span className="font-semibold">-{formatRands(totalDiscount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-nvm-dark-900">Total</span>
                    <span className="text-2xl font-bold text-nvm-gold-primary">{formatRands(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
