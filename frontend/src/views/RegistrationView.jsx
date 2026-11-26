import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import SuccessExperience from '../components/SuccessExperience';
import SEO from '../components/SEO';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const [fieldErrors, setFieldErrors] = useState({});
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
            size: window.innerWidth < 400 ? 'compact' : 'normal',
            callback: (token) => {
              setTurnstileToken(token);
              setIsVerified(true);
              setStatus({ type: null, message: '' });
              if (submitStatus === 'error') setSubmitStatus('idle');
            },
            'error-callback': () => {
              setSubmitStatus('error');
              setStatus({
                type: 'error',
                message: 'Security verification failed to load. Please refresh or check browser blockers.'
              });
            }
          });
        } catch (err) {
          console.error('Turnstile render error:', err);
        }
      }
    }, 500);
    return () => {
      clearInterval(renderInterval);
      if (widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {}
      }
    };
  }, [isVerified, submitStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      project_type: 'Event Registration',
      message: '',
      consent: false
    });
    setFieldErrors({});
    setTurnstileToken('');
    setIsVerified(false);
    setSubmitStatus('idle');
    setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (trimmedMessage.length < 10) {
      errors.message = 'Please enter at least 10 characters of details.';
    }
    if (!formData.consent) {
      errors.consent = 'Please confirm consent so SAKRA VISION can contact you.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('error');
      setStatus({ type: 'error', message: Object.values(errors)[0] });
      return;
    }

    setFieldErrors({});
    setSubmitStatus('submitting');
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await api.post('/api/clients', {
        full_name: trimmedName,
        email: trimmedEmail,
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        project_type: formData.project_type,
        message: trimmedMessage,
        consent: formData.consent,
        captcha_token: turnstileToken
      });
      if (response.status === 200 || response.status === 201) {
        const clientConfSent = response.data?.email?.client_confirmation;
        setSubmitStatus(clientConfSent ? 'success_email' : 'success_no_email');
      }
    } catch (error) {
      setSubmitStatus('error');
      const backendError = error.response?.data?.message || error.response?.data?.detail;
      setStatus({
        type: 'error',
        message: typeof backendError === 'string' ? backendError : 'Submission failed. Try again later.'
      });
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

      <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-10 text-left">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Event &amp; Studio Registration
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-2 font-sans">
          Registration &amp; Forms
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-4 font-light font-sans">
          Fill this form carefully and submit your details. Our team will review your information and contact you if needed.
        </p>

        <div className="mt-10 apple-glass p-5 sm:p-8 rounded-3xl relative shadow-2xl min-h-[450px] border border-white/15">
          <AnimatePresence mode="wait">
            {submitStatus === 'success_email' || submitStatus === 'success_no_email' || submitStatus === 'success' ? (
              <SuccessExperience
                submitStatus={submitStatus}
                handleReset={handleReset}
                setActiveView={setActiveView}
                key="success-exp"
              />
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Name *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      name="name"
                      required
                      aria-invalid={Boolean(fieldErrors.name)}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`w-full bg-black/70 border ${
                        fieldErrors.name ? 'border-rose-500/70' : 'border-white/15'
                      } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Email *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className={`w-full bg-black/70 border ${
                        fieldErrors.email ? 'border-rose-500/70' : 'border-white/15'
                      } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-company" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Organization / College
                    </label>
                    <input
                      id="reg-company"
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Organization or Institution"
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label htmlFor="reg-message" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                    Details *
                  </label>
                  <textarea
                    id="reg-message"
                    name="message"
                    required
                    rows="4"
                    aria-invalid={Boolean(fieldErrors.message)}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-black/70 border ${
                      fieldErrors.message ? 'border-rose-500/70' : 'border-white/15'
                    } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors resize-y`}
                    placeholder="Enter your requirements..."
                  />
                  {fieldErrors.message && (
                    <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.message}</p>
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-start gap-3">
                    <input
                      id="reg-consent"
                      type="checkbox"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 w-5 h-5 accent-[#0071e3] bg-black border border-white/25 rounded cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                    />
                    <label htmlFor="reg-consent" className="text-xs sm:text-sm text-slate-200 leading-relaxed cursor-pointer select-none">
                      I agree to allow SAKRA VISION to contact me regarding this request.
                    </label>
                  </div>
                  {fieldErrors.consent && (
                    <p className="text-xs text-rose-300 mt-1.5 font-sans pl-8">{fieldErrors.consent}</p>
                  )}
                </div>

                {/* Security Verification Card */}
                <div className="border border-white/15 bg-black/45 rounded-2xl p-4 sm:p-6 relative overflow-hidden blue-rim">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-sm font-semibold text-white font-sans tracking-wide">
                        Security Verification
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
                        Complete verification before submitting your registration.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 relative min-h-[56px] w-full max-w-full overflow-hidden flex flex-col justify-center items-start">
                    {!isVerified ? (
                      <div ref={turnstileContainerRef} className="cf-turnstile max-w-full" />
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm text-left">
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Verification successful</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isVerified || loading}
                  className="apple-button w-full min-h-[48px] cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {submitStatus === 'submitting'
                    ? 'Securing Request...'
                    : !isVerified
                      ? 'Complete Verification First'
                      : 'Submit Registration Form'}
                </button>

                {submitStatus === 'error' && status.message && (
                  <div
                    role="alert"
                    className="p-4 rounded-xl border border-rose-500/35 bg-rose-500/15 text-rose-200 text-xs font-mono flex items-start gap-3 text-left"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{status.message}</span>
                  </div>
                )}
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
