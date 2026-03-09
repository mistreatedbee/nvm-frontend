import React, { useState } from 'react';
import { Bot, Loader2, Send, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '../../lib/api';
import { Message } from '../../lib/chatTypes';

interface VendorAssistantModalProps {
  open: boolean;
  onClose: () => void;
}

interface BotEntry {
  id: string;
  role: 'Vendor' | 'Bot' | 'System';
  content: string;
  createdAt: string;
}

export function VendorAssistantModal({ open, onClose }: VendorAssistantModalProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [entries, setEntries] = useState<BotEntry[]>([]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');

    const vendorEntry: BotEntry = {
      id: `local-${Date.now()}`,
      role: 'Vendor',
      content: text,
      createdAt: new Date().toISOString()
    };
    setEntries(prev => [...prev, vendorEntry]);

    try {
      setSending(true);
      const response = await chatAPI.sendBotMessage({
        conversationId,
        message: text
      });

      const payload = response.data.data;
      const resolvedConversationId = payload?.conversation?._id || conversationId;
      if (resolvedConversationId) {
        setConversationId(resolvedConversationId);
      }

      const botMessage: Message | undefined = payload?.botMessage;
      if (botMessage) {
        setEntries(prev => [
          ...prev,
          {
            id: botMessage._id,
            role: botMessage.senderRole === 'Bot' ? 'Bot' : 'System',
            content: botMessage.messageContent,
            createdAt: botMessage.createdAt
          }
        ]);
      }

      if (payload?.escalated) {
        toast.success('Escalated to admin support.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Assistant unavailable right now');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[1px] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-nvm-green-primary to-nvm-green-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <p className="font-semibold">AI Assistant</p>
          </div>
          <button onClick={onClose} className="text-white/90 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {entries.length === 0 ? (
            <div className="text-sm text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg p-3">
              Ask about orders, products, payments, profiles, or support. Unresolved issues are escalated automatically.
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className={`flex ${entry.role === 'Vendor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${entry.role === 'Vendor' ? 'bg-nvm-green-primary text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  <div className="text-[11px] opacity-75 mb-1">{entry.role}</div>
                  <div>{entry.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSubmit} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the assistant..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-nvm-green-primary text-white text-sm font-medium disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
