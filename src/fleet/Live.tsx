import { useState } from "react";
import { getAuthToken, useQuery, useMutations } from "deepspace";
import Workspace from "./Workspace";
import {
  type Incident,
  type Analysis,
  type PlanStep,
  type Comment,
  type Reference,
  incidentInput,
} from "./domain";
import { sampleIncidents } from "./fixtures";

export async function callAction<T>(
  name: string,
  params: Record<string, unknown>,
): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error("Sign in again before using an integration.");
  const response = await fetch(`/api/actions/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!response.ok)
    throw new Error(`Request failed (${response.status}). Try again.`);
  const result = (await response.json()) as {
    success: boolean;
    error?: string;
    data: T;
  };
  if (!result.success)
    throw new Error(
      result.error || "Integration unavailable. Try again shortly.",
    );
  return result.data;
}
export default function Live() {
  const incidents = useQuery<Incident>("incidents", {
    orderBy: "createdAt",
    orderDir: "desc",
    limit: 100,
  });
  const analyses = useQuery<Analysis>("analyses", {
    orderBy: "createdAt",
    orderDir: "desc",
    limit: 200,
  });
  const steps = useQuery<PlanStep>("plan_steps", { limit: 1000 });
  const comments = useQuery<Comment>("comments", {
    orderBy: "createdAt",
    orderDir: "asc",
    limit: 1000,
  });
  const incidentWrites = useMutations<Incident>("incidents"),
    stepWrites = useMutations<PlanStep>("plan_steps"),
    commentWrites = useMutations<Comment>("comments");
  const [pending, setPending] = useState(""),
    [error, setError] = useState(""),
    [references, setReferences] = useState<Reference[]>([]),
    [review, setReview] = useState<Record<string, number> | null>(null);
  const ready = incidentWrites.ready && stepWrites.ready && commentWrites.ready;
  async function run(
    name: string,
    fn: () => Promise<unknown>,
    rethrow = false,
  ) {
    setPending(name);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The change could not be saved.",
      );
      if (rethrow) throw e;
    } finally {
      setPending("");
    }
  }
  const loadError = [incidents, analyses, steps, comments].find(
    (q) => q.status === "error",
  )?.error;
  return (
    <>
      {!incidents.records.length && incidents.status === "ready" && (
        <div className="bg-[#eaf1e1] px-6 py-3 text-center text-sm text-[#375337]">
          Start with your own synthetic incident, or{" "}
          <button
            className="underline"
            disabled={!ready || !!pending}
            onClick={() =>
              void run("seed", async () => {
                for (const row of sampleIncidents)
                  await incidentWrites.createConfirmed(row.data);
              })
            }
          >
            load three synthetic examples
          </button>
          .
        </div>
      )}
      <Workspace
        live
        ready={ready}
        incidents={incidents.records}
        analyses={analyses.records}
        steps={steps.records}
        comments={comments.records}
        pending={pending}
        error={error || loadError || ""}
        references={references}
        review={review}
        onSelect={() => {
          setReferences([]);
          setReview(null);
          setError("");
        }}
        onCreate={(data) =>
          run(
            "create",
            () => incidentWrites.createConfirmed(incidentInput.parse(data)),
            true,
          )
        }
        onStatus={(id, status) =>
          run("status", () => incidentWrites.putConfirmed(id, { status }))
        }
        onToggle={(id, done) =>
          run("step", () => stepWrites.putConfirmed(id, { done }))
        }
        onAddStep={(incidentId, title) =>
          run(
            "step",
            () =>
              stepWrites.createConfirmed({ incidentId, title, done: false }),
            true,
          )
        }
        onComment={(incidentId, body) =>
          run(
            "comment",
            () => commentWrites.createConfirmed({ incidentId, body }),
            true,
          )
        }
        onAnalyze={(id) =>
          run("analyze", async () => {
            setReview(null);
            await callAction("analyze", { incidentId: id });
          })
        }
        onReview={(incidentId, analysisId) =>
          run("review", async () => {
            const result = await callAction<{
              answers: Record<string, { noul: number }>;
            }>("review", { incidentId, analysisId });
            const values = Object.entries(result.answers ?? {}).filter(
              ([, v]) =>
                typeof v.noul === "number" && v.noul >= 0 && v.noul <= 1,
            );
            if (!values.length)
              throw new Error(
                "The review provider returned no usable verdict.",
              );
            setReview(Object.fromEntries(values.map(([k, v]) => [k, v.noul])));
          })
        }
        onReferences={(incidentId, topic) =>
          run("references", async () => {
            setReferences([]);
            const result = await callAction<{ results: Reference[] }>(
              "references",
              { incidentId, topic },
            );
            setReferences(result.results);
            if (!result.results.length)
              setError(
                "No approved-domain references found for this topic. Try again later.",
              );
          })
        }
      />
    </>
  );
}
