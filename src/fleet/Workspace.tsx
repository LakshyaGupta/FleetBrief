import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  FileText,
  FlaskConical,
  Layers3,
  Loader2,
  MessageSquare,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  categories,
  exportBrief,
  incidentInput,
  snapshot,
  type Incident,
  type Analysis,
  type PlanStep,
  type Row,
  type Comment,
  type Reference,
} from "./domain";
import "./fleet.css";

type Props = {
  onSelect?: () => void;
  live: boolean;
  ready: boolean;
  incidents: Row<Incident>[];
  analyses: Row<Analysis>[];
  steps: Row<PlanStep>[];
  comments: Row<Comment>[];
  pending: string;
  error: string;
  references: Reference[];
  review: Record<string, number> | null;
  onCreate: (data: Incident) => Promise<void>;
  onStatus: (id: string, status: Incident["status"]) => Promise<void>;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onAddStep: (id: string, title: string) => Promise<void>;
  onComment: (id: string, body: string) => Promise<void>;
  onAnalyze: (id: string) => Promise<void>;
  onReview: (id: string, analysisId: string) => Promise<void>;
  onReferences: (id: string, topic: string) => Promise<void>;
};
const severityLabel = { high: "High priority", medium: "Medium", low: "Low" };
export default function Workspace(props: Props) {
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("brief");
  const [showCreate, setShowCreate] = useState(false);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState("");
  const [line, setLine] = useState(0);
  const [notice, setNotice] = useState("");
  const item =
    props.incidents.find((i) => i.recordId === selected) ?? props.incidents[0];
  const incident = item?.data;
  const analysis = props.analyses.find(
    (a) => a.data.incidentId === item?.recordId,
  );
  const currentSteps = props.steps.filter(
    (s) => s.data.incidentId === item?.recordId,
  );
  const comments = props.comments.filter(
    (c) => c.data.incidentId === item?.recordId,
  );
  const filtered = props.incidents.filter(
    (i) =>
      (filter === "all" || i.data.status === filter) &&
      `${i.data.title} ${i.data.robot}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const stale =
    incident && analysis && snapshot(incident) !== analysis.data.source;
  const canWrite = props.ready && !props.pending;
  const complete = currentSteps.filter((s) => s.data.done).length;
  function select(id: string) {
    props.onSelect?.();
    setSelected(id);
    setComment("");
    setStep("");
    setTab("brief");
    setLine(0);
    setNotice("");
  }
  function download() {
    if (!incident) return;
    const blob = new Blob(
      [exportBrief(incident, analysis?.data, currentSteps)],
      { type: "text/markdown" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleetbrief-${incident.robot.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Incident report downloaded.");
  }
  return (
    <div
      className="fb"
      data-testid={props.live ? "live-workspace" : "static-landing"}
    >
      <aside className="fb-sidebar">
        <Link to="/" className="fb-logo">
          <span>
            <Layers3 size={21} />
          </span>
          FleetBrief<i>LAB</i>
        </Link>
        <div className="fb-workspace">
          <div className="fb-workspace-icon">F</div>
          <div>
            <strong>Field operations</strong>
            <small>Shared synthetic workspace</small>
          </div>
        </div>
        <p className="fb-nav-label">WORKSPACE</p>
        <button
          className={filter === "all" ? "fb-nav active" : "fb-nav"}
          onClick={() => setFilter("all")}
        >
          <ClipboardList size={17} />
          Incident queue<span>{props.incidents.length}</span>
        </button>
        <button
          className={filter === "open" ? "fb-nav active" : "fb-nav"}
          onClick={() => setFilter("open")}
        >
          <Circle size={16} />
          Needs triage
          <span>
            {props.incidents.filter((i) => i.data.status === "open").length}
          </span>
        </button>
        <button
          className={filter === "monitoring" ? "fb-nav active" : "fb-nav"}
          onClick={() => setFilter("monitoring")}
        >
          <Radio size={17} />
          Monitoring
        </button>
        <button
          className={filter === "resolved" ? "fb-nav active" : "fb-nav"}
          onClick={() => setFilter("resolved")}
        >
          <CheckCircle2 size={17} />
          Resolved
        </button>
        <div className="fb-sidebar-note">
          <FlaskConical size={20} />
          <strong>Built for human judgment.</strong>
          <p>AI helps connect the evidence. You decide what happens next.</p>
        </div>
        <div className="fb-integration-list">
          <p className="fb-nav-label">DEEPSPACE INTEGRATIONS</p>
          <span>
            <Sparkles size={14} />
            Claude <small>triage</small>
          </span>
          <span>
            <ShieldCheck size={14} />
            Jev <small>review</small>
          </span>
          <span>
            <Search size={14} />
            Exa <small>references</small>
          </span>
        </div>
        <div className="fb-sidebar-bottom">
          <span className="fb-avatar">LG</span>
          <div>
            <strong>FleetBrief project</strong>
            <small>DeepSpace build exercise</small>
          </div>
        </div>
      </aside>
      <div className="fb-main">
        <header className="fb-topbar">
          <div>
            <span className="fb-breadcrumb">Workspace</span>
            <ChevronRight size={14} />
            <span>Incident queue</span>
          </div>
          <span className="fb-mode">
            {props.live ? (
              <>
                <Radio size={13} />
                Live workspace
              </>
            ) : (
              <>
                <FlaskConical size={13} />
                Interactive demo
              </>
            )}
          </span>
          {!props.live && (
            <Link className="fb-signin" to="/home">
              Open live workspace <ArrowRight size={14} />
            </Link>
          )}
        </header>
        {!props.live && (
          <div className="fb-demo-banner">
            Explore with synthetic incidents. Demo changes reset on refresh; AI
            outputs are labeled examples.{" "}
            <Link to="/home">Sign in for saved, shared work →</Link>
          </div>
        )}
        {props.live && (
          <div className="fb-demo-banner">
            Shared evaluation sandbox: all signed-in members can view incidents
            and edit response plans. Use synthetic data only.
          </div>
        )}
        <section className="fb-heading">
          <div>
            <p className="fb-eyebrow">OBSERVE. UNDERSTAND. RESPOND.</p>
            <h1>Resolve the signal.</h1>
            <p>Turn scattered telemetry into a clear, reviewable next step.</p>
          </div>
          <button
            className="fb-button primary"
            disabled={!canWrite}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={17} />
            New incident
          </button>
        </section>
        <div className="fb-stats">
          <div>
            <span className="fb-stat-icon amber">
              <Activity size={20} />
            </span>
            <div>
              <span>Active incidents</span>
              <strong>
                {
                  props.incidents.filter((i) => i.data.status !== "resolved")
                    .length
                }
              </strong>
            </div>
            <small>Across your workspace</small>
          </div>
          <div>
            <span className="fb-stat-icon mint">
              <ClipboardList size={20} />
            </span>
            <div>
              <span>Response actions</span>
              <strong>{props.steps.filter((s) => !s.data.done).length}</strong>
            </div>
            <small>Ready for human review</small>
          </div>
          <div>
            <span className="fb-stat-icon lilac">
              <ShieldCheck size={20} />
            </span>
            <div>
              <span>Resolved</span>
              <strong>
                {
                  props.incidents.filter((i) => i.data.status === "resolved")
                    .length
                }
              </strong>
            </div>
            <small>Shared team progress</small>
          </div>
        </div>
        {props.error && (
          <div role="alert" className="fb-error">
            {props.error}
          </div>
        )}
        {notice && (
          <div role="status" className="fb-notice">
            {notice}
          </div>
        )}
        <div className="fb-board">
          <section className="fb-queue">
            <div className="fb-queue-title">
              <h2>Incident queue</h2>
              <span>{filtered.length}</span>
            </div>
            <label className="fb-search">
              <Search size={16} />
              <input
                aria-label="Search incidents"
                placeholder="Search robot or incident…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="fb-filter-row">
              <button
                className={filter === "all" ? "selected" : ""}
                onClick={() => setFilter("all")}
              >
                All incidents
              </button>
              <button
                className={filter === "open" ? "selected" : ""}
                onClick={() => setFilter("open")}
              >
                Needs triage
              </button>
            </div>
            <div className="fb-cards">
              {filtered.map((row, index) => (
                <button
                  key={row.recordId}
                  disabled={!!props.pending}
                  className={
                    "fb-incident-card " +
                    (item?.recordId === row.recordId ? "selected" : "")
                  }
                  onClick={() => select(row.recordId)}
                >
                  <div>
                    <span className={"fb-badge " + row.data.severity}>
                      {severityLabel[row.data.severity]}
                    </span>
                    <small>
                      {row.recordId.startsWith("demo")
                        ? `INC-${String(index + 1).padStart(3, "0")}`
                        : row.data.robot}
                    </small>
                  </div>
                  <h3>{row.data.title}</h3>
                  <p>{row.data.description}</p>
                  <footer>
                    <span>
                      <span className="fb-robot-dot" />
                      {row.data.robot}
                    </span>
                    <span className="fb-status-dot">{row.data.status}</span>
                  </footer>
                </button>
              ))}
              {!filtered.length && (
                <div className="fb-empty">
                  <Search size={26} />
                  <strong>No incidents here</strong>
                  <p>Try another filter or create an incident.</p>
                </div>
              )}
            </div>
            <div className="fb-queue-foot">
              <span className="fb-tiny-dot" />
              {props.live
                ? "Updates sync through DeepSpace"
                : "Synthetic data · no equipment connected"}
            </div>
          </section>
          {incident && item ? (
            <section className="fb-detail">
              <div className="fb-detail-title">
                <div className="fb-detail-meta">
                  <span className={"fb-badge " + incident.severity}>
                    {severityLabel[incident.severity]}
                  </span>
                  <span>{incident.robot}</span>
                  <span>·</span>
                  <span>{incident.category}</span>
                </div>
                <div className="fb-title-row">
                  <h2>{incident.title}</h2>
                  <button
                    className="fb-icon-button"
                    aria-label="Download incident report"
                    title="Download Markdown report"
                    onClick={download}
                  >
                    <ArrowDownToLine size={18} />
                  </button>
                </div>
                <p>{incident.description}</p>
                <div className="fb-status-control">
                  <label>
                    Status{" "}
                    <select
                      aria-label="Incident status"
                      value={incident.status}
                      disabled={!canWrite}
                      onChange={(e) =>
                        void props.onStatus(
                          item.recordId,
                          e.target.value as Incident["status"],
                        )
                      }
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </label>
                  <span>
                    <ShieldCheck size={14} />
                    Advisory only · no commands executed
                  </span>
                </div>
              </div>
              <div
                className="fb-tabs"
                role="tablist"
                aria-label="Incident sections"
              >
                {[
                  ["brief", "Triage brief", Sparkles],
                  ["evidence", "Evidence", Terminal],
                  ["discussion", "Discussion", MessageSquare],
                  ["references", "References", FileText],
                ].map(([id, label, Icon]) => {
                  const I = Icon as typeof Sparkles;
                  return (
                    <button
                      key={String(id)}
                      role="tab"
                      aria-selected={tab === id}
                      className={tab === id ? "selected" : ""}
                      onClick={() => setTab(String(id))}
                    >
                      <I size={15} />
                      {String(label)}
                      {id === "evidence" && (
                        <small>{incident.telemetry.split("\n").length}</small>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="fb-detail-body">
                {tab === "brief" && (
                  <>
                    <div className="fb-ai-heading">
                      <span>
                        <Sparkles size={17} />
                        Evidence-first triage
                      </span>
                      <button
                        className="fb-button subtle"
                        disabled={!canWrite}
                        onClick={() => void props.onAnalyze(item.recordId)}
                      >
                        {props.pending === "analyze" ? (
                          <Loader2 className="fb-spin" size={14} />
                        ) : analysis ? (
                          <RotateCcw size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}{" "}
                        {analysis ? "Regenerate" : "Generate brief"}
                      </button>
                    </div>
                    {!props.live && (
                      <p className="fb-example-label">
                        Illustrative example — live generation requires sign-in.
                      </p>
                    )}
                    {stale && (
                      <div className="fb-error">
                        This brief was generated from an earlier incident
                        snapshot. Regenerate before using it.
                      </div>
                    )}
                    {analysis ? (
                      <>
                        <p className="fb-summary">
                          {analysis.data.brief.summary}
                        </p>
                        <h3 className="fb-section-label">
                          WHAT THE EVIDENCE SAYS
                        </h3>
                        <div className="fb-findings">
                          {analysis.data.brief.findings.map((finding, i) => (
                            <article key={i}>
                              <span className="fb-finding-number">{i + 1}</span>
                              <div>
                                <strong>{finding.observation}</strong>
                                <p>{finding.interpretation}</p>
                                <button
                                  onClick={() => {
                                    setLine(finding.line);
                                    setTab("evidence");
                                  }}
                                >
                                  Telemetry line {finding.line}{" "}
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                        <div className="fb-unknowns">
                          <ShieldCheck size={18} />
                          <div>
                            <strong>What we still don’t know</strong>
                            <ul>
                              {analysis.data.brief.unknowns.map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="fb-review">
                          <div>
                            <strong>Second-pass review</strong>
                            <p>
                              Jev checks grounding and caution. This is a model
                              opinion, not a safety certification.
                            </p>
                          </div>
                          <button
                            className="fb-button outline"
                            disabled={!canWrite || !!stale}
                            onClick={() =>
                              void props.onReview(
                                item.recordId,
                                analysis.recordId,
                              )
                            }
                          >
                            {props.pending === "review" ? (
                              <Loader2 className="fb-spin" size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                            Review brief
                          </button>
                        </div>
                        {props.review && (
                          <div className="fb-review-results">
                            {Object.entries(props.review).map(
                              ([key, value]) => (
                                <span key={key}>
                                  {key}: {Math.round(value * 100)}% model
                                  estimate
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="fb-empty">
                        <Sparkles size={30} />
                        <strong>A clear next step starts with evidence.</strong>
                        <p>
                          Generate a brief from this incident’s description and
                          numbered telemetry. AI usage is billed to your
                          DeepSpace account.
                        </p>
                      </div>
                    )}
                    <div className="fb-plan">
                      <div>
                        <h3>Human response plan</h3>
                        <span>
                          {complete}/{currentSteps.length} complete
                        </span>
                      </div>
                      {currentSteps.map((s) => (
                        <label
                          className={
                            "fb-plan-step " + (s.data.done ? "done" : "")
                          }
                          key={s.recordId}
                        >
                          <input
                            type="checkbox"
                            checked={s.data.done}
                            disabled={!canWrite}
                            onChange={(e) =>
                              void props.onToggle(s.recordId, e.target.checked)
                            }
                          />
                          <span>{s.data.title}</span>
                          {s.data.done && <Check size={14} />}
                        </label>
                      ))}
                      {analysis && !stale && (
                        <div className="fb-suggestions">
                          {analysis.data.brief.nextSteps
                            .filter(
                              (title) =>
                                !currentSteps.some(
                                  (s) => s.data.title === title,
                                ),
                            )
                            .map((title) => (
                              <button
                                key={title}
                                disabled={!canWrite}
                                onClick={() =>
                                  void props.onAddStep(item.recordId, title)
                                }
                              >
                                <Plus size={13} />
                                {title}
                              </button>
                            ))}
                        </div>
                      )}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (step.trim())
                            void props
                              .onAddStep(item.recordId, step.trim())
                              .then(() => setStep(""))
                              .catch(() => {});
                        }}
                      >
                        <input
                          aria-label="New response action"
                          maxLength={400}
                          placeholder="Add a reviewed action…"
                          value={step}
                          onChange={(e) => setStep(e.target.value)}
                        />
                        <button
                          className="fb-icon-button"
                          aria-label="Add response action"
                          disabled={!canWrite || !step.trim()}
                        >
                          <Plus size={18} />
                        </button>
                      </form>
                    </div>
                  </>
                )}
                {tab === "evidence" && (
                  <>
                    <h3 className="fb-subtitle">Telemetry excerpt</h3>
                    <p className="fb-muted">
                      Original lines are kept intact. Citations in the brief
                      link back here.
                    </p>
                    <div className="fb-log">
                      {incident.telemetry.split("\n").map((text, i) => (
                        <div
                          className={line === i + 1 ? "highlight" : ""}
                          key={i}
                        >
                          <span>{i + 1}</span>
                          <code>{text}</code>
                        </div>
                      ))}
                    </div>
                    <p className="fb-footnote">
                      Evidence is supplied by the incident author. The app does
                      not connect to or control equipment.
                    </p>
                  </>
                )}
                {tab === "discussion" && (
                  <>
                    <h3 className="fb-subtitle">
                      Keep the handoff in context.
                    </h3>
                    <p className="fb-muted">
                      Notes are shared with signed-in workspace members.
                    </p>
                    {comments.map((c) => (
                      <article className="fb-comment" key={c.recordId}>
                        <span className="fb-avatar">T</span>
                        <div>
                          <strong>Workspace teammate</strong>
                          <p>{c.data.body}</p>
                        </div>
                      </article>
                    ))}
                    {!comments.length && (
                      <p className="fb-empty-copy">
                        No handoff notes yet. Add an observation or explain your
                        decision.
                      </p>
                    )}
                    <form
                      className="fb-comment-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (comment.trim())
                          void props
                            .onComment(item.recordId, comment.trim())
                            .then(() => setComment(""))
                            .catch(() => {});
                      }}
                    >
                      <textarea
                        aria-label="Handoff note"
                        maxLength={2000}
                        placeholder="What should the next operator know?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button
                        className="fb-button primary"
                        disabled={!canWrite || !comment.trim()}
                      >
                        Add note <ArrowRight size={14} />
                      </button>
                    </form>
                  </>
                )}
                {tab === "references" && (
                  <>
                    <h3 className="fb-subtitle">Go back to the source.</h3>
                    <p className="fb-muted">
                      Find official references for “{incident.category}”. Only
                      this public topic is sent to Exa; your telemetry stays out
                      of web search.
                    </p>
                    <button
                      className="fb-button outline"
                      disabled={!canWrite}
                      onClick={() =>
                        void props.onReferences(
                          item.recordId,
                          incident.category,
                        )
                      }
                    >
                      {props.pending === "references" ? (
                        <Loader2 className="fb-spin" size={15} />
                      ) : (
                        <Search size={15} />
                      )}
                      Find official documentation
                    </button>
                    <div className="fb-references">
                      {props.references.map((r) => (
                        <a
                          href={r.url}
                          key={r.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText size={19} />
                          <div>
                            <strong>{r.title}</strong>
                            <small>{new URL(r.url).hostname}</small>
                          </div>
                          <ExternalLink size={15} />
                        </a>
                      ))}
                    </div>
                    <p className="fb-footnote">
                      References are background material, not proof of this
                      incident’s root cause. Live search uses your DeepSpace
                      credits.
                    </p>
                  </>
                )}
              </div>
            </section>
          ) : (
            <section className="fb-detail fb-empty">
              <Layers3 size={40} />
              <h2>Your first incident starts here.</h2>
              <p>
                Create an incident with synthetic telemetry to try the full
                flow.
              </p>
              <button
                className="fb-button primary"
                disabled={!canWrite}
                onClick={() => setShowCreate(true)}
              >
                Create incident <Plus size={16} />
              </button>
            </section>
          )}
        </div>
        <footer className="fb-page-footer">
          <span>FLEETBRIEF / HUMAN IN THE LOOP</span>
          <span>Built with DeepSpace · Synthetic data only</span>
        </footer>
      </div>
      {showCreate && (
        <CreateDialog
          disabled={!canWrite}
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await props.onCreate(data);
            props.onSelect?.();
            setSelected("");
            setTab("brief");
            setComment("");
            setStep("");
            setShowCreate(false);
            setNotice(
              "Incident saved. Select it in the queue to start triage.",
            );
          }}
        />
      )}
    </div>
  );
}
function CreateDialog({
  onClose,
  onCreate,
  disabled,
}: {
  onClose: () => void;
  onCreate: (data: Incident) => Promise<void>;
  disabled: boolean;
}) {
  const [error, setError] = useState("");
  const [telemetry, setTelemetry] = useState("");
  return (
    <div
      className="fb-modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)",
          );
          const first = nodes[0],
            last = nodes[nodes.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
      onClick={onClose}
    >
      <section
        className="fb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-incident-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <p className="fb-eyebrow">CAPTURE THE CONTEXT</p>
            <h2 id="new-incident-heading">New incident</h2>
          </div>
          <button
            className="fb-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const fields = new FormData(e.currentTarget);
            const parsed = incidentInput.safeParse({
              ...Object.fromEntries(fields),
              telemetry,
              status: "open",
            });
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            try {
              await onCreate(parsed.data);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not save incident.",
              );
            }
          }}
        >
          <label>
            Incident title
            <input
              name="title"
              required
              minLength={5}
              maxLength={120}
              placeholder="What changed?"
              autoFocus
            />
          </label>
          <div className="fb-form-grid">
            <label>
              Robot or system
              <input
                name="robot"
                required
                maxLength={40}
                placeholder="AMR-07"
              />
            </label>
            <label>
              Priority
              <select name="severity">
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
          <label>
            Investigation topic
            <select name="category">
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Operator observation
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={2000}
              placeholder="What happened, and what has already been done?"
            />
          </label>
          <label>
            Telemetry excerpt
            <textarea
              className="fb-monospace"
              required
              minLength={10}
              maxLength={12000}
              rows={5}
              value={telemetry}
              onChange={(e) => setTelemetry(e.target.value)}
              placeholder="Paste synthetic log lines here…"
            />
          </label>
          <label className="fb-upload">
            Or load a text / log / CSV file
            <input
              type="file"
              accept=".txt,.log,.csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 100000) {
                  setError("Choose a text file under 100 KB.");
                  return;
                }
                const text = await file.text();
                if (text.length > 12000) {
                  setError(
                    "Keep the telemetry excerpt under 12,000 characters.",
                  );
                  return;
                }
                setTelemetry(text);
                setError("");
              }}
            />
          </label>
          <p className="fb-footnote">
            This is a shared evaluation workspace. Do not include customer data,
            credentials, or employer information.
          </p>
          {error && (
            <div className="fb-error" role="alert">
              {error}
            </div>
          )}
          <footer>
            <button
              type="button"
              className="fb-button outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="fb-button primary" disabled={disabled}>
              Save incident <ArrowRight size={15} />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
