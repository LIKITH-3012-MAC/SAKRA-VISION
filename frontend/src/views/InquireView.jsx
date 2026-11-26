import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MapPin, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import SuccessExperience from '../components/SuccessExperience';
import ConsultationModule from '../components/ConsultationModule';
import SEO from '../components/SEO';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InquireView({ setActiveView }) {
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
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
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
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      errors.message = 'Please enter at least 10 characters describing your project.';
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
    <div className="w-full relative bg-black pt-28 pb-20">
      <SEO
        title="Contact Sakra Vision | Project Enquiries & Collaboration"
        description="Contact Sakra Vision for AI automation, web development, event registration systems, and cloud software solutions."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Background radial glows */}
        <div aria-hidden="true" className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#0071e3]/5 blur-[130px] rounded-full pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#38bdf8]/5 blur-[130px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Start a Project with SAKRA VISION.
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-sm md:text-base font-light font-sans leading-relaxed">
            Tell us what you&apos;re building. We&apos;ll explore the architecture, intelligence, and product experience required to turn the idea into reality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto relative z-10">
          {/* Left Column: Consultation Module + Studio Hub */}
          <div className="lg:col-span-5 flex flex-col gap-8 text-left">
            <ConsultationModule
              onStartProject={scrollToForm}
              onBookMeeting={() => setActiveView('book')}
            />

            <div className="apple-glass p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-white/15">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 sm:mb-5 font-sans">Studio Hub</h2>
                <p className="text-slate-300 leading-relaxed mb-6 font-normal text-sm font-sans">
                  We operate as a global AI lab and product studio, engineering intelligence into production-level codebases. Let&apos;s create something remarkable together.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveView('capabilities')}
                  className="apple-dark-button text-xs sm:text-sm mb-8 cursor-pointer w-full justify-center md:w-auto min-h-[44px]"
                >
                  Explore Sakra Vision Services
                </button>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs text-slate-300 uppercase font-mono tracking-wider font-semibold">
                        Email Us
                      </h3>
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
                      <h3 className="text-xs text-slate-300 uppercase font-mono tracking-wider font-semibold">
                        Location
                      </h3>
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

          {/* Right Column: Form panel */}
          <div
            ref={formRef}
            className="lg:col-span-7 apple-glass p-5 sm:p-8 rounded-3xl relative shadow-2xl min-h-[450px] border border-white/15 scroll-mt-24"
          >
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
                      <label htmlFor="name" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'inquire-name-error' : undefined}
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-black/70 border ${
                          fieldErrors.name ? 'border-rose-500/70' : 'border-white/15'
                        } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                        placeholder="Your name"
                      />
                      {fieldErrors.name && (
                        <p id="inquire-name-error" className="text-xs text-rose-300 mt-1.5 font-sans">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'inquire-email-error' : undefined}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-black/70 border ${
                          fieldErrors.email ? 'border-rose-500/70' : 'border-white/15'
                        } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]`}
                        placeholder="email@example.com"
                      />
                      {fieldErrors.email && (
                        <p id="inquire-email-error" className="text-xs text-rose-300 mt-1.5 font-sans">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
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
                      <label htmlFor="project_type" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Project Type
                      </label>
                      <select
                        id="project_type"
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-3.5 py-3 text-slate-100 text-base sm:text-sm focus:outline-none transition-colors cursor-pointer min-h-[46px]"
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
                      <label htmlFor="timeline" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                        Timeline
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-3.5 py-3 text-slate-100 text-base sm:text-sm focus:outline-none transition-colors cursor-pointer min-h-[46px]"
                      >
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-left">
                    <label htmlFor="message" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="4"
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={fieldErrors.message ? 'inquire-message-error' : undefined}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full bg-black/70 border ${
                        fieldErrors.message ? 'border-rose-500/70' : 'border-white/15'
                      } focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 rounded-xl px-4 py-3 text-white text-base sm:text-sm placeholder-slate-400 focus:outline-none transition-colors resize-y`}
                      placeholder="Describe your project specification details..."
                    />
                    {fieldErrors.message && (
                      <p id="inquire-message-error" className="text-xs text-rose-300 mt-1.5 font-sans">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  <div className="text-left">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        required
                        aria-invalid={Boolean(fieldErrors.consent)}
                        aria-describedby={fieldErrors.consent ? 'inquire-consent-error' : undefined}
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-0.5 w-5 h-5 accent-[#0071e3] bg-black border border-white/25 rounded cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      />
                      <label htmlFor="consent" className="text-xs sm:text-sm text-slate-200 leading-relaxed cursor-pointer select-none">
                        I agree to allow SAKRA VISION to contact me regarding this request.
                      </label>
                    </div>
                    {fieldErrors.consent && (
                      <p id="inquire-consent-error" className="text-xs text-rose-300 mt-1.5 font-sans pl-8">
                        {fieldErrors.consent}
                      </p>
                    )}
                  </div>

                  {/* Security Verification Section */}
                  <div className="border border-white/15 bg-black/45 rounded-2xl p-4 sm:p-6 relative overflow-hidden blue-rim">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-white font-sans tracking-wide">
                          Security Verification
                        </h3>
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
                        <span>Securing Request...</span>
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
      </div>
    </div>
  );
}
