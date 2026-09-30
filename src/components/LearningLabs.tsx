import { useEffect, useMemo, useRef, useState } from "react";
import { StepPlayer } from "./StepPlayer";
import { StatusPill } from "./FlowDiagram";
import type { LearningStep } from "../types";

const renderCode = "function Counter() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n  }\n\n  return <p>{count}</p>;\n}";

function renderSteps(before: number, after: number, render: number): LearningStep[] {
  return [
    { id: "event", title: "Browser event", explanation: "The browser dispatches a click to the button. React calls the handler registered in the previous render.", codeLine: 5, operation: "click → handleClick()", component: "Counter", render: "Render #" + (render - 1), stateBefore: "count = " + before, why: "A user action is the trigger. Nothing in the component changes until the handler requests an update.", next: "The handler evaluates its setter expression using the current render snapshot." },
    { id: "request", title: "State update requested", explanation: "setCount does not mutate count in this running function. It asks React to store a next value and schedule work.", codeLine: 6, operation: "setCount(" + after + ")", component: "Counter", stateBefore: "count = " + before, stateAfter: "queued → " + after, why: "The variable count belongs to the current render. React exposes the new state to a later render.", next: "React can batch this update with other updates from the same event." },
    { id: "render", title: "Render #" + render, explanation: "React executes Counter again. useState returns the stored value from the state slot rather than using the initializer as a reset.", codeLine: 2, operation: "Counter() executes again", component: "Counter", render: "Render #" + render, stateBefore: "slot = " + before, stateAfter: "count = " + after, why: "The setter scheduled a render, so the component gets a fresh JavaScript execution with the next snapshot.", next: "The new count is substituted into the JSX description." },
    { id: "jsx", title: "JSX calculation", explanation: "During this render, the expression inside the paragraph reads the updated count.", codeLine: 8, operation: "<p>{count}</p> → <p>" + after + "</p>", component: "Counter", render: "Render #" + render, stateAfter: "count = " + after, why: "JSX is a description built from current JavaScript values. It does not directly edit the DOM.", next: "React compares this description with the previous committed description." },
    { id: "commit", title: "DOM commit", explanation: "React commits the required text change. The browser now displays the result.", codeLine: 8, operation: "commit text node", component: "Counter", dom: "Count: " + after, why: "Only the necessary DOM work is committed; a re-render does not mean the whole document was rebuilt.", next: "The component is idle until another event, prop, context, or external synchronization triggers work." },
  ];
}

export function RenderTraceLab({ title = "Click through a real render", prompt = "Click +1, then inspect the event-to-DOM chain." }: { title?: string; prompt?: string }) {
  const [count, setCount] = useState(0);
  const [trace, setTrace] = useState(0);
  const renderCount = useRef(0);
  renderCount.current += 1;
  const run = () => { setCount(value => value + 1); setTrace(value => value + 1); };
  const steps = useMemo(() => renderSteps(Math.max(0, count - 1), count, renderCount.current), [count, trace]);
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">INTERACT → EXPLAIN</span><h3>{title}</h3><p>{prompt}</p></div><div className="lab-result"><span>LIVE UI</span><strong>Count: {count}</strong><small>component executions observed: {renderCount.current}</small></div></div><div className="lab-actions"><button className="button primary" onClick={run}>+1 and trace it</button><button className="button subtle" onClick={() => { setCount(0); setTrace(value => value + 1); }}>Reset</button></div><StepPlayer key={trace} title="What just happened?" subtitle="The active line, state snapshot, render, and browser result describe the same event." code={renderCode} steps={steps} resetKey={trace} /></div>;
}

