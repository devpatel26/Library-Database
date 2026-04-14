import { FetchJson } from "../api.js";

/**
 * Fetch all notifications for the current user
 * @param {number} limit - Maximum number of notifications to fetch (default: 20)
 * @returns {Promise<Array>} Array of notification objects
 */
export async function GetNotifications(limit = 20) {
  const url = `/api/notifications?limit=${Math.min(limit, 100)}`;
  return FetchJson(url);
}

/**
 * Get count of unread notifications
 * @returns {Promise<Object>} Object with unread_count property
 */
export async function GetUnreadNotificationCount() {
  return FetchJson("/api/notifications/count");
}

/**
 * Mark a specific notification as read
 * @param {number} notificationId - The notification ID to mark as read
 * @returns {Promise<Object>} Success response
 */
export async function MarkNotificationAsRead(notificationId) {
  return FetchJson(`/api/notifications/${notificationId}`, {
    method: "PUT",
  });
}

/**
 * Mark all notifications as read for the current user
 * @returns {Promise<Object>} Success response
 */
export async function MarkAllNotificationsAsRead() {
  return FetchJson("/api/notifications/read-all", {
    method: "PUT",
  });
}

/**
 * Delete a specific notification
 * @param {number} notificationId - The notification ID to delete
 * @returns {Promise<Object>} Success response
 */
export async function DeleteNotification(notificationId) {
  return FetchJson(`/api/notifications/${notificationId}`, {
    method: "DELETE",
  });
}

/**
 * Clear all notifications for the current user
 * @returns {Promise<Object>} Success response
 */
export async function ClearAllNotifications() {
  return FetchJson("/api/notifications", {
    method: "DELETE",
  });
}
