import SEO from '../components/SEO';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, ArrowRight, ArrowUpRight, Sparkles, User, Mail, MessageSquare, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';


const MEETING_URL = "https://meet.google.com/grg-hytm-ahw";
const CONSULTATION_HOURS = "Every day · 6:00 PM – 9:00 PM IST";

const TIME_SLOTS = [
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM"
];

export default function BookView({ setActiveView }) {
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    project_topic: '',
    appointment_date: getInitialDateString(),
    appointment_time: '7:00 PM',
    timezone: 'IST'
  });

  const [captchaToken, setCaptchaToken] = useState('');
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

  function getInitialDateString() {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split('T')[0];
  }

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, appointment_date: e.target.value }));
  };

  const handleTimeSelect = (slot) => {
    setFormData(prev => ({ ...prev, appointment_time: slot }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.customer_email || !formData.appointment_date || !formData.appointment_time) {
      setErrorMsg("Please provide your email, date, and select a time slot.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/api/bookings', {
        customer_email: formData.customer_email.trim(),
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
        setErrorMsg(response.data?.message || "Booking submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      const backendError = err.response?.data?.detail || err.response?.data?.message;
      setErrorMsg(backendError || "Unable to lock in consultation. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  const formattedSelectedDate = () => {
    try {
      const d = new Date(formData.appointment_date + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return formData.appointment_date;
    }
  };

  // Get minimum date allowed (today)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left selection:bg-[#0071e3]/30">
      <SEO 
        title="Private Consultation Gateway | SAKRA VISION" 
        description="Schedule a 1-on-1 private video consultation with SAKRA VISION AI Product Studio. Scope and commercial terms are discussed individually." 
      />

      <AnimatePresence mode="wait">
        {!confirmedBooking ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left Column — Studio Branding & Consultation Context */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#38bdf8] mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SAKRA VISION PRIVATE CONSULTATION</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  Let's Build Something <span className="bg-gradient-to-r from-[#0071e3] via-[#38bdf8] to-white bg-clip-text text-transparent">Intelligent</span> Together.
                </h1>

                <p className="text-sm sm:text-base text-slate-400 font-light mt-4 leading-relaxed">
                  Choose a convenient consultation time and tell us where you'd like to take the conversation.
                </p>
              </div>

              {/* Consultation Features Cards */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">Direct Google Meet Video</h4>
                    <p className="text-xs text-slate-400 font-light mt-0.5">High-fidelity 1-on-1 video call directly with Lead AI Architect Likith Naidu.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">Daily Availability Window</h4>
                    <p className="text-xs text-slate-400 font-light mt-0.5">{CONSULTATION_HOURS}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">Individual Commercial Terms</h4>
                    <p className="text-xs text-slate-400 font-light mt-0.5">Project scope and commercial positioning discussed individually tailored to your needs.</p>
                  </div>
                </div>
              </div>

              {/* Timezone Note Card */}
              <div className="p-4 rounded-2xl bg-[#0071e3]/10 border border-[#38bdf8]/30 text-xs text-slate-300 flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
                <div>
                  <span className="font-mono text-[#38bdf8] font-bold block text-[10px] uppercase">CANONICAL TIMEZONE</span>
                  <span>Official schedule: <strong>6:00 PM – 9:00 PM IST</strong></span>
                  {userBrowserTz && userBrowserTz !== 'Asia/Kolkata' && (
                    <span className="block text-[11px] text-slate-400 mt-0.5">Your browser timezone: {userBrowserTz}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column — Interactive Consultation Booking Portal */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmitBooking} className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-6">
                
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    ✦ SCHEDULE PRIVATE SESSION
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Step 1 of 2</span>
                </div>

                {/* Step 1: Customer Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="you@gmail.com"
                      className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Your Name (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="e.g. Alex Mercer"
                        className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Topic (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.project_topic}
                        onChange={(e) => setFormData(prev => ({ ...prev, project_topic: e.target.value }))}
                        placeholder="e.g. AI System Architecture"
                        className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Date Selector */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Select Preferred Date *</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">No past dates</span>
                  </label>

                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.appointment_date}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-xl text-sm text-white focus:outline-none transition-colors cursor-pointer font-sans"
                  />
                </div>

                {/* Step 3: Selectable Glass Time Cards */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Select Time Slot (IST) *</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#38bdf8]">6:00 PM – 9:00 PM</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = formData.appointment_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`py-3 px-3 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                            isSelected
                              ? 'bg-[#0071e3] text-white border-[#38bdf8] shadow-[0_0_16px_rgba(0,113,227,0.5)] font-bold scale-[1.02]'
                              : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <span className="text-[10px] text-white">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Glass Booking Summary Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#38bdf8]/30 space-y-2 backdrop-blur-xl">
                  <div className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
                    ✦ CONSULTATION SUMMARY
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">STUDIO</span>
                      <span className="text-white font-semibold">SAKRA VISION</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">FORMAT</span>
                      <span className="text-white font-semibold">Google Meet Direct</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">DATE</span>
                      <span className="text-white font-semibold">{formattedSelectedDate()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">TIME</span>
                      <span className="text-[#38bdf8] font-bold">{formData.appointment_time} IST</span>
                    </div>
                  </div>
                </div>

                {/* Error Surface */}
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Action */}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading || !formData.customer_email}
                  className="w-full py-4 px-6 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-[0_8px_28px_rgba(0,113,227,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-[#38bdf8]/30 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Locking in Consultation...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </motion.div>
        ) : (
          /* Cinematic Confirmation View */
          <motion.div
            key="confirmation-screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-950/90 border border-[#38bdf8]/40 shadow-2xl backdrop-blur-3xl relative overflow-hidden text-center space-y-6"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0071e3]/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
                ✦ CONSULTATION LOCKED IN
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-sans">
                Consultation Confirmed
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-2 max-w-md mx-auto">
                {confirmedBooking.message || "A confirmation email has been dispatched with session details."}
              </p>
            </div>

            {/* Confirmation Key Details */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-mono">BOOKING REFERENCE</span>
                <span className="text-xs font-mono font-bold text-[#38bdf8]">{confirmedBooking.reference_id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-mono">DATE</span>
                <span className="text-xs font-semibold text-white">{formattedSelectedDate()}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs text-slate-400 font-mono">TIME</span>
                <span className="text-xs font-bold text-[#38bdf8]">{formData.appointment_time} IST</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">FORMAT</span>
                <span className="text-xs font-semibold text-white">Google Meet Direct Video</span>
              </div>
            </div>

            {/* Direct Google Meet Join CTA */}
            <div className="pt-4 space-y-3">
              <a
                href={confirmedBooking.meeting_url || MEETING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] text-white font-semibold text-sm transition-all duration-200 shadow-[0_8px_28px_rgba(0,113,227,0.45)] cursor-pointer inline-flex items-center justify-center gap-2 border border-[#38bdf8]/40 min-h-[48px]"
              >
                <span>Join Google Meet ↗</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setActiveView('overview');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-2"
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
