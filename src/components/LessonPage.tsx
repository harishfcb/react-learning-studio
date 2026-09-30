import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLesson, getNextLesson, lessons } from "../curriculum/data";
import { useProgress } from "../store/progress";
import { CodePanel } from "./CodePanel";
import { ApiDemo, ApiTimeline, ArchitectureDemo, ContextDemo, DependencyDemo, EffectLifecycleDemo, EventFlowDemo, FormDemo, HookFlowDemo, HookRulesDemo, JsxDemo, ListDemo, MemoDemo, ParentChildDemo, PropsDemo, PromiseDemo, RefDemo, RenderFlowDemo, StateMemoryDemo } from "./LessonWidgets";
import { FlowDiagram } from "./FlowDiagram";
import { Quiz } from "./Quiz";
import { CommonMistakeCard } from "./EducationalCards";
import { LearningLens } from "./LearningLens";
import { AsyncTraceLab, BatchingLab, ClosureLab, EffectTraceLab, OwnershipLab, RenderTraceLab, StateResetLab } from "./LearningLabs";

const demos: Record<string, ReactNode> = {
  jsx: <JsxDemo />, props: <PropsDemo />, rendering: <RenderFlowDemo />,
  "use-state": <StateMemoryDemo />, events: <EventFlowDemo />, forms: <FormDemo />,
  "lists-and-keys": <ListDemo />, "state-ownership": <ParentChildDemo />,
  effects: <EffectLifecycleDemo />, "dependency-arrays": <DependencyDemo />,
  "promises-and-async": <PromiseDemo />, "api-flow": <><ApiDemo /><ApiTimeline /></>,
  "custom-hooks": <HookFlowDemo />, context: <ContextDemo />, refs: <RefDemo />,
  memoization: <MemoDemo />, "rules-of-hooks": <HookRulesDemo />,
  routing: <RoutingDemo />, "production-flow": <ArchitectureDemo />,
};

const upgradedDemos: Record<string, ReactNode> = {
  rendering: <RenderTraceLab title="Trace a re-render" prompt="Click +1 and follow the actual event, setter, render, JSX, and DOM chain." />,
  "use-state": <RenderTraceLab title="State memory across renders" prompt="The initializer starts the slot once; the setter changes what the next render reads." />,
  events: <RenderTraceLab title="Event handler to visible UI" prompt="A click is not magic: inspect every transition between the browser and the committed text." />,
  "state-snapshots": <RenderTraceLab title="Which render does this handler see?" prompt="Run the interaction, then inspect the snapshot captured by the handler." />,
  batching: <BatchingLab />,
  effects: <EffectTraceLab />,
  "dependency-arrays": <EffectTraceLab />,
  "promises-and-async": <AsyncTraceLab />,
  "api-flow": <AsyncTraceLab />,
  closures: <ClosureLab />,
  "state-ownership": <OwnershipLab />,
  "state-preservation": <StateResetLab />,
};

export function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { completedLessons, completeLesson, setCurrentLesson, completedChallenges, completeChallenge } = useProgress();
  const lesson = getLesson(lessonId);
  const next = getNextLesson(lesson.id);
  const valid = Boolean(lessonId && lessons.some(item => item.id === lessonId));
  const index = lessons.findIndex(item => item.id === lesson.id);
  const previous = lessons[index - 1];
  const demo = upgradedDemos[lesson.id] ?? demos[lesson.id];

  useEffect(() => {
    if (!valid) return;
    setCurrentLesson(lesson.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lesson.id, setCurrentLesson, valid]);

  if (!valid) return <div className="not-found"><h1>Lesson not found</h1><Link to="/">Return home</Link></div>;

  return <div className="lesson-page">
    <div className="lesson-breadcrumb"><Link to="/">Studio</Link><span>/</span><span>Day {lesson.day}</span><span>/</span><strong>{lesson.title}</strong></div>
    <header className="lesson-header">
      <div><div className="lesson-heading-line"><span className={"day-tag day-" + lesson.day}>DAY {lesson.day}</span><span className="lesson-time">{lesson.estimatedMinutes} min lesson</span></div><h1>{lesson.title}</h1><p>{lesson.description}</p></div>
      <div className="lesson-header-progress"><div className={"completion-ring " + (completedLessons.includes(lesson.id) ? "complete" : "")}><span>{completedLessons.includes(lesson.id) ? "✓" : "0" + lesson.day}</span></div><small>{completedLessons.includes(lesson.id) ? "Completed" : "In progress"}</small></div>
    </header>
    <LearningLens lessonId={lesson.id} />
    <div className="lesson-grid">
      <aside className="lesson-rail"><div className="rail-sticky"><span className="eyebrow">IN THIS LESSON</span>{lesson.sections.map((section, sectionIndex) => <a href={"#section-" + sectionIndex} key={section.title}>{String(sectionIndex + 1).padStart(2, "0")} {section.title}</a>)}{lesson.commonMistake && <a href="#mistake">⚠ Common mistake</a>}{lesson.challenge && <a href="#challenge">✦ Challenge</a>}<div className="rail-next"><span>UP NEXT</span><Link to={"/learn/" + next.id}>{next.title} →</Link></div></div></aside>
      <article className="lesson-content">
        {lesson.sections.map((section, sectionIndex) => <section className="lesson-section" id={"section-" + sectionIndex} key={section.title}><div className="section-number">{String(sectionIndex + 1).padStart(2, "0")}</div><div className="section-main"><h2>{section.title}</h2><p>{section.body}</p>{section.code && <CodePanel code={section.code} />}{section.takeaway && <div className="takeaway"><span>MENTAL MODEL</span><strong>{section.takeaway}</strong></div>}</div></section>)}
        {demo && <section className="interactive-section"><div className="section-heading"><div><span className="eyebrow accent">SEE IT RUN</span><h2>Predict → run → explain.</h2></div><span className="interactive-badge">● LIVE</span></div>{demo}</section>}
        {lesson.id === "debugging" && <DebuggingDemo />}
        {lesson.id === "repository-structure" && <RepositoryDemo />}
        {lesson.commonMistake && <div id="mistake"><CommonMistakeCard mistake={lesson.commonMistake} /></div>}
        {lesson.challenge && <section className="challenge-card" id="challenge"><div className="challenge-star">✦</div><div><span className="eyebrow">END-OF-LESSON CHALLENGE</span><h3>{lesson.challenge.title}</h3><p>{lesson.challenge.prompt}</p><details><summary>Show hints</summary>{lesson.challenge.hints.map(hint => <p key={hint}>→ {hint}</p>)}</details></div><button className={"button " + (completedChallenges.includes(lesson.id) ? "success" : "primary")} onClick={() => completeChallenge(lesson.id)}>{completedChallenges.includes(lesson.id) ? "Completed ✓" : "Mark complete"}</button></section>}
        <Quiz questions={lesson.quiz} />
        <div className="lesson-finish"><button className={"button " + (completedLessons.includes(lesson.id) ? "success" : "primary") + " large"} onClick={() => completeLesson(lesson.id)}>{completedLessons.includes(lesson.id) ? "Lesson completed ✓" : "Mark lesson complete"}</button><div className="finish-nav">{previous ? <button className="text-button" onClick={() => navigate("/learn/" + previous.id)}>← {previous.title}</button> : <span />}{<button className="text-button" onClick={() => navigate("/learn/" + next.id)}>Next: {next.title} →</button>}</div></div>
      </article>
    </div>
  </div>;
}

