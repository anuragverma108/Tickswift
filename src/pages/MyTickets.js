import React, { useState, useEffect } from 'react';
import { TicketIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useFirebase } from '../contexts/FirebaseContext';
import { useNavigate } from 'react-router-dom';

const MyTickets = () => {
  const { listenToUserTickets, currentUser, userRole, loading } = useFirebase();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);

  // Guard: redirect admin to /admin
  React.useEffect(() => {
    if (!loading && userRole === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [userRole, loading, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = listenToUserTickets((data) => {
      setTickets(data);
    });
    return unsubscribe;
  }, [currentUser, listenToUserTickets]);

  if (loading || userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Tickets</h1>
        <p className="text-gray-400 mt-1">View and manage all your submitted tickets.</p>
      </div>

      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-dark-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-400">Loading tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-400">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-dark-700/40 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-mono">{ticket.id}</td>
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
                  <td className="px-4 py-3 text-sm text-gray-400">{ticket.created}</td>
                  <td className="px-4 py-3">
                    <button
                      className="p-2 rounded-md hover:bg-dark-700 text-primary-400 hover:text-primary-300 transition-colors"
                      onClick={() => setSelected(ticket)}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for ticket details */}
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
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-300">Ticket ID:</span> <span className="font-mono text-gray-400">{selected.id}</span></p>
              <p><span className="font-medium text-gray-300">Category:</span> {selected.category}</p>
              <p><span className="font-medium text-gray-300">Priority:</span> {selected.priority}</p>
              <p><span className="font-medium text-gray-300">Status:</span> {selected.status}</p>
              <p><span className="font-medium text-gray-300">Created:</span> {selected.created}</p>
              <p><span className="font-medium text-gray-300">Description:</span> {selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets; 