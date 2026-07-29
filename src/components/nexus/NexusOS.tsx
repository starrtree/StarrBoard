"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexus, type SectionId } from "@/store/nexusStore";
import { ParticleField } from "./ParticleField";
import { BootSequence } from "./BootSequence";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandDock } from "./CommandDock";
import { IntelligencePanel } from "./IntelligencePanel";
import { CloudSync } from "./CloudSync";
import { PlanningAgentDockV2 } from "./PlanningAgentDockV2";
import { OverseerHome } from "./screens/OverseerHome";
import { StarrBaseMap } from "./screens/StarrBaseMap";
import { AgentCollaborationView } from "./screens/AgentCollaborationView";
import { MissionQueue } from "./screens/MissionQueue";
import { AgentDirectory } from "./screens/AgentDirectory";
import { ToolDock } from "./screens/ToolDock";
import { RevenueOffice } from "./screens/RevenueOffice";
import { MissionBacklog } from "./screens/MissionBacklog";
import { MemoryVaultOps } from "./screens/MemoryVaultOps";
import { Settings } from "./screens/Settings";

type AppMode = "overseer" | "operations" | "system";

const SECTION_ORDER: SectionId[] = ["home", "starrmap", "mission", "agents", "workflows", "vault", "cashflow", "incubator", "settings"];
const STARRBOARD_TITLE = "S★T☆A✪R✦R✧B✰O✯A✶R✵D";

