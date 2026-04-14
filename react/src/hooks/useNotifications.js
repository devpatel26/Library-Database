import { useState, useEffect, useCallback } from "react";
import {
  GetNotifications,
  GetUnreadNotificationCount,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
  ClearAllNotifications,
} from "../api/notifications.js";

/**
 * Custom hook for managing notifications
 * Handles fetching, polling, and updating notifications
 */
export function useNotifications(pollInterval = 30000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await GetNotifications(50);
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await GetUnreadNotificationCount();
      setUnreadCount(data?.unread_count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await MarkNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: 1 } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await MarkAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await DeleteNotification(notificationId);
      const notification = notifications.find(
        (n) => n.notification_id === notificationId
      );
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await ClearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      throw err;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Set up polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
