'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon, UserCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

// Import notification sound
const notificationSound = '/notification.wav';

// Helper function to generate safe device IDs (client-side only)
const generateDeviceId = () => {
  if (typeof window === 'undefined') return 'temp-device-id'; // Fallback for SSR
  try {
    return crypto.randomUUID();
  } catch {
    return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
};

// Helper function to generate safe default names (client-side only)
const generateDefaultName = (deviceId) => {
  if (typeof window === 'undefined') return 'Guest'; // Fallback for SSR
  return deviceId 
    ? `Guest-${deviceId.slice(-4).replace(/[^a-z0-9]/gi, '')}` 
    : `Guest-${Math.random().toString(36).substring(2, 6)}`;
};

// Format date consistently (avoid locale issues)
const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  // Use fixed format (e.g., HH:mm) to avoid locale mismatches
  return date.toISOString().slice(11, 16); // e.g., "14:30"
};

export default function GuestChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const lastMessageTimeRef = useRef(new Date(0).toISOString());
  const nicknameInputRef = useRef(null);

  // Initialize device and load messages (client-side only)
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setError(null);
        
        // Get or generate device ID
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId || !deviceId.match(/^[a-z0-9-]{8,}$/)) {
          deviceId = generateDeviceId();
          localStorage.setItem('deviceId', deviceId);
        }

        // Get or generate device name
        let deviceName = localStorage.getItem('deviceName');
        if (!deviceName || deviceName.length < 4) {
          deviceName = generateDefaultName(deviceId);
          localStorage.setItem('deviceName', deviceName);
        }

        // Get sound preference
        const soundPref = localStorage.getItem('soundEnabled');
        if (soundPref !== null) {
          setSoundEnabled(soundPref === 'true');
        }

        // Initialize audio
        audioRef.current = new Audio(notificationSound);
        audioRef.current.preload = 'auto';
        audioRef.current.addEventListener('error', () => {
          console.warn('Notification sound not found');
          setError('Notification sound unavailable.');
          setSoundEnabled(false);
          localStorage.setItem('soundEnabled', 'false');
        });
        try {
          const res = await fetch(notificationSound, { method: 'HEAD' });
          if (!res.ok) {
            setSoundEnabled(false);
            localStorage.setItem('soundEnabled', 'false');
            throw new Error('Sound file unavailable');
          }
        } catch {
          setSoundEnabled(false);
          localStorage.setItem('soundEnabled', 'false');
        }
        audioRef.current.load();

        // Set device info
        setDeviceInfo({ id: deviceId, name: deviceName });
        setNewNickname(deviceName);

        // Load initial messages
        await loadMessages(deviceId, 1);
      } catch (err) {
        console.error('Initialization error:', err);
        setDeviceInfo({
          id: generateDeviceId(),
          name: generateDefaultName(null)
        });
        setError('Chat initialized with temporary session.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  // Setup polling
  useEffect(() => {
    if (!isLoading && deviceInfo?.id) {
      const pollInterval = setInterval(() => pollNewMessages(), 10000);
      return () => clearInterval(pollInterval);
    }
  }, [isLoading, deviceInfo?.id]);

  // Focus nickname input
  useEffect(() => {
    if (showNicknameModal && nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  }, [showNicknameModal]);

  // Handle errors
  const setPersistentError = (message, isCritical = false) => {
    setError({ message, isCritical });
    if (!isCritical) {
      setTimeout(() => setError(null), 5000);
    }
  };

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.warn('Audio playback failed:', e);
        if (e.name === 'NotAllowedError') {
          setPersistentError('Audio playback blocked by browser.');
        }
      });
    }
  }, [soundEnabled]);

  const loadMessages = async (deviceId, page = 1, reset = false) => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        since: reset ? new Date(0).toISOString() : lastMessageTimeRef.current
      });
      const response = await fetch(`/api/chat/guest/conversation?${params}`, {
        headers: {
          'Device-ID': deviceId,
          'User-Agent': navigator.userAgent
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setIsBlocked(true);
          setPersistentError('Your device is blocked.', true);
          return;
        }
        if (response.status === 429) {
          setPersistentError('Too many requests. Please wait a minute.', true);
          return;
        }
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error('Invalid response format');
      }

      setMessages(prev => reset ? data.messages.reverse() : [...data.messages.reverse(), ...prev]);
      setPagination({
        page: data.pagination.currentPage,
        limit: data.pagination.limit,
        totalPages: data.pagination.totalPages
      });
      if (data.messages.length > 0) {
        lastMessageTimeRef.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch (err) {
      console.error('loadMessages:', err);
      setPersistentError(`Failed to load messages: ${err.message}`);
    }
  };

  const pollNewMessages = useCallback(async () => {
    try {
      if (!deviceInfo?.id || isBlocked) return;

      const response = await fetch(`/api/chat/guest/conversation?since=${encodeURIComponent(lastMessageTimeRef.current)}`, {
        headers: {
          'Device-ID': deviceInfo.id,
          'User-Agent': navigator.userAgent
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setIsBlocked(true);
          setPersistentError('Your device is blocked.', true);
          return;
        }
        if (response.status === 429) {
          setPersistentError('Too many requests. Please wait a minute.', true);
          return;
        }
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(prev => {
          const newMessages = data.messages.filter(
            newMsg => !prev.some(existingMsg => existingMsg.createdAt === newMsg.createdAt)
          );
          if (newMessages.length > 0) {
            playNotificationSound();
            lastMessageTimeRef.current = newMessages[newMessages.length - 1].createdAt;
            return [...prev, ...newMessages];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('pollNewMessages:', err);
      setPersistentError(`Failed to fetch new messages: ${err.message}`);
    }
  }, [deviceInfo?.id, playNotificationSound, isBlocked]);

  const sendMessage = async () => {
    const content = inputMessage.trim();
    if (!content || !deviceInfo?.id || isSending || isBlocked) return;

    setIsSending(true);
    setError(null);

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content,
      senderType: 'guest',
      senderName: deviceInfo.name,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/chat/guest/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Device-ID': deviceInfo.id,
          'User-Agent': navigator.userAgent
        },
        body: JSON.stringify({ 
          content,
          recipientType: 'admin'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setIsBlocked(true);
          setPersistentError('Your device is blocked.', true);
        } else if (response.status === 429) {
          setPersistentError('Too many messages sent. Please wait a minute.', true);
        } else {
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        return;
      }

      const newMessage = await response.json();
      setMessages(prev => prev.map(msg => msg._id === tempMessage._id ? newMessage : msg));
      lastMessageTimeRef.current = newMessage.createdAt;
      setInputMessage('');
    } catch (err) {
      console.error('sendMessage:', err);
      setPersistentError(`Failed to send message: ${err.message}`);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    } finally {
      setIsSending(false);
    }
  };

  const updateNickname = async () => {
    const updatedName = newNickname.trim();
    if (!updatedName || updatedName.length < 3 || updatedName.length > 50) {
      setPersistentError('Name must be 3-50 characters long');
      return;
    }

    try {
      const response = await fetch('/api/chat/device/rename', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Device-ID': deviceInfo.id
        },
        body: JSON.stringify({ deviceId: deviceInfo.id, newName: updatedName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      localStorage.setItem('deviceName', updatedName);
      setDeviceInfo(prev => ({ ...prev, name: updatedName }));
      setShowNicknameModal(false);
      setNewNickname(updatedName);
    } catch (err) {
      console.error('updateNickname:', err);
      setPersistentError(`Failed to update name: ${err.message}`);
    }
  };

  const loadMoreMessages = async () => {
    if (pagination.page >= pagination.totalPages) return;
    await loadMessages(deviceInfo.id, pagination.page + 1);
  };

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    localStorage.setItem('soundEnabled', newSoundState.toString());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-lg font-semibold">Your device is blocked.</p>
          <p className="text-gray-600">Please contact support for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <audio ref={audioRef} src={notificationSound} preload="auto" />
      
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Support Chat</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleSound}
              className="p-1 rounded-full hover:bg-blue-700 transition-colors"
              title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
              aria-label={soundEnabled ? "Mute notifications" : "Unmute notifications"}
            >
              {soundEnabled ? (
                <SpeakerWaveIcon className="w-5 h-5" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={() => setShowNicknameModal(true)}
              className="flex items-center space-x-1 bg-blue-700 px-3 py-1 rounded-full text-sm"
              aria-label="Change display name"
            >
              <UserCircleIcon className="w-4 h-4" />
              <span>{deviceInfo?.name || 'Guest'}</span>
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 flex justify-between items-center">
          <p className="text-sm">{error.message}</p>
          {!error.isCritical && (
            <button
              onClick={() => setError(null)}
              className="text-sm font-semibold"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 container mx-auto">
        {pagination.page < pagination.totalPages && (
          <button
            onClick={loadMoreMessages}
            className="mx-auto block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
          >
            Load More Messages
          </button>
        )}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Send your first message to start chatting!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message._id || `${message.createdAt}-${index}`} 
              className={`flex ${message.senderType === 'guest' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                  message.senderType === 'guest'
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                {message.senderType !== 'guest' && (
                  <p className="font-semibold text-xs mb-1">
                    {message.senderName || 'Support'}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p 
                  className={`text-xs mt-1 flex items-center space-x-1 ${
                    message.senderType === 'guest' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  <span>{formatMessageTime(message.createdAt)}</span>
                  {message.senderType === 'guest' && (
                    <span>{message.read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending || isBlocked}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            aria-label="Type your message"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isSending || isBlocked}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full p-2 w-12 h-12 flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {isSending ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {showNicknameModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-labelledby="nickname-modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 id="nickname-modal-title" className="text-xl font-bold mb-4">Set Your Display Name</h2>
            <input
              ref={nicknameInputRef}
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && updateNickname()}
              placeholder="Enter your display name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              maxLength={50}
              aria-label="Enter your display name"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNicknameModal(false);
                  setNewNickname(deviceInfo.name);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={updateNickname}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                aria-label="Save display name"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}