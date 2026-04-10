import axios from 'axios';
import type { User } from '../components/types';

// O puedes obtener la URL de tus variables de entorno si lo deseas
const API_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  /**
   * Intenta iniciar sesión con el servidor backend mediante nombre de usuario (o email) y contraseña.
   * @param username - El nombre o email del usuario
   * @param password - La contraseña en texto plano
   * @returns El objeto de usuario si es exitoso
   * @throws Un error si las credenciales son inválidas
   */
  async login(username: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users/login', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al conectar con el servidor.');
    }
  },

  async signup(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al conectar con el servidor durante el registro.');
    }
  },

  async forgotPassword(identity: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>('/users/forgot-password', {
        identity,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al conectar con el servidor para restaurar la contraseña.');
    }
  }
};
