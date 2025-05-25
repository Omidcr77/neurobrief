// src/pages/UsersManagementPage.jsx
import React, { useEffect, useState, Fragment } from 'react';
import { FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import { Dialog, Transition }         from '@headlessui/react';
import api                            from '../api';

export default function UsersManagementPage() {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [filters, setFilters]     = useState({ q:'', role:'', status:'active', page:1, limit:10 });
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState('');

  // Fetch users
  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: filters })
      .then(res => {
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .catch(err => showToast(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, [filters]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async () => {
    try {
      const { _id, name, email, role, status } = editing;
      await api.put(`/admin/users/${_id}`,        { name, email, role });
      await api.patch(`/admin/users/${_id}/status`, { status });
      showToast('User updated');
      setEditing(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleting._id}`);
      showToast('User deleted');
      setDeleting(null);
      if (users.length === 1 && filters.page > 1) {
        setFilters(f => ({ ...f, page: f.page - 1 }));
      } else {
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300">
        <FaSpinner className="animate-spin mr-2" /> Loading users…
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-gray-200 min-h-screen space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <h2 className="text-2xl font-bold">User Management</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          className="px-3 py-2 border rounded flex-1 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Search..."
          value={filters.q}
          onChange={e => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
        />
        <select
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {['Name','Email','Role','Status','Actions'].map(h => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/*
              1) filter out anything falsy
              2) guard inside map to never render a null row
            */}
            {users.filter(Boolean).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.filter(Boolean).map((u, i) => {
              if (!u) return null;
              return (
                <tr
                  key={u._id}
                  className={
                    (i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700')
                    + ' hover:bg-indigo-50 dark:hover:bg-gray-600 transition'
                  }
                >
                  <td className="px-4 py-2">{u?.name ?? '—'}</td>
                  <td className="px-4 py-2">{u?.email ?? '—'}</td>
                  <td className="px-4 py-2 capitalize">{u?.role ?? '—'}</td>
                  <td className="px-4 py-2 capitalize">{u?.status ?? '—'}</td>
                  <td className="px-4 py-2 space-x-3">
                    <button
                      onClick={() => setEditing(u)}
                      title="Edit"
                      className="hover:text-indigo-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      title="Delete"
                      className="hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {filters.page} of {Math.ceil(total / filters.limit) || 1}
        </p>
        <div className="space-x-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={filters.page * filters.limit >= total}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Transition appear show={!!editing} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setEditing(null)}
        >
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-30">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Edit User
                </Dialog.Title>
                {['name','email','role','status'].map(field => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium capitalize mb-1">
                      {field}
                    </label>
                    {['role','status'].includes(field) ? (
                      <select
                        value={editing?.[field] ?? ''}
                        onChange={e =>
                          setEditing(ed => ({ ...ed, [field]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        {(field === 'role' ? ['user','admin'] : ['active','inactive','banned'])
                          .map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={editing?.[field] ?? ''}
                        onChange={e =>
                          setEditing(ed => ({ ...ed, [field]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={!!deleting} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setDeleting(null)}
        >
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-30">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Confirm Deletion
                </Dialog.Title>
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  Permanently delete <strong>{deleting?.name}</strong>?
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleting(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}
