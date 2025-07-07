import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useFirebase } from '../contexts/FirebaseContext';

const statusOptions = ['All', 'Open', 'In Progress', 'Resolved'];
const priorityOptions = ['All', 'High', 'Medium', 'Low'];
const categoryOptions = ['All', 'Bug', 'Feature Request', 'Integration'];

const AdminPanel = () => {
  const { listenToAllTickets, assignTicket, updateTicketStatus, addCommentToTicket, currentUser, getAllUsers, userRole } = useFirebase();

  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Real-time tickets
  useEffect(() => {
    const unsubscribe = listenToAllTickets(setTickets);
    return unsubscribe;
  }, [listenToAllTickets]);

  // Fetch users when modal opens
  useEffect(() => {
    if (selected) {
      getAllUsers().then(setUsers).catch(() => setUsers([]));
    }
  }, [selected, getAllUsers]);

  const filteredTickets = tickets.filter(ticket => {
    return (
      (status === 'All' || ticket.status === status) &&
      (priority === 'All' || ticket.priority === priority) &&
      (category === 'All' || ticket.category === category) &&
      (search === '' || (ticket.title && ticket.title.toLowerCase().includes(search.toLowerCase())) || (ticket.id && ticket.id.toLowerCase().includes(search.toLowerCase())))
    );
  });

  // Admin actions
  const handleAssign = async () => {
    if (!selected || !assignUserId) return;
    setActionLoading(true);
    try {
      await assignTicket(selected.id, assignUserId);
      setAssignUserId('');
    } catch (e) {
      alert('Failed to assign: ' + e.message);
    }
    setActionLoading(false);
  };

  const handleStatus = async (newStatus) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await updateTicketStatus(selected.id, newStatus);
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
    setActionLoading(false);
  };

  const handleAddComment = async () => {
    if (!selected || !commentInput) return;
    setActionLoading(true);
    try {
      await addCommentToTicket(selected.id, {
        text: commentInput,
        author: currentUser?.displayName || 'Admin',
        createdAt: new Date().toISOString()
      });
      setCommentInput('');
    } catch (e) {
      alert('Failed to add comment: ' + e.message);
    }
    setActionLoading(false);
  };

  if (userRole !== 'admin') {
    return (
      <div className="text-center text-red-400 font-bold mt-10">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage all tickets, assign, and update statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-4 py-2 w-48"
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-field py-2">
            {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field py-2">
            {priorityOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field py-2">
            {categoryOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-dark-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-dark-700/40 transition-colors">
                <td className="px-4 py-3 text-sm text-white font-mono">{ticket.id}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{ticket.title}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{ticket.userName || ticket.user}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{ticket.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ticket.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ticket.status === 'Open' ? 'bg-blue-500/20 text-blue-400' :
                    ticket.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{ticket.createdAt && (new Date(ticket.createdAt.seconds ? ticket.createdAt.seconds * 1000 : ticket.createdAt).toLocaleString())}</td>
                <td className="px-4 py-3">
                  <button
                    className="p-2 rounded-md hover:bg-dark-700 text-primary-400 hover:text-primary-300 transition-colors"
                    onClick={() => setSelected(ticket)}
                  >
                    <TicketIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for ticket details and admin actions */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-dark-900 rounded-xl p-8 max-w-md w-full border border-dark-700 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <div className="flex items-center mb-4">
              <TicketIcon className="h-6 w-6 text-primary-400 mr-2" />
              <h2 className="text-lg font-bold text-white">{selected.title}</h2>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="font-medium text-gray-300">Ticket ID:</span> <span className="font-mono text-gray-400">{selected.id}</span></p>
              <p><span className="font-medium text-gray-300">User:</span> {selected.userName || selected.user}</p>
              <p><span className="font-medium text-gray-300">Category:</span> {selected.category}</p>
              <p><span className="font-medium text-gray-300">Priority:</span> {selected.priority}</p>
              <p><span className="font-medium text-gray-300">Status:</span> {selected.status}</p>
              <p><span className="font-medium text-gray-300">Created:</span> {selected.createdAt && (new Date(selected.createdAt.seconds ? selected.createdAt.seconds * 1000 : selected.createdAt).toLocaleString())}</p>
              <p><span className="font-medium text-gray-300">Description:</span> {selected.description}</p>
              {selected.assignedTo && (
                <p><span className="font-medium text-gray-300">Assigned To:</span> {
                  users.find(u => u.id === selected.assignedTo)?.name || selected.assignedTo
                }</p>
              )}
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-2">
                <select
                  className="input-field flex-1"
                  value={assignUserId}
                  onChange={e => setAssignUserId(e.target.value)}
                >
                  <option value="">Assign to agent/user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}){u.role === 'admin' ? ' [admin]' : ''}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary flex items-center justify-center"
                  onClick={handleAssign}
                  disabled={actionLoading}
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" /> Assign
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary flex items-center justify-center flex-1"
                  onClick={() => handleStatus('In Progress')}
                  disabled={actionLoading || selected.status === 'In Progress'}
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" /> Mark In Progress
                </button>
                <button
                  className="btn-secondary flex items-center justify-center flex-1"
                  onClick={() => handleStatus('Resolved')}
                  disabled={actionLoading || selected.status === 'Resolved'}
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" /> Mark Resolved
                </button>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  className="btn-secondary flex items-center justify-center"
                  onClick={handleAddComment}
                  disabled={actionLoading}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" /> Add
                </button>
              </div>
              {selected.comments && selected.comments.length > 0 && (
                <div className="bg-dark-800 rounded p-2 max-h-32 overflow-y-auto">
                  <div className="text-xs text-gray-400 mb-1">Comments:</div>
                  {selected.comments.map((c, i) => (
                    <div key={i} className="mb-1">
                      <span className="font-medium text-gray-300">{c.author || 'User'}:</span> {c.text} <span className="text-gray-500 text-xs">{c.createdAt && new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 