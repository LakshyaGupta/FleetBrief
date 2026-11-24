import { z } from "zod";
export const categories = [
  "ROS 2 connectivity",
  "Battery and charging",
  "Navigation and localization",
] as const;
export const incidentInput = z.object({
  title: z.string().trim().min(5).max(120),
  robot: z.string().trim().min(1).max(40),
  severity: z.enum(["high", "medium", "low"]),
  category: z.enum(categories),
  description: z.string().trim().min(10).max(2000),
  telemetry: z.string().trim().min(10).max(12000),
  status: z
    .enum(["open", "investigating", "monitoring", "resolved"])
    .default("open"),
});
export type Incident = z.infer<typeof incidentInput>;
export const briefSchema = z.object({
  summary: z.string().min(10).max(1200),
  findings: z
    .array(
      z.object({
        observation: z.string().min(1).max(600),
        line: z.number().int().positive(),
        interpretation: z.string().min(1).max(600),
      }),
    )
    .min(1)
    .max(6),
  nextSteps: z.array(z.string().min(1).max(400)).min(1).max(6),
  unknowns: z.array(z.string().min(1).max(400)).min(1).max(5),
});
export type Brief = z.infer<typeof briefSchema>;
export type Row<T> = {
  recordId: string;
  data: T;
  createdAt?: string | number;
  createdBy?: string;
};
export type Analysis = {
  incidentId: string;
  source: string;
  brief: Brief;
  model: string;
};
export type PlanStep = { incidentId: string; title: string; done: boolean };
export type Comment = { incidentId: string; body: string };
export type Reference = { title: string; url: string; text?: string };
export function snapshot(incident: Incident) {
  return JSON.stringify({
    title: incident.title,
    category: incident.category,
    description: incident.description,
    telemetry: incident.telemetry,
  });
}
export function parseBrief(raw: string, telemetry: string): Brief {
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "");
  const result = briefSchema.parse(JSON.parse(text));
  const count = telemetry.split("\n").length;
  if (result.findings.some((f) => f.line > count))
    throw new Error(
      "The analysis cited a line outside the supplied telemetry. Try again.",
    );
  return result;
}
export function safeReference(value: unknown): Reference | null {
  const parsed = z
    .object({
      title: z.string().max(500),
      url: z.string().url(),
      text: z.string().optional(),
    })
    .safeParse(value);
  if (!parsed.success) return null;
  const url = new URL(parsed.data.url);
  const allowed = [
    "docs.ros.org",
    "docs.docker.com",
    "developer.nvidia.com",
    "cloud.google.com",
  ];
  return url.protocol === "https:" && allowed.includes(url.hostname)
    ? parsed.data
    : null;
}
export function exportBrief(
  incident: Incident,
  analysis: Analysis | undefined,
  steps: Row<PlanStep>[],
): string {
  const stale = !!analysis && analysis.source !== snapshot(incident);
  if (stale) analysis = undefined;
  return `# ${incident.title}\n\nRobot: ${incident.robot}\nStatus: ${incident.status}\nSeverity: ${incident.severity}\n\n${incident.description}\n\n## Triage brief\n${stale ? "Previous AI output excluded: its evidence snapshot differs from this report.\n\n" : ""}${analysis?.brief.summary ?? "No AI analysis generated."}\n\n${analysis?.brief.findings.map((f) => `- Line ${f.line}: ${f.observation} — ${f.interpretation}`).join("\n") ?? ""}\n\n## Human response plan\n${steps.map((s) => `- [${s.data.done ? "x" : " "}] ${s.data.title}`).join("\n")}\n\n## Unknowns\n${analysis?.brief.unknowns.map((s) => `- ${s}`).join("\n") ?? ""}\n\n## Telemetry\n\`\`\`text\n${incident.telemetry}\n\`\`\`\n\nSynthetic demonstration data. Advisory analysis; no robot-control commands are executed.\n`;
}
