import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Compass,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import projectsData from '../data/projects';
import {
  SOLUTION_SERVICES,
  PROJECT_STAGES,
  buildDeterministicRecommendation
} from '../data/solutionRules';

const STEPS = [
  { num: 1, label: 'Requirement' },
  { num: 2, label: 'Problem' },
  { num: 3, label: 'Stage' },
  { num: 4, label: 'Direction' }
];

export default function SolutionExplorer({ onDiscussProject }) {
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(SOLUTION_SERVICES[0].id);
  const [problemText, setProblemText] = useState('');
  const [selectedStageId, setSelectedStageId] = useState(PROJECT_STAGES[0].id);
  const [errorMsg, setErrorMsg] = useState('');

  const recommendation = buildDeterministicRecommendation(
    selectedServiceId,
    selectedStageId,
    problemText
  );

  const matchedProjects = recommendation.service.relatedProjectIds
    .map((id) => projectsData.find((p) => p.id === id))
    .filter(Boolean);

  const handleNextFromStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!selectedServiceId) {
        setErrorMsg('Please select a service requirement to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (problemText.trim().length < 10) {
        setErrorMsg('Please describe your problem or objective in at least 10 characters.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedStageId) {
        setErrorMsg('Please select your current project stage.');
        return;
      }
      setStep(4);
    }
  };

  const handleDiscuss = () => {
    if (!onDiscussProject) return;
    onDiscussProject({
      projectType: recommendation.service.briefType,
      description: problemText.trim(),
      requirements: `Selected focus: ${recommendation.service.label} (${recommendation.stage.label} stage). Suggested technologies: ${recommendation.service.technologies.join(', ')}.`,
      timeline: recommendation.stage.timelineHint === '1-3 months' ? 'Within 3 Months' : 'Within 1 Month'
    });
  };

  return (
    <section
      id="solution-explorer"
      aria-labelledby="solution-explorer-heading"
      className="mt-20 sm:mt-24 pt-16 border-t border-white/10 scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          AI Solution Explorer
        </span>
        <h2
          id="solution-explorer-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans"
        >
          Discover the right technical direction.
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base font-light mt-3 font-sans">
          Select your requirement, outline the problem, and choose your current stage to review a structured preliminary recommendation from SAKRA VISION.
        </p>
      </div>

      <div className="max-w-4xl mx-auto apple-glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Step Progress Indicator */}
        <div className="px-5 py-4 sm:px-8 border-b border-white/10 bg-[#050914] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="navigation" aria-label="Solution explorer steps">
            {STEPS.map((item) => {
              const isCurrent = step === item.num;
              const isReachable =
                item.num < step ||
                (item.num === 2 && Boolean(selectedServiceId)) ||
                (item.num === 3 && problemText.trim().length >= 10) ||
                (item.num === 4 && problemText.trim().length >= 10 && Boolean(selectedStageId));

              return (
                <button
                  key={item.num}
                  type="button"
                  disabled={!isReachable && !isCurrent}
                  onClick={() => {
                    if (isReachable || isCurrent) {
                      setErrorMsg('');
                      setStep(item.num);
                    }
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                    isCurrent
                      ? 'bg-[#0071e3] text-white font-semibold'
                      : isReachable
                        ? 'bg-white/[0.06] text-slate-200 hover:bg-white/10 cursor-pointer'
                        : 'bg-white/[0.02] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>0{item.num}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono text-slate-300">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 text-left">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                    Step 01 · Select Requirement
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 font-sans">
                    Which capability fits your objective best?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Select requirement">
                  {SOLUTION_SERVICES.map((srv) => {
                    const isSelected = srv.id === selectedServiceId;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedServiceId(srv.id);
                          setErrorMsg('');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                          isSelected
                            ? 'bg-[#0071e3]/20 border-[#38bdf8] text-white shadow-[0_0_20px_rgba(0,113,227,0.2)]'
                            : 'bg-white/[0.03] border-white/15 text-slate-200 hover:bg-white/[0.07] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white font-sans">{srv.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />}
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                          {srv.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                    Step 02 · Describe the Problem
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 font-sans">
                    What workflow, bottleneck, or product are you solving for?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Selected capability: <strong className="text-white">{recommendation.service.label}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="solution-problem-input" className="block text-xs font-mono text-slate-200 uppercase tracking-wider mb-2">
                    Problem &amp; Requirement Summary *
                  </label>
                  <textarea
                    id="solution-problem-input"
                    rows="5"
                    value={problemText}
                    onChange={(e) => {
                      setProblemText(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Example: We want an offline document assistant for student PDFs, or an automated portal to verify uploaded registration receipts..."
                    className="w-full bg-black/70 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-2xl p-4 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors resize-y"
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>Minimum 10 characters</span>
                    <span>{problemText.trim().length} chars</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                    Step 03 · Project Stage
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 font-sans">
                    Where is the project currently?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="radiogroup" aria-label="Select project stage">
                  {PROJECT_STAGES.map((st) => {
                    const isSelected = st.id === selectedStageId;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedStageId(st.id);
                          setErrorMsg('');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                          isSelected
                            ? 'bg-[#0071e3]/20 border-[#38bdf8] text-white'
                            : 'bg-white/[0.03] border-white/15 text-slate-200 hover:bg-white/[0.07] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white font-sans">{st.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />}
                        </div>
                        <span className="text-xs font-mono text-slate-300 mt-1.5 block">
                          Typical cycle: {st.timelineHint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/15 border border-[#38bdf8]/35 text-xs font-mono text-[#38bdf8] font-semibold">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Preliminary Recommendation · Rule-Based Guidance</span>
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-2.5 font-sans">
                      {recommendation.service.category}
                    </h3>
                    <p className="text-xs font-mono text-slate-300 mt-1">
                      Stage: {recommendation.stage.label} · Service: {recommendation.service.label}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38bdf8] hover:text-white bg-white/[0.05] border border-white/15 px-3 py-2 min-h-[38px] rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Edit Answers</span>
                  </button>
                </div>

                {/* User Problem Recap */}
                <div className="p-4 rounded-2xl bg-black/55 border border-white/10">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Your Stated Requirement
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {problemText.trim()}
                  </p>
                </div>

                {/* Technical Approach & Next Step */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/15 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-semibold">
                      <Compass className="w-4 h-4" aria-hidden="true" />
                      <span>Possible Technical Approach</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {recommendation.service.approach}
                    </p>
                    {recommendation.extraHints.length > 0 && (
                      <ul className="pt-2 border-t border-white/10 space-y-1.5">
                        {recommendation.extraHints.map((hint, idx) => (
                          <li key={idx} className="text-xs text-[#38bdf8] flex items-start gap-2">
                            <span aria-hidden="true">▪</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0071e3]/10 border border-[#38bdf8]/30 space-y-3">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-semibold">
                      Recommended Next Step
                    </div>
                    <p className="text-sm text-slate-100 leading-relaxed font-normal">
                      {recommendation.stage.nextStep}
                    </p>
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-xs font-mono text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                        <span>Suitable Technology Options</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendation.service.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs font-mono text-slate-100 bg-black/60 border border-white/15 px-2.5 py-1 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relevant SAKRA VISION Projects */}
                {matchedProjects.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2.5">
                      Relevant SAKRA VISION Projects
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {matchedProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-white">{proj.title}</span>
                              <span className="text-[11px] font-mono text-[#38bdf8]">{proj.status}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {proj.shortDesc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400 font-mono">
                  Note: Recommendations above are preliminary architectural suggestions generated deterministically from your selections, not live AI model output.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="mt-5 p-3.5 rounded-xl border border-rose-500/35 bg-rose-500/15 text-rose-200 text-xs font-mono flex items-center gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep((prev) => prev - 1);
                }}
                className="apple-dark-button py-2.5 px-5 min-h-[44px] text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextFromStep}
                className="apple-button py-2.5 px-6 min-h-[44px] text-xs sm:text-sm cursor-pointer ml-auto"
              >
                <span>{step === 3 ? 'View Solution Direction' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDiscuss}
                className="apple-button py-2.5 px-6 min-h-[44px] text-xs sm:text-sm cursor-pointer ml-auto"
              >
                <span>Discuss This Project</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