export function NexusOS() {
  const booted = useNexus((s) => s.booted);
  const section = useNexus((s) => s.section);
  const setSection = useNexus((s) => s.setSection);
  const focusMode = useNexus((s) => s.focusMode);
  const setFocusMode = useNexus((s) => s.setFocusMode);
  const setCommandOpen = useNexus((s) => s.setCommandOpen);
  const setSelectedProject = useNexus((s) => s.setSelectedProject);
  const motionLevel = useNexus((s) => s.settings.motionLevel);
  const themeMode = useNexus((s) => s.settings.themeMode);

  const [mobileNav, setMobileNav] = useState(false);
  const [mobileIntel, setMobileIntel] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState("What are my top priorities right now?");
  const [plannerAutoRunNonce, setPlannerAutoRunNonce] = useState(0);
  const [appMode, setAppMode] = useState<AppMode>("overseer");

  const openPlanner = (prompt = "What are my top priorities right now?", autoRun = false) => {
    setPlannerPrompt(prompt);
    setPlannerOpen(true);
    if (autoRun) setPlannerAutoRunNonce((n) => n + 1);
  };

  const switchMode = (mode: AppMode) => {
    setAppMode(mode);
    if (mode === "operations" && section === "settings") setSection("home");
    if (mode === "system") setSection("settings");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("starrboard-light-root", themeMode === "light");
    document.body.classList.toggle("starrboard-light-body", themeMode === "light");
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("starrboard-light-root");
      document.body.classList.remove("starrboard-light-body");
    };
  }, [themeMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        openPlanner();
        return;
      }
      if (typing) return;
      if (e.key === "Escape") {
        setFocusMode(false);
        setCommandOpen(false);
        setSelectedProject(null);
        setMobileNav(false);
        setMobileIntel(false);
        setPlannerOpen(false);
      }
      if (e.key === " ") e.preventDefault();
      if (e.key === "ArrowRight") {
        const i = SECTION_ORDER.indexOf(section);
        setSection(SECTION_ORDER[(i + 1) % SECTION_ORDER.length]);
      }
      if (e.key === "ArrowLeft") {
        const i = SECTION_ORDER.indexOf(section);
        setSection(SECTION_ORDER[(i - 1 + SECTION_ORDER.length) % SECTION_ORDER.length]);
      }
      if (e.key.toLowerCase() === "f") setFocusMode(!focusMode);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section, focusMode, setSection, setFocusMode, setCommandOpen, setSelectedProject]);

  const renderOperationsSection = () => {
    switch (section) {
      case "home": return <StarrBaseMap />;
      case "starrmap": return <AgentCollaborationView />;
      case "mission":
      case "projects": return <MissionQueue />;
      case "agents": return <AgentDirectory />;
      case "workflows": return <ToolDock />;
      case "cashflow": return <RevenueOffice />;
      case "incubator": return <MissionBacklog />;
      case "vault": return <MemoryVaultOps />;
      case "settings": return <Settings />;
      default: return <StarrBaseMap />;
    }
  };

  const renderMain = () => {
    if (appMode === "overseer") {
      return <OverseerHome onAskPlanner={(prompt) => openPlanner(prompt, true)} onOpenOperations={() => switchMode("operations")} />;
    }
    if (appMode === "system") return <Settings />;
    return renderOperationsSection();
  };

  return (
    <div className={`starrboard-shell ${motionLevel === "reduced" || motionLevel === "minimal" ? "reduce-motion" : ""} ${themeMode === "light" ? "starrboard-light" : ""}`}>
      <CloudSync />
      <ParticleField intensity={useNexus.getState().settings.themeIntensity} />
      <AnimatePresence>{!booted && <BootSequence />}</AnimatePresence>

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="starrboard-ui flex h-full min-h-0 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="hidden h-full w-[248px] shrink-0 lg:block"><Sidebar /></div>

            <AnimatePresence>
              {mobileNav && (
                <motion.div className="fixed inset-0 z-[90] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
                  <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="absolute left-0 top-0 h-full w-[260px]">
                    <Sidebar onNav={() => setMobileNav(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <Topbar onMenu={() => setMobileNav(true)} onPlanner={() => openPlanner()} />

              <div className="flex shrink-0 items-center justify-center border-b border-violet-400/10 px-3 py-2">
                <div className="inline-flex rounded-xl border border-violet-400/20 bg-black/25 p-1">
                  {(["overseer", "operations", "system"] as AppMode[]).map((mode) => (
                    <button key={mode} onClick={() => switchMode(mode)} className={`rounded-lg px-3 py-1.5 font-hud text-[9px] uppercase tracking-widest transition ${appMode === mode ? "bg-amber-400/15 text-amber-100 shadow-[inset_0_0_0_1px_rgba(251,191,36,.25)]" : "text-violet-200/45 hover:text-violet-100"}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <main className={`nexus-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 ${focusMode ? "relative" : ""}`}>
                <AnimatePresence mode="wait">
                  <motion.div key={`${appMode}-${section}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    {renderMain()}
                  </motion.div>
                </AnimatePresence>

                <footer className="mt-8 flex flex-col items-center gap-1 py-6 text-center">
                  <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-violet-300/50">{STARRBOARD_TITLE}</span>
                  <p className="font-hud text-[9px] uppercase tracking-widest text-violet-300/30">Overseer clarity · Agent operations · System depth</p>
                </footer>
              </main>
              <CommandDock onPlanner={openPlanner} />
            </div>

            {!focusMode && appMode !== "overseer" && <div className="hidden h-full w-[320px] shrink-0 xl:block"><IntelligencePanel /></div>}

            <AnimatePresence>
              {mobileIntel && !focusMode && appMode !== "overseer" && (
                <motion.div className="fixed inset-0 z-[90] xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileIntel(false)} />
                  <motion.div initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="absolute right-0 top-0 h-full w-[300px]">
                    <IntelligencePanel onClose={() => setMobileIntel(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!focusMode && appMode !== "overseer" && (
            <button onClick={() => setMobileIntel(true)} className="fixed bottom-24 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/15 text-amber-200 backdrop-blur transition hover:bg-amber-400/25 xl:hidden" title="Live Intel">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>●</motion.span>
            </button>
          )}

          <PlanningAgentDockV2 open={plannerOpen} onClose={() => setPlannerOpen(false)} initialPrompt={plannerPrompt} autoRunNonce={plannerAutoRunNonce} />

          <AnimatePresence>
            {focusMode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed left-1/2 top-4 z-40 -translate-x-1/2 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-1.5 backdrop-blur">
                <span className="font-hud text-[10px] uppercase tracking-widest text-amber-200">Focus Mode · press Esc to exit</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
