import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

export function VendorDocuments() {
  const [vendor, setVendor] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('BUSINESS_REG');
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vendorRes, docsRes, metricsRes] = await Promise.all([
        vendorsAPI.getMyProfile(),
        vendorsAPI.vendorGetDocuments(),
        vendorsAPI.vendorGetMetrics()
      ]);
      setVendor(vendorRes.data.data);
      setDocuments(docsRes.data.data || []);
      setMetrics(metricsRes.data.data || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Select a file first');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('docType', docType);
      form.append('file', file);
      await vendorsAPI.vendorUploadDocument(form);
      toast.success('Document uploaded');
      setFile(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await vendorsAPI.vendorDeleteDocument(docId);
      toast.success('Document deleted');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8">Loading verification data...</div>
      </div>
    );
  }

  const vendorStatus = vendor?.vendorStatus || vendor?.status || 'PENDING';
  const verificationStatus = vendor?.verificationStatus || 'UNVERIFIED';
  const suspensionReason = vendor?.suspension?.suspensionReason || vendor?.suspensionReason;
  const rejectionReason = vendor?.rejection?.rejectionReason || vendor?.rejectionReason;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-5">
        <h1 className="text-2xl font-bold">Verification & Documents</h1>

        <div className="bg-white border rounded-lg p-4 grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Vendor Status</p>
            <p className="font-semibold">{vendorStatus}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Verification Status</p>
            <p className="font-semibold">{verificationStatus}</p>
          </div>
          {vendorStatus === 'SUSPENDED' && suspensionReason ? (
            <div className="md:col-span-2 p-3 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Suspended: {suspensionReason}. Contact support/admin to resolve.
            </div>
          ) : null}
          {vendorStatus === 'REJECTED' && rejectionReason ? (
            <div className="md:col-span-2 p-3 rounded bg-red-50 text-red-800 border border-red-200">
              Rejected: {rejectionReason}
            </div>
          ) : null}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Performance Snapshot</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="border rounded p-3"><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-bold">{metrics?.totalOrders || 0}</p></div>
            <div className="border rounded p-3"><p className="text-xs text-gray-500">Sales</p><p className="text-xl font-bold">{formatRands(metrics?.totalSales || 0)}</p></div>
            <div className="border rounded p-3"><p className="text-xs text-gray-500">Reviews</p><p className="text-xl font-bold">{metrics?.totalReviews || 0}</p></div>
            <div className="border rounded p-3"><p className="text-xs text-gray-500">Avg Rating</p><p className="text-xl font-bold">{metrics?.avgRating || 0}</p></div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Upload Document</h2>
          <form className="grid md:grid-cols-3 gap-3 items-end" onSubmit={handleUpload}>
            <div>
              <label className="text-sm text-gray-600">Document Type</label>
              <select className="w-full border rounded px-3 py-2" value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="BUSINESS_REG">BUSINESS_REG</option>
                <option value="COMPLIANCE">COMPLIANCE</option>
                <option value="ID">ID</option>
                <option value="TAX">TAX</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">File (pdf, jpg, png, webp)</label>
              <input className="w-full border rounded px-3 py-2" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <button className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-60" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Uploaded Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-600">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc._id} className="border rounded p-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{doc.fileName}</p>
                    <p className="text-sm text-gray-600">{doc.docType} | {doc.status}</p>
                    {doc.reviewNote ? <p className="text-sm text-red-700">Review Note: {doc.reviewNote}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">View</a>
                    {doc.status !== 'APPROVED' ? (
                      <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(doc._id)}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
