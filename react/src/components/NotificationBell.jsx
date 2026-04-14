import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // NEW: Imported useNavigate
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
  const navigate = useNavigate(); // NEW: Initialize the navigate function

  // 1. Load read notification IDs from local storage when component loads
  useEffect(() => {
    const storedReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    setReadIds(storedReadIds);
  }, []);

  // 2. Fetch the activity data AND new notifications from triggers
  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Fetching account activity...");
        const data = await FetchJson("/api/account/activity"); 
        console.log("✅ Account activity fetched:", data);
        
        // Also fetch new notifications from triggers
        let newNotifications = [];
        try {
          console.log("🔔 Attempting to fetch notifications from /api/notifications?limit=50");
          newNotifications = await FetchJson("/api/notifications?limit=50");
          console.log("✅ Fetched notifications from /api/notifications:", newNotifications);
        } catch (notifError) {
          console.error("❌ Failed to fetch notifications - Error details:", notifError);
          newNotifications = [];
        }
        
        if (isMounted && Array.isArray(data)) {
          // Combine both sources: account activity + new trigger notifications
          const combinedData = [
            ...data.slice(0, 10), // Keep original account activity
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
          
          console.log("📦 Combined notifications count:", combinedData.length);
          console.log("📦 Combined data:", combinedData);
          setNotifications(combinedData.slice(0, 15)); // Show top 15 combined
        }
      } catch (error) {
        console.error("❌ Error in fetchActivities:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivities();
    
    // Poll every 10 seconds for new notifications
    const interval = setInterval(() => {
      if (isMounted) {
        fetchActivities();
      }
    }, 10000);
    
    return () => { 
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 3. Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Calculate unread count
  const unreadCount = notifications.filter(n => !readIds.includes(n.activityId)).length;

  // 5. Mark all as read function
  const markAllAsRead = (e) => {
    e.stopPropagation(); // Prevents the dropdown from closing if clicking this
    const allIds = notifications.map(n => n.activityId);
    const newReadIds = [...new Set([...readIds, ...allIds])];
    
    setReadIds(newReadIds);
    localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
  };

  // NEW: 6. Handle clicking a single notification
  const handleNotificationClick = (activityId) => {
    // Mark this specific item as read if it isn't already
    if (!readIds.includes(activityId)) {
      const newReadIds = [...readIds, activityId];
      setReadIds(newReadIds);
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
    }
    
    // Close the dropdown
    setIsOpen(false);
    
    // Navigate to the Account Activity page
    navigate('/account/activity');
  };

  // NEW: 7. Handle clicking "View all activity"
  const handleViewAllClick = () => {
    setIsOpen(false);
    navigate('/account/activity');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white focus:outline-none transition-colors duration-200"
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
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-sky-400 hover:text-sky-300 focus:outline-none"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {isLoading ? (
               <div className="px-4 py-6 text-center text-sm text-slate-400">
                 Loading activity...
               </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const isRead = readIds.includes(notification.activityId);
                
                return (
                  <div 
                    key={notification.activityId} 
                    onClick={() => handleNotificationClick(notification.activityId)} // NEW: Added click handler here
                    className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700 transition-colors duration-150 cursor-pointer ${!isRead ? 'bg-slate-700/50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-slate-200">
                        {notification.headline}
                      </p>
                      {notification.status === 'Overdue' && (
                         <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                      {notification.status === 'Ready' && (
                         <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Ready</span>
                      )}
                    </div>
                    
                    {notification.title && (
                      <p className="text-sm text-slate-300 mt-0.5">{notification.title}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-sky-300">{notification.detail}</p>
                      <p className="text-xs text-slate-500">{FormatActivityDate(notification.activityDate)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No new activity
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-slate-700 bg-slate-900 text-center">
            {/* NEW: Added click handler to view all button */}
            <button 
              onClick={handleViewAllClick}
              className="text-sm text-sky-400 hover:text-sky-300 font-medium focus:outline-none w-full"
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