import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, MessageSquare, Paperclip, Send } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { disputesAPI } from '../lib/api';
import { connectChatSocket, disconnectChatSocket, getChatSocket } from '../lib/chatSocket';
import { useAuthStore } from '../lib/store';

export function Disputes() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const isAdminRoute = window.location.pathname.startsWith('/admin/');

  const selectedDispute = useMemo(() => disputes.find((d) => d._id === selectedId) || selected, [disputes, selectedId, selected]);

  const loadList = async () => {
    setLoading(true);
    try {
      const response = isAdminRoute ? await disputesAPI.getAdmin({ status: status || undefined }) : await disputesAPI.getMy({ status: status || undefined });
      const rows = response.data?.data || [];
      setDisputes(rows);
      const wanted = params.id || searchParams.get('disputeId');
      const wantedOrderId = searchParams.get('orderId');
      let initial = wanted && rows.find((row: any) => String(row._id) === wanted) ? wanted : '';
      if (!initial && wantedOrderId) {
        const byOrder = rows.find((row: any) => String(row?.order?._id || '') === String(wantedOrderId));
        if (byOrder?._id) initial = String(byOrder._id);
      }
      if (!initial) initial = rows[0]?._id;
      if (initial) {
        setSelectedId(String(initial));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    if (!id) return;
    try {
      const [detailRes, messagesRes] = await Promise.all([
        disputesAPI.getById(id),
        disputesAPI.getMessages(id)
      ]);
      setSelected(detailRes.data?.data || null);
      setMessages(messagesRes.data?.data || []);
      setSearchParams({ disputeId: id });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load dispute thread');
    }
  };

  useEffect(() => {
    loadList();
  }, [status]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!token) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    const onDisputeUpdated = (payload: { disputeId: string; status?: string }) => {
      if (!payload?.disputeId) return;
      if (payload.disputeId === selectedId) {
        loadDetail(selectedId).catch(() => null);
      }
      loadList().catch(() => null);
    };

    const onDisputeNewMessage = (payload: { disputeId: string; message: any }) => {
      if (!payload?.disputeId || payload.disputeId !== selectedId || !payload.message) return;
      setMessages((prev) => {
        if (prev.some((item: any) => String(item._id) === String(payload.message._id))) return prev;
        return [...prev, payload.message];
      });
      loadList().catch(() => null);
    };

    const onDisputeListUpdated = () => {
      loadList().catch(() => null);
    };

    socket.on('dispute:updated', onDisputeUpdated);
    socket.on('dispute:new-message', onDisputeNewMessage);
    socket.on('dispute:list-updated', onDisputeListUpdated);

    return () => {
      socket.off('dispute:updated', onDisputeUpdated);
      socket.off('dispute:new-message', onDisputeNewMessage);
      socket.off('dispute:list-updated', onDisputeListUpdated);
    };
  }, [token, selectedId, status]);

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket || !selectedId) return;
    socket.emit('dispute:join-thread', { disputeId: selectedId });
    return () => {
      socket.emit('dispute:leave-thread', { disputeId: selectedId });
    };
  }, [selectedId]);

  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: any[] = [];
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.append('file', file);
        const res = await disputesAPI.uploadAttachment(data);
        if (res.data?.data) uploaded.push(res.data.data);
      }
      setAttachments((prev) => [...prev, ...uploaded].slice(0, 5));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Attachment upload failed');
    } finally {
      setUploading(false);
    }
  };

  const send = async () => {
    if (!selectedId || (!message.trim() && !attachments.length)) return;
    setSending(true);
    try {
      await disputesAPI.sendMessage(selectedId, { message: message.trim(), attachments });
      setMessage('');
      setAttachments([]);
      await loadDetail(selectedId);
      toast.success('Dispute message sent');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const adminUpdate = async (nextStatus: 'IN_REVIEW' | 'RESOLVED' | 'CLOSED') => {
    if (!selectedId) return;
    let resolution = '';
    if (nextStatus === 'RESOLVED' || nextStatus === 'CLOSED') {
      resolution = window.prompt('Resolution note') || '';
    }
    try {
      await disputesAPI.adminUpdate(selectedId, { status: nextStatus, resolution });
      toast.success('Dispute updated');
      await loadDetail(selectedId);
      await loadList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update dispute');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5 gap-3">
          <h1 className="text-2xl font-bold text-nvm-dark-900">{isAdminRoute ? 'Admin Dispute Center' : 'My Disputes'}</h1>
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">All</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            {!isAdminRoute && (
              <Link to="/orders" className="text-sm text-nvm-green-primary font-semibold">Back to Orders</Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 max-h-[72vh] overflow-auto">
            {loading ? <div className="p-3 text-sm text-gray-600">Loading disputes...</div> : disputes.map((item) => (
              <button
                key={item._id}
                onClick={() => setSelectedId(item._id)}
                className={`w-full text-left border rounded-lg p-3 mb-2 ${selectedId === item._id ? 'border-nvm-green-primary bg-green-50' : 'border-gray-200'}`}
              >
                <p className="font-semibold text-sm">Order #{item.order?.orderNumber || '-'}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.reason}</p>
                <p className="text-xs mt-1 font-medium text-gray-700">{item.status}</p>
              </button>
            ))}
            {!loading && !disputes.length && <div className="p-3 text-sm text-gray-500">No disputes found.</div>}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[72vh] flex flex-col">
            {!selectedDispute ? (
              <div className="h-full grid place-items-center text-gray-500 text-sm">Select a dispute to view thread.</div>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{selectedDispute.order?.orderNumber || '-'}</p>
                      <p className="text-sm text-gray-600">Reason: {selectedDispute.reason}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{selectedDispute.status}</span>
                  </div>
                  {isAdminRoute && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => adminUpdate('IN_REVIEW')} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">In Review</button>
                      <button onClick={() => adminUpdate('RESOLVED')} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs">Resolve</button>
                      <button onClick={() => adminUpdate('CLOSED')} className="px-3 py-1.5 bg-gray-700 text-white rounded text-xs">Close</button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto space-y-3 bg-gray-50 rounded-lg p-3">
                  {(messages || []).map((item: any) => (
                    <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{item.senderRole} {item.sender?.name ? `- ${item.sender.name}` : ''}</p>
                      {item.message && <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.message}</p>}
                      {!!item.attachments?.length && (
                        <div className="mt-2 space-y-1">
                          {item.attachments.map((att: any, idx: number) => (
                            <a key={`${item._id}-${idx}`} href={att.url} target="_blank" rel="noreferrer" className="text-xs text-nvm-green-primary underline block">
                              {att.fileName || 'Attachment'}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  {!messages.length && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      No thread messages yet.
                    </div>
                  )}
                </div>

                <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[88px]"
                    placeholder="Send dispute update..."
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />} Attach files
                      <input type="file" className="hidden" multiple onChange={(e) => uploadFiles(e.target.files)} />
                    </label>
                    {!!attachments.length && (
                      <span className="text-xs text-gray-600">{attachments.length} file(s) attached</span>
                    )}
                    <button
                      onClick={send}
                      disabled={sending || (!message.trim() && !attachments.length)}
                      className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-nvm-green-primary text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
