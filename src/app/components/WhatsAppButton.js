'use client';

import { useEffect, useState, useRef } from 'react';
import { FaWhatsapp, FaTimes, FaRobot, FaVolumeUp } from 'react-icons/fa';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState([]); // Start with empty messages
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Play sound and show welcome message when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      // Show welcome message with delay
      setTimeout(() => {
        setShowWelcome(true);
        setMessages([{
          id: 1,
          text: "Hello! I'm your AI assistant. Would you like to chat with us on WhatsApp?",
          sender: 'bot',
          timestamp: new Date()
        }]);
        
        // Hide welcome message after 5 seconds
        setTimeout(() => {
          setShowWelcome(false);
        }, 5000);
      }, 500);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle opening the chat
  const handleOpenChat = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  // Handle minimizing the chat
  const handleMinimize = () => {
    setIsMinimized(true);
    setShowWelcome(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  // Handle WhatsApp redirection
  const handleWhatsAppRedirect = () => {
    const phoneNumber = '9779815817938';
    const message = 'Hello! I would like to chat with you.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Check if message indicates positive response
  const isPositiveResponse = (message) => {
    const positiveWords = ['yes', 'ok', 'okay', 'sure', 'yeah', 'yep', 'ya', 'alright', 'definitely', 'absolutely'];
    return positiveWords.includes(message.toLowerCase().trim());
  };

  // Simulate bot response
  const simulateBotResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse;
      
      // Check if user responded positively
      if (isPositiveResponse(userMessage)) {
        botResponse = {
          id: messages.length + 1,
          text: "Great! I'm redirecting you to WhatsApp now to continue our conversation.",
          sender: 'bot',
          timestamp: new Date(),
          action: 'redirect' // Flag to trigger WhatsApp redirect
        };
      } else {
        botResponse = {
          id: messages.length + 1,
          text: "No problem! If you change your mind, just type 'yes' or click the WhatsApp button below anytime.",
          sender: 'bot',
          timestamp: new Date()
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // If it's a positive response, redirect to WhatsApp after a short delay
      if (botResponse.action === 'redirect') {
        setTimeout(() => {
          handleWhatsAppRedirect();
        }, 1500);
      }
    }, 1500);
  };

  // Handle user sending a message
  const handleSendMessage = () => {
    if (currentMessage.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    simulateBotResponse(currentMessage);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Audio element for the sound */}
      <audio 
        ref={audioRef} 
        src="/notification.wav" 
        preload="auto"
      />
      
      {/* 3D AI Assistant Button */}
      {!isOpen && (
        <div 
          className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl cursor-pointer transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          onClick={handleOpenChat}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5), 0 5px 10px rgba(139, 92, 246, 0.5)'
          }}
        >
          {/* 3D effect layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full"></div>
          <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
          
          {/* Main icon */}
          <FaRobot className="w-8 h-8 text-white" />
          
          {/* Pulsing animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
          
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">1</span>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isMinimized ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{ width: '320px', height: '400px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header - Always visible */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* 3D Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaRobot className="w-6 h-6 text-white" />
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-blue-200">Online • Ready to help</p>
              </div>
            </div>
            <button 
              onClick={handleMinimize}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container - Flexible height */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: 'calc(400px - 160px)' }}>
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 ${message.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 shadow-md rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-none px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* WhatsApp CTA Button - Always visible at bottom */}
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full py-2 px-4 flex items-center justify-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all shadow-md text-sm"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}