/* ============================================================
   LOMON DOCTORATE ACADEMY — shared data (v2, mentor-advised plan)
   15-week bridge block · Start: Mon Jul 6, 2026 · Ends Oct 18, 2026
   Goal: PSU Great Valley bridge courses + D.Eng. repair track
   → Fall 2027 D.Eng. reapplication
   ============================================================ */

const START_DATE = new Date(2026, 6, 6); // Mon Jul 6, 2026
const TOTAL_WEEKS = 15;
const TOTAL_DAYS = 105;
const REAPPLY_DATE = new Date(2027, 8, 1); // Fall 2027 target

/* ---------- Courses — MENTOR ORDER (quantitative repair first) ---------- */
const COURSES = [
  {
    id: "stat", order: 1, code: "MATH 2350", name: "Statistics",
    icon: "📊", color: "#a55eea", weeks: "Weeks 1–3", phase: "Phase 1 · Quantitative Repair",
    url: "https://coursecompanion.gv.psu.edu/?page_id=2626",
    zybook: "Statistics for Decision Making · $64",
    why: "Your biggest gap is quantitative + research readiness. Statistics powers papers, evaluation, and AI reasoning.",
    modules: [
      "M1 · Descriptive Statistics & Probability",
      "M2 · Probability Distributions",
      "M3 · Confidence Intervals & Hypothesis Testing",
      "M4 · Regression",
      "M5 · Chi-Square Tests"
    ],
    summary: "How statistics will help me evaluate enterprise AI systems",
    outside: "Compare two hypothetical AI pipeline versions and explain how you'd test whether version B is actually better than version A.",
    exitQs: [
      "What does statistical significance actually mean?",
      "How do I compare two system outcomes without hand-waving?",
      "How do confidence intervals change how I evaluate AI performance?",
      "When would I use regression vs simple descriptive stats?"
    ]
  },
  {
    id: "la", order: 2, code: "MATH 2330", name: "Linear Algebra",
    icon: "🧮", color: "#f7b731", weeks: "Weeks 4–6", phase: "Phase 1 · Quantitative Repair",
    url: "https://coursecompanion.gv.psu.edu/?page_id=2615",
    zybook: "Linear Algebra (custom zyBook) · $64",
    why: "Embeddings, weights, and feature spaces are all linear algebra objects. This is AI/ML foundation, not math worship.",
    modules: [
      "M1 · Systems of Linear Equations",
      "M2 · Matrix Algebra",
      "M3 · Vectors",
      "M4 · Determinants",
      "M5 · Linear Transformations"
    ],
    summary: "How linear algebra shows up in AI pipelines, embeddings, and model representations",
    outside: "Use Python/NumPy: vector dot products, matrix multiplication, and a tiny example showing how document embeddings are vectors.",
    exitQs: [
      "Why is matrix multiplication the core operation of neural networks?",
      "What does a dot product measure between two embeddings?",
      "How does a linear transformation reshape a feature space?"
    ]
  },
  {
    id: "calc", order: 3, code: "MATH 2340", name: "Calculus",
    icon: "∫", color: "#fc5c65", weeks: "Weeks 7–9", phase: "Phase 1 · Quantitative Repair",
    url: "https://coursecompanion.gv.psu.edu/?page_id=2622",
    zybook: "Calculus (custom zyBook) · $64",
    why: "Supportive, not urgent — enough calculus to understand derivatives as rates of change, optimization intuition, and why gradients matter.",
    modules: [
      "M1 · Foundations & Limits",
      "M2 · Derivatives",
      "M3 · Integration",
      "M4 · Differentiation & Differential Equations",
      "M5 · Multivariable Calculus"
    ],
    summary: "Why calculus matters for optimization in machine learning",
    outside: "Take one simple cost function: explain what the slope means, why a zero derivative matters, and how this relates to minimizing model error.",
    exitQs: [
      "What is a derivative as a rate of change, in plain English?",
      "Why is training loss minimized where the gradient is zero?",
      "What does the gradient tell an optimizer to do?"
    ]
  },
  {
    id: "py", order: 4, code: "CMPSC 2310", name: "Foundations of Programming",
    icon: "🐍", color: "#4ecdc4", weeks: "Weeks 10–12", phase: "Phase 2 · CS Repair",
    url: "https://coursecompanion.gv.psu.edu/?page_id=3535",
    zybook: "Programming in Python 3 with zyLabs · $99/yr",
    why: "Make sure no faculty member could think: 'He works with tools, but does he actually program?' — Skip candidate if PSU says your Data Engineer role satisfies programming readiness.",
    modules: [
      "M1 · Python Basics, Variables, Types & I/O",
      "M2 · Conditionals & Loops (Iteration)",
      "M3 · Functions & Recursion",
      "M4 · Data Structures, Classes & OOP",
      "M5 · Modules, Files & Program Design"
    ],
    summary: "How I use programming in data engineering and AI systems work",
    outside: "One clean Python script: load a CSV, compute summary stats, write a result file, log one quality check. Basic done cleanly beats pretending.",
    exitQs: [
      "Can I write a clean, modular script without copying from tools?",
      "Do I structure code with functions, or one long block?",
      "Could a faculty member read my code and see a programmer?"
    ]
  },
  {
    id: "dsa", order: 5, code: "CMPSC 2320", name: "Data Structures & Algorithms",
    icon: "🌳", color: "#45aaf2", weeks: "Weeks 13–15", phase: "Phase 2 · CS Repair",
    url: "https://coursecompanion.gv.psu.edu/?page_id=2652",
    zybook: "Data Structures Essentials · (with Python 3 zyBook)",
    why: "To move toward Enterprise AI Systems Architect: efficiency, structure, system behavior under load, problem decomposition.",
    modules: [
      "M1 · Intro to Data Structures, Algorithms & Python",
      "M2 · Data Structures & OOP",
      "M3 · Recursion & Searching",
      "M4 · Trees & Algorithms",
      "M5 · Hash Tables & Graph Algorithms"
    ],
    summary: "How data structures and algorithmic thinking support scalable AI/data systems",
    outside: "Compare a list vs a dictionary for fast lookup of metadata records. Explain which is better and why (Big-O).",
    exitQs: [
      "When is a dict/hash map the right structure, and why is lookup O(1)?",
      "What does Big-O tell me about a pipeline at 10× the data volume?",
      "How do I decompose a messy system problem into structures + algorithms?"
    ]
  }
];

