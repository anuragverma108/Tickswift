import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useFirebase } from '../contexts/FirebaseContext';

const Dashboard = () => {
  const { listenToUserTickets } = useFirebase();
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToUserTickets((tickets) => {
      setRecentTickets(tickets.slice(0, 3));
    });
    return unsubscribe;
  }, [listenToUserTickets]);

  const stats = [
    {
      name: 'Open Tickets',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: TicketIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      name: 'In Progress',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: ClockIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      name: 'Resolved',
      value: '45',
      change: '+5',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      name: 'Urgent',
      value: '3',
      change: '-1',
      changeType: 'decrease',
      icon: ExclamationTriangleIcon,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your tickets.</p>
        </div>
        <Link
          to="/raise-ticket"
          className="btn-primary mt-4 sm:mt-0 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Raise New Ticket
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`card ${stat.borderColor} ${stat.bgColor} hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">from last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:scale-105 transition-transform duration-300 cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <PlusIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Create Ticket</h3>
              <p className="text-sm text-gray-400">Submit a new support request</p>
            </div>
          </div>
        </div>

        <div className="card hover:scale-105 transition-transform duration-300 cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Live Chat</h3>
              <p className="text-sm text-gray-400">Get instant support</p>
            </div>
          </div>
        </div>

        <div className="card hover:scale-105 transition-transform duration-300 cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Team Support</h3>
              <p className="text-sm text-gray-400">Contact your team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Tickets</h2>
          <Link
            to="/my-tickets"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg border border-dark-600/50 hover:border-dark-500/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-dark-600 rounded-lg flex items-center justify-center">
                    <TicketIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{ticket.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400">{ticket.id}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{ticket.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                  ticket.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                  ticket.status === 'Open' ? 'bg-blue-500/20 text-blue-400' :
                  ticket.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {ticket.createdAt && (new Date(ticket.createdAt.seconds ? ticket.createdAt.seconds * 1000 : ticket.createdAt).toLocaleString())}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            <span className="text-sm text-green-400 font-medium">+12%</span>
          </div>
        </div>
        <div className="h-64 bg-dark-700/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-dark-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">Chart visualization will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 