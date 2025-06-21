import { User } from '../types';

const API_BASE_URL = '/api/v1'; // Nginx will proxy this

const getToken = (): string | null => localStorage.getItem('docuhubToken');

const setToken = (token: string): void => localStorage.setItem('docuhubToken', token);

const removeToken = (): void => localStorage.removeItem('docuhubToken');


export const loginUser = async (credentials: { email: string, password: string }): Promise<{ success: boolean; message?: string; user?: User, token?: string }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/login/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.detail || 'Login failed.' };
    }
    
    if (data.access_token) {
      setToken(data.access_token);
      // Fetch user details after successful login
      const userDetailsResponse = await fetchCurrentUser();
      if (userDetailsResponse.success && userDetailsResponse.user) {
        return { success: true, user: userDetailsResponse.user, token: data.access_token };
      } else {
        removeToken(); // Clean up token if fetching user details fails
        return { success: false, message: 'Login successful, but failed to fetch user details.' };
      }
    }
    return { success: false, message: 'Login failed: No token received.' };
  } catch (error) {
    console.error('Login API error:', error);
    return { success: false, message: 'An network error occurred during login.' };
  }
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message?: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.detail || 'Registration failed' };
    }
    return { success: true, user: data };
  } catch (error) {
    console.error('Registration API error:', error);
    return { success: false, message: 'A network error occurred during registration.' };
  }
}

export const logoutUser = async (): Promise<{ success: boolean }> => {
  removeToken();
  // No backend call for logout in simple JWT, token is just removed client-side.
  // If backend had a token blacklist, you'd call it here.
  return Promise.resolve({ success: true });
};

export const fetchCurrentUser = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'No token found.' };
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
        if(response.status === 401) removeToken(); // Token might be invalid/expired
        return { success: false, message: data.detail || 'Failed to fetch current user.' };
    }
    return { success: true, user: data };
  } catch (error) {
    console.error('Fetch current user API error:', error);
    return { success: false, message: 'A network error occurred while fetching user data.' };
  }
};


export const getUsers = async (): Promise<{ success: boolean; users?: User[]; message?: string }> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required.' };
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      if(response.status === 401) removeToken();
      return { success: false, message: data.detail || 'Failed to fetch users.' };
    }
    return { success: true, users: data };
  } catch (error) {
    console.error('Get users API error:', error);
    return { success: false, message: 'A network error occurred while fetching users.' };
  }
};


// --- MOCK FUNCTIONS (to be replaced or implemented in backend later) ---
export const publishSite = async (): Promise<{ success: boolean; message: string }> => {
  console.warn("publishSite is using a mock implementation.");
  return new Promise(resolve => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ success: true, message: 'Site published successfully! (Simulated)' });
      } else {
        resolve({ success: false, message: 'Failed to publish site. An unexpected error occurred. (Simulated)' });
      }
    }, 1500);
  });
};

export const exportToPdf = async (filePath: string): Promise<{ success: boolean; message: string }> => {
  console.warn("exportToPdf is using a mock implementation.");
  return new Promise(resolve => {
    setTimeout(() => {
      if (filePath) {
        resolve({ success: true, message: `PDF export initiated for "${filePath}". Check your downloads. (Simulated)` });
      } else {
        resolve({ success: false, message: 'File path is missing for PDF export. (Simulated)' });
      }
    }, 1200);
  });
};

export const saveFileContent = async (fileId: string, content: string): Promise<{ success: boolean; message: string }> => {
  console.warn("saveFileContent is using a mock implementation.");
  return new Promise(resolve => {
    setTimeout(() => {
      if (fileId && typeof content === 'string') {
        console.log(`Simulating save for fileId: ${fileId}, content length: ${content.length}`);
        resolve({ success: true, message: 'File saved successfully! (Simulated)' });
      } else {
        resolve({ success: false, message: 'Failed to save file. Invalid parameters. (Simulated)' });
      }
    }, 800);
  });
};