/* ---------- 15-week plan ----------
   One course at a time · 2-2-1 module pacing per 3-week block.
   Weekly rhythm (8 hrs while working full-time):
   Mon/Wed/Fri = 2h bridge sessions · Tue = paper reading (1h) ·
   Thu = research refinement (1h) · Sat = practice arena + outside practice · Sun = review + journal
------------------------------------------------------------------ */
const WEEKS = [];
(function buildWeeks() {
  COURSES.forEach((c, ci) => {
    const moduleSplit = [[1, 2], [3, 4], [5]]; // 2-2-1 pacing
    for (let w = 0; w < 3; w++) {
      const n = ci * 3 + w + 1;
      const mods = moduleSplit[w];
      WEEKS.push({
        n, course: c.id, phase: c.phase, blockWeek: w + 1,
        mods,
        theme: `${c.icon} ${c.code} ${c.name} — ` + (
          w === 0 ? `Modules 1–2: ${short(c.modules[0])} + ${short(c.modules[1])}` :
          w === 1 ? `Modules 3–4: ${short(c.modules[2])} + ${short(c.modules[3])}` :
                    `Module 5 (${short(c.modules[4])}) + finish all quizzes + write the 1-page summary`)
      });
    }
  });
  function short(m) { return m.split("·")[1].trim(); }
})();

