import type { CollectionSchema, ColumnDefinition } from "deepspace/schema";
import { categories } from "../fleet/domain";
const text = (name: string, maxLength = 400): ColumnDefinition => ({
  name,
  storage: "text",
  interpretation: "plain",
  required: true,
  maxLength,
});
const select = (name: string, options: string[]): ColumnDefinition => ({
  ...text(name, 80),
  interpretation: { kind: "select", options },
});
const shared = {
  member: { read: true, create: true, update: true, delete: "own" as const },
  admin: { read: true, create: true, update: true, delete: true },
};
const serverOwned = {
  member: { read: true, create: false, update: false, delete: false },
  admin: { read: true, create: false, update: false, delete: false },
};
export const fleetSchemas: CollectionSchema[] = [
  {
    name: "incidents",
    columns: [
      text("title", 120),
      text("robot", 40),
      select("severity", ["high", "medium", "low"]),
      select("category", [...categories]),
      text("description", 2000),
      text("telemetry", 12000),
      select("status", ["open", "investigating", "monitoring", "resolved"]),
    ],
    permissions: shared,
  },
  {
    name: "analyses",
    columns: [
      text("incidentId", 200),
      text("source", 40000),
      {
        name: "brief",
        storage: "text",
        interpretation: { kind: "json" },
        required: true,
        maxLength: 20000,
      },
      text("model", 100),
    ],
    permissions: serverOwned,
  },
  {
    name: "plan_steps",
    columns: [
      text("incidentId", 200),
      text("title", 400),
      {
        name: "done",
        storage: "number",
        interpretation: { kind: "boolean" },
        required: true,
      },
    ],
    permissions: shared,
  },
  {
    name: "comments",
    columns: [text("incidentId", 200), text("body", 2000)],
    permissions: {
      member: { read: true, create: true, update: "own", delete: "own" },
      admin: { read: true, create: true, update: true, delete: true },
    },
  },
];
