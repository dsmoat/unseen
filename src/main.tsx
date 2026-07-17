import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu,
  Play,
  Database,
  ChevronRight,
  Search,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FlaskConical,
  BookOpen,
  Network,
} from "lucide-react";
import {
  messages,
  participants,
  signals as initialSignals,
  claims,
  opportunities as initialOpps,
} from "./data/demo";
import {
  reconstructThreads,
  detectContradictions,
  groupProblems,
  applyValidation,
  learningWeight,
} from "./lib/pipeline";
import type { Opportunity } from "./types";
import "./styles.css";
const nav = [
  "Overview",
  "Conversations",
  "Signals",
  "Claim Ledger",
  "Organization Graph",
  "Patterns",
  "Opportunities",
  "Validation",
  "Experiments",
  "Outcomes",
  "Learning",
  "Settings",
];
const route = (n: string) => n.toLowerCase().replaceAll(" ", "-");
function Chip({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`chip ${tone}`}>{children}</span>;
}
function Evidence({ ids }: { ids: string[] }) {
  return (
    <details>
      <summary>
        {ids.length} source message{ids.length !== 1 ? "s" : ""}
      </summary>
      {ids.map((id) => {
        const m = messages.find((x) => x.id === id)!;
        return (
          <blockquote key={id}>
            <b>{participants.find((p) => p.id === m.senderId)?.name}</b> ·{" "}
            {new Date(m.sentAt).toLocaleDateString()}
            <br />
            {m.content}
            {m.translatedContent && (
              <small>English: {m.translatedContent}</small>
            )}
          </blockquote>
        );
      })}
    </details>
  );
}
function App() {
  const [page, setPage] = useState(location.hash.slice(1) || "overview"),
    [collapsed, setCollapsed] = useState(false),
    [loaded, setLoaded] = useState(true),
    [running, setRunning] = useState(false),
    [progress, setProgress] = useState(0),
    [sig, setSig] = useState(initialSignals),
    [opps, setOpps] = useState(initialOpps),
    [answer, setAnswer] = useState("unknown"),
    [experiments, setExperiments] = useState<any[]>([]),
    [outcomes, setOutcomes] = useState<any[]>([]),
    [learnings, setLearnings] = useState<any[]>([]),
    [tour, setTour] = useState(0);
  const threads = useMemo(
      () => reconstructThreads(loaded ? messages : []),
      [loaded],
    ),
    contradictions = detectContradictions(claims),
    clusters = groupProblems(sig);
  const go = (p: string) => {
    location.hash = p;
    setPage(p);
  };
  const run = () => {
    setRunning(true);
    setProgress(0);
    let n = 0;
    const timer = setInterval(() => {
      n++;
      setProgress(n);
      if (n === 8) {
        clearInterval(timer);
        setRunning(false);
      }
    }, 260);
  };
  const answerQuestion = () =>
    setOpps((o) =>
      o.map((x, i) =>
        i
          ? x
          : {
              ...x,
              overallScore: applyValidation(
                x.overallScore,
                answer as any,
                true,
              ),
            },
      ),
    );
  const createExp = () =>
    setExperiments([
      {
        id: "e1",
        opportunityId: "o2",
        hypothesis: "Knowledge continuity is urgent enough for a pilot.",
        riskiestAssumption:
          "Plant managers rank knowledge loss among their top three problems.",
        method:
          "Interview five plant managers, document current transfer cost, then offer a limited paid concierge pilot.",
        durationDays: 14,
        effort: "low",
        status: "approved",
      },
      ...experiments,
    ]);
  const record = () => {
    const out = {
      id: "out1",
      what: "Customer interview completed",
      result: "confirmed",
      date: new Date().toISOString().slice(0, 10),
    };
    setOutcomes([out]);
    setLearnings([
      {
        id: "l1",
        lesson:
          "Customer-confirmed repeated factory problems receive greater weight.",
        affectedPattern: "knowledge-loss",
        previousWeight: 1,
        newWeight: learningWeight(1, "confirmed", true),
        sourceOutcomeId: out.id,
        approved: false,
      },
    ]);
  };
  return (
    <div className="app">
      <aside className={collapsed ? "collapsed" : ""}>
        <div className="brand">
          <div>U</div>
          {!collapsed && (
            <span>
              UNSEEN<small>Evidence → learning</small>
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}>
            <Menu />
          </button>
        </div>
        <nav>
          {nav.map((n) => (
            <button
              className={page === route(n) ? "active" : ""}
              onClick={() => go(route(n))}
              key={n}
            >
              <span>{n[0]}</span>
              {!collapsed && n}
            </button>
          ))}
        </nav>
        <div className="mode">
          {!collapsed && <>MODE</>}
          <Chip tone="green">Deterministic</Chip>
        </div>
      </aside>
      <main>
        <div className="banner">
          FICTIONAL DEMONSTRATION DATA{" "}
          <span>No real people, companies, or customer records.</span>
        </div>
        <header>
          <div>
            <p className="eyebrow">ORGANIZATIONAL INTELLIGENCE</p>
            <h1>{nav.find((n) => route(n) === page) || "Overview"}</h1>
          </div>
          <div className="header-actions">
            <button className="secondary" onClick={() => setTour(1)}>
              <Play />
              Start guided tour
            </button>
            <div className="avatar">AT</div>
          </div>
        </header>
        {tour > 0 && (
          <div className="tour">
            <b>Guided tour · {tour}/12</b>
            <p>
              {
                [
                  "Load fictional communication",
                  "Reconstruct threads and participants",
                  "Extract evidence-linked signals",
                  "Compare three conflicting claims",
                  "See approval needs repeat across countries",
                  "Recover the archived risk proposal",
                  "Connect factory loss to an AI capability",
                  "Review an opportunity hypothesis",
                  "Answer a targeted validation question",
                  "Approve the cheapest useful experiment",
                  "Record evidence from an outcome",
                  "Inspect an explainable learning update",
                ][tour - 1]
              }
            </p>
            <button
              onClick={() => {
                const pages = [
                  "conversations",
                  "conversations",
                  "signals",
                  "claim-ledger",
                  "patterns",
                  "patterns",
                  "opportunities",
                  "opportunities",
                  "validation",
                  "experiments",
                  "outcomes",
                  "learning",
                ];
                go(pages[tour - 1]);
                setTour(tour === 12 ? 0 : tour + 1);
              }}
            >
              {tour === 12 ? "Finish" : "Open record"} <ChevronRight />
            </button>
          </div>
        )}
        <section className="content">
          {page === "overview" && (
            <Overview run={run} running={running} progress={progress} go={go} />
          )}{" "}
          {page === "conversations" && (
            <Conversations
              threads={threads}
              loaded={loaded}
              setLoaded={setLoaded}
            />
          )}{" "}
          {page === "signals" && <Signals items={sig} setItems={setSig} />}{" "}
          {page === "claim-ledger" && (
            <Claims contradictions={contradictions} />
          )}{" "}
          {page === "organization-graph" && <Graph />}{" "}
          {page === "patterns" && (
            <Patterns contradictions={contradictions} clusters={clusters} />
          )}{" "}
          {page === "opportunities" && <Opportunities items={opps} />}{" "}
          {page === "validation" && (
            <Validation
              answer={answer}
              setAnswer={setAnswer}
              submit={answerQuestion}
              score={opps[0].overallScore}
            />
          )}{" "}
          {page === "experiments" && (
            <Experiments items={experiments} create={createExp} />
          )}{" "}
          {page === "outcomes" && <Outcomes items={outcomes} record={record} />}{" "}
          {page === "learning" && (
            <Learning items={learnings} setItems={setLearnings} />
          )}{" "}
          {page === "settings" && <Settings />}
        </section>
      </main>
    </div>
  );
}
const metrics = [
  ["Conversations", 8],
  ["Participants", 8],
  ["Signals", 11],
  ["Claims", 3],
  ["Contradictions", 1],
  ["Repeated clusters", 2],
  ["Abandoned ideas", 1],
  ["Capabilities", 3],
  ["Opportunities", 3],
  ["Awaiting validation", 3],
  ["Experiments running", 0],
];
function Overview({ run, running, progress, go }: any) {
  const stages = [
    "Conversations",
    "Signals",
    "Claims",
    "Patterns",
    "Opportunities",
    "Experiments",
    "Outcomes",
    "Learning",
  ];
  return (
    <>
      <div className="hero">
        <div>
          <Chip>DETERMINISTIC ANALYSIS</Chip>
          <h2>Turn overlooked communication into testable hypotheses.</h2>
          <p>
            UNSEEN preserves source evidence, separates participant claims from
            conclusions, and keeps uncertainty visible.
          </p>
        </div>
        <button className="primary" onClick={run} disabled={running}>
          <Play />
          {running
            ? "Processing deterministic rules…"
            : "Run analysis pipeline"}
        </button>
      </div>
      {running && (
        <div className="progress">
          <i style={{ width: `${(progress / 8) * 100}%` }} />
          <span>Stage {progress} of 8 · no live model is running</span>
        </div>
      )}
      <div className="metrics">
        {metrics.map(([a, b]) => (
          <article>
            <b>{b}</b>
            <span>{a}</span>
          </article>
        ))}
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">ANALYSIS FLOW</p>
            <h3>From conversations to organizational learning</h3>
          </div>
        </div>
        <div className="pipeline">
          {stages.map((s, i) => (
            <button onClick={() => go(route(s))}>
              <span>{i + 1}</span>
              {s}
              {i < 7 && <ChevronRight />}
            </button>
          ))}
        </div>
      </div>
      <div className="grid3">
        <Insight
          icon={<AlertTriangle />}
          title="Conflicting explanations"
          body="Sales, Delivery, and Product name three different primary causes for approval adoption."
        />
        <Insight
          icon={<Network />}
          title="Hidden connection"
          body="Factory knowledge loss links to a reusable multilingual extraction capability."
        />
        <Insight
          icon={<Lightbulb />}
          title="Idea worth revisiting"
          body="A 2024 risk-report proposal has new customer evidence and improved technical conditions."
        />
      </div>
    </>
  );
}
function Insight(p: any) {
  return (
    <article className="panel insight">
      <div className="icon">{p.icon}</div>
      <Chip>HYPOTHESIS</Chip>
      <h3>{p.title}</h3>
      <p>{p.body}</p>
      <small>Requires human validation</small>
    </article>
  );
}
function Conversations({ threads, loaded, setLoaded }: any) {
  const [selected, setSelected] = useState(threads[0]?.id);
  const t = threads.find((x: any) => x.id === selected);
  return (
    <>
      <div className="toolbar">
        <button className="primary" onClick={() => setLoaded(true)}>
          <Database />
          Load sample
        </button>
        <button onClick={() => setLoaded(false)}>
          <RotateCcw />
          Reset
        </button>
        <label className="upload">
          <Upload />
          Upload JSON
          <input type="file" accept="application/json" />
        </label>
        <input placeholder="Paste email or chat text…" />
      </div>
      {!loaded ? (
        <div className="empty">
          <Database />
          <h3>No conversations loaded</h3>
          <p>
            Load the built-in fictional sample or import the documented JSON
            format.
          </p>
        </div>
      ) : (
        <div className="split">
          <div className="list">
            {threads.map((x: any) => (
              <button
                className={selected === x.id ? "selected" : ""}
                onClick={() => setSelected(x.id)}
              >
                <b>{x.messages[0].subject}</b>
                <span>
                  {x.messages.length} messages · {x.participants.length} people
                </span>
              </button>
            ))}
          </div>
          <div className="thread">
            <h2>{t.messages[0].subject}</h2>
            <p>
              <Chip tone="green">
                {Math.round(t.confidence * 100)}% reconstruction
              </Chip>{" "}
              Chronological reply links
            </p>
            {t.messages.map((m: any) => (
              <article>
                <div className="avatar">
                  {participants
                    .find((p) => p.id === m.senderId)
                    ?.name.split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <div>
                  <b>
                    {participants.find((p) => p.id === m.senderId)?.name ||
                      "Unknown participant"}
                  </b>
                  <small>
                    {new Date(m.sentAt).toLocaleString()} · {m.sourceType}
                  </small>
                  <p>{m.content}</p>
                  {m.translatedContent && (
                    <p className="translation">
                      English: {m.translatedContent}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function Signals({ items, setItems }: any) {
  return (
    <div className="cards">
      {items.map((s: any) => (
        <article className="panel">
          <div className="row">
            <Chip>{s.type}</Chip>
            <Chip tone="gray">
              {Math.round(s.confidence * 100)}% confidence
            </Chip>
          </div>
          <h3>{s.title}</h3>
          <p>Extracted observation · not yet a verified fact</p>
          <Evidence ids={s.sourceMessageIds} />
          <div className="actions">
            <button
              onClick={() =>
                setItems(
                  items.map((x: any) =>
                    x.id === s.id ? { ...x, status: "confirmed" } : x,
                  ),
                )
              }
            >
              <CheckCircle2 />
              Confirm
            </button>
            <button>Edit</button>
            <button
              className="danger"
              onClick={() =>
                setItems(
                  items.map((x: any) =>
                    x.id === s.id ? { ...x, status: "rejected" } : x,
                  ),
                )
              }
            >
              Reject
            </button>
            <Chip tone={s.status === "confirmed" ? "green" : "gray"}>
              {s.status}
            </Chip>
          </div>
        </article>
      ))}
    </div>
  );
}
function Claims({ contradictions }: any) {
  return (
    <>
      <div className="toolbar">
        <Search />
        <input placeholder="Filter subject, claimant, or status" />
        <select>
          <option>All verification states</option>
          <option>Contradicted</option>
        </select>
      </div>
      <div className="notice">
        <AlertTriangle />
        <b>A claim is not automatically a fact.</b> Conflicting claims remain
        separate until a person judges the evidence.
      </div>
      {claims.map((c) => (
        <article className="panel claim">
          <div>
            <Chip tone="orange">CONTRADICTED</Chip>
            <h3>“{c.objectValue}”</h3>
            <p>
              {participants.find((p) => p.id === c.claimantParticipantId)?.name}{" "}
              asserts this is the {c.predicate}.
            </p>
            <Evidence ids={c.sourceMessageIds} />
          </div>
          <button>Record human judgment</button>
        </article>
      ))}
      <h2>Comparison</h2>
      <div className="panel">
        <p>{contradictions[0].why}</p>
        <b>Missing evidence:</b> {contradictions[0].missingEvidence}
        <p>
          <b>Resolution question:</b> {contradictions[0].question}
        </p>
      </div>
    </>
  );
}
function Graph() {
  const nodes = [
    ["Customer request", 15, 35],
    ["Approval problem", 38, 40],
    ["Product team", 62, 22],
    ["Excel workaround", 65, 61],
    ["Factory loss", 32, 78],
    ["Multilingual AI", 58, 84],
    ["Opportunity", 84, 72],
  ];
  return (
    <div className="panel">
      <div className="toolbar">
        <button>Graph view</button>
        <button>Chronological view</button>
        <select>
          <option>Focused opportunity subgraph</option>
        </select>
      </div>
      <div className="graph">
        {nodes.map((n, i) => (
          <button
            style={{ left: `${n[1]}%`, top: `${n[2]}%` }}
            className={i === 6 ? "hot" : ""}
          >
            {n[0]}
          </button>
        ))}
        <svg>
          <line x1="15%" y1="35%" x2="38%" y2="40%" />
          <line x1="38%" y1="40%" x2="65%" y2="61%" />
          <line x1="32%" y1="78%" x2="58%" y2="84%" />
          <line x1="58%" y1="84%" x2="84%" y2="72%" />
        </svg>
      </div>
      <p className="muted">
        Select a node to highlight related evidence. Use browser zoom or
        trackpad to zoom and pan this focused view.
      </p>
    </div>
  );
}
function Patterns({ contradictions, clusters }: any) {
  return (
    <>
      <div className="tabs">
        <button>
          Contradictions <b>1</b>
        </button>
        <button>
          Repeated problems <b>2</b>
        </button>
        <button>
          Abandoned ideas <b>1</b>
        </button>
        <button>
          Capabilities <b>3</b>
        </button>
      </div>
      <div className="grid2">
        <article className="panel">
          <Chip tone="orange">CONTRADICTION · 88%</Chip>
          <h3>What blocks local approval adoption?</h3>
          <p>{contradictions[0].why}</p>
          <ul>
            <li>Sales: price</li>
            <li>Delivery: implementation speed</li>
            <li>Product: configurable local rules</li>
          </ul>
          <p>
            <b>Unknown:</b> Direct customer ranking.
          </p>
        </article>
        {clusters.map((c: any) => (
          <article className="panel">
            <Chip>REPEATED PROBLEM</Chip>
            <h3>{c.tag.replace("-", " ")}</h3>
            <p>
              {c.occurrences} evidence groups across countries and threads.
              Trend: increasing.
            </p>
            <p>
              Workaround:{" "}
              {c.tag === "approval" ? "Excel sheet exists" : "not confirmed"} ·
              Owner: unresolved
            </p>
          </article>
        ))}
        <article className="panel">
          <Chip tone="purple">ABANDONED IDEA · SCORE 83</Chip>
          <h3>Multilingual risk reporting</h3>
          <p>
            Stopped in 2024 because model quality was inadequate and no owner
            was assigned. New requests and improved evaluations justify
            reconsideration—not validation.
          </p>
          <Evidence ids={["m21", "m23", "m24", "m26", "m27"]} />
        </article>
        <article className="panel">
          <Chip tone="green">CAPABILITY</Chip>
          <h3>Multilingual extraction + citations</h3>
          <p>
            Applied AI · used in two internal projects · maturity: prototype ·
            reusability: high · human validation pending.
          </p>
          <Evidence ids={["m14", "m16", "m17"]} />
        </article>
      </div>
    </>
  );
}
function Opportunities({ items }: { items: Opportunity[] }) {
  return (
    <div className="cards">
      {items.map((o) => (
        <article className="panel opportunity">
          <div className="score">
            {o.overallScore}
            <small>/100</small>
          </div>
          <Chip tone="purple">AI-GENERATED HYPOTHESIS</Chip>
          <h2>{o.title}</h2>
          <p>
            <b>{o.problemStatement}</b>
          </p>
          <p>{o.proposedValue}</p>
          <h4>Why generated</h4>
          <p>
            Repeated evidence + reusable capability + customer access +
            favorable timing.
          </p>
          <div className="scores">
            {[
              ["Evidence", o.evidenceStrength],
              ["Fit", o.strategicFit],
              ["Readiness", o.capabilityReadiness],
              ["Access", o.customerAccess],
              ["Uncertainty", o.uncertainty],
            ].map(([n, v]) => (
              <span>
                {n}
                <i>
                  <b style={{ width: `${v}%` }} />
                </i>
                {v}
              </span>
            ))}
          </div>
          <div className="grid2">
            <div>
              <h4>Assumptions</h4>
              <ul>
                {o.assumptions.map((x) => (
                  <li>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Unknowns</h4>
              <ul>
                {o.unknowns.map((x) => (
                  <li>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <Evidence
            ids={o.supportingSignalIds.flatMap(
              (id) =>
                initialSignals.find((s) => s.id === id)?.sourceMessageIds || [],
            )}
          />
          <button>Begin human review</button>
        </article>
      ))}
    </div>
  );
}
function Validation({ answer, setAnswer, submit, score }: any) {
  return (
    <div className="grid2">
      <article className="panel">
        <Chip>HIGH-VALUE QUESTION</Chip>
        <h2>
          Does configurable workflow support materially affect a purchase or
          rollout decision?
        </h2>
        <p>
          Resolves the conflict between price, speed, and product-fit claims.
        </p>
        <label>
          Answer
          <select value={answer} onChange={(e) => setAnswer(e.target.value)}>
            <option value="unknown">Unknown</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Evidence note
          <textarea placeholder="Summarize interview evidence; do not paste sensitive data." />
        </label>
        <label>
          Answered by
          <select>
            <option>Niran Chai · customer operations</option>
          </select>
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Verified fact (not opinion)
        </label>
        <button className="primary" onClick={submit}>
          Save answer & update assessment
        </button>
      </article>
      <article className="panel">
        <p className="eyebrow">ASSESSMENT IMPACT</p>
        <div className="bigscore">{score}</div>
        <p>
          Score changes are rule-based and explainable: verified yes/no evidence
          changes ±8; opinions change ±3; unknown changes 0.
        </p>
      </article>
    </div>
  );
}
function Experiments({ items, create }: any) {
  return (
    <>
      {!items.length ? (
        <div className="empty">
          <FlaskConical />
          <h2>Test the riskiest assumption cheaply</h2>
          <p>
            Generate a deterministic recommendation for the factory knowledge
            hypothesis.
          </p>
          <button className="primary" onClick={create}>
            Generate and approve experiment
          </button>
        </div>
      ) : (
        items.map((e: any) => (
          <article className="panel">
            <Chip tone="green">{e.status}</Chip>
            <h2>{e.hypothesis}</h2>
            <p>
              <b>Riskiest assumption:</b> {e.riskiestAssumption}
            </p>
            <label>
              Method
              <textarea defaultValue={e.method} />
            </label>
            <p>14 days · low effort</p>
            <h4>Success criteria</h4>
            <p>
              At least two customers agree to a pilot discussion; three rank the
              issue top-three.
            </p>
            <button>Save edits</button>
          </article>
        ))
      )}
    </>
  );
}
function Outcomes({ items, record }: any) {
  return (
    <>
      <article className="panel form">
        <h2>Record outcome evidence</h2>
        <label>
          What happened
          <input defaultValue="Customer interview conducted" />
        </label>
        <label>
          Result
          <select>
            <option>Assumption confirmed</option>
            <option>Assumption rejected</option>
          </select>
        </label>
        <label>
          Evidence
          <textarea defaultValue="Plant manager ranked knowledge loss among top three operational problems." />
        </label>
        <label>
          Responsible person
          <input defaultValue="Aiko Tanaka" />
        </label>
        <button className="primary" onClick={record}>
          Record outcome
        </button>
      </article>
      {items.map((x: any) => (
        <div className="notice">
          <CheckCircle2 />
          Recorded {x.what} on {x.date}; generated an explainable learning
          candidate.
        </div>
      ))}
    </>
  );
}
function Learning({ items, setItems }: any) {
  return (
    <>
      {!items.length ? (
        <div className="empty">
          <BookOpen />
          <h2>No new learning candidates</h2>
          <p>
            Record an outcome to generate an explainable score-rule update.
            UNSEEN does not claim autonomous model retraining.
          </p>
        </div>
      ) : (
        items.map((l: any) => (
          <article className="panel">
            <Chip tone="purple">RULE UPDATE · HUMAN APPROVAL REQUIRED</Chip>
            <h2>{l.lesson}</h2>
            <p>
              Outcome <b>{l.sourceOutcomeId}</b> supplied direct customer
              evidence. Future <b>{l.affectedPattern}</b> clusters will be
              affected.
            </p>
            <div className="weight">
              <span>{l.previousWeight}</span> → <strong>{l.newWeight}</strong>
            </div>
            <button onClick={() => setItems([{ ...l, approved: true }])}>
              {l.approved ? "Approved" : "Approve learning"}
            </button>
          </article>
        ))
      )}
    </>
  );
}
function Settings() {
  return (
    <div className="grid2">
      <article className="panel">
        <h2>Analysis mode</h2>
        <Chip tone="green">Deterministic demo</Chip>
        <p>
          Complete pipeline with precomputed extraction and transparent rules.
          No model call is implied.
        </p>
        <button disabled>AI mode requires bindings</button>
      </article>
      <article className="panel">
        <h2>Privacy</h2>
        <ul>
          <li>Raw messages remain separate from derived records</li>
          <li>Full bodies are not logged</li>
          <li>No employee performance or personality scoring</li>
          <li>Silence is never treated as agreement</li>
        </ul>
        <button className="danger">Delete and reset demo data</button>
      </article>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