/* Daily tasks: wd 0=Mon..6=Sun */
function dayTasks(week, wd) {
  const c = COURSES.find(x => x.id === week.course);
  const modNames = week.mods.map(m => `M${m} ${c.modules[m-1].split("·")[1].trim()}`);
  const focus = modNames.join(" · ");
  const last = week.blockWeek === 3;
  switch (wd) {
    case 0: return [ // Mon — bridge session 1 (2h)
      `${c.icon} Bridge Session 1 (2h) — zyBook reading + Participation Activities: ${focus}`,
      `📓 Update notes doc: definitions + formulas + plain-English explanations`];
    case 1: return [ // Tue — research reading (1h)
      `📄 D.Eng. Repair (1h) — read/skim ONE paper. Log it in Research: problem · method · limitation · why it matters`];
    case 2: return [ // Wed — bridge session 2 (2h)
      `${c.icon} Bridge Session 2 (2h) — Challenge Activities: ${focus}`,
      `🎯 Practice Arena: 10 questions on ${c.name}`];
    case 3: return [ // Thu — research refinement (1h)
      `🔬 D.Eng. Repair (1h) — refine research topic shortlist / work on literature synthesis memo`];
    case 4: return last ? [ // Fri — bridge session 3 (2h)
      `✅ QUIZ DAY (2h) — finish remaining ${c.code} module quizzes (need ≥80%) and log scores in Courses`,
      `✍️ Write the 1-page summary: “${c.summary}”`] : [
      `${c.icon} Bridge Session 3 (2h) — finish ${focus}, take module quiz${week.mods.length>1?"zes":""} (≥80%) and log scores in Courses`];
    case 5: return [ // Sat
      `🎯 Practice Arena — 20 challenge questions (${c.name} + one older course for retention)`,
      last ? `🛠️ Outside practice deliverable — ${c.outside}` : `🛠️ Outside practice (start/continue) — ${c.outside}`];
    default: return [ // Sun
      `🔁 Review weakest topic of the week (redo missed Challenge Activities)`,
      `✍️ Journal: “This week I learned ___. It strengthens my D.Eng. comeback because ___.”`,
      `🗓️ Preview next week (10 min)`];
  }
}

/* ---------- XP formula ---------- */
const XP = {
  day: 20,            // each plan day completed
  quizPass: 50,       // module quiz ≥ 80
  quizAce: 25,        // bonus ≥ 90
  practiceCorrect: 2, // per correct practice question
  paper: 40,          // each paper logged in reading log
  summary: 60,        // each 1-page course summary written
  outside: 50,        // each outside-practice deliverable done
  moduleGate: 15      // each module marked complete
};

