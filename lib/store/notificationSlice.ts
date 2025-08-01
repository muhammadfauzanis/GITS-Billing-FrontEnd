// lib/store/notificationSlice.ts
import { StateCreator } from 'zustand';
import { DashboardState, NotificationSlice } from './types';
// UBAH IMPORT DI BAWAH INI
import {
  getNotifications,
  markNotificationAsRead,
  type AppNotification,
} from '../api';

export const createNotificationSlice: StateCreator<
  DashboardState,
  [],
  [],
  NotificationSlice
> = (set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const data = await getNotifications();
      set({
        notifications: data.notifications || [],
        unreadCount: data.notifications?.length || 0,
      });
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err.message);
    }
  },

  markAsRead: async (notificationId: number) => {
    const originalNotifications = get().notifications;
    const newNotifications = originalNotifications.filter(
      (n) => n.id !== notificationId
    );
    set({
      notifications: newNotifications,
      unreadCount: newNotifications.length,
    });

    try {
      await markNotificationAsRead(notificationId);
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err.message);
      set({
        notifications: originalNotifications,
        unreadCount: originalNotifications.length,
      });
    }
  },
});