function RoutingDemo() {
  const [draft, setDraft] = useState("/customers/101");
  const [path, setPath] = useState("/customers/101");
  const validPath = path.includes("/customers/");
  return <section className="special-demo"><form className="browser-bar" onSubmit={event => { event.preventDefault(); setPath(draft); }}><span>●</span><input value={draft} onChange={event => setDraft(event.target.value)} aria-label="Route path" /><button className="button subtle">Go</button></form><FlowDiagram steps={["URL", "Router", validPath ? "CustomerPage" : "NotFoundPage", validPath ? "id = " + path.split("/").pop() : "—"]} /><div className="browser-output"><span className="eyebrow">ROUTE OUTPUT</span><strong>{validPath ? "Customer details for " + path.split("/").pop() : "No matching route"}</strong></div></section>;
}

function RepositoryDemo() {
  const files = ["src/main.jsx", "src/App.jsx", "src/pages/Customers.jsx", "src/components/CustomerTable.jsx", "src/hooks/useCustomers.js", "src/services/customerService.js", "src/context/AuthContext.jsx", "src/routes/index.jsx"];
  const [selected, setSelected] = useState(files[0]);
  const isService = selected.includes("service");
  const isHook = selected.includes("hook");
  const isRoutes = selected.includes("routes");
  const code = isService ? 'export const customerService = {\\n  getCustomers: () => http.get("/customers")\\n};' : isHook ? "export function useCustomers() {\\n  const [data, setData] = useState([]);\\n  useEffect(loadCustomers, []);\\n  return { data };\\n}" : isRoutes ? '<Route path="/customers/:id" element={<CustomerPage />} />' : "export default function Module() {\\n  return <App />;\\n}";
  const explanation = isService ? "This is the HTTP boundary. Confirm the URL and response shape here." : isHook ? "This is the React lifecycle boundary. Inspect loading, errors, and dependencies." : isRoutes ? "This is where URL patterns become page components." : "Follow this file to the next layer in the application.";
  return <section className="special-demo repo-demo"><div className="repo-tree">{files.map(file => <button className={selected === file ? "selected" : ""} key={file} onClick={() => setSelected(file)}>{file}</button>)}</div><div className="repo-file"><div className="code-title"><span className="code-file">{selected}</span><span className="code-label">repository explorer</span></div><pre>{code}</pre><div className="file-explain"><strong>Why you might open this next</strong><p>{explanation}</p></div></div></section>;
}

function DebuggingDemo() {
  const checks = ["Route matches /customers/101", "CustomerPage rendered", "GET request sent", "HTTP status is 200", "Response contains name", "setCustomer called", "JSX reads customer.name"];
  const [checked, setChecked] = useState<number[]>([]);
  const next = checked.length;
  return <section className="special-demo debug-demo"><div className="debug-list">{checks.map((check, checkIndex) => <button key={check} className={checked.includes(checkIndex) ? "checked" : ""} onClick={() => setChecked(value => value.includes(checkIndex) ? value : [...value, checkIndex])}><span>{checked.includes(checkIndex) ? "✓" : checkIndex + 1}</span>{check}{checkIndex === next && <em>inspect next</em>}</button>)}</div><div className="devtools"><div className="devtools-tabs"><span>Elements</span><span className="active">Network</span><span>Console</span></div><div className="network-row"><span>GET</span><code>/api/customers/101</code><strong>200</strong></div><pre>{'{\\n  "id": 101,\\n  "name": "Harish Kumar"\\n}'}</pre><p>Start at the first unchecked question. Debugging is a sequence, not a hunch.</p></div></section>;
}