/* ---------- Badges ---------- */
const BADGES = [
  // Bronze
  { id:"first-step", tier:"bronze", icon:"👣", name:"First Step", desc:"Complete Day 1", test: s => !!s.days[1] },
  { id:"week-one", tier:"bronze", icon:"🌱", name:"Week One", desc:"Complete all 7 days of Week 1", test: s => [1,2,3,4,5,6,7].every(d => s.days[d]) },
  { id:"first-quiz", tier:"bronze", icon:"✅", name:"Gate Breaker", desc:"Pass your first module quiz (≥80%)", test: s => Object.values(s.quizzes).some(v => v >= 80) },
  { id:"first-paper", tier:"bronze", icon:"📄", name:"First Citation", desc:"Log your first paper in the reading log", test: s => (s.papers||[]).length >= 1 },
  { id:"first-practice", tier:"bronze", icon:"🎯", name:"Arena Rookie", desc:"Answer 10 practice questions", test: s => (s.practice.total||0) >= 10 },
  { id:"streak-5", tier:"bronze", icon:"🔥", name:"Kindling", desc:"5-day streak", test: s => bestStreak(s) >= 5 },
  // Silver
  { id:"stat-done", tier:"silver", icon:"📊", name:"Signal from Noise", desc:"Pass all 5 MATH 2350 quizzes", test: s => courseDone(s,"stat") },
  { id:"la-done", tier:"silver", icon:"🧮", name:"Matrix Mind", desc:"Pass all 5 MATH 2330 quizzes", test: s => courseDone(s,"la") },
  { id:"calc-done", tier:"silver", icon:"∫", name:"Rate of Change", desc:"Pass all 5 MATH 2340 quizzes", test: s => courseDone(s,"calc") },
  { id:"py-done", tier:"silver", icon:"🐍", name:"Pythonista", desc:"Pass all 5 CMPSC 2310 quizzes", test: s => courseDone(s,"py") },
  { id:"dsa-done", tier:"silver", icon:"🌳", name:"Algorithm Architect", desc:"Pass all 5 CMPSC 2320 quizzes", test: s => courseDone(s,"dsa") },
  { id:"papers-5", tier:"silver", icon:"📚", name:"Reader", desc:"5 papers in the reading log", test: s => (s.papers||[]).length >= 5 },
  { id:"streak-10", tier:"silver", icon:"🔥", name:"Two Weeks Strong", desc:"10-day streak", test: s => bestStreak(s) >= 10 },
  { id:"practice-100", tier:"silver", icon:"🏹", name:"Century Archer", desc:"100 practice questions answered", test: s => (s.practice.total||0) >= 100 },
  { id:"sharp-shooter", tier:"silver", icon:"🎖️", name:"Sharpshooter", desc:"80%+ accuracy over 50+ questions", test: s => (s.practice.total||0) >= 50 && s.practice.correct/s.practice.total >= 0.8 },
  // Gold
  { id:"quant-repair", tier:"gold", icon:"🏛️", name:"Quantitative Repair", desc:"Statistics + Linear Algebra + Calculus all complete", test: s => courseDone(s,"stat") && courseDone(s,"la") && courseDone(s,"calc") },
  { id:"half-way", tier:"gold", icon:"⛰️", name:"Basecamp 53", desc:"Complete 53 plan days (halfway)", test: s => doneDays(s) >= 53 },
  { id:"papers-10", tier:"gold", icon:"🗂️", name:"Literature Hunter", desc:"10 papers in the reading log", test: s => (s.papers||[]).length >= 10 },
  { id:"summaries-3", tier:"gold", icon:"✍️", name:"Synthesist", desc:"Write 3 one-page course summaries", test: s => Object.values(s.summaries||{}).filter(Boolean).length >= 3 },
  { id:"streak-20", tier:"gold", icon:"🔥", name:"Month Warrior", desc:"20-day streak", test: s => bestStreak(s) >= 20 },
  { id:"ace-5", tier:"gold", icon:"💯", name:"Ace Collector", desc:"Score ≥90% on five quizzes", test: s => Object.values(s.quizzes).filter(v => v >= 90).length >= 5 },
  { id:"practice-500", tier:"gold", icon:"🏆", name:"Arena Gladiator", desc:"500 practice questions answered", test: s => (s.practice.total||0) >= 500 },
  // Diamond
  { id:"all-courses", tier:"diamond", icon:"💎", name:"Bridge Master", desc:"All 25 module quizzes passed — every course complete", test: s => COURSES.every(c => courseDone(s, c.id)) },
  { id:"day-105", tier:"diamond", icon:"🎓", name:"The 105th Day", desc:"Complete the full 15-week plan", test: s => doneDays(s) >= 105 },
  { id:"memo", tier:"diamond", icon:"🧬", name:"Research Ready", desc:"Literature synthesis memo complete + 10 papers + topic shortlist", test: s => s.research && s.research.memoDone && (s.papers||[]).length >= 10 && (s.topics||[]).filter(t=>t.title).length >= 3 },
  { id:"streak-30", tier:"diamond", icon:"🛡️", name:"Iron Scholar", desc:"30-day streak", test: s => bestStreak(s) >= 30 },
  { id:"streak-60", tier:"diamond", icon:"👑", name:"Academy Legend", desc:"60-day streak", test: s => bestStreak(s) >= 60 },
  { id:"deng-ready", tier:"diamond", icon:"🚀", name:"D.Eng. Ready", desc:"All courses + all 5 summaries + all 5 outside practices + memo done", test: s =>
      COURSES.every(c => courseDone(s, c.id)) &&
      COURSES.every(c => (s.summaries||{})[c.id]) &&
      COURSES.every(c => (s.outside||{})[c.id]) &&
      s.research && s.research.memoDone }
];

