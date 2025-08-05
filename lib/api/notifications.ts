// lib/api/notifications.ts
import { axiosInstance } from './index';

// UBAH NAMA INTERFACE DI SINI
export interface AppNotification {
  id: number;
  message: string;
  createdAt: string;
}

export const getNotifications = async (): Promise<{
  notifications: AppNotification[];
}> => {
  try {
    const response = await axiosInstance.get('/notifications/');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch notifications'
    );
  }
};

export const markNotificationAsRead = async (
  notificationId: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post(
      `/notifications/${notificationId}/read/`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to mark notification as read'
    );
  }
};
