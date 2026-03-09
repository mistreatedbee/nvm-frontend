import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { chatAPI } from '../lib/api';
import { Conversation, Message } from '../lib/chatTypes';

export function AdminSupportChats() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => conversations.find(c => c._id === selectedId) || null,
    [conversations, selectedId]
  );

  const fetchChats = async () => {
    try {
      setLoadingList(true);
      const response = await chatAPI.getAdminEscalatedChats();
      const data: Conversation[] = response.data.data || [];
      setConversations(data);
      if (!selectedId && data.length) {
        setSelectedId(data[0]._id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load escalated chats');
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedId) return;
    try {
      setLoadingMessages(true);
      const response = await chatAPI.getMessages({ conversationId: selectedId, limit: 100 });
      setMessages(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedId]);

  const updateStatus = async (status: 'Open' | 'In Progress' | 'Resolved') => {
    if (!selectedId) return;
    try {
      setSaving(true);
      await chatAPI.updateAdminChatStatus(selectedId, { status });
      toast.success(`Status updated to ${status}`);
      await fetchChats();
      await fetchMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !reply.trim() || saving) return;

    try {
      setSaving(true);
      await chatAPI.sendAdminMessage(selectedId, {
        messageContent: reply.trim(),
        messageType: 'text'
      });
      setReply('');
      await fetchChats();
      await fetchMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send admin message');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-display font-bold text-gray-900">Escalated Support Chats</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)] min-h-[560px]">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-y-auto">
            {loadingList ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No escalated chats.</div>
            ) : (
              conversations.map(conversation => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedId(conversation._id)}
                  className={`w-full text-left p-4 border-b border-gray-100 ${selectedId === conversation._id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {(conversation.vendorId as any)?.storeName || 'Vendor'}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {conversation.supportStatus || 'Open'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conversation.escalationReason || 'Escalated conversation'}</p>
                  {Boolean((conversation.orderId as any)?.orderNumber) && (
                    <p className="text-[11px] text-gray-500 mt-1">Order #{(conversation.orderId as any).orderNumber}</p>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
            {!selected ? (
              <div className="h-full grid place-items-center text-gray-500">Select an escalated chat.</div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{(selected.vendorId as any)?.storeName || 'Vendor Support'}</p>
                    <p className="text-xs text-gray-500">{selected.escalationReason || 'Escalated to admin'}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => updateStatus('Open')} disabled={saving} className="px-3 py-1 text-xs rounded-lg border border-gray-300">Open</button>
                    <button onClick={() => updateStatus('In Progress')} disabled={saving} className="px-3 py-1 text-xs rounded-lg border border-blue-300 text-blue-700">In Progress</button>
                    <button onClick={() => updateStatus('Resolved')} disabled={saving} className="px-3 py-1 text-xs rounded-lg border border-green-300 text-green-700">Resolved</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                  {loadingMessages ? (
                    <div className="text-sm text-gray-500">Loading messages...</div>
                  ) : messages.map(message => (
                    <div key={message._id} className={`flex ${message.senderRole === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.senderRole === 'Admin' ? 'bg-nvm-green-primary text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                        <div className="text-[11px] opacity-75 mb-1">{message.senderRole}</div>
                        <div className="whitespace-pre-wrap">{message.messageContent}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendReply} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply as Admin"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || saving}
                    className="rounded-xl px-4 py-2 bg-nvm-green-primary text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
