import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { invoicesAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import { 
  Download, 
  Printer, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Building
} from 'lucide-react';

export function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchInvoice();
    }
  }, [orderId]);

  const fetchInvoice = async () => {
    try {
      const response = await invoicesAPI.getData(orderId!);
      setInvoice(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load invoice');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      toast.loading('Generating PDF...');
      const response = await invoicesAPI.download(orderId!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Invoice downloaded!');
    } catch (error: any) {
      toast.dismiss();
      toast.error('PDF generation not available yet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-red-600">Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between print:hidden"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </motion.div>

        {/* Invoice Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12"
          id="invoice-content"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
                NVM MARKETPLACE
              </h1>
              <p className="text-gray-600">Ndingoho Vendor Markets</p>
              <p className="text-gray-600">South Africa</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-nvm-dark-900 mb-2">TAX INVOICE</h2>
              <p className="text-sm text-gray-600">
                Invoice #: <span className="font-semibold">{invoice.orderNumber}</span>
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(invoice.date).toLocaleDateString('en-ZA', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {invoice.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-nvm-dark-900 mb-4">BILL TO:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-nvm-dark-900">{invoice.customer.name}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                {invoice.customer.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4" />
                {invoice.customer.phone}
              </p>
              <div className="mt-3 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>
                    {invoice.shippingAddress.street}<br />
                    {invoice.shippingAddress.city}, {invoice.shippingAddress.state}<br />
                    {invoice.shippingAddress.zipCode}, {invoice.shippingAddress.country}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Items by Vendor */}
          {invoice.vendors.map((vendorGroup: any, index: number) => (
            <div key={index} className="mb-8">
              {/* Vendor Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-bold text-nvm-dark-900 mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  VENDOR {index + 1}: {vendorGroup.vendor.storeName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {vendorGroup.vendor.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {vendorGroup.vendor.phone}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendorGroup.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatRands(item.price)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatRands(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Banking Details for EFT/Bank Transfer */}
              {vendorGroup.vendor.bankDetails && (invoice.paymentMethod === 'eft' || invoice.paymentMethod === 'bank-transfer') && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    PAYMENT DETAILS (EFT)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Bank Name:</span>
                      <p className="font-semibold">{vendorGroup.vendor.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <p className="font-semibold">{vendorGroup.vendor.bankDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-semibold">{vendorGroup.vendor.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Branch Code:</span>
                      <p className="font-semibold">{vendorGroup.vendor.bankDetails.branchCode}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    * Please use order number <strong>{invoice.orderNumber}</strong> as reference when making payment
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Order Summary */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatRands(invoice.subtotal)}</span>
                </div>
                {invoice.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-semibold">{formatRands(invoice.shippingCost)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (VAT):</span>
                    <span className="font-semibold">{formatRands(invoice.tax)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatRands(invoice.discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-nvm-dark-900">TOTAL:</span>
                    <span className="text-2xl font-bold text-nvm-gold-primary">{formatRands(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p className="mb-2">Thank you for shopping with NVM Marketplace!</p>
            <p>For any queries, please contact the vendor directly or visit www.nvmmarketplace.co.za</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
