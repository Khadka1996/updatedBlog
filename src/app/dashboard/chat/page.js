'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminChatDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDevices, setExpandedDevices] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1
  });

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/messages/received', {
        params: { page, limit: pagination.limit }
      });
      
      // Group messages by device and track replies
      const grouped = response.data.messages.reduce((acc, message) => {
        if (!acc[message.deviceId]) {
          acc[message.deviceId] = {
            deviceId: message.deviceId,
            senderName: message.senderName,
            lastMessage: message.createdAt,
            messages: [],
            unreadCount: 0
          };
        }
        
        // Find if this message is a reply to another message
        if (message.replyTo) {
          const repliedMessage = response.data.messages.find(m => m._id === message.replyTo);
          if (repliedMessage) {
            message.repliedContent = repliedMessage.content;
          }
        }
        
        acc[message.deviceId].messages.push(message);
        if (!message.read) acc[message.deviceId].unreadCount++;
        return acc;
      }, {});
      
      setDevices(Object.values(grouped));
      setPagination({
        page,
        limit: pagination.limit,
        totalPages: response.data.pagination.totalPages
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleDevice = (deviceId) => {
    setExpandedDevices(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  const markAllAsRead = async (deviceId) => {
    try {
      await axios.patch(`/api/chat/users/${deviceId}/mark-read`);
      setDevices(prev => prev.map(device => 
        device.deviceId === deviceId 
          ? { ...device, unreadCount: 0, messages: device.messages.map(m => ({ ...m, read: true })) } 
          : device
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark all as read');
    }
  };

  const startReply = (message) => {
    setReplyingTo(message);
    setReplyContent('');
    // Scroll to reply input if needed
    document.getElementById('reply-input')?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    
    try {
      const replyMessage = {
        content: replyContent,
        deviceId: replyingTo.deviceId,
        senderType: 'admin',
        replyTo: replyingTo._id
      };
      
      await axios.post('/api/chat/send', replyMessage);
      
      setReplyingTo(null);
      setReplyContent('');
      fetchMessages(pagination.page); // Refresh messages
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Guest Messages</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              Admin View
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {devices.length} Devices
            </span>
          </div>
        </div>
        
        {devices.length === 0 ? (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="mt-2 text-gray-500">No messages found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map(device => (
              <div key={device.deviceId} className="border rounded-lg overflow-hidden">
                <div 
                  className={`p-4 cursor-pointer flex justify-between items-center ${device.unreadCount > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}
                  onClick={() => toggleDevice(device.deviceId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${device.unreadCount > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-800">{device.senderName}</h3>
                      <p className="text-xs text-gray-500">Device ID: {device.deviceId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {device.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {device.unreadCount} unread
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      Last: {new Date(device.lastMessage).toLocaleString()}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead(device.deviceId);
                      }}
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition"
                    >
                      Mark all read
                    </button>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedDevices[device.deviceId] ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {expandedDevices[device.deviceId] && (
                  <div className="divide-y">
                    {device.messages.map(message => (
                      <div 
                        key={message._id} 
                        className={`p-4 ${message.read ? 'bg-white' : 'bg-blue-50'} ${message.senderType === 'admin' ? 'border-l-4 border-blue-500' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                            {message.senderType === 'admin' && ' (You)'}
                          </span>
                          {!message.read && message.senderType !== 'admin' && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        
                        {/* Show replied message if this is a reply */}
                        {message.repliedContent && (
                          <div className="bg-gray-100 p-2 mb-2 rounded text-sm text-gray-600 border-l-2 border-gray-400 italic">
                            <p>Replying to: {message.repliedContent}</p>
                          </div>
                        )}
                        
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Reply button for guest messages */}
                        {message.senderType !== 'admin' && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => startReply(message)}
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Reply input when replying to a message */}
                    {replyingTo?.deviceId === device.deviceId && (
                      <div id="reply-input" className="p-4 bg-gray-50 border-t">
                        <div className="mb-2 text-sm text-gray-500">
                          Replying to: {replyingTo.content}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={sendReply}
                            disabled={!replyContent.trim()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {devices.length > 0 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button 
              onClick={() => fetchMessages(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded flex items-center ${pagination.page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => fetchMessages(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={`px-4 py-2 rounded flex items-center ${pagination.page >= pagination.totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatDashboard;