import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import Background3D from './components/Background3D';
import IntroAnimation from './components/IntroAnimation';
import SEO from './components/SEO';

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


function App() {
  const [activeView, setActiveView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('sakraIntroSeen');
  });

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('sakraIntroSeen', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Mouse coordinate tracking states for cursor-glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Detect viewport width to restrict cursor tracking to desktop interfaces
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop]);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky navbar styling based on scroll depth
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll to top on every view transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

  // Framer Motion 3D Spatial Page Transitions
  const pageVariants = {
    initial: { opacity: 0, rotateY: 10, translateZ: -200, scale: 0.94, filter: 'blur(6px)' },
    animate: { opacity: 1, rotateY: 0, translateZ: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, rotateY: -10, translateZ: -200, scale: 0.94, filter: 'blur(6px)' }
  };

  const pageTransition = {
    type: 'spring',
    stiffness: 85,
    damping: 18,
    mass: 1
  };

  return (
    <HelmetProvider>
      <div className="bg-black text-white min-h-screen font-sans selection:bg-[#0071e3]/30 selection:text-white relative overflow-x-hidden">
        
        {/* Cinematic Welcome Intro Animation Overlay */}
      <AnimatePresence>
        {showIntro && <IntroAnimation />}
      </AnimatePresence>

      {/* Premium Apple-style desktop-only cursor glow following container */}
      {isDesktop && (
        <div 
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0, 113, 227, 0.06), transparent 80%)`
          }}
        />
      )}

      {/* 3D Particle Mesh Background */}
      <Background3D />

      {/* Persistent Navigation Command Bar - Anchored to Viewport Root */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView}
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        isScrolled={isScrolled} 
      />

      {/* Main website content with cinematic reveal animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: showIntro ? 0 : 1, scale: showIntro ? 0.98 : 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Background Tech-Grid Grid Overlay (Subtle White Grid Matrix) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_65%,transparent_100%)] pointer-events-none" />

        {/* Dynamic Cinematic Page Views with 3D Perspective Context */}
        <main 
          className="relative z-10 min-h-[calc(100vh-140px)] perspective-container" 
          style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              style={{ transformStyle: 'preserve-3d' }}
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

        {/* Screen-reader-only / AI scraper-friendly semantic content section */}
        <section className="sr-only" aria-label="Sakra Vision AI Product Studio company information">
          <h1>Sakra Vision AI Product Studio</h1>
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
            Founder: Likith Naidu Anumakonda (Instagram: @likhithnaidu_anumakonda), Founder & CEO of SAKRA VISION, AI/ML Engineer,
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
  );
}

export default App;
