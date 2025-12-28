'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FaSearch, FaBell, FaUserCircle, FaTimes, FaChevronRight } from 'react-icons/fa';
import { MdNotifications } from 'react-icons/md';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Breadcrumb, Dropdown, Badge, Avatar } from 'antd';

const Header = ({ user }) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Skip the first 'dashboard' part
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i];
      const href = `/${paths.slice(0, i + 1).join('/')}`;
      const name = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        title: i === paths.length - 1 ? (
          <span className="text-primary font-medium">{name}</span>
        ) : (
          <a href={href} className="hover:text-primary transition-colors">{name}</a>
        )
      });
    }
    
    return breadcrumbs;
  };

  // Fetch notifications data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const logsResponse = await fetch('/api/users/admin/audit-logs');
        const logsData = await logsResponse.json();
        setNotifications(logsData.logs || []);
        setUnreadCount(logsData.unread || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Add your search logic here
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch('/api/users/admin/audit-logs/mark-read', { method: 'POST' });
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <a href="/dashboard/profile" className="flex items-center gap-2">
          <FaUserCircle className="text-gray-500" />
          My Profile
        </a>
      ),
    },
    {
      key: 'settings',
      label: (
        <a href="/dashboard/settings" className="flex items-center gap-2">
          <SettingOutlined />
          Settings
        </a>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <button 
          onClick={() => {
            fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
              .then(() => window.location.href = '/login');
          }}
          className="flex items-center gap-2 text-red-500 w-full"
        >
          <LogoutOutlined />
          Logout
        </button>
      ),
    },
  ];

  return (
    <header className="bg-white shadow-sm p-4 flex flex-col sticky top-0 z-50">
      {/* Top Row - Search and User Controls */}
      <div className="flex items-center justify-between w-full">
        {/* Breadcrumbs - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <Breadcrumb 
            separator={<FaChevronRight className="text-gray-400 text-xs" />}
            items={[
              {
                title: <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>,
              },
              ...getBreadcrumbs()
            ]}
            className="text-sm"
          />
        </div>

        {/* Mobile Title - Shown only on mobile */}
        <h1 className="text-lg font-semibold text-gray-800 md:hidden">
          {getBreadcrumbs().slice(-1)[0]?.title || 'Dashboard'}
        </h1>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Search Bar - Hidden on mobile */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white focus-within:shadow-sm"
          >
            <input
              type="text"
              className="bg-transparent outline-none text-gray-800 w-40 lg:w-64 text-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <FaSearch size={16} />
            </button>
          </form>
          
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Notifications"
            >
              <Badge count={unreadCount} size="small">
                <MdNotifications 
                  size={20} 
                  className={unreadCount > 0 ? "text-primary" : "text-gray-500"} 
                />
              </Badge>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button 
                    onClick={toggleNotifications}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Close notifications"
                  >
                    <FaTimes size={14} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto" style={{ maxHeight: '320px' }}>
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((log) => (
                      <div 
                        key={log._id} 
                        className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="mr-3 text-primary">
                            <FaBell size={14} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{log.action}</p>
                            <p className="text-sm text-gray-600">{log.description}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">{log.user}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 text-center bg-gray-50">
                  <a 
                    href="/dashboard/audit-logs" 
                    className="text-sm text-primary hover:underline"
                  >
                    View All Notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-colors">
              <Avatar 
                size="default" 
                src={user?.avatar} 
                icon={<FaUserCircle />}
                className="border border-gray-200"
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Mobile Search - Shown only on mobile when needed */}
      <div className="md:hidden mt-2">
        <form 
          onSubmit={handleSearch} 
          className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-full"
        >
          <input
            type="text"
            className="bg-transparent outline-none text-gray-800 flex-grow text-sm"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="text-gray-500 hover:text-primary transition-colors ml-2"
            aria-label="Search"
          >
            <FaSearch size={16} />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;