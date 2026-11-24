import { useState } from "react";
import Workspace from "./Workspace";
import {
  sampleIncidents,
  sampleAnalyses,
  sampleSteps,
  sampleBrief,
} from "./fixtures";
import {
  snapshot,
  type Incident,
  type Analysis,
  type PlanStep,
  type Comment,
  type Row,
  type Reference,
} from "./domain";
export default function Demo() {
  const [incidents, setIncidents] = useState(sampleIncidents);
  const [analyses, setAnalyses] = useState<Row<Analysis>[]>(sampleAnalyses);
  const [steps, setSteps] = useState<Row<PlanStep>[]>(sampleSteps);
  const [comments, setComments] = useState<Row<Comment>[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [error, setError] = useState("");
  const id = () => crypto.randomUUID();
  return (
    <Workspace
      live={false}
      ready
      incidents={incidents}
      analyses={analyses}
      steps={steps}
      comments={comments}
      references={references}
      review={null}
      pending=""
      error={error}
      onSelect={() => {
        setReferences([]);
        setError("");
      }}
      onCreate={async (data) => {
        setIncidents((old) => [{ recordId: id(), data }, ...old]);
      }}
      onStatus={async (key, status) =>
        setIncidents((old) =>
          old.map((row) =>
            row.recordId === key
              ? { ...row, data: { ...row.data, status } }
              : row,
          ),
        )
      }
      onToggle={async (key, done) =>
        setSteps((old) =>
          old.map((row) =>
            row.recordId === key
              ? { ...row, data: { ...row.data, done } }
              : row,
          ),
        )
      }
      onAddStep={async (incidentId, title) =>
        setSteps((old) => [
          ...old,
          { recordId: id(), data: { incidentId, title, done: false } },
        ])
      }
      onComment={async (incidentId, body) =>
        setComments((old) => [
          ...old,
          { recordId: id(), data: { incidentId, body } },
        ])
      }
      onAnalyze={async (key) => {
        if (key !== "demo-001") {
          setError(
            "This offline demo includes one illustrative brief. Open AMR-07, or use the live workspace for analysis of your own synthetic incidents.",
          );
          return;
        }
        const item = incidents.find((i) => i.recordId === key)!;
        setAnalyses((old) => [
          {
            recordId: id(),
            data: {
              incidentId: key,
              source: snapshot(item.data),
              brief: sampleBrief,
              model: "Illustrative example — not a live model run",
            },
          },
          ...old,
        ]);
      }}
      onReview={async () =>
        setError(
          "Jev review runs in the signed-in workspace. This offline demo does not simulate a model verdict.",
        )
      }
      onReferences={async () =>
        setReferences([
          {
            title: "ROS 2: Quality of Service settings",
            url: "https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Quality-of-Service-Settings.html",
            text: "Curated example reference. Live workspace uses Exa search for the selected topic.",
          },
        ])
      }
    />
  );
}
