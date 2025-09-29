import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setField, setStatus } from '../store/candidateSlice';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';

const CandidateInfo = () => {
  const dispatch = useDispatch();
  const { name, email, phone } = useSelector(state => state.candidate);
  const [localName, setLocalName] = useState(name || '');
  const [localEmail, setLocalEmail] = useState(email || '');
  const [localPhone, setLocalPhone] = useState(phone || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!localName.trim() || !localEmail.trim() || !localPhone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    dispatch(setField({ field: 'name', value: localName.trim() }));
    dispatch(setField({ field: 'email', value: localEmail.trim() }));
    dispatch(setField({ field: 'phone', value: localPhone.trim() }));
    dispatch(setStatus('ready'));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">Please provide the missing information to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              id="phone"
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Continue to Interview</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};

export default CandidateInfo;