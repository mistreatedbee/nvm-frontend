import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { invoicesAPI } from '../lib/api';
import { formatRands } from '../lib/currency';

export function CustomerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getMy({ limit: 50 });
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

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await invoicesAPI.downloadMyPdf(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-nvm-dark-900 mb-6">My Invoices</h1>
        {loading ? (
          <div className="bg-white rounded-lg p-6 shadow">Loading invoices...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Invoice #</th>
                  <th className="text-left px-4 py-3 text-sm">Date</th>
                  <th className="text-left px-4 py-3 text-sm">Status</th>
                  <th className="text-right px-4 py-3 text-sm">Total</th>
                  <th className="text-right px-4 py-3 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-t">
                    <td className="px-4 py-3">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{new Date(invoice.issuedAt).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3 text-right">{formatRands(invoice.totals?.total || 0)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                        className="px-3 py-1.5 bg-nvm-green-primary text-white rounded-md hover:bg-nvm-green-600"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No invoices yet.
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
