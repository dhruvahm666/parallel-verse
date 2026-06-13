import { useState } from "react";
import type { ParallelResult, Timeline } from "@/lib/parallel.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Sparkles, AlertTriangle, Users, Lightbulb, Target, TrendingUp, RotateCcw } from "lucide-react";

function formatMoney(n: number, currency: string) {
  if (n >= 1_000_000_000) return `${currency}${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(0)}K`;
  return `${currency}${n}`;
}

export function TimelineResults({ result, name, onReset }: { result: ParallelResult; name: string; onReset: () => void }) {
  const [active, setActive] = useState(0);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          <Sparkles className="size-3" /> Your parallel universes
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="text-gradient">{name}</span>, here are 3 lives you could live.
        </h1>
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-5 gap-4">
        <InsightCard icon={<Lightbulb className="size-5" />} title="What you value" body={result.insights.values} />
        <InsightCard icon={<TrendingUp className="size-5" />} title="Biggest opportunity" body={result.insights.opportunity} />
        <InsightCard icon={<AlertTriangle className="size-5" />} title="Biggest challenge" body={result.insights.challenge} />
        <InsightCard icon={<Target className="size-5" />} title="First step this week" body={result.insights.firstStep} />
        <InsightCard icon={<Sparkles className="size-5" />} title="Revelation" body={result.insights.revelation} />
      </div>

      {/* Timeline cards summary */}
      <div className="grid md:grid-cols-3 gap-5">
        {result.timelines.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`text-left bg-card-glass rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-glow ${active === i ? "ring-glow" : ""}`}
          >
            <div className="text-4xl mb-3">{t.emoji}</div>
            <h3 className="text-xl font-bold mb-2">{t.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t.tagline}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Probability</span>
              <span className="text-2xl font-bold text-gradient">{t.successProbability}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active timeline detail */}
      <TimelineDetail t={result.timelines[active]!} />

      {/* Compare table */}
      <CompareTable timelines={result.timelines} />

      <div className="flex justify-center pt-4">
        <Button onClick={onReset} variant="outline" size="lg">
          <RotateCcw className="size-4 mr-2" /> Try different "What if" questions
        </Button>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-card-glass rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-wider">
        {icon} {title}
      </div>
      <p className="text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function TimelineDetail({ t }: { t: Timeline }) {
  const [milestoneIdx, setMilestoneIdx] = useState(0);
  const m = t.milestones[milestoneIdx];
  const chartData = t.milestones.map((mi) => ({ age: mi.age, money: mi.money, impact: mi.impact }));
  const useImpact = t.milestones.every((mi) => mi.money === 0);

  return (
    <div className="bg-card-glass rounded-3xl border shadow-elegant p-6 md:p-10 space-y-8">
      <div className="flex items-start gap-4">
        <div className="text-5xl">{t.emoji}</div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground mt-1">{t.tagline}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 -mx-2">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="oklch(0.72 0.20 295)" />
                <stop offset="100%" stopColor="oklch(0.68 0.22 250)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.97 0.01 280 / 0.08)" />
            <XAxis dataKey="age" stroke="oklch(0.72 0.04 280)" tickLine={false} />
            <YAxis
              stroke="oklch(0.72 0.04 280)"
              tickFormatter={(v) => useImpact ? `${(v / 1000).toFixed(0)}K` : formatMoney(v, t.currency)}
              tickLine={false} width={70}
            />
            <Tooltip
              contentStyle={{ background: "oklch(0.21 0.06 285)", border: "1px solid oklch(0.97 0.01 280 / 0.15)", borderRadius: 12 }}
              formatter={(v: number) => useImpact ? `${v.toLocaleString()} ${t.milestones[0]?.impactLabel ?? "impact"}` : formatMoney(v, t.currency)}
              labelFormatter={(l) => `Age ${l}`}
            />
            <Line type="monotone" dataKey={useImpact ? "impact" : "money"} stroke="url(#lineGrad)" strokeWidth={3} dot={{ fill: "oklch(0.72 0.20 295)", r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Age milestones */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {t.milestones.map((mi, i) => (
            <button
              key={i}
              onClick={() => setMilestoneIdx(i)}
              className={`px-4 py-2 rounded-full text-sm border transition ${milestoneIdx === i ? "bg-gradient-cosmic text-primary-foreground border-transparent" : "hover:bg-secondary/40"}`}
            >
              Age {mi.age}
            </button>
          ))}
        </div>

        {m && (
          <div className="bg-background/40 rounded-2xl border p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-2xl font-bold">Age {m.age}: {m.title}</h3>
              <div className="text-right">
                <div className="text-xs uppercase text-muted-foreground">{m.moneyLabel}</div>
                <div className="text-2xl font-bold text-gradient">{m.money > 0 ? formatMoney(m.money, t.currency) : `${m.impact.toLocaleString()} ${m.impactLabel}`}</div>
              </div>
            </div>
            <p className="text-foreground/90 leading-relaxed">{m.description}</p>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <span className="font-semibold text-destructive">Challenge:</span> {m.challenge}
            </div>
          </div>
        )}
      </div>

      {/* Skills + people + resources */}
      <div className="grid md:grid-cols-3 gap-5">
        <DetailBlock title="Skills you must build">
          <ul className="space-y-1.5">
            {t.requiredSkills.map((s, i) => <li key={i} className="text-sm flex gap-2"><span className="text-primary">→</span>{s}</li>)}
          </ul>
        </DetailBlock>
        <DetailBlock title="People who did this" icon={<Users className="size-4" />}>
          <ul className="space-y-3">
            {t.realPeople.map((p, i) => (
              <li key={i} className="text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-muted-foreground text-xs">{p.note}</div>
              </li>
            ))}
          </ul>
        </DetailBlock>
        <DetailBlock title="Resources you'll need">
          <ul className="space-y-1.5">
            {t.resourcesNeeded.map((r, i) => <li key={i} className="text-sm flex gap-2"><span className="text-accent">◆</span>{r}</li>)}
          </ul>
        </DetailBlock>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="text-xs uppercase tracking-wider text-primary mb-2">What it truly takes</div>
          <p className="text-sm leading-relaxed">{t.whatItTakes}</p>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="text-xs uppercase tracking-wider text-destructive mb-2 flex items-center gap-1"><AlertTriangle className="size-3" />Warning</div>
          <p className="text-sm leading-relaxed">{t.warning}</p>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-background/40 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">{icon}{title}</div>
      {children}
    </div>
  );
}

function CompareTable({ timelines }: { timelines: Timeline[] }) {
  return (
    <Tabs defaultValue="compare">
      <TabsList>
        <TabsTrigger value="compare">Compare all 3 paths</TabsTrigger>
      </TabsList>
      <TabsContent value="compare">
        <div className="bg-card-glass rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-muted-foreground font-normal">Dimension</th>
                {timelines.map((t, i) => <th key={i} className="text-left p-4 font-semibold">{t.emoji} {t.title}</th>)}
              </tr>
            </thead>
            <tbody className="[&_tr]:border-b [&_tr:last-child]:border-0">
              <Row label="Probability">{timelines.map((t, i) => <td key={i} className="p-4 font-bold text-gradient">{t.successProbability}%</td>)}</Row>
              <Row label="Tagline">{timelines.map((t, i) => <td key={i} className="p-4">{t.tagline}</td>)}</Row>
              <Row label="Top skill needed">{timelines.map((t, i) => <td key={i} className="p-4">{t.requiredSkills[0]}</td>)}</Row>
              <Row label="Honest warning">{timelines.map((t, i) => <td key={i} className="p-4 text-destructive/90">{t.warning}</td>)}</Row>
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-4 text-muted-foreground align-top">{label}</td>
      {children}
    </tr>
  );
}