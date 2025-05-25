// src/pages/UsersManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api';

export default function UsersManagementPage() {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [filters, setFilters]     = useState({
    q: '', role: '', status: 'active', page: 1, limit: 20
  });
  const [loading, setLoading]     = useState(true);
  const [modalUser, setModalUser] = useState(null);

  // Fetch users list
  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: filters })
      .then(res => {
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, [filters]);

  // Delete (hard delete)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently DELETE this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      // remove locally for immediate feedback
      setUsers(us => us.filter(u => u._id !== id));
      setTotal(t => t - 1);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  // Save edits
  const handleSave = async () => {
    const { _id, name, email, role, status } = modalUser;
    try {
      await api.put(`/admin/users/${_id}`,           { name, email, role });
      await api.patch(`/admin/users/${_id}/status`, { status });
      setModalUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
        <FaSpinner className="animate-spin mr-2"/> Loading users…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
      <h2 className="text-2xl font-bold">User Management</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={filters.q}
          onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded w-1/3 dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users table */}
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b dark:border-gray-700">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">{user.status}</td>
              <td className="px-4 py-2 space-x-3">
                <button onClick={() => setModalUser({ ...user })} title="Edit">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(user._id)} title="Delete">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3 space-y-4">
            <h3 className="text-xl font-semibold">Edit User</h3>
            {['name', 'email', 'role', 'status'].map(field => (
              <div key={field}>
                <label className="block font-medium capitalize mb-1">{field}</label>
                {field === 'role' || field === 'status' ? (
                  <select
                    value={modalUser[field]}
                    onChange={e => setModalUser(m => ({ ...m, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    {(field === 'role' ? ['user', 'admin'] : ['active', 'inactive', 'banned'])
                      .map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={modalUser[field]}
                    onChange={e => setModalUser(m => ({ ...m, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalUser(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
