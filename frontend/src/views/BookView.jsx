import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import SEO from '../components/SEO';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  User,
  Mail,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Globe
} from 'lucide-react';

const MEETING_URL = 'https://meet.google.com/grg-hytm-ahw';
const CONSULTATION_HOURS = 'Every day · 6:00 PM – 9:00 PM IST';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIME_SLOTS = [
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM'
];

// Local YYYY-MM-DD formatter avoids UTC midnight offset mismatch
function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function BookView({ setActiveView }) {
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    project_topic: '',
    appointment_date: getLocalDateString(1),
    appointment_time: '7:00 PM',
    timezone: 'IST'
  });

  const [captchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [userBrowserTz, setUserBrowserTz] = useState('');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setUserBrowserTz(tz);
    } catch (e) {}
  }, []);

  const handleDateChange = (e) => {
    setFormData((prev) => ({ ...prev, appointment_date: e.target.value }));
  };

  const handleTimeSelect = (slot) => {
    setFormData((prev) => ({ ...prev, appointment_time: slot }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    const trimmedEmail = formData.customer_email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.appointment_date || !formData.appointment_time) {
      setErrorMsg('Please select a preferred date and time slot.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/api/bookings', {
        customer_email: trimmedEmail,
        customer_name: formData.customer_name.trim() || undefined,
        project_topic: formData.project_topic.trim() || undefined,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        timezone: 'IST',
        captcha_token: captchaToken || undefined
      });

      if (response.data && response.data.success) {
        setConfirmedBooking(response.data);
      } else {
        setErrorMsg(response.data?.message || 'Booking submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      const backendError = err.response?.data?.detail || err.response?.data?.message;
      setErrorMsg(backendError || 'Unable to lock in consultation. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const formattedSelectedDate = () => {
    try {
      const d = new Date(`${formData.appointment_date}T12:00:00`);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return formData.appointment_date;
    }
  };

  const todayStr = getLocalDateString(0);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left selection:bg-[#0071e3]/30">
      <SEO
        title="Private Consultation Gateway | SAKRA VISION"
        description="Schedule a 1-on-1 private video consultation with SAKRA VISION AI Product Studio. Scope and commercial terms are discussed individually."
      />

      {/* Return navigation breadcrumb */}
      {!confirmedBooking && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setActiveView('inquire')}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/15 px-3.5 py-2 min-h-[40px] rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
            <span>Back to Inquiries</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!confirmedBooking ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left Column — Studio Branding & Consultation Context */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-xs font-mono text-[#38bdf8] mb-4">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>SAKRA VISION PRIVATE CONSULTATION</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  Let&apos;s Build Something{' '}
                  <span className="bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-white bg-clip-text text-transparent">
                    Intelligent
                  </span>{' '}
                  Together.
                </h1>

                <p className="text-sm sm:text-base text-slate-300 font-light mt-4 leading-relaxed">
                  Choose a convenient consultation time and tell us where you&apos;d like to take the conversation.
                </p>
              </div>

              {/* Consultation Features Cards */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <Video className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                      Direct Google Meet Video
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
                      High-fidelity 1-on-1 video call directly with Lead AI Architect Likith Naidu.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                      Daily Availability Window
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">{CONSULTATION_HOURS}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                      Individual Commercial Terms
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
                      Project scope and commercial positioning discussed individually tailored to your needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timezone Note Card */}
              <div className="p-4 rounded-2xl bg-[#0071e3]/15 border border-[#38bdf8]/35 text-xs text-slate-100 flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#38bdf8] flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-mono text-[#38bdf8] font-bold block text-xs uppercase">
                    Canonical Timezone
                  </span>
                  <span>
                    Official schedule: <strong>6:00 PM – 9:00 PM IST</strong>
                  </span>
                  {userBrowserTz && userBrowserTz !== 'Asia/Kolkata' && (
                    <span className="block text-xs text-slate-300 mt-0.5">
                      Your browser timezone: {userBrowserTz}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column — Interactive Consultation Booking Portal */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmitBooking}
                noValidate
                className="p-5 sm:p-8 rounded-3xl bg-slate-950/85 border border-white/15 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6"
              >
                <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/45 to-transparent" />

                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                    ✦ Schedule Private Session
                  </h2>
                  <span className="text-xs font-mono text-[#38bdf8] bg-[#0071e3]/15 border border-[#38bdf8]/30 px-2.5 py-0.5 rounded-full">
                    Direct Booking
                  </span>
                </div>

                {/* Step 1: Customer Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="book-email" className="block text-xs font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      id="book-email"
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setFormData((prev) => ({ ...prev, customer_email: e.target.value }));
                      }}
                      placeholder="you@gmail.com"
                      className="w-full px-4 py-3 bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="book-name" className="block text-xs font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                        <span>Your Name (Optional)</span>
                      </label>
                      <input
                        id="book-name"
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="e.g. Alex Mercer"
                        className="w-full px-4 py-3 bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                      />
                    </div>

                    <div>
                      <label htmlFor="book-topic" className="block text-xs font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                        <span>Topic (Optional)</span>
                      </label>
                      <input
                        id="book-topic"
                        type="text"
                        value={formData.project_topic}
                        onChange={(e) => setFormData((prev) => ({ ...prev, project_topic: e.target.value }))}
                        placeholder="e.g. AI System Architecture"
                        className="w-full px-4 py-3 bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors min-h-[46px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Date Selector */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="book-date" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Select Preferred Date *</span>
                    </label>
                    <span className="text-xs font-mono text-slate-300">Future dates</span>
                  </div>

                  <input
                    id="book-date"
                    type="date"
                    required
                    min={todayStr}
                    value={formData.appointment_date}
                    onChange={handleDateChange}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-4 py-3 bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-base sm:text-sm text-white focus:outline-none transition-colors cursor-pointer font-sans min-h-[46px]"
                  />
                </div>

                {/* Step 3: Selectable Glass Time Cards */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span id="book-time-label" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Select Time Slot (IST) *</span>
                    </span>
                    <span className="text-xs font-mono text-[#38bdf8]">6:00 PM – 9:00 PM</span>
                  </div>

                  <div role="group" aria-labelledby="book-time-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = formData.appointment_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleTimeSelect(slot)}
                          className={`py-3 px-3 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                            isSelected
                              ? 'bg-[#0071e3] text-white border-[#38bdf8] shadow-[0_0_16px_rgba(0,113,227,0.5)] font-bold'
                              : 'bg-white/[0.06] text-slate-100 hover:text-white border-white/15 hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <span aria-hidden="true" className="text-xs text-white">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Glass Booking Summary Card */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#38bdf8]/35 space-y-2.5">
                  <div className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase font-bold">
                    ✦ Consultation Summary
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div>
                      <span className="text-slate-300 block text-xs uppercase font-mono">Studio</span>
                      <span className="text-white font-semibold">SAKRA VISION</span>
                    </div>
                    <div>
                      <span className="text-slate-300 block text-xs uppercase font-mono">Format</span>
                      <span className="text-white font-semibold">Google Meet Direct</span>
                    </div>
                    <div>
                      <span className="text-slate-300 block text-xs uppercase font-mono">Date</span>
                      <span className="text-white font-semibold">{formattedSelectedDate()}</span>
                    </div>
                    <div>
                      <span className="text-slate-300 block text-xs uppercase font-mono">Time</span>
                      <span className="text-[#38bdf8] font-bold">{formData.appointment_time} IST</span>
                    </div>
                  </div>
                </div>

                {/* Error Surface */}
                {errorMsg && (
                  <div role="alert" className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs font-sans flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !formData.customer_email.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-[0_8px_28px_rgba(0,113,227,0.4)] disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-[#38bdf8]/35 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Locking in Consultation...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Consultation</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* Confirmation View */
          <motion.div
            key="confirmation-screen"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/95 border border-[#38bdf8]/40 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center space-y-6"
          >
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
            <div aria-hidden="true" className="absolute -top-24 -right-24 w-48 h-48 bg-[#0071e3]/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div>
              <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
                ✦ CONSULTATION LOCKED IN
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 font-sans">
                Consultation Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2 max-w-md mx-auto">
                {confirmedBooking.message || 'A confirmation email has been dispatched with session details.'}
              </p>
            </div>

            {/* Confirmation Key Details */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/15 text-left space-y-3 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-xs text-slate-300 font-mono">BOOKING REFERENCE</span>
                <span className="text-xs font-mono font-bold text-[#38bdf8]">{confirmedBooking.reference_id}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-xs text-slate-300 font-mono">DATE</span>
                <span className="text-xs font-semibold text-white">{formattedSelectedDate()}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-xs text-slate-300 font-mono">TIME</span>
                <span className="text-xs font-bold text-[#38bdf8]">{formData.appointment_time} IST</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-300 font-mono">FORMAT</span>
                <span className="text-xs font-semibold text-white">Google Meet Direct Video</span>
              </div>
            </div>

            {/* Direct Google Meet Join CTA */}
            <div className="pt-2 space-y-3">
              <a
                href={confirmedBooking.meeting_url || MEETING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] text-white font-semibold text-sm transition-all duration-200 shadow-[0_8px_28px_rgba(0,113,227,0.45)] cursor-pointer inline-flex items-center justify-center gap-2 border border-[#38bdf8]/40 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Join Google Meet</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setActiveView('overview');
                }}
                className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer py-2.5 px-4 min-h-[44px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
              >
                Return to SAKRA VISION Overview →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