export function BatchingLab() {
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<"direct" | "functional">("direct");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [trace, setTrace] = useState(0);
  const run = (kind: "direct" | "functional") => {
    setMode(kind);
    setPrediction(null);
    if (kind === "direct") { setCount(count + 1); setCount(count + 1); setCount(count + 1); }
    else { setCount(value => value + 1); setCount(value => value + 1); setCount(value => value + 1); }
    setTrace(value => value + 1);
  };
  const steps: LearningStep[] = mode === "direct" ? [
    { id: "snapshot", title: "One render snapshot", explanation: "All three direct expressions read count from the same event handler snapshot.", codeLine: 1, operation: "count + 1", stateBefore: "count = " + Math.max(0, count - 1), why: "Calling a setter does not rewrite the count variable inside the current function.", next: "React receives three requests for the same value." },
    { id: "queue", title: "Queue collapses", explanation: "The queue contains the same next value three times. The last identical result wins.", codeLine: 1, operation: "setCount(snapshot + 1) × 3", stateAfter: Math.max(0, count - 1) + " → " + count, why: "Direct updates are values calculated from one snapshot, not instructions to increment repeatedly.", next: "Compare this with updater functions that receive the latest queue value." },
    { id: "render", title: "One batched render", explanation: "React processes the event updates together and renders once with the resulting state.", codeLine: 1, operation: "render after event", render: "next render", dom: "Count: " + count, why: "Batching avoids unnecessary intermediate renders during one event.", next: "Run the functional version to enqueue three transformations instead." },
  ] : [
    { id: "updaters", title: "Updater functions", explanation: "Each updater is a function waiting for the latest state value in the queue.", codeLine: 1, operation: "c => c + 1 × 3", stateBefore: "count = " + Math.max(0, count - 3), why: "Functional updates do not capture one fixed next value; React can compose them in order.", next: "The first updater receives the starting value." },
    { id: "queue", title: "Queue runs in order", explanation: "React feeds each updater the result of the previous one: 0 becomes 1, then 2, then 3.", codeLine: 1, operation: "queue: 0 → 1 → 2 → 3", stateAfter: "+3 → " + count, why: "Each function receives the latest queued state, so no increment is lost.", next: "React commits one render with the final value." },
    { id: "render", title: "One render, final state", explanation: "The UI renders after the batch with the accumulated result.", codeLine: 1, operation: "render after event", render: "next render", dom: "Count: " + count, why: "Batching groups work, while updater functions compose values. They solve different parts of the puzzle.", next: "Try the other mode and compare the queue, not just the number." },
  ];
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">PREDICT → RUN → COMPARE</span><h3>Why three setters can produce one or three</h3><p>Choose a prediction, then run both versions against real React state.</p></div><div className="lab-result"><span>LIVE STATE</span><strong>{count}</strong><small>mode: {mode} · result after batch</small></div></div><PredictionCard options={["Direct updates finish at +1", "Functional updates finish at +3"]} answer={mode === "direct" ? 0 : 1} selected={prediction} onSelect={setPrediction} /><div className="lab-actions"><button className="button primary" onClick={() => run("direct")}>Run direct updates</button><button className="button subtle" onClick={() => run("functional")}>Run functional updates</button><button className="text-button" onClick={() => { setCount(0); setTrace(value => value + 1); }}>Reset state</button></div><StepPlayer key={trace + "-" + mode} title="Inspect the update queue" subtitle="The queue explains the result more reliably than memorizing a rule." code={mode === "direct" ? "setCount(count + 1);\nsetCount(count + 1);\nsetCount(count + 1);" : "setCount(c => c + 1);\nsetCount(c => c + 1);\nsetCount(c => c + 1);"} steps={steps} resetKey={trace + "-" + mode} /></div>;
}

