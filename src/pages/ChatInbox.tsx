import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Loader2, MessageCircle, Send, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { chatAPI } from '../lib/api';
import { connectChatSocket, disconnectChatSocket, getChatSocket } from '../lib/chatSocket';
import { Conversation, Message } from '../lib/chatTypes';
import { useAuthStore } from '../lib/store';

function getId(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || null;
}

function getDisplayName(conversation: Conversation, currentUserId?: string) {
  const customer = conversation.customerId as any;
  const vendorUser = conversation.vendorUserId as any;
  const vendor = conversation.vendorId as any;

  if (customer && getId(customer) !== currentUserId) return customer?.name || 'Customer';
  if (vendorUser && getId(vendorUser) !== currentUserId) return vendorUser?.name || vendor?.storeName || 'Vendor';
  return vendor?.storeName || customer?.name || 'Conversation';
}

function getSenderId(message: Message): string | null {
  if (!message.senderId) return null;
  return typeof message.senderId === 'string' ? message.senderId : (message.senderId as any)._id;
}

export function ChatInbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingLabel, setTypingLabel] = useState('');

  const typingTimeoutRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didBootstrapFromQuery = useRef(false);

  const selectedConversation = useMemo(
    () => conversations.find(c => c._id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const ensureConversationFromQuery = async () => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setSelectedConversationId(conversationId);
      return;
    }

    const vendorId = searchParams.get('vendorId');
    const participantId = searchParams.get('participantId');
    const orderId = searchParams.get('orderId');
    const type = (searchParams.get('type') || (orderId ? 'order' : 'general')) as 'general' | 'order' | 'support';

    if (!vendorId && !participantId && !orderId) {
      return;
    }

    try {
      const payload: Record<string, string> = { type };
      if (vendorId) payload.vendorId = vendorId;
      if (participantId) payload.participantId = participantId;
      if (orderId) payload.orderId = orderId;

      const response = await chatAPI.createConversation(payload);
      const created = response.data.data as Conversation;
      setSelectedConversationId(created._id);

      await loadConversations();

      setSearchParams(new URLSearchParams());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to open conversation');
    }
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await chatAPI.getConversations({ limit: 50 });
      const list: Conversation[] = response.data.data || [];
      setConversations(list);

      if (!selectedConversationId && list.length > 0) {
        setSelectedConversationId(list[0]._id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (reset: boolean) => {
    if (!selectedConversationId) return;

    try {
      if (reset) {
        setLoadingMessages(true);
      } else {
        setLoadingOlder(true);
      }

      const response = await chatAPI.getMessages({
        conversationId: selectedConversationId,
        limit: 30,
        before: !reset ? nextCursor || undefined : undefined
      });

      const data: Message[] = response.data.data || [];
      const cursor: string | null = response.data.nextCursor || null;

      if (reset) {
        setMessages(data);
      } else {
        setMessages(prev => [...data, ...prev]);
      }

      setNextCursor(cursor);

      const unreadByMe = data.filter(
        msg => !msg.readAt && getSenderId(msg) && getSenderId(msg) !== user?._id
      );
      if (unreadByMe.length) {
        await Promise.all(
          unreadByMe.map(msg => chatAPI.markMessageRead(msg._id).catch(() => null))
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
      setLoadingOlder(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    loadConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!didBootstrapFromQuery.current && conversations.length >= 0) {
      didBootstrapFromQuery.current = true;
      ensureConversationFromQuery();
    }
  }, [conversations.length]);

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(true);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!token) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    const onNewMessage = (payload: { conversationId: string; message: Message }) => {
      if (payload.conversationId !== selectedConversationId) return;
      setMessages(prev => [...prev, payload.message]);
    };

    const onMessageRead = (payload: { messageId: string; readAt: string }) => {
      setMessages(prev => prev.map(m => (m._id === payload.messageId ? { ...m, readAt: payload.readAt } : m)));
    };

    const onTyping = (payload: { conversationId: string; userId: string; typing: boolean }) => {
      if (payload.conversationId !== selectedConversationId) return;
      if (payload.userId === user?._id) return;
      setTypingLabel(payload.typing ? 'Typing...' : '');
    };

    socket.on('chat:new-message', onNewMessage);
    socket.on('chat:message-read', onMessageRead);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.off('chat:message-read', onMessageRead);
      socket.off('chat:typing', onTyping);
    };
  }, [token, selectedConversationId, user?._id]);

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket || !selectedConversationId) return;

    socket.emit('chat:join-conversation', { conversationId: selectedConversationId });
    return () => {
      socket.emit('chat:leave-conversation', { conversationId: selectedConversationId });
    };
  }, [selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);

  const handleTyping = (text: string) => {
    setMessageInput(text);

    const socket = getChatSocket();
    if (socket && selectedConversationId) {
      socket.emit('chat:typing', { conversationId: selectedConversationId, typing: true });
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      const runningSocket = getChatSocket();
      if (runningSocket && selectedConversationId) {
        runningSocket.emit('chat:typing', { conversationId: selectedConversationId, typing: false });
      }
    }, 1000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversationId || sending) return;

    try {
      setSending(true);
      await chatAPI.sendMessage({
        conversationId: selectedConversationId,
        messageContent: messageInput.trim(),
        messageType: 'text'
      });
      setMessageInput('');
      const socket = getChatSocket();
      if (socket) {
        socket.emit('chat:typing', { conversationId: selectedConversationId, typing: false });
      }
      await loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const senderIsMe = (message: Message) => {
    const senderId = getSenderId(message);
    return Boolean(senderId && user?._id && senderId === user._id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-nvm-dark-900">Messages</h1>
          {user?.role === 'admin' && (
            <Link to="/admin/chats" className="text-sm text-nvm-green-primary font-semibold hover:underline">
              Escalated Support Chats
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)] min-h-[560px]">
          <section className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <p className="font-semibold text-gray-800">Conversations</p>
            </div>

            <div className="h-[calc(100%-52px)] overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 text-gray-500 text-sm">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
              ) : (
                conversations.map(conversation => {
                  const active = selectedConversationId === conversation._id;
                  return (
                    <button
                      key={conversation._id}
                      onClick={() => setSelectedConversationId(conversation._id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition ${active ? 'bg-nvm-green-primary/10' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                          {getDisplayName(conversation, user?._id)}
                        </p>
                        {conversation.supportStatus && conversation.isEscalated && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {conversation.supportStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {conversation.lastMessageAt
                          ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                          : 'just now'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            {!selectedConversation ? (
              <div className="h-full grid place-items-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3" />
                  <p>Select a conversation to start chatting.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <p className="font-semibold text-gray-900">{getDisplayName(selectedConversation, user?._id)}</p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.type === 'order' && (selectedConversation.orderId as any)?.orderNumber
                      ? `Order #${(selectedConversation.orderId as any).orderNumber} - ${
                          (selectedConversation.orderId as any).status || selectedConversation.orderStatusSnapshot || 'status unavailable'
                        }`
                      : selectedConversation.type === 'support'
                      ? `Support chat - ${selectedConversation.supportStatus || 'Open'}`
                      : 'General inquiry'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                  {loadingMessages ? (
                    <div className="text-sm text-gray-500">Loading messages...</div>
                  ) : (
                    <>
                      {nextCursor && (
                        <button
                          onClick={() => loadMessages(false)}
                          disabled={loadingOlder}
                          className="mx-auto block text-xs text-nvm-green-primary font-semibold hover:underline disabled:opacity-50"
                        >
                          {loadingOlder ? 'Loading...' : 'Load older messages'}
                        </button>
                      )}

                      {messages.map(message => {
                        const mine = senderIsMe(message);
                        const isSystem = message.senderRole === 'System' || message.messageType === 'system';
                        return (
                          <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                                isSystem
                                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                                  : mine
                                  ? 'bg-nvm-green-primary text-white'
                                  : message.senderRole === 'Bot'
                                  ? 'bg-amber-50 border border-amber-200 text-gray-900'
                                  : 'bg-white border border-gray-200 text-gray-900'
                              }`}
                            >
                              <div className="text-[11px] opacity-75 mb-1">{message.senderRole}</div>
                              <div className="whitespace-pre-wrap break-words">{message.messageContent}</div>
                              <div className="text-[10px] opacity-70 mt-1 flex justify-between gap-2">
                                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {mine && <span>{message.readAt ? 'Read' : 'Sent'}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {typingLabel && (
                        <div className="text-xs text-gray-500 px-2">{typingLabel}</div>
                      )}

                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                  <input
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="rounded-xl px-4 py-2 bg-nvm-green-primary text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
