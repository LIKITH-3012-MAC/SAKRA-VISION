import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../utils/api';
import SuccessExperience from './SuccessExperience';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_TAG_PATTERN = /<[a-zA-Z/]+[^>]*>/;

const PROJECT_TYPES = [
  { label: 'AI/ML Application', desc: 'Intelligent web or desktop application with AI capabilities' },
  { label: 'Computer Vision', desc: 'OCR, image verification, detection, or OpenCV automation' },
  { label: 'AI Agent', desc: 'Autonomous multi-step tool-calling or workflow reasoning agent' },
  { label: 'Web Application', desc: 'Full-stack React/Next.js frontend, backend APIs & database' },
  { label: 'Automation', desc: 'Scripting, webhooks, document/event verification & pipelines' },
  { label: 'Research Prototype', desc: 'Proof-of-concept exploration for emerging AI/ML ideas' },
  { label: 'Other', desc: 'Custom hybrid software or technical consulting scope' }
];

const REQUIREMENT_OPTIONS = [
  'Frontend Interface (React / Next.js)',
  'Backend API & Database (FastAPI / SQL)',
  'LLM / RAG Knowledge Pipeline',
  'Computer Vision / OCR Scanning',
  'Workflow & Email Automation',
  'Offline / Local-First Execution',
  'Cloud Deployment & Security'
];

const BUDGET_OPTIONS = [
  'Discuss Individually',
  'Starter MVP (< $1,000)',
  'Growth Build ($1,000 – $3,000)',
  'Full Platform ($3,000 – $7,500)',
  'Enterprise Scope ($7,500+)'
];

const TIMELINE_OPTIONS = [
  { label: 'Immediate', hint: 'Urgent kickoff' },
  { label: 'Within 1 Month', hint: 'Focused sprint delivery' },
  { label: 'Within 3 Months', hint: 'Structured multi-phase build' },
  { label: 'Flexible', hint: 'Exploratory or phased schedule' }
];

const BRIEF_STEPS = [
  { num: 1, title: 'Type' },
  { num: 2, title: 'Description' },
  { num: 3, title: 'Requirements' },
  { num: 4, title: 'Budget' },
  { num: 5, title: 'Timeline' },
  { num: 6, title: 'Contact' },
  { num: 7, title: 'Review' }
];

