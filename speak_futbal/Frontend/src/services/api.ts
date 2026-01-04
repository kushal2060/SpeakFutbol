// Interfaces
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface SignupData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
}

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    event_type: 'match' | 'tournament' | 'training' | 'other';
    created_by: User;
    participants: User[];
    max_participants?: number;
}

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface EventData {
  title: string;
  description: string;
  event_type: 'match' | 'tournament' | 'training' | 'other';
  location: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  max_participants?: number;
}

class ApiService {
  private static async ensureCsrfToken(): Promise<void> {
    try {
      // Just make a GET request to the CSRF endpoint
      // Django will automatically set the CSRF cookie
      await fetch(`${API_BASE_URL}/users/csrf/`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw new Error('Failed to get CSRF token');
    }
  }

 private static getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  // Remove token auth - we're using session cookies only
  return headers;
}

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // For POST, PUT, DELETE requests, ensure we have a CSRF token
      if (['POST', 'PUT', 'DELETE'].includes(options.method || '')) {
        // Only get a new CSRF token if we don't have one
        if (!document.cookie.includes('csrftoken=')) {
          await this.ensureCsrfToken();
        }
      }

      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
       let errorData;
      try {
      errorData = await response.json();
      } catch {
      errorData = { detail: response.statusText || 'Unknown error' };
        }
     const message = errorData.detail ?? errorData.error ?? JSON.stringify(errorData);
     throw new Error(message);
  }

      return response;
    } catch (error) {
       
        throw error;
      
      
    }
  }

  // Auth methods
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response.json();
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to login');
    }
  }

  static async signup(data: SignupData): Promise<User> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
     
    return response.json();
  }

  static async logout(): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/users/logout/`, {
      method: 'POST',
    });
    // Clear any local storage or state after logout
    localStorage.removeItem('user');
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/users/me/`);
      console.log('Current user response:', response);
      return response.json();
    } catch (error) {
      return null;
    }
  }

  // Profile methods
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/me/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Event methods
  static async getEvents(params?: { lat?: string; lng?: string; radius?: string }): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat);
    if (params?.lng) queryParams.append('lng', params.lng);
    if (params?.radius) queryParams.append('radius', params.radius);

    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/events/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.json();
  }

  static async getEvent(id: number) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/${id}/`);
  }

  static async createEvent(data: EventData) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateEvent(id: number, data: Partial<EventData>) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteEvent(id: number) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/${id}/`, {
      method: 'DELETE',
    });
  }

  static async participateInEvent(id: number) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/${id}/participate/`, {
      method: 'POST',
    });
  }

  static async leaveEvent(id: number) {
    return this.fetchWithAuth(`${API_BASE_URL}/events/${id}/participate/`, {
      method: 'DELETE',
    });
  }

  static async removeParticipantFromEvent(eventId: number, userId: number) {
    
      return this.fetchWithAuth(`${API_BASE_URL}/events/${eventId}/participants/${userId}/`, {
      method: 'DELETE',
    });
    
    
}
}

export default ApiService; 