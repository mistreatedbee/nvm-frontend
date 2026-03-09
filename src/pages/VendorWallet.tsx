import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorWalletAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

export function VendorWallet() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({ availableBalance: 0, pendingBalance: 0, totalPaidOut: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, txRes, payoutsRes] = await Promise.all([
        vendorWalletAPI.summary(),
        vendorWalletAPI.transactions({ page, limit: 20, type: typeFilter || undefined }),
        vendorWalletAPI.payoutRequests()
      ]);
      setSummary(summaryRes.data?.data || { availableBalance: 0, pendingBalance: 0, totalPaidOut: 0 });
      setTransactions(txRes.data?.data || []);
      setPages(txRes.data?.pages || 1);
      setPayouts(payoutsRes.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, typeFilter]);

  const requestWithdraw = async () => {
    const value = Number(amount);
    if (value <= 0) return toast.error('Enter a valid amount');
    try {
      setWithdrawing(true);
      await vendorWalletAPI.withdraw(value);
      toast.success('Withdrawal request submitted');
      setAmount('');
      setPage(1);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Vendor Wallet</h1>
        <p className="text-gray-600 mb-6">View balances, transactions, and payout history.</p>

        {loading ? <div className="bg-white border rounded-xl p-6">Loading wallet...</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-5">
            <div className="text-sm text-gray-500">Available Balance</div>
            <div className="text-2xl font-bold">{formatRands(summary.availableBalance || 0)}</div>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <div className="text-sm text-gray-500">Pending Balance</div>
            <div className="text-2xl font-bold">{formatRands(summary.pendingBalance || 0)}</div>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <div className="text-sm text-gray-500">Total Paid Out</div>
            <div className="text-2xl font-bold">{formatRands(summary.totalPaidOut || 0)}</div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-3">Request Withdrawal</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={requestWithdraw}
              disabled={withdrawing}
              className="px-4 py-2 bg-nvm-green-primary text-white rounded disabled:opacity-60"
            >
              {withdrawing ? 'Submitting...' : 'Request Payout'}
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Transactions</h2>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="SALE">SALE</option>
              <option value="COMMISSION">COMMISSION</option>
              <option value="PAYOUT">PAYOUT</option>
              <option value="REFUND">REFUND</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </div>
          {transactions.length === 0 ? (
            <div className="text-sm text-gray-500">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Direction</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-t">
                      <td className="p-2">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">{tx.direction}</td>
                      <td className="p-2">{tx.status}</td>
                      <td className="p-2 text-right">{formatRands(tx.amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-500">Page {page} of {pages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Payout History</h2>
          {payouts.length === 0 ? (
            <div className="text-sm text-gray-500">No payout requests yet.</div>
          ) : (
            <div className="space-y-2">
              {payouts.map((row) => (
                <div key={row._id} className="border rounded p-2 text-sm flex justify-between">
                  <span>{new Date(row.requestedAt || row.createdAt).toLocaleString()} - {formatRands(row.amount || 0)}</span>
                  <span>{row.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

