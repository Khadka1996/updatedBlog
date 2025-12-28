// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter, useParams } from 'next/navigation';

// export default function ChatPage() {
//   const params = useParams();
//   const deviceId = params.id;
//   const router = useRouter();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [deviceInfo, setDeviceInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch device info
//         const deviceRes = await fetch(`/api/chat/staff/users/${deviceId}`);
//         if (!deviceRes.ok) throw new Error('Failed to fetch device info');
//         const deviceData = await deviceRes.json();
//         setDeviceInfo(deviceData.user);

//         // Fetch messages
//         const messagesRes = await fetch(`/api/chat/staff/conversation/${deviceId}`);
//         if (!messagesRes.ok) throw new Error('Failed to fetch messages');
//         const messagesData = await messagesRes.json();
//         setMessages(messagesData.messages);

//         // Mark messages as read
//         if (messagesData.unreadCount > 0) {
//           await fetch(`/api/chat/staff/users/${deviceId}/mark-read`, {
//             method: 'PATCH'
//           });
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000);

//     return () => clearInterval(interval);
//   }, [deviceId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     try {
//       const res = await fetch('/api/chat/staff/send', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content: newMessage,
//           deviceId
//         }),
//       });

//       if (!res.ok) throw new Error('Failed to send message');

//       const sentMessage = await res.json();
//       setMessages([...messages, sentMessage]);
//       setNewMessage('');
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleBlockToggle = async () => {
//     try {
//       const res = await fetch('/api/chat/device/block', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           deviceId,
//           isBlocked: !deviceInfo.isBlocked
//         }),
//       });

//       if (!res.ok) throw new Error('Failed to update block status');

//       const updatedDevice = await res.json();
//       setDeviceInfo(updatedDevice);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleRename = async (newName) => {
//     if (!newName.trim() || newName === deviceInfo.nickname) return;

//     try {
//       const res = await fetch('/api/chat/device/rename', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           deviceId,
//           newName
//         }),
//       });

//       if (!res.ok) throw new Error('Failed to rename device');

//       const updatedDevice = await res.json();
//       setDeviceInfo(updatedDevice);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   if (loading) return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//     </div>
//   );

//   if (error) return (
//     <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto mt-10">
//       Error: {error}
//     </div>
//   );

//   if (!deviceInfo) return (
//     <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg max-w-md mx-auto mt-10">
//       Device not found
//     </div>
//   );

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm p-4 border-b border-gray-200">
//         <div className="flex items-center justify-between max-w-4xl mx-auto">
//           <button 
//             onClick={() => router.back()}
//             className="flex items-center text-blue-600 hover:text-blue-800"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
//             </svg>
//             Back
//           </button>
          
//           <div className="text-center">
//             <h2 className="text-xl font-semibold text-gray-800">{deviceInfo.nickname}</h2>
//             <p className="text-xs text-gray-500">ID: {deviceInfo._id}</p>
//           </div>
          
//           <div className="flex space-x-2">
//             <button 
//               onClick={() => {
//                 const newName = prompt('Enter new name:', deviceInfo.nickname);
//                 if (newName) handleRename(newName);
//               }}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
//             >
//               Rename
//             </button>
//             <button 
//               onClick={handleBlockToggle}
//               className={`px-3 py-1 rounded text-sm font-medium ${
//                 deviceInfo.isBlocked 
//                   ? 'bg-green-100 hover:bg-green-200 text-green-800' 
//                   : 'bg-red-100 hover:bg-red-200 text-red-800'
//               }`}
//             >
//               {deviceInfo.isBlocked ? 'Unblock' : 'Block'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
//         {messages.length > 0 ? (
//           messages.map((message) => (
//             <div 
//               key={message._id} 
//               className={`mb-4 flex ${
//                 message.senderType === 'guest' ? 'justify-start' : 'justify-end'
//               }`}
//             >
//               <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${
//                 message.senderType === 'guest' 
//                   ? 'bg-white border border-gray-200' 
//                   : 'bg-blue-500 text-white'
//               }`}>
//                 <div className="flex justify-between items-baseline mb-1">
//                   <span className={`text-sm font-medium ${
//                     message.senderType === 'guest' ? 'text-gray-800' : 'text-blue-100'
//                   }`}>
//                     {message.senderName}
//                   </span>
//                   <span className={`text-xs ${
//                     message.senderType === 'guest' ? 'text-gray-500' : 'text-blue-100'
//                   }`}>
//                     {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>
//                 </div>
//                 <p className="text-sm">{message.content}</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             No messages yet
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="bg-white border-t border-gray-200 p-4">
//         <form 
//           onSubmit={handleSendMessage} 
//           className="max-w-4xl mx-auto flex space-x-2"
//         >
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             disabled={deviceInfo.isBlocked}
//           />
//           <button 
//             type="submit" 
//             className={`px-4 py-2 rounded-lg font-medium ${
//               !newMessage.trim() || deviceInfo.isBlocked
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 : 'bg-blue-600 hover:bg-blue-700 text-white'
//             }`}
//             disabled={!newMessage.trim() || deviceInfo.isBlocked}
//           >
//             Send
//           </button>
//         </form>
//         {deviceInfo.isBlocked && (
//           <p className="text-center text-sm text-red-500 mt-2">
//             This device is blocked and cannot receive messages
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }