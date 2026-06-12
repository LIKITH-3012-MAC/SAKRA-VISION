import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import SuccessExperience from '../components/SuccessExperience';
import SEO from '../components/SEO';

export default function RegistrationView({ setActiveView }) {
  const turnstileContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: 'Event Registration',
    message: '',
    consent: false
  });

  const [turnstileToken, setTurnstileToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let widgetId = null;
    const renderInterval = setInterval(() => {
      if (window.turnstile && turnstileContainerRef.current && !isVerified) {
        clearInterval(renderInterval);
        try {
          widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: '0x4AAAAAADitIbxDQDzUGUKm',
            callback: (token) => {
              setTurnstileToken(token);
              setIsVerified(true);
            },
            'error-callback': () => {
              setStatus({ type: 'error', message: 'CAPTCHA load failed. Please refresh.' });
            }
          });
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      }
    }, 500);
    return () => {
      clearInterval(renderInterval);
      if (widgetId && window.turnstile) {
        try { window.turnstile.remove(widgetId); } catch (e) {}
      }
    };
  }, [isVerified]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', company: '', project_type: 'Event Registration', message: '', consent: false });
    setTurnstileToken(''); setIsVerified(false); setSubmitStatus('idle'); setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setLoading(true);
    setStatus({ type: null, message: '' });

    if (formData.name.length < 2 || !formData.consent) {
      setStatus({ type: 'error', message: 'Please fill required fields and consent.' });
      setSubmitStatus('error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/clients', {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        project_type: formData.project_type,
        message: formData.message,
        consent: formData.consent,
        captcha_token: turnstileToken
      });
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success_email');
      }
    } catch (error) {
      setSubmitStatus('error');
      setStatus({ type: 'error', message: 'Submission failed. Try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative bg-black pt-28 pb-20 min-h-screen">
      <SEO 
        title="Sakra Vision Contact Form | Submit Your Project Request"
        description="Submit your details through the Sakra Vision registration form for events, workshops, services, or project enquiries."
      />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-left">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-2 font-sans">
          Registration & Forms
        </h1>
        
        <p className="text-base text-[#94a3b8] mt-4 font-light font-sans">
          Fill this form carefully and submit your details. Our team will review your information and contact you if needed.
        </p>

        <div className="mt-12 apple-glass p-8 rounded-3xl relative shadow-2xl min-h-[450px]">
          <AnimatePresence mode="wait">
            {submitStatus === 'success_email' || submitStatus === 'success_no_email' || submitStatus === 'success' ? (
              <SuccessExperience submitStatus={submitStatus} handleReset={handleReset} setActiveView={setActiveView} key="success-exp" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Details *</label>
                  <textarea name="message" required rows="4" value={formData.message} onChange={handleChange} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Enter your requirements..."></textarea>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <input type="checkbox" name="consent" required checked={formData.consent} onChange={handleChange} className="mt-1 accent-[#0071e3] bg-black border border-white/10 rounded cursor-pointer" />
                  <label className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                    I agree to allow SAKRA VISION to contact me regarding this request.
                  </label>
                </div>

                <div className="mt-4 relative min-h-[50px] flex flex-col justify-center items-start">
                  {!isVerified ? (
                    <div ref={turnstileContainerRef} className="cf-turnstile"></div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm text-left">
                      <span>✅ Verification successful</span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={!isVerified || loading} className="apple-button w-full cursor-pointer disabled:opacity-50">
                  {submitStatus === 'submitting' ? 'Securing Request...' : !isVerified ? 'Complete Verification First' : 'Submit Registration Form'}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