/* ---------- Levels ---------- */
const LEVELS = [
  { xp: 0,    name: "Applicant" },
  { xp: 300,  name: "Bridge Student" },
  { xp: 800,  name: "Scholar" },
  { xp: 1600, name: "Researcher" },
  { xp: 2800, name: "Candidate" },
  { xp: 4500, name: "Doctor-in-Training" },
  { xp: 6500, name: "Academy Legend" }
];

/* ---------- D.Eng. repair track reference data ---------- */
const TOPIC_SEEDS = [
  "Governance / traceability in enterprise RAG pipelines",
  "Evaluation of AI decision-support systems in operational workflows",
  "Automated data quality / test generation for AI pipelines using metadata + LLMs"
];

const READING_STARTERS = [
  { t: "Attention Is All You Need (Vaswani et al., 2017)", why: "Transformer foundation — the architecture behind everything you'll evaluate" },
  { t: "Retrieval-Augmented Generation for Knowledge-Intensive NLP (Lewis et al., 2020)", why: "Core RAG paper — directly feeds topic candidate #1" },
  { t: "Hidden Technical Debt in Machine Learning Systems (Sculley et al., 2015)", why: "The enterprise-AI-systems classic — pipelines, not models" },
  { t: "Data Validation for Machine Learning (Breck et al., 2019, TFX)", why: "Automated data quality — feeds topic candidate #3" },
  { t: "Model Cards for Model Reporting (Mitchell et al., 2019)", why: "Governance & documentation — feeds topic candidate #1" },
  { t: "Beyond Accuracy: Behavioral Testing of NLP Models — CheckList (Ribeiro et al., 2020)", why: "Evaluation methodology — feeds topic candidate #2" },
  { t: "The ML Test Score (Breck et al., 2017)", why: "A rubric for production-readiness of ML pipelines" },
  { t: "Judging LLM-as-a-Judge (Zheng et al., 2023)", why: "Modern AI evaluation — statistical thinking applied to LLM systems" },
  { t: "Datasheets for Datasets (Gebru et al., 2021)", why: "Data governance & metadata — feeds topics #1 and #3" },
  { t: "Operationalizing Machine Learning: An Interview Study (Shankar et al., 2022)", why: "How real MLOps work happens — grounds your D.Eng. problem statement" }
];

const ROADMAP_2027 = [
  { when: "Jul–Oct 2026", what: "15-week bridge block (this site) + weekly paper reading. Start Statistics immediately. Wait for PSU faculty recommendation before enrolling in all 5.", key: true },
  { when: "Oct 2026", what: "Bridge block complete: 25 quizzes passed, 5 one-page summaries, 10–15 paper reading log, literature synthesis memo v1." },
  { when: "Nov–Dec 2026", what: "Narrow the 3 topic candidates to ONE. Expand memo into a 5–8 page literature review draft. Contact potential PSU advisors with a specific, narrow problem." },
  { when: "Jan–Mar 2027", what: "Technical project that demonstrates the research direction (e.g., a RAG-governance or pipeline-evaluation prototype from your data engineering work). Document it like a paper." },
  { when: "Apr–Jun 2027", what: "Draft application package: statement of purpose built around the narrow problem + evidence (bridge grades, memo, project). Get recommenders lined up." },
  { when: "Jul–Sep 2027", what: "Polish and submit the Fall 2027 D.Eng. application. You arrive with proof, not promises.", key: true }
];

const COST_PLAN = [
  { item: "5 × bridge course fee ($150 each)", cost: "$750" },
  { item: "zyBooks: Statistics $64 · Linear Algebra $64 · Calculus $64", cost: "$192" },
  { item: "zyBooks: Python 3 + Data Structures ($99/yr covers both CS courses)", cost: "$99–$198" },
  { item: "Estimated total (all 5 courses)", cost: "~$1,050–$1,200", total: true }
];
