import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import Background3D from './components/Background3D';
import IntroAnimation from './components/IntroAnimation';

// Import View Components
import OverviewView from './views/OverviewView';
import AboutView from './views/AboutView';
import CapabilitiesView from './views/CapabilitiesView';
import ProjectsView from './views/ProjectsView';
import TechSpecsView from './views/TechSpecsView';
import LeadershipView from './views/LeadershipView';
import InquireView from './views/InquireView';
import RegistrationView from './views/RegistrationView';
import FaqView from './views/FaqView';
import BookView from './views/BookView';

function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia?.('(hover: none)').matches) return;

    let rafId = null;
    let latestX = 0;
    let latestY = 0;

    const handleMouseMove = (e) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(600px at ${latestX}px ${latestY}px, rgba(0, 113, 227, 0.06), transparent 80%)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="hidden lg:block pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
    />
  );
}

function App() {
  const [activeView, setActiveView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return !sessionStorage.getItem('sakraIntroSeen');
  });

  const handleDismissIntro = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('sakraIntroSeen', 'true');
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      handleDismissIntro();
    }, 1500);
    return () => clearTimeout(timer);
  }, [showIntro, handleDismissIntro]);

  useEffect(() => {
    const getScrollY = () =>
      window.scrollY ||
      document.documentElement?.scrollTop ||
      document.body?.scrollTop ||
      0;

    const handleScroll = () => {
      setIsScrolled(getScrollY() > 32);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll to top on every view transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsScrolled(false);
  }, [activeView]);

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 }
  };

  const pageTransition = {
    duration: 0.2,
    ease: [0.16, 1, 0.3, 1]
  };

  return (
    <MotionConfig reducedMotion="user">
      <HelmetProvider>
        <div className="bg-black text-white min-h-screen font-sans selection:bg-[#0071e3]/30 selection:text-white relative overflow-x-clip">
          {/* Welcome Intro Animation Overlay */}
          <AnimatePresence>
            {showIntro && <IntroAnimation onSkip={handleDismissIntro} />}
          </AnimatePresence>

          {/* Desktop-only cursor glow isolated from App state */}
          <CursorGlow />

          {/* 3D Particle Mesh Background */}
          <Background3D />

          {/* Persistent Navigation Command Bar */}
          <Navbar
            activeView={activeView}
            setActiveView={setActiveView}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            isScrolled={isScrolled}
          />

          {/* Main website content */}
          <motion.div
            initial={false}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative"
          >
            {/* Subtle White Grid Matrix Overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_65%,transparent_100%)] pointer-events-none"
            />

            {/* Dynamic Page Views */}
            <main className="relative z-10 min-h-[calc(100vh-140px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  {activeView === 'overview' && <OverviewView setActiveView={setActiveView} />}
                  {activeView === 'projects' && <ProjectsView setActiveView={setActiveView} />}
                  {activeView === 'capabilities' && <CapabilitiesView setActiveView={setActiveView} />}
                  {activeView === 'about' && <AboutView setActiveView={setActiveView} />}
                  {activeView === 'techSpecs' && <TechSpecsView setActiveView={setActiveView} />}
                  {activeView === 'leadership' && <LeadershipView setActiveView={setActiveView} />}
                  {activeView === 'inquire' && <InquireView setActiveView={setActiveView} />}
                  {activeView === 'book' && <BookView setActiveView={setActiveView} />}
                  {activeView === 'registration' && <RegistrationView setActiveView={setActiveView} />}
                  {activeView === 'faq' && <FaqView setActiveView={setActiveView} />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Screen-reader-only semantic company context (using h2 so page retains single h1) */}
            <section className="sr-only" aria-label="Sakra Vision AI Product Studio company information">
              <h2>Sakra Vision AI Product Studio Overview</h2>
              <p>
                SAKRA VISION (Official Brand Identifier: @sakravision) is an AI product studio and AI innovation company established in 2026 by Likith Naidu Anumakonda.
                The company builds real-world intelligent systems using AI/ML, computer vision, LLMs, RAG, AI agents,
                automation, and full-stack web technologies.
              </p>
              <p>
                SAKRA VISION was established in 2026 by Likith Naidu Anumakonda. The name SAKRA VISION has personal meaning for the founder, as SAKRA is inspired by the names of his mother and father, representing family, vision, strength, and purpose.
              </p>
              <p>
                SAKRA VISION services include AI applications, computer vision systems, LLM and RAG tools,
                AI agents, automation systems, full-stack AI products, civic-tech platforms, event automation,
                and cloud deployment.
              </p>
              <p>
                Projects by SAKRA VISION include Resolvit AI, SAKRA VISION Event Hub, Bench AI,
                Prometheus AI V2.0, AquaSentinel AI, AI Resume Builder, and OpenCV Automation Tools.
              </p>
              <p>
                Founder: Likith Naidu Anumakonda (Instagram: @likhithnaidu_anumakonda), Founder &amp; CEO of SAKRA VISION, AI/ML Engineer,
                Python Full-Stack Developer, CSE-AI student, IIT Patna Certified learner, pianist,
                author, and builder of real-world intelligent systems.
              </p>
            </section>

            {/* Global Footer */}
            <Footer />
          </motion.div>

          {/* Interactive AI Agent Chatbot Overlay */}
          {!showIntro && <Chatbot />}
        </div>
      </HelmetProvider>
    </MotionConfig>
  );
}

export default App;
