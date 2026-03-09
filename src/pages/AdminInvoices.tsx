import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { invoicesAPI } from '../lib/api';
import { formatRands } from '../lib/currency';

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const loadInvoices = async (search = q) => {
    try {
      const response = await invoicesAPI.getAdminInvoices({
        limit: 100,
        ...(search ? { q: search } : {})
      });
      setInvoices(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleVoid = async (invoiceId: string) => {
    const reason = window.prompt('Void reason');
    if (!reason) return;
    try {
      await invoicesAPI.voidAdminInvoice(invoiceId, { reason });
      toast.success('Invoice voided');
      loadInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to void invoice');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-nvm-dark-900">Admin Invoices</h1>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by invoice/order"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
            <button
              onClick={() => {
                setLoading(true);
                loadInvoices(q);
              }}
              className="px-3 py-2 bg-nvm-green-primary text-white rounded-md hover:bg-nvm-green-600 text-sm"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-6 shadow">Loading invoices...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Invoice #</th>
                  <th className="text-left px-4 py-3 text-sm">Type</th>
                  <th className="text-left px-4 py-3 text-sm">Order</th>
                  <th className="text-left px-4 py-3 text-sm">Issued</th>
                  <th className="text-left px-4 py-3 text-sm">Status</th>
                  <th className="text-right px-4 py-3 text-sm">Total</th>
                  <th className="text-right px-4 py-3 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-t">
                    <td className="px-4 py-3">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{invoice.type}</td>
                    <td className="px-4 py-3">{invoice.metadata?.orderNumber || '-'}</td>
                    <td className="px-4 py-3">{new Date(invoice.issuedAt).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3 text-right">{formatRands(invoice.totals?.total || 0)}</td>
                    <td className="px-4 py-3 text-right">
                      {invoice.status !== 'VOID' && (
                        <button
                          onClick={() => handleVoid(invoice._id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
