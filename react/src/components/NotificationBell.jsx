import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FetchJson } from "../api"; 

// Helper function to format dates
function FormatActivityDate(value) {
  if (!value) return "Unknown date";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(parsedDate);
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState([]); 
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    setReadIds(storedReadIds);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const data = await FetchJson("/api/account/activity"); 
        
        let newNotifications = [];
        try {
          newNotifications = await FetchJson("/api/notifications?limit=50");
        } catch (notifError) {
          console.error("🔔 Notification fetch failed", notifError);
          newNotifications = [];
        }
        
        if (isMounted && Array.isArray(data)) {
          const combinedData = [
            ...data.slice(0, 10),
            ...(Array.isArray(newNotifications) ? newNotifications.map(notif => ({
              activityId: `notif_${notif.notification_id}`,
              headline: notif.notification_type,
              title: notif.message,
              detail: notif.message,
              status: notif.notification_type === 'OVERDUE_FINE' ? 'Overdue' : 
                      notif.notification_type === 'HOLD_READY' ? 'Ready' : 
                      notif.notification_type,
              activityDate: notif.created_at,
              isNewNotification: true
            })) : [])
          ];
          
          setNotifications(combinedData.slice(0, 15));
        }
      } catch (error) {
        console.error("❌ Error in fetchActivities:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(() => { if (isMounted) fetchActivities(); }, 10000);
    
    return () => { 
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.includes(n.activityId)).length;

  const markAllAsRead = (e) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.activityId);
    const newReadIds = [...new Set([...readIds, ...allIds])];
    setReadIds(newReadIds);
    localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
  };

  const handleNotificationClick = (activityId) => {
    if (!readIds.includes(activityId)) {
      const newReadIds = [...readIds, activityId];
      setReadIds(newReadIds);
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
    }
    setIsOpen(false);
    navigate('/account/activity');
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
    navigate('/account/activity');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-sky-600 transition-colors duration-200"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto overflow-x-hidden">
            {isLoading ? (
               <div className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                 Loading activity...
               </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const isRead = readIds.includes(notification.activityId);
                
                return (
                  <div 
                    key={notification.activityId} 
                    onClick={() => handleNotificationClick(notification.activityId)}
                    className={`px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!isRead ? 'bg-sky-50/40' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-bold ${!isRead ? 'text-sky-900' : 'text-slate-900'}`}>
                        {notification.headline}
                      </p>
                      {notification.status === 'Overdue' && (
                         <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Overdue</span>
                      )}
                      {notification.status === 'Ready' && (
                         <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">Ready</span>
                      )}
                    </div>
                    
                    {notification.title && (
                      <p className="text-sm text-slate-600 mt-1 font-medium leading-snug">{notification.title}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs font-bold text-sky-600">{notification.detail}</p>
                      <p className="text-[11px] font-medium text-slate-400">{FormatActivityDate(notification.activityDate)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm font-medium text-slate-400">
                No new activity
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-slate-50 text-center border-t border-slate-100">
            <button 
              onClick={handleViewAllClick}
              className="text-sm text-sky-600 hover:text-sky-700 font-bold w-full transition-colors"
            >
              View all activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;