function PredictionCard({ options, answer, selected, onSelect }: { options: string[]; answer: number; selected: number | null; onSelect: (value: number) => void }) {
  return <div className="prediction-card"><div><span className="eyebrow">BEFORE YOU RUN IT</span><strong>What do you predict?</strong></div><div className="prediction-options">{options.map((option, index) => <button key={option} className={selected === index ? (selected === answer ? "correct" : "incorrect") : ""} onClick={() => onSelect(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>{selected !== null && <p className={selected === answer ? "prediction-correct" : "prediction-why"}>{selected === answer ? "Prediction matched. Now inspect why the queue produced that result." : "Not quite. Read the active code: the important difference is which value each update receives."}</p>}</div>;
}

export function EffectTraceLab() {
  const [userId, setUserId] = useState(101);
  const [effectRuns, setEffectRuns] = useState(0);
  const [cleanups, setCleanups] = useState(0);
  const [trace, setTrace] = useState(0);
  useEffect(() => { setEffectRuns(value => value + 1); return () => setCleanups(value => value + 1); }, [userId]);
  const changed = userId === 102;
  const steps: LearningStep[] = [
    { id: "render", title: "Render reads dependency", explanation: "React renders with userId = " + userId + ". The dependency array is remembered for comparison after this commit.", codeLine: 5, operation: "render → [" + userId + "]", component: "CustomerPage", render: "current render", stateAfter: "userId = " + userId, why: "Dependencies are values from a render. React decides whether to rerun the effect after comparing the committed render with the previous one.", next: "React commits the UI, then compares the dependency value." },
    { id: "compare", title: changed ? "Dependency changed" : "Dependency unchanged", explanation: changed ? "The previous userId was 101 and the current value is 102, so the old synchronization is obsolete." : "The previous and current userId are equal, so the existing synchronization is still valid.", codeLine: 5, operation: changed ? "101 !== 102" : "101 === 101", stateBefore: "previous dependency = 101", stateAfter: "current dependency = " + userId, why: changed ? "React compares each dependency with the previous committed value." : "A re-render alone is not enough; the listed value must change.", next: changed ? "Cleanup runs before the new effect setup." : "The effect is skipped for this commit." },
    { id: "cleanup", title: changed ? "Cleanup old effect" : "Skip effect", explanation: changed ? "The cleanup stops work associated with userId 101 before React starts work for 102." : "No cleanup or new setup is needed because the dependency did not change.", codeLine: 3, operation: changed ? "cleanup()" : "effect skipped", effect: changed ? "old effect cleaned" : "unchanged", why: changed ? "Cleanup prevents subscriptions, timers, or requests for the old value from leaking into the new screen." : "The dependency array describes when this synchronization becomes stale.", next: changed ? "The new effect setup runs after the commit." : "The next event or changed dependency can trigger another comparison." },
    { id: "run", title: changed ? "Run new effect" : "UI stays synchronized", explanation: changed ? "The effect now synchronizes with customer 102. In development Strict Mode, initial setup can be replayed to expose unsafe cleanup." : "The existing effect remains the one associated with userId 101.", codeLine: 2, operation: changed ? "effect setup()" : "no setup", effect: changed ? "runs: " + effectRuns : "runs: " + effectRuns, dom: "customerId = " + userId, why: "Effects are for external synchronization, and their dependencies describe the values that synchronization reads.", next: "Try the same ID to see a render without an effect rerun, then switch IDs to see cleanup." },
  ];
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">DEPENDENCY COMPARATOR</span><h3>Why an effect runs or skips</h3><p>Set the same or a different ID, then inspect the previous/current comparison.</p></div><div className="lab-result"><span>OBSERVED EFFECTS</span><strong>{effectRuns}</strong><small>cleanups observed: {cleanups}</small></div></div><div className="lab-actions"><button className="button subtle" onClick={() => { setUserId(101); setTrace(value => value + 1); }}>Set userId 101</button><button className="button primary" onClick={() => { setUserId(102); setTrace(value => value + 1); }}>Set userId 102</button></div><StepPlayer key={trace + "-" + userId} title="Render → commit → effect" subtitle="Same dependency skips; changed dependency cleans up and reruns." code={"useEffect(() => {\n  const request = loadCustomer(userId);\n  return () => request.cancel();\n}, [userId]);"} steps={steps} resetKey={trace + "-" + userId} /></div>;
}

export function AsyncTraceLab() {
  const [outcome, setOutcome] = useState<"success" | "error">("success");
  const [status, setStatus] = useState<"idle" | "pending" | "fulfilled" | "rejected">("idle");
  const [trace, setTrace] = useState(0);
  const request = useRef(0);
  useEffect(() => {
    if (!trace) return;
    const requestId = ++request.current;
    let cancelled = false;
    setStatus("pending");
    const timer = window.setTimeout(() => { if (!cancelled && requestId === request.current) setStatus(outcome === "success" ? "fulfilled" : "rejected"); }, 650);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [outcome, trace]);
  const steps: LearningStep[] = [
    { id: "render", title: "Initial render", explanation: "The component starts with no response. That is why a production screen needs an explicit loading branch.", codeLine: 2, operation: "render → loading UI", component: "CustomerPage", stateBefore: "customer = null", stateAfter: "loading = true", render: "Render #1", dom: "Loading…", why: "React can render immediately while asynchronous work is pending.", next: "After commit, the effect starts the request." },
    { id: "promise", title: "Promise pending", explanation: "The service returns a Promise immediately. JavaScript continues; the async result will resume later.", codeLine: 5, operation: "customerService.getCustomer()", effect: "request started", stateAfter: "Promise = pending", why: "await pauses only the async function, not the browser or React render loop.", next: "The mock response will fulfill or reject based on the selected outcome." },
    { id: "settled", title: status === "rejected" ? "Promise rejected" : status === "fulfilled" ? "Promise fulfilled" : "Waiting for response", explanation: status === "rejected" ? "The request failed, so control moves to catch and error state becomes the visible outcome." : status === "fulfilled" ? "The response arrived and the async function can continue with customer data." : "The Promise is still pending. The UI remains in its loading state instead of pretending data exists.", codeLine: status === "rejected" ? 8 : 6, operation: status === "rejected" ? "catch(error)" : "await resumes", stateBefore: "Promise = pending", stateAfter: "Promise = " + status, why: status === "rejected" ? "A rejection needs an explicit UI path; otherwise the screen can remain misleadingly pending." : "Promise settlement is the boundary between waiting and updating React state.", next: status === "rejected" ? "setError updates state and produces an error branch." : "setCustomer stores the data and schedules another render." },
    { id: "ui", title: status === "rejected" ? "Error UI" : status === "fulfilled" ? "Success UI" : "No second render yet", explanation: status === "rejected" ? "The UI now explains failure instead of reading a missing customer." : status === "fulfilled" ? "setCustomer causes a second render; JSX reads the response and displays the customer." : "Run the request to move from pending to a settled UI state.", codeLine: status === "rejected" ? 8 : 7, operation: status === "rejected" ? "setError(error)" : "setCustomer(data)", render: status === "idle" ? "not started" : "Render #2", dom: status === "rejected" ? "Request failed" : status === "fulfilled" ? "Harish Kumar" : "Loading…", why: "The service never paints pixels directly. React state carries the result into the next JSX calculation.", next: "Run the other outcome and compare which branch diverges." },
  ];
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">PROMISE → REACT STATE → UI</span><h3>Trace success and error as different paths</h3><p>Choose an outcome, run the actual async effect, and step through the state machine.</p></div><StatusPill tone={status === "rejected" ? "danger" : status === "pending" ? "warning" : "success"}>{status}</StatusPill></div><div className="lab-actions"><button className={"button " + (outcome === "success" ? "primary" : "subtle")} onClick={() => setOutcome("success")}>Success path</button><button className={"button " + (outcome === "error" ? "primary" : "subtle")} onClick={() => setOutcome("error")}>Error path</button><button className="button subtle" onClick={() => setTrace(value => value + 1)}>Run request</button></div><StepPlayer key={trace + "-" + status} title="Follow the async request" subtitle="Code, Promise state, React state, render number, and browser output stay in one timeline." code={"useEffect(() => {\n  setLoading(true);\n  try {\n    const data = await customerService.getCustomer(id);\n    setCustomer(data);\n  } catch (error) {\n    setError(error);\n  }\n}, [id]);"} steps={steps} resetKey={trace + "-" + status} /></div>;
}

export function ClosureLab() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("No timer scheduled");
  const timer = useRef<number | null>(null);
  const schedule = () => {
    const captured = count;
    if (timer.current) window.clearTimeout(timer.current);
    setMessage("Callback created in Render #" + (captured + 1) + " captured count = " + captured);
    timer.current = window.setTimeout(() => setMessage("Older callback remembered " + captured + "; current button count may be " + count), 700);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  return <div className="learning-lab closure-lab"><div className="lab-toolbar"><div><span className="eyebrow">RENDER SNAPSHOTS</span><h3>See a stale closure remember an older render</h3><p>Schedule a callback, change count, and watch which render the callback captured.</p></div><div className="lab-result"><span>CURRENT RENDER</span><strong>count = {count}</strong><small>{message}</small></div></div><div className="snapshot-strip"><span>Render #{count + 1}</span><code>handleLater captures count = {count}</code><span>→</span><span>future callback</span></div><div className="lab-actions"><button className="button primary" onClick={schedule}>Schedule callback</button><button className="button subtle" onClick={() => setCount(value => value + 1)}>Increment count</button></div><div className="closure-explanation"><strong>Why this matters in React</strong><p>Every render creates a new JavaScript execution context. Effects, timers, and callbacks can keep an older context. Dependencies or functional updates are the usual fix, depending on what the code needs.</p></div></div>;
}

export function OwnershipLab() {
  const [query, setQuery] = useState("");
  const customers = ["Asha · Active", "Maya · Trial", "Harish · Active"];
  const visible = customers.filter(customer => customer.toLowerCase().includes(query.toLowerCase()));
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">ONE SOURCE OF TRUTH</span><h3>Lift shared state to the common owner</h3><p>SearchBox writes parent state; CustomerList reads the same value.</p></div><div className="lab-result"><span>CHILDREN SHARE</span><strong>query = {query || '""'}</strong><small>{visible.length} matching rows</small></div></div><div className="ownership-flow"><label>SearchBox<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter customers" /></label><div className="ownership-owner"><span>CustomerPage owns</span><strong>query: {query || '""'}</strong><small>single state source</small></div><div className="ownership-list"><span>CustomerList receives query</span>{visible.length ? visible.map(customer => <strong key={customer}>{customer}</strong>) : <small>No matching customers</small>}</div></div><div className="closure-explanation"><strong>Trace the direction</strong><p>Data flows down from the owner. Events flow up through callbacks. The siblings do not secretly synchronize with one another.</p></div></div>;
}

export function StateResetLab() {
  const [person, setPerson] = useState<"Asha" | "Maya">("Asha");
  return <div className="learning-lab"><div className="lab-toolbar"><div><span className="eyebrow">STATE IDENTITY</span><h3>Preserve or reset state intentionally</h3><p>A key can tell React that the new person is a different component instance.</p></div><div className="lab-result"><span>ACTIVE KEY</span><strong>{person}</strong><small>form state belongs to this identity</small></div></div><div className="lab-actions"><button className="button subtle" onClick={() => setPerson("Asha")}>Show Asha</button><button className="button primary" onClick={() => setPerson("Maya")}>Show Maya</button></div><ProfileEditor key={person} person={person} /><div className="closure-explanation"><strong>Key as identity, not decoration</strong><p>Because the key changes, React discards the old ProfileEditor state and creates a fresh one. Without the key, a component in the same position would normally preserve its local state.</p></div></div>;
}

function ProfileEditor({ person }: { person: string }) {
  const [draft, setDraft] = useState(person);
  return <label className="state-editor">Profile editor for <strong>{person}</strong><input value={draft} onChange={event => setDraft(event.target.value)} /><small>local draft: {draft}</small></label>;
}
