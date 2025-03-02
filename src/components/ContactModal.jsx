import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { FaTimes } from 'react-icons/fa';

function ContactModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const formRef = useRef();

  // Clear success message after timeout
  useEffect(() => {
    let timeoutId;
    if (submitStatus.type === 'success') {
      timeoutId = setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [submitStatus.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    const templateParams = {
      from_name: e.target.from_name.value,
      from_email: e.target.from_email.value,
      message: e.target.message.value,
      to_email: 'nishantvidhuri0987@gmail.com'
    };

    try {
      await emailjs.send(
        'service_ijklxic',
        'template_n8csemo',
        templateParams,
        'zcL4jj0QhEChPRS1V'
      );

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! I will get back to you soon.'
      });
      e.target.reset();
      setTimeout(onClose, 2000); // Changed to 3 seconds to match message timeout
    } catch (error) {
      console.error('Email error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-[#333] rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        <h2 className="text-2xl text-white mb-6">Contact Me</h2>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Name</label>
            <input 
              type="text" 
              name="from_name"
              required
              className="w-full bg-[#454545] text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Your Name"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input 
              type="email"
              name="from_email"
              required
              className="w-full bg-[#454545] text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Message</label>
            <textarea 
              name="message"
              required
              className="w-full bg-[#454545] text-white rounded px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Your message..."
            />
          </div>

          {submitStatus.message && (
            <div className={`text-sm ${submitStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {submitStatus.message}
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactModal; 