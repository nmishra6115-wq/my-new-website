import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this path points to your initialized Supabase client

export default function SubscribePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  // Show the popup automatically 3 seconds after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    try {
      // Insert email into your live Supabase 'subscribers' table
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: email }]);

      if (error) throw error;

      setStatusType('success');
      setStatusMessage('Successfully subscribed!');
      setEmail('');

      // Auto-close the window after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Subscription error:', error.message);
      setStatusType('error');
      setStatusMessage('Something went wrong. Please try again!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-4 animate-fade-in">
      <div className="bg-[#1e1e24] text-white p-8 rounded-xl w-full max-w-md relative shadow-2xl border border-zinc-800">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-4 text-zinc-400 hover:text-white text-2xl transition-colors"
        >
          &times;
        </button>

        {/* Content */}
        <h2 className="text-2xl font-bold text-[#3ecf8e] mb-2 text-center">Stay Updated</h2>
        <p className="text-zinc-400 text-sm mb-6 text-center">
          Receive daily updates and screening alerts directly in your inbox.
        </p>

        {/* Form */}
        <form onSubmit={handleSubscribe} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full p-3 rounded-lg bg-[#121214] border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e] transition-colors"
          />
          <button
            type="submit"
            className="w-full p-3 bg-[#3ecf8e] hover:bg-[#34b279] text-[#121214] font-bold rounded-lg transition-colors"
          >
            Subscribe Now
          </button>
        </form>

        {/* Feedback Message */}
        {statusMessage && (
          <p className={`mt-4 text-center text-sm font-medium ${
            statusType === 'success' ? 'text-[#3ecf8e]' : 'text-red-400'
          }`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}