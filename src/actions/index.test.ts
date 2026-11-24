import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("deepspace/worker", () => ({ resolveAppRole: vi.fn() }));
import { resolveAppRole, type ActionContext } from "deepspace/worker";
import { actions } from "./index";
import {
  sampleIncidents,
  sampleBrief,
  sampleAnalyses,
} from "../fleet/fixtures";
import type { Env } from "../../worker";
const role = vi.mocked(resolveAppRole);
function context(params: Record<string, unknown> = { incidentId: "i-1" }) {
  const tools = {
    get: vi
      .fn()
      .mockResolvedValue({
        success: true,
        data: { record: { data: sampleIncidents[0].data } },
      }),
    create: vi
      .fn()
      .mockResolvedValue({ success: true, data: { recordId: "a-1" } }),
    integration: vi
      .fn()
      .mockResolvedValue({
        success: true,
        data: {
          content: [{ type: "text", text: JSON.stringify(sampleBrief) }],
        },
      }),
  };
  return {
    tools,
    ctx: {
      userId: "u-1",
      params,
      tools,
      env: {},
      callerJwt: "test-only",
    } as unknown as ActionContext<Env>,
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  role.mockResolvedValue("member");
});
describe("authenticated integration actions", () => {
  it("refuses non-members before reading records or billing integrations", async () => {
    role.mockResolvedValue("viewer");
    const { ctx, tools } = context();
    const result = await actions.analyze(ctx);
    expect(result.success).toBe(false);
    expect(tools.get).not.toHaveBeenCalled();
    expect(tools.integration).not.toHaveBeenCalled();
  });
  it("persists only a validated brief tied to its incident snapshot", async () => {
    const { ctx, tools } = context();
    expect((await actions.analyze(ctx)).success).toBe(true);
    expect(tools.create).toHaveBeenCalledWith(
      "analyses",
      expect.objectContaining({
        incidentId: "i-1",
        source: sampleAnalyses[0].data.source,
        brief: sampleBrief,
      }),
    );
    expect(tools.integration).toHaveBeenCalledWith(
      "anthropic/chat-completion",
      expect.objectContaining({ messages: expect.any(Array) }),
    );
  });
  it("does not persist fabricated citation numbers", async () => {
    const { ctx, tools } = context();
    tools.integration.mockResolvedValue({
      success: true,
      data: {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ...sampleBrief,
              findings: [{ ...sampleBrief.findings[0], line: 999 }],
            }),
          },
        ],
      },
    });
    expect((await actions.analyze(ctx)).success).toBe(false);
    expect(tools.create).not.toHaveBeenCalled();
  });
  it("surfaces provider failure without inserting an analysis", async () => {
    const { ctx, tools } = context();
    tools.integration.mockResolvedValue({
      success: false,
      error: "Unavailable",
    } as never);
    expect((await actions.analyze(ctx)).success).toBe(false);
    expect(tools.create).not.toHaveBeenCalled();
  });
  it("rejects reviewing an analysis from another incident", async () => {
    const { ctx, tools } = context({
      incidentId: "i-1",
      analysisId: "a-other",
    });
    tools.get
      .mockResolvedValueOnce({
        success: true,
        data: { record: { data: sampleIncidents[0].data } },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          record: { data: { ...sampleAnalyses[0].data, incidentId: "i-2" } },
        },
      });
    expect((await actions.review(ctx)).success).toBe(false);
    expect(tools.integration).not.toHaveBeenCalled();
  });
  it("forwards only a fixed public topic to search, never incident text", async () => {
    const { ctx, tools } = context({
      incidentId: "i-1",
      topic: "ROS 2 connectivity",
    });
    tools.integration.mockResolvedValue({
      success: true,
      data: {
        results: [
          { title: "ROS docs", url: "https://docs.ros.org/" },
          { title: "untrusted", url: "https://evil.test/" },
        ],
      },
    } as never);
    const result = await actions.references(ctx);
    expect(result.success).toBe(true);
    expect(JSON.stringify(tools.integration.mock.calls)).not.toContain(
      sampleIncidents[0].data.telemetry,
    );
    expect(tools.integration.mock.calls[0][1]).toMatchObject({
      query: "ROS 2 connectivity troubleshooting official documentation",
    });
    expect(
      (result as { data: { results: unknown[] } }).data.results,
    ).toHaveLength(1);
  });
  it("refuses custom search queries before provider call", async () => {
    const { ctx, tools } = context({
      incidentId: "i-1",
      topic: "customer secrets",
    });
    expect((await actions.references(ctx)).success).toBe(false);
    expect(tools.integration).not.toHaveBeenCalled();
  });
});
