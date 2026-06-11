import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

export default function InquireView() {
  const turnstileContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: 'AI Application',
    budget_range: '₹15,000 - ₹50,000',
    timeline: 'Within 1 month',
    message: '',
    consent: false
  });

  const [turnstileToken, setTurnstileToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let widgetId = null;
    const renderInterval = setInterval(() => {
      if (window.turnstile && turnstileContainerRef.current && !isVerified) {
        clearInterval(renderInterval);
        try {
          widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: '1x00000000000000000000AA',
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
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {}
      }
    };
  }, [isVerified]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      project_type: 'AI Application',
      budget_range: '₹15,000 - ₹50,000',
      timeline: 'Within 1 month',
      message: '',
      consent: false
    });
    setTurnstileToken('');
    setIsVerified(false);
    setSubmitStatus('idle');
    setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setLoading(true);
    setStatus({ type: null, message: '' });

    if (formData.name.length < 2) {
      setStatus({ type: 'error', message: 'Name must be at least 2 characters.' });
      setSubmitStatus('error');
      setLoading(false);
      return;
    }
    if (formData.message.length < 10) {
      setStatus({ type: 'error', message: 'Message must be at least 10 characters.' });
      setSubmitStatus('error');
      setLoading(false);
      return;
    }
    if (!formData.consent) {
      setStatus({ type: 'error', message: 'You must consent to terms.' });
      setSubmitStatus('error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/clients', {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        project_type: formData.project_type,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
        message: formData.message,
        consent: formData.consent,
        captcha_token: turnstileToken
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
      }
    } catch (error) {
      console.error("Submission error:", error);
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
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Background radial glows */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#0071e3]/5 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#38bdf8]/5 blur-[130px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Start a Project with SAKRA VISION.
          </h2>
          <p className="text-[#94a3b8] mt-4 max-w-xl mx-auto text-sm md:text-base font-light font-sans">
            Let's discuss how we can build custom intelligence models, automation pipelines, and deep-tech web products for your enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto relative z-10">
          
          {/* Contact info panel */}
          <div className="lg:col-span-5 flex flex-col justify-between apple-glass p-8 rounded-3xl text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-6 font-sans">Studio Hub</h3>
              <p className="text-[#94a3b8] leading-relaxed mb-8 font-light text-sm font-sans">
                We operate as a global AI lab and product studio, engineering intelligence into production-level codebases. Let's create something remarkable together.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Email Us</h4>
                    <p className="text-white font-mono mt-1 text-xs md:text-sm flex flex-col gap-0.5">
                      <a href="mailto:likith.anumakonda@gmail.com" className="hover:text-[#38bdf8] transition-colors">likith.anumakonda@gmail.com</a>
                      <a href="mailto:likith.naidu@icloud.com" className="hover:text-[#38bdf8] transition-colors">likith.naidu@icloud.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Location</h4>
                    <p className="text-white mt-1 text-xs md:text-sm">AI Innovation Center, India / Remote</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 mt-8">
              <span className="text-[10px] font-mono text-[#0071e3] block mb-2">Tagline</span>
              <p className="text-base font-bold text-white italic font-sans">
                "Engineering Intelligence Into Reality"
              </p>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-7 apple-glass p-8 rounded-3xl relative shadow-2xl min-h-[450px]">
            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="py-12 px-4 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#38bdf8] mb-6 blue-rim">
                    <svg className="w-8 h-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-sans tracking-tight mb-3">Inquiry submitted successfully.</h3>
                  <p className="text-[#cbd5e1] font-light text-sm leading-relaxed mb-8 max-w-sm font-sans mx-auto">
                    SAKRA VISION received your project request and will contact you soon.
                  </p>
                  <button
                    onClick={handleReset}
                    className="apple-button w-full max-w-xs justify-center text-sm cursor-pointer"
                  >
                    Back to Overview
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 focus:ring-1 focus:ring-[#0071e3]/45 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 focus:ring-1 focus:ring-[#0071e3]/45 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label htmlFor="phone" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 focus:ring-1 focus:ring-[#0071e3]/45 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Company</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 focus:ring-1 focus:ring-[#0071e3]/45 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                        placeholder="Enterprise Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div>
                      <label htmlFor="project_type" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Project Type</label>
                      <select
                        id="project_type"
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 rounded-xl px-3 py-3 text-[#cbd5e1] text-xs md:text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="AI Application">AI Application</option>
                        <option value="Computer Vision">Computer Vision</option>
                        <option value="LLM & RAG Solution">LLM & RAG Solution</option>
                        <option value="Automation System">Automation System</option>
                        <option value="Full-Stack Product">Full-Stack Product</option>
                        <option value="AI Agentic Workflow">AI Agentic Workflow</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget_range" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Budget Range</label>
                      <select
                        id="budget_range"
                        name="budget_range"
                        value={formData.budget_range}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 rounded-xl px-3 py-3 text-[#cbd5e1] text-xs md:text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="Under ₹15,000">Under ₹15,000</option>
                        <option value="₹15,000 - ₹50,000">₹15,000 - ₹50,000</option>
                        <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                        <option value="₹1,50,000+">₹1,50,000+</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timeline" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Timeline</label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 rounded-xl px-3 py-3 text-[#cbd5e1] text-xs md:text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-left">
                    <label htmlFor="message" className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 focus:border-[#0071e3]/80 focus:ring-1 focus:ring-[#0071e3]/45 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors resize-none"
                      placeholder="Describe your project specification details..."
                    />
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-1 accent-[#0071e3] bg-black border border-white/10 rounded cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                      I agree to allow SAKRA VISION to contact me regarding this request.
                    </label>
                  </div>

                  {/* Security Verification Section */}
                  <div className="border border-white/5 bg-black/40 rounded-2xl p-6 relative overflow-hidden blue-rim">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-white font-sans tracking-wide">Security Verification</h4>
                        <p className="text-xs text-[#94a3b8] mt-1 font-light leading-relaxed">
                          Complete the secure verification to confirm you are human before submitting your inquiry.
                        </p>
                      </div>
                    </div>

                    {/* Turnstile Container / Success State */}
                    <div className="mt-4 relative min-h-[50px] flex flex-col justify-center items-start">
                      {!isVerified ? (
                        <div ref={turnstileContainerRef} className="cf-turnstile"></div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-emerald-400 font-medium text-sm text-left"
                        >
                          <span>✅</span>
                          <span>Verification successful</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isVerified || loading}
                    className="apple-button w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'submitting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Securely...
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-mono flex items-start gap-3 text-left"
                      >
                        <span className="text-base">🚨</span>
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

