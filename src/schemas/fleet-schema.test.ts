import { describe, it, expect } from "vitest";
import { fleetSchemas } from "./fleet-schema";
describe("shared sandbox trust boundary", () => {
  it("has no anonymous record grants", () => {
    for (const schema of fleetSchemas) {
      expect(schema.permissions).not.toHaveProperty("*");
      expect(schema.permissions).not.toHaveProperty("anonymous");
    }
  });
  it("makes AI output read-only to every browser role", () => {
    const schema = fleetSchemas.find((s) => s.name === "analyses")!;
    for (const permissions of Object.values(schema.permissions!)) {
      expect(permissions.create).toBe(false);
      expect(permissions.update).toBe(false);
      expect(permissions.delete).toBe(false);
    }
  });
  it("enforces input bounds at persistence, not just the form", () => {
    const schema = fleetSchemas.find((s) => s.name === "incidents")!;
    expect(schema.columns.find((c) => c.name === "telemetry")).toMatchObject({
      required: true,
      maxLength: 12000,
    });
    expect(schema.columns.find((c) => c.name === "title")).toMatchObject({
      required: true,
      maxLength: 120,
    });
  });
});
