import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { vendorTransactionsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';

export function VendorTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async (nextType = type) => {
    try {
      const response = await vendorTransactionsAPI.getMy({
        limit: 100,
        ...(nextType ? { type: nextType } : {})
      });
      setTransactions(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTypeChange = (value: string) => {
    setType(value);
    setLoading(true);
    loadTransactions(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-nvm-dark-900">Vendor Transactions</h1>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="SALE">SALE</option>
            <option value="COMMISSION">COMMISSION</option>
            <option value="PAYOUT">PAYOUT</option>
            <option value="REFUND">REFUND</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-6 shadow">Loading transactions...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Date</th>
                  <th className="text-left px-4 py-3 text-sm">Type</th>
                  <th className="text-left px-4 py-3 text-sm">Direction</th>
                  <th className="text-left px-4 py-3 text-sm">Reference</th>
                  <th className="text-left px-4 py-3 text-sm">Status</th>
                  <th className="text-right px-4 py-3 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-t">
                    <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3">{tx.type}</td>
                    <td className={`px-4 py-3 ${tx.direction === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                      {tx.direction}
                    </td>
                    <td className="px-4 py-3">{tx.reference}</td>
                    <td className="px-4 py-3">{tx.status}</td>
                    <td className="px-4 py-3 text-right">{formatRands(tx.amount || 0)}</td>
                  </tr>
                ))}
                {!transactions.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No transactions found.
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
