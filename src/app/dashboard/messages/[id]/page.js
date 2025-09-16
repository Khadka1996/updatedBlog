// app/dashboard/messages/[id]/page.js
'use client'
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaReply, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import { format } from 'date-fns';

export default function MessageDetails({ params }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const router = useRouter();
  
  // Unwrap the params promise
  const { id } = use(params);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`/api/messages/${id}`);
        const data = await res.json();
        if (res.ok) {
          setMessage(data.data);
          // Mark as read if not already
          if (data.data.status === 'new') {
            await fetch(`/api/messages/${id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'read' })
            });
          }
        } else {
          throw new Error(data.message || 'Failed to fetch message');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]); // Now using the unwrapped id

  // ... rest of your component code remains the same
  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const res = await fetch(`/api/messages/${message._id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseText: replyContent })
      });
      
      if (res.ok) {
        router.refresh();
        setReplyContent('');
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12 text-gray-500">
        Message not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">
            {message.name} - {message.service}
          </h1>
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-600">From:</p>
              <p>{message.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Phone:</p>
              <p>{message.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Date:</p>
              <p>{format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Status:</p>
              <p className="capitalize">{message.status}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-600 mb-2">Message:</p>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          {message.responseText && (
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-600 mb-2">Response:</p>
              <div className="bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">
                {message.responseText}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-600 mb-2">Reply:</p>
            <textarea
              className="w-full border rounded-lg p-3 mb-4 min-h-[150px]"
              placeholder="Type your response here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button
              onClick={handleReply}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <FaReply /> Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}