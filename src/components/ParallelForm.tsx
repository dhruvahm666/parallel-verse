import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { ParallelInput } from "@/lib/parallel.functions";

const INTERESTS = [
  "Science/Research", "Business/Entrepreneurship", "Arts/Creative",
  "Technology/AI", "Social Impact", "Sports/Fitness",
  "Travel/Exploration", "Philosophy/Spirituality", "Politics/Leadership",
  "Family/Relationships",
];
const VALUES = [
  "Money/Financial freedom", "Impact on others", "Creative expression",
  "Legacy for family/bloodline", "Knowledge/Discovery", "Fame/Recognition",
  "Freedom/Autonomy", "Beauty/Aesthetics", "Power/Influence", "Spirituality",
];

const empty: ParallelInput = {
  name: "", age: 25, city: "", country: "", occupation: "",
  education: "", income: "", family: "", financial: "",
  interests: [], otherInterest: "",
  risk: "Medium", values: [], workStyle: "Solo", pace: "Balanced",
  opportunities: "", constraints: "", resources: "",
  whatIfs: ["", "", ""], secretDream: "", biggestDream: "",
  whyExplore: "", whatDo: "",
};

export function ParallelForm({
  onSubmit, loading,
}: { onSubmit: (d: ParallelInput) => void; loading: boolean }) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<ParallelInput>(empty);
  const total = 7;
  const pct = (step / total) * 100;

  const set = <K extends keyof ParallelInput>(k: K, v: ParallelInput[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));
  const toggle = (key: "interests" | "values", v: string) =>
    setD((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }));

  const canNext = (() => {
    if (step === 1) return d.name.trim() && d.city.trim() && d.country.trim() && d.occupation.trim();
    if (step === 6) return d.whatIfs.filter((q) => q.trim()).length >= 1 && d.biggestDream.trim();
    return true;
  })();

  const submit = () => {
    const cleaned: ParallelInput = { ...d, whatIfs: d.whatIfs.map((q) => q.trim()).filter(Boolean) };
    onSubmit(cleaned);
  };

  return (
    <div className="bg-card-glass rounded-3xl border shadow-elegant p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step} of {total}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {step === 1 && (
        <Section title="Who are you?" subtitle="The basics. We'll use these to personalize your universes.">
          <Field label="Name"><Input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age">
              <Input type="number" min={16} max={80} value={d.age} onChange={(e) => set("age", parseInt(e.target.value || "25"))} />
            </Field>
            <Field label="Occupation"><Input value={d.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="Student, farmer, engineer..." /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City"><Input value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Mumbai" /></Field>
            <Field label="Country"><Input value={d.country} onChange={(e) => set("country", e.target.value)} placeholder="India" /></Field>
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section title="Current life situation" subtitle="Where you stand today.">
          <Field label="Education level"><Input value={d.education} onChange={(e) => set("education", e.target.value)} placeholder="High school, Bachelor's, no formal..." /></Field>
          <Field label="Income range (optional)"><Input value={d.income} onChange={(e) => set("income", e.target.value)} placeholder="₹5 LPA, $50k, none yet" /></Field>
          <Field label="Family status"><Input value={d.family} onChange={(e) => set("family", e.target.value)} placeholder="Single / married / kids / parents dependent" /></Field>
          <Field label="Financial situation">
            <RadioGroup value={d.financial} onValueChange={(v) => set("financial", v)} className="grid grid-cols-2 gap-2">
              {["Struggling", "Stable", "Comfortable", "Wealthy"].map((o) => (
                <label key={o} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-secondary/40">
                  <RadioGroupItem value={o} />{o}
                </label>
              ))}
            </RadioGroup>
          </Field>
        </Section>
      )}

      {step === 3 && (
        <Section title="Interests & passions" subtitle="Pick what lights you up.">
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map((i) => (
              <label key={i} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${d.interests.includes(i) ? "ring-glow bg-primary/10" : "hover:bg-secondary/40"}`}>
                <Checkbox checked={d.interests.includes(i)} onCheckedChange={() => toggle("interests", i)} />
                <span className="text-sm">{i}</span>
              </label>
            ))}
          </div>
          <Field label="What else are you interested in?"><Textarea value={d.otherInterest} onChange={(e) => set("otherInterest", e.target.value)} placeholder="Anything not listed above..." /></Field>
        </Section>
      )}

      {step === 4 && (
        <Section title="Mindset & values" subtitle="How you approach life.">
          <Field label="Risk tolerance">
            <RadioGroup value={d.risk} onValueChange={(v) => set("risk", v)} className="grid grid-cols-4 gap-2">
              {["Low", "Medium", "High", "Extreme"].map((o) => (
                <label key={o} className="flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-secondary/40">
                  <RadioGroupItem value={o} className="sr-only" />
                  <span className={d.risk === o ? "text-primary font-semibold" : ""}>{o}</span>
                </label>
              ))}
            </RadioGroup>
          </Field>
          <Field label="What matters most? (pick 2–3)">
            <div className="grid grid-cols-2 gap-2">
              {VALUES.map((v) => (
                <label key={v} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${d.values.includes(v) ? "ring-glow bg-primary/10" : "hover:bg-secondary/40"}`}>
                  <Checkbox checked={d.values.includes(v)} onCheckedChange={() => toggle("values", v)} />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Work style">
              <RadioGroup value={d.workStyle} onValueChange={(v) => set("workStyle", v)} className="space-y-1">
                {["Solo", "Team", "Leadership", "Collaborative"].map((o) => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer text-sm"><RadioGroupItem value={o} />{o}</label>
                ))}
              </RadioGroup>
            </Field>
            <Field label="Life pace">
              <RadioGroup value={d.pace} onValueChange={(v) => set("pace", v)} className="space-y-1">
                {["Slow & steady", "Balanced", "Fast & intense"].map((o) => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer text-sm"><RadioGroupItem value={o} />{o}</label>
                ))}
              </RadioGroup>
            </Field>
          </div>
        </Section>
      )}

      {step === 5 && (
        <Section title="Opportunities & constraints" subtitle="What you have, what holds you back.">
          <Field label="Opportunities you have"><Textarea value={d.opportunities} onChange={(e) => set("opportunities", e.target.value)} placeholder="I have a small farm, coding skills, ₹2L to invest..." /></Field>
          <Field label="Constraints you face"><Textarea value={d.constraints} onChange={(e) => set("constraints", e.target.value)} placeholder="I'm 45, no college degree, family responsibilities..." /></Field>
          <Field label="Resources you can access"><Textarea value={d.resources} onChange={(e) => set("resources", e.target.value)} placeholder="Local college, online courses, mentor network..." /></Field>
        </Section>
      )}

      {step === 6 && (
        <Section title="Your 'What if' dreams" subtitle="The most important step. These define your universes." big>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-primary font-mono text-sm w-12">What if</span>
              <Input
                value={d.whatIfs[i] ?? ""}
                onChange={(e) => {
                  const next = [...d.whatIfs];
                  next[i] = e.target.value;
                  set("whatIfs", next);
                }}
                placeholder={i === 0 ? "I become the first billionaire of my bloodline?" : i === 1 ? "I cure a disease no one has cured?" : "your wildest 'what if'..."}
              />
            </div>
          ))}
          <Field label="The BIGGEST thing you've always wanted to achieve"><Textarea value={d.biggestDream} onChange={(e) => set("biggestDream", e.target.value)} placeholder="Your one massive dream..." /></Field>
          <Field label="ONE dream you've never told anyone (optional)"><Textarea value={d.secretDream} onChange={(e) => set("secretDream", e.target.value)} placeholder="Your secret..." /></Field>
        </Section>
      )}

      {step === 7 && (
        <Section title="Why this matters to you" subtitle="Last step — context for your timelines.">
          <Field label="Why do you want to explore these parallel universes?"><Textarea value={d.whyExplore} onChange={(e) => set("whyExplore", e.target.value)} /></Field>
          <Field label="What would you do with this information?"><Textarea value={d.whatDo} onChange={(e) => set("whatDo", e.target.value)} /></Field>
        </Section>
      )}

      <div className="flex items-center justify-between mt-10">
        <Button variant="ghost" disabled={step === 1 || loading} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="size-4 mr-1" /> Back
        </Button>
        {step < total ? (
          <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-gradient-cosmic text-primary-foreground shadow-glow hover:opacity-90">
            Next <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button disabled={loading} onClick={submit} className="bg-gradient-cosmic text-primary-foreground shadow-glow hover:opacity-90">
            {loading ? <><Loader2 className="size-4 mr-2 animate-spin" />Generating universes…</> : <><Sparkles className="size-4 mr-2" />Generate my parallel universes</>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, big }: { title: string; subtitle: string; children: React.ReactNode; big?: boolean }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className={`font-bold tracking-tight ${big ? "text-3xl text-gradient" : "text-2xl"}`}>{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}