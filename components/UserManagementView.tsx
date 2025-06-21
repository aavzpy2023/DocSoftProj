import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { APP_TITLE } from '../constants';
import Header from './Header'; // Re-using Header for consistent layout
import { getUsers } from '../services/apiService'; // Changed to static import

interface UserManagementViewProps {
  currentUser: User | null;
  onLogout: () => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Removed: const { getUsers } = await import('../services/apiService');
        const result = await getUsers();
        if (result.success && result.users) {
          setUsers(result.users);
        } else {
          setError(result.message || 'Failed to fetch users.');
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        setError('An unexpected error occurred while fetching users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  return (
    <div className="flex flex-col h-screen">
       <Header 
        title={`${APP_TITLE} - User Management`}
        user={currentUser}
        onLogout={onLogout}
      />
      <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">User List</h2>
          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          )}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
           {users.length === 0 && !isLoading && !error && (
            <p className="text-center text-gray-500 mt-4">No users found.</p>
           )}
        </div>
      </main>
    </div>
  );
};

export default UserManagementView;