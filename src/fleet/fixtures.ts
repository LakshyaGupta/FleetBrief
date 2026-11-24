import type { Incident, Brief, Row, PlanStep, Analysis } from "./domain";
import { snapshot } from "./domain";
export const sampleIncidents: Row<Incident>[] = [
  {
    recordId: "demo-001",
    data: {
      title: "Robot goes quiet after network handoff",
      robot: "AMR-07",
      severity: "high",
      category: "ROS 2 connectivity",
      status: "investigating",
      description:
        "AMR-07 stopped publishing its heartbeat after moving from zone B to zone C. The operator paused the mission. Other robots remain connected.",
      telemetry:
        "14:02:10 INFO mission=pick-483 zone=B heartbeat_age_ms=42\n14:02:14 INFO network ssid=warehouse-c rssi_dbm=-78\n14:02:15 WARN dds participant discovery timeout after 5000ms\n14:02:16 WARN heartbeat_age_ms=6042 supervisor=disconnected\n14:02:17 INFO battery_pct=74 cpu_pct=31\n14:02:18 INFO operator paused mission; no recovery command sent",
    },
  },
  {
    recordId: "demo-002",
    data: {
      title: "Charging session ends before target",
      robot: "AMR-12",
      severity: "medium",
      category: "Battery and charging",
      status: "open",
      description:
        "A synthetic charging session ended at 38% rather than the requested 80%. The robot is parked and awaiting inspection.",
      telemetry:
        "09:10:00 INFO dock=CH-2 battery_pct=36 target_pct=80\n09:14:11 WARN charge_current_a=0.0 contact_state=unstable\n09:14:12 INFO battery_pct=38 temperature_c=29\n09:14:13 WARN charge_session ended reason=contact_lost",
    },
  },
  {
    recordId: "demo-003",
    data: {
      title: "Localization variance near loading bay",
      robot: "AMR-03",
      severity: "low",
      category: "Navigation and localization",
      status: "monitoring",
      description:
        "A robot reported elevated position uncertainty near a busy loading bay. It has remained stationary while the area is checked.",
      telemetry:
        "11:42:01 INFO zone=loading-bay speed_mps=0.0\n11:42:02 WARN localization covariance_xy=0.84\n11:42:03 INFO lidar points_valid_pct=62\n11:42:04 INFO battery_pct=83\n11:42:05 INFO supervisor monitoring; robot remains stationary",
    },
  },
];
export const sampleBrief: Brief = {
  summary:
    "The heartbeat loss follows a network handoff and a DDS discovery timeout. Connectivity is a plausible lead, but these logs do not establish a root cause. The robot is already paused.",
  findings: [
    {
      observation: "DDS discovery timed out after 5000ms.",
      line: 3,
      interpretation:
        "Peer discovery may have been interrupted during the handoff. Check discovery and network configuration before considering a restart.",
    },
    {
      observation: "Heartbeat age rose to 6042ms.",
      line: 4,
      interpretation:
        "The supervisor reported a connectivity gap; this does not prove the robot process crashed.",
    },
    {
      observation: "Battery is 74% and CPU is 31%.",
      line: 5,
      interpretation:
        "These samples provide no direct evidence of battery depletion or CPU saturation.",
    },
  ],
  nextSteps: [
    "Keep the mission paused while checking the robot’s physical surroundings.",
    "Compare ROS discovery and network configuration in zones B and C.",
    "Collect matching supervisor and access-point logs for 14:02:10–14:02:18.",
  ],
  unknowns: [
    "Access-point roaming events and packet loss are not included.",
    "The ROS distribution, RMW implementation, and discovery configuration are unknown.",
  ],
};
export const sampleAnalyses: Row<Analysis>[] = [
  {
    recordId: "example-analysis",
    data: {
      incidentId: "demo-001",
      source: snapshot(sampleIncidents[0].data),
      brief: sampleBrief,
      model: "Illustrative example — not a live model run",
    },
  },
];
export const sampleSteps: Row<PlanStep>[] = [
  {
    recordId: "step-1",
    data: {
      incidentId: "demo-001",
      title: "Keep the mission paused and inspect the area",
      done: true,
    },
  },
  {
    recordId: "step-2",
    data: {
      incidentId: "demo-001",
      title: "Compare access-point and supervisor logs",
      done: false,
    },
  },
];
