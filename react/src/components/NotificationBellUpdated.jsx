import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications.js";
import "./NotificationBell.css";

/**
 * NotificationBell Component
 * Displays notification bell with unread count and a dropdown panel
 */
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(30000); // Poll every 30 seconds

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_id);
      } catch (err) {
        console.error("Failed to mark notification as read");
      }
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      HOLD_READY: "📦",
      ITEM_AVAILABLE: "✓",
      FINE_CREATED: "⚠️",
      OVERDUE_FINE: "💰",
      FINE_PAID: "💳",
      LOAN_DUE_SOON: "⏰",
      HOLD_CREATED: "👋",
    };
    return icons[type] || "📬";
  };

  return (
    <div className="notification-bell-container">
      <button
        ref={bellRef}
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-panel-body">
            {isLoading && !notifications.length && (
              <div className="notification-loading">Loading...</div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            )}

            {notifications.length > 0 && (
              <ul className="notification-list">
                {notifications.map((notification) => (
                  <li
                    key={notification.notification_id}
                    className={`notification-item ${
                      notification.is_read ? "read" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="notification-icon">
                      {getNotificationIcon(notification.notification_type)}
                    </span>
                    <div className="notification-content">
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <span className="notification-time">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <button
                      className="notification-delete-btn"
                      onClick={(e) =>
                        handleDelete(e, notification.notification_id)
                      }
                      aria-label="Delete notification"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-panel-footer">
              <small>Showing {notifications.length} notifications</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default NotificationBell;
