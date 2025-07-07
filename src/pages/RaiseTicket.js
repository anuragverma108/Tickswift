import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaperClipIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useFirebase } from '../contexts/FirebaseContext';

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    title: '',
    description: '',
    isPremium: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { createTicket, currentUser, uploadFile } = useFirebase();

  const categories = [
    'Bug Report',
    'Feature Request',
    'Login Issue',
    'Payment Problem',
    'Performance Issue',
    'UI/UX Feedback',
    'Integration Request',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { value: 'high', label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-600/20' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Razorpay handler
  const handleRazorpayPayment = () => {
    return new Promise((resolve, reject) => {
      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Razorpay public test key for dev
        amount: 4900, // 49 INR in paise
        currency: 'INR',
        name: 'TickSwift Premium Ticket',
        description: 'Premium Support Ticket',
        handler: function (response) {
          resolve(response.razorpay_payment_id);
        },
        prefill: {
          name: currentUser?.displayName || '',
          email: currentUser?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled'));
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      let paymentId = null;
      if (formData.isPremium) {
        paymentId = await handleRazorpayPayment();
      }
      const ticketData = {
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        createdAt: new Date(),
        userId: currentUser.uid,
        status: 'Open',
        title: formData.title,
        isPremium: formData.isPremium || false,
        paymentId: paymentId || null
      };
      if (selectedFile) {
        const filePath = `tickets/${currentUser.uid}/${Date.now()}_${selectedFile.name}`;
        const fileUrl = await uploadFile(selectedFile, filePath);
        ticketData.attachment = fileUrl;
      }
      await createTicket(ticketData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Raise New Ticket</h1>
        <p className="text-gray-400 mt-1">Submit a new support request and we'll get back to you soon.</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center">
          <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
          <div>
            <p className="text-green-400 font-medium">Ticket submitted successfully!</p>
            <p className="text-green-300 text-sm mt-1">Redirecting to My Tickets...</p>
          </div>
        </div>
      )}

      {/* Ticket Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Premium Ticket Option */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <StarIcon className="h-6 w-6 text-yellow-400" />
              <div>
                <h3 className="text-white font-medium">Premium Support</h3>
                <p className="text-sm text-gray-400">Get priority handling and faster response times</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Brief description of your issue"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="">Select priority</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              required
              value={formData.description}
              onChange={handleChange}
              className="input-field w-full resize-none"
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
              Attachments (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-dark-600 rounded-lg hover:border-dark-500 transition-colors">
              <div className="space-y-1 text-center">
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-dark-800 rounded-md font-medium text-primary-400 hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF, DOC up to 10MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-400">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-dark-700/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <p><strong>Browser:</strong> Chrome 120.0.6099.109</p>
                <p><strong>OS:</strong> Windows 11</p>
              </div>
              <div>
                <p><strong>User Agent:</strong> Mozilla/5.0...</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-dark-600">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket; 