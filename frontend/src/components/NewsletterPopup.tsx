// src/components/NewsletterPopup.tsx - Enhanced Version
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, CheckCircle } from 'lucide-react';

interface NewsletterPopupProps {
  showAfterSeconds?: number;
}

export default function NewsletterPopup({ showAfterSeconds = 45 }: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already_subscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user already dismissed or signed up
    const dismissed = localStorage.getItem('newsletter-dismissed');
    const signedUp = localStorage.getItem('newsletter-signed-up');

    if (dismissed || signedUp) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [showAfterSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message.includes('Already subscribed')) {
          setStatus('already_subscribed');
        } else {
          setStatus('success');
          localStorage.setItem('newsletter-signed-up', 'true');
        }
        setTimeout(() => setIsVisible(false), 4000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter-dismissed', 'true');
  };

  const getSuccessMessage = () => {
    if (status === 'already_subscribed') {
      return {
        title: "You're Already In!",
        message: "Looks like you're already subscribed. Check your inbox for our latest updates!"
      };
    }
    return {
      title: "Welcome Aboard!",
      message: "You're now subscribed! Watch for updates on accountability features and military support resources."
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-800 border border-gray-600 rounded-xl p-8 max-w-md w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              {/* Success State */}
              {(status === 'success' || status === 'already_subscribed') ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="text-green-400 mb-4">
                    <CheckCircle className="w-16 h-16 mx-auto" />
                  </div>
                  <h4 className="text-xl font-bold text-green-400 mb-2">
                    {getSuccessMessage().title}
                  </h4>
                  <p className="text-gray-300">
                    {getSuccessMessage().message}
                  </p>
                </motion.div>
              ) : (
                /* Form State */
                <>
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="bg-green-400 rounded-full p-3">
                      <Mail className="text-black" size={24} />
                    </div>
                  </div>

                  {/* Header */}
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    Stay Mission-Ready
                    <Sparkles className="text-green-400" size={20} />
                  </h3>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Get updates on new accountability features, military support resources,
                    and success stories from veterans crushing their goals!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={status === 'loading'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={status === 'loading'}
                      whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-green-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {status === 'loading' ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Subscribing...
                        </span>
                      ) : (
                        'Join the Mission'
                      )}
                    </motion.button>

                    {status === 'error' && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {errorMessage}
                      </motion.p>
                    )}
                  </form>
                </>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  🔒 No spam, unsubscribe anytime • 📧 Updates only
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
