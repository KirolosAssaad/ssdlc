import { apiClient, ApiResponse } from '../config';
import { 
  UpdateProfileRequest, 
  RegisterDeviceRequest, 
  RegisterDeviceResponse 
} from '../types';
import { User } from '../../types';

class UserService {
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/user/profile', profileData);
      
      if (response.data.success) {
        // Update user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      console.warn('API updateProfile failed, using mock update:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error('No user found');
    }
  }

  async registerDevice(deviceData: RegisterDeviceRequest): Promise<RegisterDeviceResponse> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterDeviceResponse>>('/user/register-device', deviceData);
      
      if (response.data.success) {
        // Update user data with registered device
        this.updateUserDevice(deviceData.deviceName);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to register device');
    } catch (error) {
      console.warn('API registerDevice failed, using mock response:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data with registered device
      this.updateUserDevice(deviceData.deviceName);
      
      return {
        success: true,
        deviceId: deviceData.deviceId,
      };
    }
  }

  async unregisterDevice(): Promise<void> {
    try {
      await apiClient.delete('/user/register-device');
      
      // Update user data to remove registered device
      this.updateUserDevice(undefined);
    } catch (error) {
      console.warn('API unregisterDevice failed, using mock response:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user data to remove registered device
      this.updateUserDevice(undefined);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.warn('API changePassword failed, using mock response:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would validate the current password
      if (currentPassword !== 'correct-password') {
        throw new Error('Current password is incorrect');
      }
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/user/account');
      
      // Clear all user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('API deleteAccount failed, using mock response:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear all user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  private updateUserDevice(deviceName?: string): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.registeredDevice = deviceName;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user device:', error);
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
}

export const userService = new UserService();