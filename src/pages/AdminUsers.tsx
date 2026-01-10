import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { usersAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search,
  Filter,
  Mail,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  User
} from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (filterRole !== 'all') params.role = filterRole;
      const response = await usersAPI.getAll(params);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to ban ${userName}?`)) return;
    
    try {
      toast.loading('Banning user...');
      await usersAPI.ban(userId);
      toast.dismiss();
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    try {
      toast.loading('Unbanning user...');
      await usersAPI.unban(userId);
      toast.dismiss();
      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
              User Management
            </h1>
          </div>
          <p className="text-gray-600">Manage platform users and their access</p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user: any) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-nvm-green-primary to-nvm-gold-primary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-nvm-dark-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          !user.isActive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {!user.isActive ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-ZA')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!user.isActive ? (
                            <button
                              onClick={() => handleUnbanUser(user._id, user.name)}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Unban
                            </button>
                          ) : user.role !== 'admin' && (
                            <button
                              onClick={() => handleBanUser(user._id, user.name)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
