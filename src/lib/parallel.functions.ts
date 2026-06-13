import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(1).max(120),
  age: z.number().int().min(16).max(80),
  city: z.string().max(120),
  country: z.string().max(120),
  occupation: z.string().max(160),
  education: z.string().max(160),
  income: z.string().max(160),
  family: z.string().max(160),
  financial: z.string().max(160),
  interests: z.array(z.string().max(80)).max(20),
  otherInterest: z.string().max(300),
  risk: z.string(),
  values: z.array(z.string().max(80)).max(10),
  workStyle: z.string(),
  pace: z.string(),
  opportunities: z.string().max(1000),
  constraints: z.string().max(1000),
  resources: z.string().max(1000),
  whatIfs: z.array(z.string().max(500)).min(1).max(5),
  secretDream: z.string().max(500),
  biggestDream: z.string().max(500),
  whyExplore: z.string().max(800),
  whatDo: z.string().max(800),
});

export type ParallelInput = z.infer<typeof FormSchema>;

export type Milestone = {
  age: number;
  title: string;
  description: string;
  money: number;
  moneyLabel: string;
  impact: number;
  impactLabel: string;
  challenge: string;
};

export type Timeline = {
  title: string;
  tagline: string;
  emoji: string;
  successProbability: number;
  currency: string;
  milestones: Milestone[];
  requiredSkills: string[];
  realPeople: { name: string; note: string }[];
  resourcesNeeded: string[];
  whatItTakes: string;
  warning: string;
};

export type ParallelResult = {
  insights: {
    values: string;
    opportunity: string;
    challenge: string;
    firstStep: string;
    revelation: string;
  };
  timelines: Timeline[];
};

const SYSTEM = `You are an analyst that generates highly personalized "parallel universe" life trajectories. You read a user's profile, mindset, and their own "What if" questions, then return STRICT JSON only — no prose, no markdown fences. Be motivational but realistic: show the dream AND the grind. Pick the currency that matches the user's country (₹ for India, $ for US, € for Europe, etc.). Use realistic money figures. Each timeline must map to one of the user's "What if" questions, customized to their exact profile (age, location, constraints).`;

function buildPrompt(d: ParallelInput) {
  return `USER PROFILE:
- Name: ${d.name}, Age: ${d.age}, Location: ${d.city}, ${d.country}
- Occupation: ${d.occupation}
- Education: ${d.education} | Income: ${d.income} | Family: ${d.family} | Financial: ${d.financial}
- Interests: ${d.interests.join(", ")}${d.otherInterest ? " | Other: " + d.otherInterest : ""}
- Risk tolerance: ${d.risk} | Values: ${d.values.join(", ")} | Work style: ${d.workStyle} | Pace: ${d.pace}
- Opportunities they have: ${d.opportunities}
- Constraints they face: ${d.constraints}
- Resources: ${d.resources}
- BIGGEST dream: ${d.biggestDream}
- Secret dream: ${d.secretDream}
- Why explore: ${d.whyExplore} | What they'd do with it: ${d.whatDo}

USER'S "WHAT IF" QUESTIONS (PICK 3 — most distinctive/important):
${d.whatIfs.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return JSON matching EXACTLY this TypeScript shape:
{
  "insights": {
    "values": "1 sentence about what their dreams reveal they value",
    "opportunity": "their biggest opportunity based on profile",
    "challenge": "their biggest challenge based on constraints",
    "firstStep": "ONE concrete first action they can take this week",
    "revelation": "1-2 sentences: what their parallel universes reveal about them"
  },
  "timelines": [
    {
      "title": "You as the [thing from their What If]",
      "tagline": "1-line dream summary",
      "emoji": "single emoji",
      "successProbability": 0-100 integer based on their profile,
      "currency": "₹ or $ or € etc.",
      "milestones": [ 7 entries at ages: current, +5, +10, +15, +20, +25, +30 capped at 80
        { "age": number, "title": "short", "description": "2-3 sentences specific to them", "money": number (in their currency, realistic), "moneyLabel": "e.g. Net worth or Annual revenue", "impact": number (people helped / publications / etc), "impactLabel": "e.g. People impacted", "challenge": "specific challenge at this age" }
      ],
      "requiredSkills": ["5-7 specific skills"],
      "realPeople": [ 3 entries { "name": "real person who did similar", "note": "1 line on what they did" } ],
      "resourcesNeeded": ["4-6 specific resources: colleges, mentors, capital amounts"],
      "whatItTakes": "honest paragraph: hours/day, years of grind, failures they'll face",
      "warning": "1 brutal honest sentence about the path"
    }
  ]
}

Generate EXACTLY 3 timelines. Output ONLY raw JSON, no \`\`\` fences.`;
}

export const generateParallelUniverses = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FormSchema.parse(d))
  .handler(async ({ data }): Promise<ParallelResult> => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("AI not configured: GROQ_API_KEY missing");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(data) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("AI is busy — please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      throw new Error(`AI error: ${res.status} ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
    let parsed: ParallelResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned malformed response. Try again.");
    }
    return parsed;
  });