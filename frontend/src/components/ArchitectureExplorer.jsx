import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, ArrowDown, GitBranch, Layers } from 'lucide-react';
import architecturesData from '../data/architectures';

const PROJECT_KEYS = ['prometheus-ai', 'resolvit-ai', 'bench-ai'];

export default function ArchitectureExplorer({ controlledProjectId, onProjectChange }) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    controlledProjectId && architecturesData[controlledProjectId]
      ? controlledProjectId
      : 'prometheus-ai'
  );

  useEffect(() => {
    if (controlledProjectId && architecturesData[controlledProjectId]) {
      setSelectedProjectId(controlledProjectId);
    }
  }, [controlledProjectId]);

  const activeArch = architecturesData[selectedProjectId] || architecturesData['prometheus-ai'];
  const [selectedNodeId, setSelectedNodeId] = useState(activeArch.nodes[0].id);

  useEffect(() => {
    setSelectedNodeId(activeArch.nodes[0].id);
  }, [activeArch]);

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    onProjectChange?.(id);
  };

  const selectedNode =
    activeArch.nodes.find((n) => n.id === selectedNodeId) || activeArch.nodes[0];

  // Connected edges & neighbor node IDs for highlighting
  const connectedEdges = activeArch.edges.filter(
    (edge) => edge.from === selectedNode.id || edge.to === selectedNode.id
  );
  const connectedNodeIds = new Set([
    selectedNode.id,
    ...connectedEdges.map((e) => e.from),
    ...connectedEdges.map((e) => e.to)
  ]);

  const incomingNodes = connectedEdges
    .filter((e) => e.to === selectedNode.id)
    .map((e) => ({
      edgeLabel: e.label,
      node: activeArch.nodes.find((n) => n.id === e.from)
    }))
    .filter((x) => x.node);

  const outgoingNodes = connectedEdges
    .filter((e) => e.from === selectedNode.id)
    .map((e) => ({
      edgeLabel: e.label,
      node: activeArch.nodes.find((n) => n.id === e.to)
    }))
    .filter((x) => x.node);

  return (
    <section
      id="architecture-explorer"
      aria-labelledby="arch-explorer-heading"
      className="mb-20 sm:mb-24 scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Interactive System Architecture Explorer
        </span>
        <h2
          id="arch-explorer-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans"
        >
          Inside the Engineering Architecture.
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base font-light mt-3 font-sans">
          Select a product and click any component node to inspect how data flows between interfaces, AI models, and persistence layers.
        </p>
      </div>

      {/* Project Switcher */}
      <div
        role="tablist"
        aria-label="Select product architecture diagram"
        className="flex flex-wrap justify-center gap-2.5 mb-8 max-w-4xl mx-auto"
      >
        {PROJECT_KEYS.map((key) => {
          const item = architecturesData[key];
          const isSelected = key === selectedProjectId;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => handleSelectProject(key)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                isSelected
                  ? 'bg-white text-black border border-white shadow-sm'
                  : 'bg-white/[0.06] border border-white/15 text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Explorer Frame */}
      <div className="max-w-5xl mx-auto apple-glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Top Banner */}
        <div className="px-6 py-4 sm:px-8 border-b border-white/10 bg-[#050914] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-left">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">{activeArch.name}</h3>
            <p className="text-xs font-mono text-[#38bdf8]">{activeArch.subtitle}</p>
          </div>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            {activeArch.summary}
          </p>
        </div>

        {/* Desktop Interactive Node Graph (hidden on small screens so labels never shrink/clip) */}
        <div className="hidden md:block p-6 lg:p-8 bg-[#02050d] border-b border-white/10">
          <div
            className="relative w-full h-[370px] rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.08),transparent_70%)] overflow-hidden"
            role="region"
            aria-label={`${activeArch.name} interactive architecture graph`}
          >
            {/* Subtle structural grid */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
            />

            {/* SVG Connecting Paths & Flow Indicators */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="arrow-muted"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(148, 163, 184, 0.45)" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              {activeArch.edges.map((edge, idx) => {
                const fromNode = activeArch.nodes.find((n) => n.id === edge.from);
                const toNode = activeArch.nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isHighlighted =
                  edge.from === selectedNode.id || edge.to === selectedNode.id;

                const midX = (fromNode.x + toNode.x) / 2;
                const d = `M ${fromNode.x} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`;

                return (
                  <g key={`${edge.from}-${edge.to}-${idx}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        isHighlighted
                          ? 'rgba(56, 189, 248, 0.78)'
                          : 'rgba(148, 163, 184, 0.22)'
                      }
                      strokeWidth={isHighlighted ? '0.65' : '0.35'}
                      markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow-muted)'}
                      style={{ transition: 'stroke 0.25s ease, stroke-width 0.25s ease' }}
                    />
                    {isHighlighted && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#e0f2fe"
                        strokeWidth="0.6"
                        strokeDasharray="2 4"
                        initial={{ strokeDashoffset: 12 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Interactive Nodes */}
            {activeArch.nodes.map((node) => {
              const isSelected = node.id === selectedNode.id;
              const isConnected = connectedNodeIds.has(node.id);

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  aria-pressed={isSelected}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`absolute w-[176px] lg:w-[192px] p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isSelected
                      ? 'z-30 bg-[#0071e3] border border-[#38bdf8] text-white shadow-[0_12px_32px_rgba(0,113,227,0.5)] scale-[1.03]'
                      : isConnected
                        ? 'z-20 bg-[#0a1428] border border-[#38bdf8]/60 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                        : 'z-10 bg-[#070b14]/95 border border-white/15 text-slate-300 opacity-75 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <div
                    className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      isSelected ? 'text-sky-100' : 'text-[#38bdf8]'
                    }`}
                  >
                    {node.layer}
                  </div>
                  <div className="text-xs lg:text-[13px] font-bold text-white mt-0.5 leading-snug">
                    {node.label}
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-1 truncate ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {node.tech}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Architecture Flow (< md) */}
        <div className="md:hidden p-4 sm:p-5 bg-[#02050d] border-b border-white/10 space-y-2.5 text-left">
          <div className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            Tap any component to inspect connections
          </div>
          {activeArch.nodes.map((node, idx) => {
            const isSelected = node.id === selectedNode.id;
            const isConnected = connectedNodeIds.has(node.id);
            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  aria-pressed={isSelected}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                    isSelected
                      ? 'bg-[#0071e3]/25 border-[#38bdf8] text-white'
                      : isConnected
                        ? 'bg-[#0a1428] border-[#38bdf8]/45 text-white'
                        : 'bg-white/[0.04] border-white/15 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#38bdf8] font-semibold">
                      {String(idx + 1).padStart(2, '0')} · {node.layer}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">{node.tech}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{node.label}</div>
                </button>
                {idx < activeArch.nodes.length - 1 && (
                  <div className="flex justify-center text-slate-500" aria-hidden="true">
                    <ArrowDown className="w-4 h-4 text-[#38bdf8]/70" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Node Technical Detail Inspector */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeArch.id}-${selectedNode.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-6 sm:p-8 bg-[#050914] text-left grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-6 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0071e3]/15 border border-[#38bdf8]/35 text-xs font-mono text-[#38bdf8] font-semibold">
                  <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{selectedNode.layer}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 text-xs font-mono text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                  <span>{selectedNode.tech}</span>
                </span>
              </div>

              <h4 className="text-xl font-bold text-white font-sans pt-1">
                {selectedNode.label}
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {selectedNode.desc}
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2.5">
                  Receives Input From
                </div>
                {incomingNodes.length > 0 ? (
                  <div className="space-y-2">
                    {incomingNodes.map(({ node, edgeLabel }) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#38bdf8]/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      >
                        <div className="text-xs font-semibold text-white flex items-center justify-between gap-2">
                          <span>{node.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                          Flow: {edgeLabel}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-mono">Entry node in pipeline</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2.5">
                  Outputs Data To
                </div>
                {outgoingNodes.length > 0 ? (
                  <div className="space-y-2">
                    {outgoingNodes.map(({ node, edgeLabel }) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#38bdf8]/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      >
                        <div className="text-xs font-semibold text-white flex items-center justify-between gap-2">
                          <span>{node.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                          Flow: {edgeLabel}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-mono">Terminal output node</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
