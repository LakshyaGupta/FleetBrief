import { describe, it, expect } from "vitest";
import {
  parseBrief,
  safeReference,
  incidentInput,
  exportBrief,
  snapshot,
} from "./domain";
import {
  sampleBrief,
  sampleIncidents,
  sampleAnalyses,
  sampleSteps,
} from "./fixtures";
const incident = sampleIncidents[0].data;

describe("evidence and input boundaries", () => {
  it("accepts structured model output with numbered evidence", () =>
    expect(parseBrief(JSON.stringify(sampleBrief), incident.telemetry)).toEqual(
      sampleBrief,
    ));
  it("accepts a JSON fence without allowing arbitrary surrounding prose", () => {
    expect(
      parseBrief(
        "```json\n" + JSON.stringify(sampleBrief) + "\n```",
        incident.telemetry,
      ),
    ).toEqual(sampleBrief);
    expect(() =>
      parseBrief(
        "Here it is: " + JSON.stringify(sampleBrief),
        incident.telemetry,
      ),
    ).toThrow();
  });
  it("rejects a citation beyond the input", () =>
    expect(() =>
      parseBrief(
        JSON.stringify({
          ...sampleBrief,
          findings: [{ ...sampleBrief.findings[0], line: 99 }],
        }),
        incident.telemetry,
      ),
    ).toThrow(/outside/));
  it("rejects zero, fractional and nonnumeric citations", () => {
    for (const line of [0, 1.5, "3"])
      expect(() =>
        parseBrief(
          JSON.stringify({
            ...sampleBrief,
            findings: [{ ...sampleBrief.findings[0], line }],
          }),
          incident.telemetry,
        ),
      ).toThrow();
  });
  it("rejects malformed output and empty findings", () => {
    expect(() => parseBrief("not JSON", incident.telemetry)).toThrow();
    expect(() =>
      parseBrief(
        JSON.stringify({ ...sampleBrief, findings: [] }),
        incident.telemetry,
      ),
    ).toThrow();
  });
  it("bounds telemetry and restricts public search topics", () => {
    expect(
      incidentInput.safeParse({ ...incident, telemetry: "x".repeat(12001) })
        .success,
    ).toBe(false);
    expect(
      incidentInput.safeParse({ ...incident, category: "secret customer name" })
        .success,
    ).toBe(false);
  });
  it("accepts only HTTPS official-domain references", () => {
    expect(
      safeReference({ title: "ROS", url: "https://docs.ros.org/en/rolling/" }),
    ).not.toBeNull();
    for (const url of [
      "javascript:alert(1)",
      "http://docs.ros.org/",
      "https://docs.ros.org.evil.test/",
      "https://evil.test/",
      "https://docs.ros.org@evil.test/",
    ])
      expect(safeReference({ title: "x", url })).toBeNull();
  });
  it("snapshots relevant evidence while status changes do not invalidate analysis", () => {
    expect(snapshot({ ...incident, status: "resolved" })).toBe(
      snapshot(incident),
    );
    expect(
      snapshot({ ...incident, telemetry: incident.telemetry + "\nextra" }),
    ).not.toBe(snapshot(incident));
  });
  it("exports real checklist state, citations and original telemetry", () => {
    const report = exportBrief(incident, sampleAnalyses[0].data, sampleSteps);
    expect(report).toContain("- [x] Keep the mission paused");
    expect(report).toContain("- [ ] Compare");
    expect(report).toContain("Line 3:");
    expect(report).toContain(incident.telemetry);
    const staleReport = exportBrief(
      { ...incident, telemetry: "Changed synthetic evidence." },
      sampleAnalyses[0].data,
      sampleSteps,
    );
    expect(staleReport).toContain("Previous AI output excluded");
    expect(staleReport).not.toContain("Line 3:");
  });
});