export default function SmartProjectBrief({ prefill, setActiveView, onClearPrefill }) {
  const turnstileRef = useRef(null);
  const [step, setStep] = useState(1);

  const [briefData, setBriefData] = useState({
    projectType: prefill?.projectType || 'AI/ML Application',
    description: prefill?.description || '',
    selectedRequirements: [],
    customRequirements: prefill?.requirements || '',
    budget: '',
    timeline: prefill?.timeline || 'Within 1 Month',
    name: '',
    email: '',
    organization: '',
    additionalMessage: '',
    consent: false
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  // Sync incoming prefill from AI Solution Explorer
  useEffect(() => {
    if (!prefill) return;
    setBriefData((prev) => ({
      ...prev,
      projectType: prefill.projectType || prev.projectType,
      description: prefill.description || prev.description,
      customRequirements: prefill.requirements || prev.customRequirements,
      timeline: prefill.timeline || prev.timeline
    }));
    setStep(2);
  }, [prefill]);

  // Mount Cloudflare Turnstile widget on Review & Submit step (Step 7)
  useEffect(() => {
    if (step !== 7 || isVerified) return;
    let widgetId = null;
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current && !isVerified) {
        clearInterval(interval);
        try {
          widgetId = window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAADitIbxDQDzUGUKm',
            size: window.innerWidth < 400 ? 'compact' : 'normal',
            callback: (token) => {
              setTurnstileToken(token);
              setIsVerified(true);
              setErrorMsg('');
            },
            'error-callback': () => {
              setErrorMsg(
                'Security verification failed to load. You can refresh or contact likith.anumakonda@gmail.com directly.'
              );
            }
          });
        } catch (err) {
          console.error('Turnstile render error:', err);
        }
      }
    }, 450);

    return () => {
      clearInterval(interval);
      if (widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {}
      }
    };
  }, [step, isVerified]);

  const toggleRequirement = (req) => {
    setBriefData((prev) => {
      const exists = prev.selectedRequirements.includes(req);
      return {
        ...prev,
        selectedRequirements: exists
          ? prev.selectedRequirements.filter((r) => r !== req)
          : [...prev.selectedRequirements, req]
      };
    });
  };

  const validateCurrentStep = (targetStep = step) => {
    setErrorMsg('');

    if (targetStep === 1 && !briefData.projectType) {
      setErrorMsg('Please select a project type.');
      return false;
    }

    if (targetStep === 2) {
      const desc = briefData.description.trim();
      if (desc.length < 10) {
        setErrorMsg('Please describe your project in at least 10 characters.');
        return false;
      }
      if (HTML_TAG_PATTERN.test(desc)) {
        setErrorMsg('HTML tags are not permitted in project descriptions.');
        return false;
      }
    }

    if (targetStep === 3 && HTML_TAG_PATTERN.test(briefData.customRequirements)) {
      setErrorMsg('HTML tags are not permitted in technical requirements.');
      return false;
    }

    if (targetStep === 5 && !briefData.timeline) {
      setErrorMsg('Please select a target timeline.');
      return false;
    }

    if (targetStep === 6) {
      const name = briefData.name.trim();
      const email = briefData.email.trim();
      if (name.length < 2) {
        setErrorMsg('Please enter your name (minimum 2 characters).');
        return false;
      }
      if (!EMAIL_PATTERN.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
      if (
        HTML_TAG_PATTERN.test(name) ||
        HTML_TAG_PATTERN.test(briefData.organization) ||
        HTML_TAG_PATTERN.test(briefData.additionalMessage)
      ) {
        setErrorMsg('HTML tags are not permitted in form inputs.');
        return false;
      }
      if (!briefData.consent) {
        setErrorMsg('Please agree to allow SAKRA VISION to contact you regarding this brief.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep(step)) return;
    setStep((prev) => Math.min(7, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const buildCombinedMessage = () => {
    const reqParts = [
      ...briefData.selectedRequirements,
      briefData.customRequirements.trim()
    ].filter(Boolean);

    const blocks = [
      `Project Description:\n${briefData.description.trim()}`
    ];

    if (reqParts.length > 0) {
      blocks.push(`Technical Requirements:\n${reqParts.join('; ')}`);
    }
    if (briefData.budget) {
      blocks.push(`Budget Preference: ${briefData.budget}`);
    }
    if (briefData.additionalMessage.trim()) {
      blocks.push(`Additional Notes:\n${briefData.additionalMessage.trim()}`);
    }

    return blocks.join('\n\n').slice(0, 4950);
  };

  const handleSubmitBrief = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep(2) || !validateCurrentStep(6)) return;

    if (!isVerified || !turnstileToken) {
      setErrorMsg('Please complete the security verification check before submitting.');
      return;
    }

    setLoading(true);
    setSubmitStatus('submitting');
    setErrorMsg('');

    try {
      const response = await api.post('/api/clients', {
        full_name: briefData.name.trim(),
        email: briefData.email.trim(),
        company: briefData.organization.trim() || undefined,
        project_type: briefData.projectType,
        budget_range: briefData.budget || undefined,
        timeline: briefData.timeline,
        message: buildCombinedMessage(),
        captcha_token: turnstileToken
      });

      if (response.status === 200 || response.status === 201) {
        onClearPrefill?.();
        const clientConfSent = response.data?.email?.client_confirmation;
        setSubmitStatus(clientConfSent ? 'success_email' : 'success_no_email');
      } else {
        setSubmitStatus('error');
        setErrorMsg('Unexpected response from server. Please try again or email likith.anumakonda@gmail.com.');
      }
    } catch (error) {
      console.error('Smart brief submission error:', error);
      setSubmitStatus('error');
      const backendError = error.response?.data?.message || error.response?.data?.detail;
      setErrorMsg(
        typeof backendError === 'string'
          ? backendError
          : 'Unable to reach the submission server right now. Please try again or email likith.anumakonda@gmail.com directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    onClearPrefill?.();
    setBriefData({
      projectType: 'AI/ML Application',
      description: '',
      selectedRequirements: [],
      customRequirements: '',
      budget: '',
      timeline: 'Within 1 Month',
      name: '',
      email: '',
      organization: '',
      additionalMessage: '',
      consent: false
    });
    setStep(1);
    setTurnstileToken('');
    setIsVerified(false);
    setSubmitStatus('idle');
    setErrorMsg('');
  };

  if (submitStatus === 'success_email' || submitStatus === 'success_no_email') {
    return (
      <SuccessExperience
        submitStatus={submitStatus}
        handleReset={handleReset}
        setActiveView={setActiveView}
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Guided Progress Header */}
      <div className="pb-4 border-b border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Guided Project Brief</span>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Step 0{step} of 0{BRIEF_STEPS.length}
          </span>
        </div>

        {/* Clickable Step Indicators */}
        <div className="grid grid-cols-7 gap-1.5" role="navigation" aria-label="Project brief steps">
          {BRIEF_STEPS.map((s) => {
            const isActive = step === s.num;
            const isPast = s.num < step;
            return (
              <button
                key={s.num}
                type="button"
                disabled={s.num > step}
                onClick={() => {
                  if (s.num <= step) {
                    setErrorMsg('');
                    setStep(s.num);
                  }
                }}
                title={`Step 0${s.num}: ${s.title}`}
                aria-label={`Step ${s.num}: ${s.title}`}
                aria-current={isActive ? 'step' : undefined}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-mono text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                  isActive
                    ? 'bg-[#0071e3] text-white font-bold'
                    : isPast
                      ? 'bg-[#0071e3]/25 text-[#38bdf8] hover:bg-[#0071e3]/35 cursor-pointer'
                      : 'bg-white/[0.04] text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="block">{s.num}</span>
                <span className="hidden sm:block text-[10px] truncate">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {prefill && (
        <div className="p-3 rounded-xl bg-[#0071e3]/15 border border-[#38bdf8]/35 text-xs text-slate-100 flex items-center justify-between gap-2">
          <span>Pre-filled from AI Solution Explorer — review and customize any step.</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 01: Project Type */}
        {step === 1 && (
          <motion.div
            key="brief-1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 01 · Project Type
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                What type of system are you building?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Project Type">
              {PROJECT_TYPES.map((item) => {
                const isSelected = briefData.projectType === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setBriefData((prev) => ({ ...prev, projectType: item.label }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                      isSelected
                        ? 'bg-[#0071e3]/20 border-[#38bdf8] text-white'
                        : 'bg-black/50 border-white/15 text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 02: Project Description */}
        {step === 2 && (
          <motion.div
            key="brief-2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 02 · Project Description
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                Describe what you want SAKRA VISION to build.
              </h2>
            </div>

            <div>
              <label htmlFor="brief-description" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                Project Overview &amp; Goals *
              </label>
              <textarea
                id="brief-description"
                rows="5"
                value={briefData.description}
                onChange={(e) => {
                  setErrorMsg('');
                  setBriefData((prev) => ({ ...prev, description: e.target.value }));
                }}
                placeholder="Outline the problem, target users, and key outcomes you expect..."
                className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors resize-y"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-1.5">
                <span>Minimum 10 characters · Plain text</span>
                <span>{briefData.description.trim().length} / 3500</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 03: Technical Requirements */}
        {step === 3 && (
          <motion.div
            key="brief-3"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 03 · Technical Requirements
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                Select key capabilities or add constraints (optional).
              </h2>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Technical capabilities">
              {REQUIREMENT_OPTIONS.map((req) => {
                const isSelected = briefData.selectedRequirements.includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleRequirement(req)}
                    className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                      isSelected
                        ? 'bg-[#0071e3] border-[#38bdf8] text-white'
                        : 'bg-white/[0.04] border-white/15 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{req}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="brief-custom-req" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                Specific Integrations or Stack Notes (Optional)
              </label>
              <textarea
                id="brief-custom-req"
                rows="3"
                value={briefData.customRequirements}
                onChange={(e) =>
                  setBriefData((prev) => ({ ...prev, customRequirements: e.target.value }))
                }
                placeholder="e.g. Offline FAISS search, FastAPI + PostgreSQL, payment receipt OCR..."
                className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors resize-y"
              />
            </div>
          </motion.div>
        )}

        {/* Step 04: Budget (Optional) */}
        {step === 4 && (
          <motion.div
            key="brief-4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 04 · Budget (Optional)
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                Do you have an estimated budget range?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Completely optional — scope and commercial terms can always be discussed individually.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Optional budget range">
              {BUDGET_OPTIONS.map((option) => {
                const isSelected = briefData.budget === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() =>
                      setBriefData((prev) => ({
                        ...prev,
                        budget: prev.budget === option ? '' : option
                      }))
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-h-[48px] flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                      isSelected
                        ? 'bg-[#0071e3]/20 border-[#38bdf8] text-white font-semibold'
                        : 'bg-black/50 border-white/15 text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-sm">{option}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 05: Timeline */}
        {step === 5 && (
          <motion.div
            key="brief-5"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 05 · Timeline
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                What is your target timeline?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Project timeline">
              {TIMELINE_OPTIONS.map((opt) => {
                const isSelected = briefData.timeline === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setBriefData((prev) => ({ ...prev, timeline: opt.label }))}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                      isSelected
                        ? 'bg-[#0071e3]/20 border-[#38bdf8] text-white'
                        : 'bg-black/50 border-white/15 text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />}
                    </div>
                    <span className="text-xs font-mono text-slate-300 mt-1 block">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 06: Contact Information */}
        {step === 6 && (
          <motion.div
            key="brief-6"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Step 06 · Contact Information
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                Where should we send our response?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brief-name" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  id="brief-name"
                  type="text"
                  required
                  value={briefData.name}
                  onChange={(e) => {
                    setErrorMsg('');
                    setBriefData((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Your full name"
                  className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none min-h-[46px]"
                />
              </div>

              <div>
                <label htmlFor="brief-email" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-1.5">
                  Email *
                </label>
                <input
                  id="brief-email"
                  type="email"
                  required
                  value={briefData.email}
                  onChange={(e) => {
                    setErrorMsg('');
                    setBriefData((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="brief-org" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-1.5">
                Organization (Optional)
              </label>
              <input
                id="brief-org"
                type="text"
                value={briefData.organization}
                onChange={(e) => setBriefData((prev) => ({ ...prev, organization: e.target.value }))}
                placeholder="Company, Startup, or Institution"
                className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none min-h-[46px]"
              />
            </div>

            <div>
              <label htmlFor="brief-additional" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-1.5">
                Additional Message (Optional)
              </label>
              <textarea
                id="brief-additional"
                rows="2"
                value={briefData.additionalMessage}
                onChange={(e) =>
                  setBriefData((prev) => ({ ...prev, additionalMessage: e.target.value }))
                }
                placeholder="Preferred contact window, existing links, or extra context..."
                className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none resize-y"
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="brief-consent"
                type="checkbox"
                checked={briefData.consent}
                onChange={(e) => {
                  setErrorMsg('');
                  setBriefData((prev) => ({ ...prev, consent: e.target.checked }));
                }}
                className="mt-0.5 w-5 h-5 accent-[#0071e3] bg-black border border-white/25 rounded cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
              />
              <label htmlFor="brief-consent" className="text-xs sm:text-sm text-slate-200 leading-relaxed cursor-pointer select-none">
                I agree to allow SAKRA VISION to contact me regarding this project brief.
              </label>
            </div>
          </motion.div>
        )}

        {/* Step 07: Review, Edit, Verify & Submit */}
        {step === 7 && (
          <motion.form
            key="brief-7"
            onSubmit={handleSubmitBrief}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                Final Confirmation
              </span>
              <h2 className="text-xl font-bold text-white mt-1 font-sans">
                Review your project brief before submitting.
              </h2>
            </div>

            {/* Editable Review Summary Grid */}
            <div className="space-y-3">
              {[
                {
                  stepNum: 1,
                  label: 'Project Type',
                  value: briefData.projectType
                },
                {
                  stepNum: 2,
                  label: 'Project Description',
                  value: briefData.description.trim()
                },
                {
                  stepNum: 3,
                  label: 'Technical Requirements',
                  value:
                    [...briefData.selectedRequirements, briefData.customRequirements.trim()]
                      .filter(Boolean)
                      .join(' · ') || 'None specified'
                },
                {
                  stepNum: 4,
                  label: 'Budget Preference',
                  value: briefData.budget || 'Not specified (discuss individually)'
                },
                {
                  stepNum: 5,
                  label: 'Timeline',
                  value: briefData.timeline
                },
                {
                  stepNum: 6,
                  label: 'Contact',
                  value: `${briefData.name.trim()} (${briefData.email.trim()})${
                    briefData.organization.trim() ? ` · ${briefData.organization.trim()}` : ''
                  }${briefData.additionalMessage.trim() ? `\nNotes: ${briefData.additionalMessage.trim()}` : ''}`
                }
              ].map((row) => (
                <div
                  key={row.stepNum}
                  className="p-3.5 rounded-2xl bg-black/55 border border-white/15 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#38bdf8]">
                      {row.label}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                      {row.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep(row.stepNum);
                    }}
                    aria-label={`Edit ${row.label}`}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white bg-white/[0.06] border border-white/15 px-2.5 py-1.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                  >
                    <Edit3 className="w-3 h-3" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Cloudflare Turnstile Verification */}
            <div className="border border-white/15 bg-black/50 rounded-2xl p-4 sm:p-5 relative overflow-hidden blue-rim">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Security Verification</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Complete verification to submit securely via SAKRA VISION&apos;s inquiry pipeline.
                  </p>
                </div>
              </div>

              <div className="mt-3 relative min-h-[56px] w-full max-w-full overflow-hidden flex flex-col justify-center items-start">
                {!isVerified ? (
                  <div ref={turnstileRef} className="cf-turnstile max-w-full" />
                ) : (
                  <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Verification successful</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="apple-dark-button py-2.5 px-5 min-h-[46px] text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={!isVerified || loading}
                className="apple-button py-3 px-7 min-h-[48px] text-sm cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed flex-1 sm:flex-initial"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting Brief...</span>
                  </span>
                ) : !isVerified ? (
                  'Complete Verification First'
                ) : (
                  'Submit Project Brief'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-500/35 bg-rose-500/15 text-rose-200 text-xs font-mono flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Buttons for Steps 1-6 */}
      {step < 7 && (
        <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="apple-dark-button py-2.5 px-5 min-h-[44px] text-xs sm:text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="apple-button py-2.5 px-6 min-h-[44px] text-xs sm:text-sm cursor-pointer ml-auto"
          >
            <span>{step === 6 ? 'Review Brief' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
