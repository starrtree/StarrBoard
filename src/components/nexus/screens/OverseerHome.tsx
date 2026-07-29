"use client";

import { AlertTriangle, Bot, CheckCircle2, DollarSign, Play, Sparkles, Target, Zap } from "lucide-react";
import { useNexus } from "@/store/nexusStore";

const rank = { urgent: 4, high: 3, medium: 2, low: 1 } as const;

export function OverseerHome({ onAskPlanner, onOpenOperations }: { onAskPlanner: (prompt: string) => void; onOpenOperations: () => void }) {
  const missions = useNexus((s) => s.agentMissions);
  const runtimes = useNexus((s) => s.agentRuntimes);
  const cashflow = useNexus((s) => s.cashflow);
  const setSection = useNexus((s) => s.setSection);
  const setSelectedMission = useNexus((s) => s.setSelectedMission);

  const active = missions.filter((m) => m.status !== "complete");
  const priorities = [...active].sort((a, b) => rank[b.priority] - rank[a.priority] || b.progress - a.progress).slice(0, 3);
  const blocked = active.filter((m) => m.status === "blocked" || m.blockers.length > 0);
  const waiting = active.filter((m) => m.status === "waiting");
  const nearComplete = active.filter((m) => m.progress >= 70).sort((a, b) => b.progress - a.progress);
  const workingAgents = runtimes.filter((a) => ["working", "collaborating", "planning"].includes(a.status));
  const idleAgents = runtimes.filter((a) => ["idle", "standby"].includes(a.status));
  const blockedAgents = runtimes.filter((a) => a.status === "blocked");
  const topCashflow = [...cashflow].sort((a: any, b: any) => (b.potential ?? 0) - (a.potential ?? 0))[0] as any;

  const openMission = (id: string) => {
    setSelectedMission(id);
    setSection("mission");
  };

  return (
    <div className="space-y-4 pb-4">
      <section className="rounded-3xl border border-amber-300/25 bg-gradient-to-br from-amber-400/12 via-violet-500/5 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.25em] text-amber-200/75">
              <Sparkles size={14} /> Overseer Home
            </div>
            <h1 className="text-2xl font-semibold text-amber-50">What matters right now</h1>
            <p className="mt-1 max-w-2xl text-sm text-violet-100/65">A simple control layer for decisions, approvals, priorities, and agent health. The deeper system stays available underneath.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onAskPlanner("Give me a fast priority check for today. Return only the top 3 actions, biggest blocker, and fastest revenue move.")} className="rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-400/25">
              Ask what to do now
            </button>
            <button onClick={onOpenOperations} className="rounded-xl border border-violet-400/25 bg-white/5 px-4 py-2 text-sm text-violet-100/75 transition hover:border-amber-300/35 hover:text-amber-100">
              Open StarrBase
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Target size={16} />} label="Urgent missions" value={`${active.filter((m) => m.priority === "urgent").length}`} detail="Needs attention" />
        <Metric icon={<AlertTriangle size={16} />} label="Blocked / waiting" value={`${blocked.length + waiting.length}`} detail="Needs your decision" />
        <Metric icon={<Bot size={16} />} label="Agents working" value={`${workingAgents.length}`} detail={`${idleAgents.length} idle · ${blockedAgents.length} blocked`} />
        <Metric icon={<CheckCircle2 size={16} />} label="Near complete" value={`${nearComplete.length}`} detail="70% or higher" />
        <Metric icon={<DollarSign size={16} />} label="Fastest money lane" value={topCashflow?.title || topCashflow?.name || "Review offers"} detail={topCashflow?.potential ? `$${Number(topCashflow.potential).toLocaleString()} potential` : "Ask Cashflow Agent"} compact />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">Today’s Focus</h2>
              <p className="mt-1 text-xs text-violet-100/50">Top missions ranked by urgency and momentum.</p>
            </div>
            <button onClick={() => onAskPlanner("Review my current active missions and tell me the best focus order for today in a concise response.")} className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-100">Re-rank with AI</button>
          </div>
          <div className="space-y-2">
            {priorities.map((mission, index) => (
              <button key={mission.id} onClick={() => openMission(mission.id)} className="flex w-full items-center gap-3 rounded-xl border border-violet-400/15 bg-black/20 p-3 text-left transition hover:border-amber-300/35">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10 font-hud text-xs text-amber-200">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-medium text-amber-50">{mission.title}</span><span className="rounded-full border border-violet-400/20 px-2 py-0.5 font-hud text-[8px] uppercase tracking-widest text-violet-100/60">{mission.priority}</span></div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-violet-100/55"><span>{mission.progress}% complete</span><span>·</span><span>{mission.status}</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300" style={{ width: `${mission.progress}%` }} /></div>
                </div>
                <Play size={15} className="text-amber-200/65" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-4">
          <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">Needs My Approval</h2>
          <p className="mt-1 text-xs text-violet-100/50">Items waiting on a human decision.</p>
          <div className="mt-3 space-y-2">
            {[...waiting, ...blocked].slice(0, 5).map((mission) => (
              <button key={mission.id} onClick={() => openMission(mission.id)} className="w-full rounded-xl border border-amber-300/20 bg-amber-400/[0.06] p-3 text-left transition hover:bg-amber-400/10">
                <div className="text-sm font-medium text-amber-50">{mission.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-violet-100/60">{mission.blockers[0] || "Waiting for your approval or direction."}</div>
              </button>
            ))}
            {waiting.length + blocked.length === 0 && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-100/70">Nothing currently needs approval.</div>}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-4">
          <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">Quick Questions</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {["What should I focus on right now?", "What is blocked and needs me?", "What makes money fastest?", "Which agent should I deploy next?"].map((prompt) => (
              <button key={prompt} onClick={() => onAskPlanner(prompt)} className="rounded-xl border border-violet-400/15 bg-black/20 p-3 text-left text-sm text-violet-100/75 transition hover:border-amber-300/35 hover:text-amber-100">{prompt}</button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-4">
          <h2 className="font-hud text-[11px] font-bold uppercase tracking-widest text-amber-100">Recent Agent Activity</h2>
          <div className="mt-3 space-y-2">
            {runtimes.filter((r) => r.lastOutput).slice(0, 5).map((runtime) => (
              <div key={runtime.agentId} className="flex gap-3 rounded-xl border border-violet-400/10 bg-black/15 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-amber-200">{runtime.avatar}</div>
                <div><div className="text-sm font-medium text-amber-50">{runtime.agentId.replaceAll("-", " ")}</div><div className="mt-0.5 text-xs leading-relaxed text-violet-100/55">{runtime.lastOutput}</div></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail, compact }: { icon: React.ReactNode; label: string; value: string; detail: string; compact?: boolean }) {
  return <div className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-4"><div className="mb-3 flex items-center gap-2 text-amber-200">{icon}<span className="font-hud text-[9px] uppercase tracking-widest text-violet-200/55">{label}</span></div><div className={`${compact ? "text-sm leading-snug" : "text-2xl"} font-semibold text-amber-50`}>{value}</div><div className="mt-1 text-xs text-violet-100/45">{detail}</div></div>;
}
