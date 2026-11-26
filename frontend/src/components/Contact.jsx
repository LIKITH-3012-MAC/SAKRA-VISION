import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import ConsultationModule from './ConsultationModule';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEETING_URL = 'https://meet.google.com/grg-hytm-ahw';

const Contact = () => {
  const turnstileContainerRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: 'AI Application',
    timeline: 'Within 1 month',
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      project_type: 'AI Application',
      timeline: 'Within 1 month',
      message: '',
      consent: false
    });
    setFieldErrors({});
    setTurnstileToken('');
    setIsVerified(false);
    setSubmitStatus('idle');
    setStatus({ type: null, message: '' });
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      errors.message = 'Message must be at least 10 characters.';
    }
    if (!formData.consent) {
      errors.consent = 'You must consent to allow SAKRA VISION to contact you.';
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
        timeline: formData.timeline,
        message: trimmedMessage,
        consent: formData.consent,
        captcha_token: turnstileToken
      });

      if (response.status === 200 || response.status === 201) {
        const clientConfSent = response.data?.email?.client_confirmation;
        setSubmitStatus(clientConfSent ? 'success_email' : 'success_no_email');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      const backendError = error.response?.data?.message || error.response?.data?.detail;
      setStatus({
        type: 'error',
        message: typeof backendError === 'string' ? backendError : 'Something went wrong. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-5 sm:px-6 max-w-6xl mx-auto bg-black text-left">
      <div aria-hidden="true" className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#0071e3]/5 blur-[130px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#38bdf8]/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="text-center mb-14 sm:mb-16">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Get In Touch
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
          Start a Project with SAKRA VISION.
        </h2>
        <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-sm md:text-base font-light font-sans leading-relaxed">
          Tell us what you&apos;re building. We&apos;ll explore the architecture, intelligence, and product experience required to turn the idea into reality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto relative z-10">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <ConsultationModule
            onStartProject={scrollToForm}
            onBookMeeting={() => window.open(MEETING_URL, '_blank', 'noopener,noreferrer')}
          />

          <div className="apple-glass p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-white/15">
            <div>
              <h3 className="text-xl font-bold text-white mb-5 font-sans">Studio Hub</h3>
              <p className="text-slate-300 leading-relaxed mb-7 font-normal text-sm font-sans">
                We operate as a global AI lab and product studio, engineering intelligence into production-level codebases. Let&apos;s create something remarkable together.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs text-slate-300 uppercase font-mono tracking-wider font-semibold">
                      Email Us
                    </h4>
                    <p className="text-white font-mono mt-1 text-xs md:text-sm flex flex-col gap-1 break-all">
                      <a href="mailto:likith.anumakonda@gmail.com" className="hover:text-[#38bdf8] transition-colors">
                        likith.anumakonda@gmail.com
                      </a>
                      <a href="mailto:likith.naidu@icloud.com" className="hover:text-[#38bdf8] transition-colors">
                        likith.naidu@icloud.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-300 uppercase font-mono tracking-wider font-semibold">
                      Location
                    </h4>
                    <p className="text-white mt-1 text-xs md:text-sm">AI Innovation Center, India / Remote</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-7 mt-8">
              <span className="text-xs font-mono text-[#38bdf8] block mb-1.5">Tagline</span>
              <p className="text-base font-bold text-white italic font-sans">
                &ldquo;Engineering Intelligence Into Reality&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div
          ref={formRef}
          className="lg:col-span-7 apple-glass p-5 sm:p-8 rounded-3xl relative shadow-2xl min-h-[450px] border border-white/15 scroll-mt-24"
        >
          <AnimatePresence mode="wait">
            {submitStatus === 'success_email' || submitStatus === 'success_no_email' || submitStatus === 'success' ? (
              <motion.div
                key="success-card"
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="py-12 px-4 text-center flex flex-col items-center justify-center min-h-[400px] w-full"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] mb-6 blue-rim mx-auto">
                  <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white font-sans tracking-tight mb-3">
                  Inquiry submitted successfully.
                </h3>
                <p className="text-slate-200 font-normal text-sm leading-relaxed mb-8 max-w-sm font-sans mx-auto">
                  {submitStatus === 'success_email' ? (
                    <>
                      A confirmation email has been sent to your email address.
                      <br />
                      SAKRA VISION will contact you soon.
                    </>
                  ) : (
                    <>SAKRA VISION received your request and will contact you soon.</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="apple-button w-full max-w-xs justify-center text-sm cursor-pointer min-h-[46px]"
                >
                  Back to Overview
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      required
                      aria-invalid={Boolean(fieldErrors.name)}
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-black/70 border ${
                        fieldErrors.name ? 'border-rose-500/70' : 'border-white/15'
                      } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                      placeholder="Your name"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-black/70 border ${
                        fieldErrors.email ? 'border-rose-500/70' : 'border-white/15'
                      } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                      placeholder="email@example.com"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-company" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="contact-company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                      placeholder="Enterprise Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                  <div>
                    <label htmlFor="contact-project-type" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Project Type
                    </label>
                    <select
                      id="contact-project-type"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleChange}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] rounded-xl px-3.5 py-3 text-slate-100 text-base sm:text-sm focus:outline-none transition-colors cursor-pointer min-h-[46px]"
                    >
                      <option value="AI Application">AI Application</option>
                      <option value="Computer Vision">Computer Vision</option>
                      <option value="LLM & RAG Solution">LLM &amp; RAG Solution</option>
                      <option value="Automation System">Automation System</option>
                      <option value="Full-Stack Product">Full-Stack Product</option>
                      <option value="AI Agentic Workflow">AI Agentic Workflow</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-timeline" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Timeline
                    </label>
                    <select
                      id="contact-timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] rounded-xl px-3.5 py-3 text-slate-100 text-base sm:text-sm focus:outline-none transition-colors cursor-pointer min-h-[46px]"
                    >
                      <option value="Within 1 month">Within 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="text-left">
                  <label htmlFor="contact-message" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows="4"
                    aria-invalid={Boolean(fieldErrors.message)}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-black/70 border ${
                      fieldErrors.message ? 'border-rose-500/70' : 'border-white/15'
                    } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors resize-y`}
                    placeholder="Describe your project specification details..."
                  />
                  {fieldErrors.message && (
                    <p className="text-xs text-rose-300 mt-1.5 font-sans">{fieldErrors.message}</p>
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contact-consent"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 w-5 h-5 accent-[#0071e3] bg-black border border-white/25 rounded cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                    />
                    <label htmlFor="contact-consent" className="text-xs sm:text-sm text-slate-200 leading-relaxed cursor-pointer select-none">
                      I agree to allow SAKRA VISION to contact me regarding this request.
                    </label>
                  </div>
                  {fieldErrors.consent && (
                    <p className="text-xs text-rose-300 mt-1.5 font-sans pl-8">{fieldErrors.consent}</p>
                  )}
                </div>

                <div className="border border-white/15 bg-black/45 rounded-2xl p-4 sm:p-6 relative overflow-hidden blue-rim">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-white font-sans tracking-wide">
                        Security Verification
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
                        Complete the secure verification to confirm you are human before submitting your inquiry.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 relative min-h-[56px] w-full max-w-full overflow-hidden flex flex-col justify-center items-start">
                    {!isVerified ? (
                      <div ref={turnstileContainerRef} className="cf-turnstile max-w-full" />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-emerald-300 font-medium text-sm text-left"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Verification successful</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isVerified || loading}
                  className="apple-button w-full min-h-[48px] cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {submitStatus === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Submitting Securely...</span>
                    </span>
                  ) : !isVerified ? (
                    'Complete Verification First'
                  ) : (
                    'Submit Inquiry'
                  )}
                </button>

                <AnimatePresence mode="wait">
                  {submitStatus === 'error' && status.message && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-4 rounded-xl border border-rose-500/35 bg-rose-500/15 text-rose-200 text-xs font-mono flex items-start gap-3 text-left"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{status.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Contact;
