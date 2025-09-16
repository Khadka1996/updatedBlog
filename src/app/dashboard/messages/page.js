'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaSearch, 
  FaSpinner, 
  FaFilter,
  FaReply,
  FaTrash
} from 'react-icons/fa';

export default function ServiceMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (res.ok) {
        setMessages(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.service?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateMessageStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/messages/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchMessages(); // Refresh the messages after status update
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchMessages(); // Refresh the messages after deletion
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Service Messages</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <tr 
                      key={message._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        message.status === 'new' ? 'bg-blue-50 font-semibold' : 'bg-white'
                      }`}
                      onClick={() => router.push(`/dashboard/messages/${message._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {message.status === 'new' ? (
                            <FaEnvelope className="text-blue-500 mr-2" />
                          ) : (
                            <FaEnvelopeOpen className="text-gray-400 mr-2" />
                          )}
                          <span className={message.status === 'new' ? 'text-gray-900' : 'text-gray-700'}>
                            {message.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${message.status === 'new' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${message.status === 'new' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={message.status}
                          onChange={(e) => updateMessageStatus(message._id, e.target.value)}
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded ${
                            message.status === 'new' ? 'bg-red-100 text-red-800' :
                            message.status === 'read' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'responded' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${message.status === 'new' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard//messages/${message._id}`);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="View"
                        >
                          <FaReply />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {messages.length === 0 ? 'No messages yet' : 'No messages match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}