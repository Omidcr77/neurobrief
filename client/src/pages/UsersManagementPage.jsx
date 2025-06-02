// src/pages/UsersManagementPage.jsx
import React, { useEffect, useState, Fragment } from 'react';
import { 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import api from '../api';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ q: '', role: '', status: 'active', page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  // Fetch users
  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: filters })
      .then(res => {
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .catch(err => showToast('error', err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, [filters]);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
  };

  const handleSave = async () => {
    try {
      const { _id, name, email, role, status } = editing;
      await api.put(`/admin/users/${_id}`, { name, email, role });
      await api.patch(`/admin/users/${_id}/status`, { status });
      showToast('success', 'User updated successfully!');
      setEditing(null);
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleting._id}`);
      showToast('success', 'User deleted successfully!');
      setDeleting(null);
      if (users.length === 1 && filters.page > 1) {
        setFilters(f => ({ ...f, page: f.page - 1 }));
      } else {
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    }
  };

  // Auto-hide toast message
  useEffect(() => {
    if (toastMessage.text) {
      const timer = setTimeout(() => setToastMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading users...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            User <span className="text-blue-600 dark:text-blue-400">Management</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Manage users, roles, and account status
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FaSearch />
              </div>
              <input
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="Search users..."
                value={filters.q}
                onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
              />
            </div>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={filters.role}
              onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={filters.limit}
              onChange={e => setFilters(f => ({ ...f, limit: parseInt(e.target.value), page: 1 }))}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.filter(Boolean).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  users.filter(Boolean).map((u, i) => (
                    <tr
                      key={u._id}
                      className={i % 2 === 0 
                        ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-700'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{u?.name ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{u?.email ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize 
                          ${u?.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          }`}
                        >
                          {u?.role ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize 
                          ${u?.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : u?.status === 'banned'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}
                        >
                          {u?.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setEditing(u)}
                            title="Edit"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleting(u)}
                            title="Delete"
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
            <span className="font-medium">{Math.min(filters.page * filters.limit, total)}</span> of{' '}
            <span className="font-medium">{total}</span> users
          </p>
          <div className="flex items-center space-x-2">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors ${
                filters.page === 1
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <FaChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              disabled={filters.page * filters.limit >= total}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors ${
                filters.page * filters.limit >= total
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Next
              <FaChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={!!editing} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setEditing(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4"
                  >
                    Edit User
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    {['name', 'email', 'role', 'status'].map(field => (
                      <div key={field} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {field}
                        </label>
                        {['role', 'status'].includes(field) ? (
                          <select
                            value={editing?.[field] ?? ''}
                            onChange={e => setEditing(ed => ({ ...ed, [field]: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          >
                            {(field === 'role' ? ['user', 'admin'] : ['active', 'banned'])
                              .map(opt => (
                                <option key={opt} value={opt} className="capitalize">
                                  {opt}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type={field === 'email' ? 'email' : 'text'}
                            value={editing?.[field] ?? ''}
                            onChange={e => setEditing(ed => ({ ...ed, [field]: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setEditing(null)}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={!!deleting} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setDeleting(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <FaExclamationTriangle className="text-red-500 mr-3 h-6 w-6" />
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Are you sure you want to permanently delete user <span className="font-semibold">{deleting?.name}</span>? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setDeleting(null)}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Delete User
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Global Toast Notification */}
      <Transition
        show={!!toastMessage.text}
        as={Fragment}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-10 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-10 sm:translate-y-0 sm:scale-95"
      >
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl text-white
            ${toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {toastMessage.type === 'success' ? 
            <FaCheckCircle className="h-6 w-6" /> : 
            <FaExclamationTriangle className="h-6 w-6" />}
          <span className="font-medium">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage({ type: '', text: '' })} 
            className="opacity-80 hover:opacity-100 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
      </Transition>
    </section>
  );
}