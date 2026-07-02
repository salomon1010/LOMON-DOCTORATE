/* ============================================================
   PRACTICE ARENA — randomized zyBook-style question generators
   Each generator returns { q, code?, choices:[...], answer:idx, explain }
   Numbers are randomized so every session is different — like a zyBook
   Challenge Activity.
   ============================================================ */

const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
};

/* Build MCQ from correct answer + distractor values (deduped) */
function mcq(q, correct, distractors, explain, code) {
  const seen = new Set([String(correct)]);
  const uniq = [];
  for (const d of distractors) {
    const k = String(d);
    if (!seen.has(k)) { seen.add(k); uniq.push(d); }
    if (uniq.length === 3) break;
  }
  // pad with numeric variants if we ran short and the answer is numeric
  let salt = 3;
  while (uniq.length < 2) {
    const cand = typeof correct === "number" ? correct + salt : String(correct) + " ";
    if (!seen.has(String(cand))) { seen.add(String(cand)); uniq.push(cand); }
    salt += 4;
  }
  const opts = R.shuffle([correct, ...uniq]);
  return { q, code, choices: opts.map(String), answer: opts.findIndex(o => String(o) === String(correct)), explain };
}

/* ================= STATISTICS ================= */
const GEN_STAT = [
  () => { // mean/median
    const xs = [...Array(5)].map(() => R.int(2, 20)).sort((a, b) => a - b);
    const mean = xs.reduce((a, b) => a + b) / 5, med = xs[2];
    const which = R.pick(["mean", "median"]);
    const ans = which === "mean" ? +mean.toFixed(1) : med;
    return mcq(`Data set: {${xs.join(", ")}}. What is the ${which}?`, ans,
      [med + 1, +(mean + 1).toFixed(1), xs[4] - xs[0], +(mean - 0.5).toFixed(1)],
      `Mean = sum/n = ${xs.reduce((a,b)=>a+b)}/5 = ${mean.toFixed(1)}. Median = middle value of the sorted set = ${med}.`);
  },
  () => { // z-score
    const mu = R.int(50, 80), sd = R.pick([5, 10]), x = mu + sd * R.pick([-2, -1, 1, 2]);
    const z = (x - mu) / sd;
    return mcq(`A model's daily accuracy is normally distributed with mean ${mu}% and SD ${sd}. Today it scored ${x}%. What is the z-score?`,
      z, [z + 1, -z, z / 2, z * 2],
      `z = (x − μ)/σ = (${x} − ${mu})/${sd} = ${z}. A |z| ≥ 2 is a strong signal the result isn't routine noise — exactly how you'd flag a pipeline regression.`);
  },
  () => { // hypothesis testing concept
    const p = R.pick([0.03, 0.01, 0.2, 0.35]);
    const sig = p < 0.05;
    return mcq(`You A/B test pipeline v2 vs v1 and get p = ${p} (α = 0.05). What do you conclude?`,
      sig ? "Reject H₀ — the difference is statistically significant" : "Fail to reject H₀ — the difference could be noise",
      ["Reject H₀ — the difference is statistically significant", "Fail to reject H₀ — the difference could be noise",
       "Accept H₁ with 100% certainty", "The test is invalid"],
      `p = ${p} ${sig ? "<" : ">"} α = 0.05. ${sig ? "Small p-value: data this extreme would be rare if there were no real difference." : "Large p-value: you cannot claim v2 is better without hand-waving. This is the exact question your mentor said you must be able to answer."}`);
  },
  () => { // CI
    const n = R.pick([25, 100]), sd = R.pick([10, 20]), mean = R.int(60, 80);
    const me = +(1.96 * sd / Math.sqrt(n)).toFixed(1);
    return mcq(`Sample of n=${n} responses: mean latency ${mean}ms, σ=${sd}. What is the 95% CI margin of error (z=1.96)?`,
      me, [+(sd / Math.sqrt(n)).toFixed(1), +(1.96 * sd).toFixed(1), +(me * 2).toFixed(1), +(me / 2).toFixed(1)],
      `ME = z·σ/√n = 1.96×${sd}/√${n} = ${me}. So the true mean is plausibly ${mean}±${me}ms. Quadrupling n halves the margin — that's why sample size matters in AI evaluation.`);
  },
  () => { // probability
    const k = R.pick([2, 3]);
    const ans = k === 2 ? "1/4" : "1/8";
    return mcq(`A fair coin is flipped ${k} times. P(all heads)?`, ans,
      ["1/2", "1/4", "1/8", `${k}/4`],
      `Independent events multiply: (1/2)^${k} = ${ans}. Independence assumptions hide everywhere in AI evaluation — flag them.`);
  },
  () => { // binomial mean
    const n = R.pick([20, 50, 100]), p = R.pick([0.1, 0.2, 0.5]);
    return mcq(`A classifier is wrong with probability ${p} per record. Over ${n} records, expected number of errors?`,
      n * p, [n * p + 5, Math.round(n * p / 2), n * (1 - p), n * p * 2],
      `Binomial mean = n·p = ${n}×${p} = ${n * p}. Expected values turn error *rates* into error *counts* — the language ops teams understand.`);
  },
  () => { // regression concept
    const b = R.pick([2.5, -1.2, 0.8]);
    return mcq(`Regression: quality_score = 40 + ${b}·(review_hours). What does ${b} mean?`,
      `Each extra review hour changes the score by ${b} points on average`,
      [`Each extra review hour changes the score by ${b} points on average`,
       "The score when hours = 0", `Correlation is ${b}`, "The model explains " + Math.abs(b) + "% of variance"],
      `The slope is the average change in y per unit of x. The intercept (40) is the baseline at x=0. R² — not the slope — measures explained variance.`);
  },
  () => { // chi-square use case
    return mcq(`Which question calls for a chi-square test?`,
      "Is error type (schema/null/drift) independent of data source (A/B/C)?",
      ["Is error type (schema/null/drift) independent of data source (A/B/C)?",
       "What is the average latency of pipeline B?",
       "How strong is the linear relation between rows and runtime?",
       "What is the 95% CI for mean accuracy?"],
      `Chi-square tests association between two *categorical* variables using counts. Means → t-tests/CIs; linear relations → correlation/regression.`);
  }
];

/* ================= LINEAR ALGEBRA ================= */
const GEN_LA = [
  () => { // dot product
    const a = [R.int(-3, 5), R.int(-3, 5), R.int(-3, 5)];
    const b = [R.int(-3, 5), R.int(-3, 5), R.int(-3, 5)];
    const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    return mcq(`u = [${a}], v = [${b}]. Compute u·v.`, dot,
      [dot + 2, dot - 3, a[0]*b[0], dot * -1 || 7],
      `u·v = ${a[0]}·${b[0]} + ${a[1]}·${b[1]} + ${a[2]}·${b[2]} = ${dot}. Dot products measure alignment — it's literally how embedding similarity works.`);
  },
  () => { // 2x2 multiply (one entry)
    const A = [[R.int(0,4),R.int(0,4)],[R.int(0,4),R.int(0,4)]];
    const B = [[R.int(0,4),R.int(0,4)],[R.int(0,4),R.int(0,4)]];
    const c11 = A[0][0]*B[0][0] + A[0][1]*B[1][0];
    return mcq(`A = [[${A[0]}],[${A[1]}]], B = [[${B[0]}],[${B[1]}]]. What is entry (1,1) of AB (row 1 · column 1)?`,
      c11, [A[0][0]*B[0][0], c11 + A[0][1], A[0][0]+B[0][0], c11 - 1],
      `(AB)₁₁ = row₁(A)·col₁(B) = ${A[0][0]}·${B[0][0]} + ${A[0][1]}·${B[1][0]} = ${c11}. Every neural-network layer is exactly this: rows of weights dotted with an input column.`);
  },
  () => { // determinant 2x2
    const a=R.int(1,6),b=R.int(0,5),c=R.int(0,5),d=R.int(1,6);
    const det = a*d - b*c;
    return mcq(`det([[${a}, ${b}], [${c}, ${d}]]) = ?`, det,
      [a*d + b*c, a+d-b-c, a*d, b*c - a*d],
      `det = ad − bc = ${a}·${d} − ${b}·${c} = ${det}. ${det === 0 ? "Zero determinant → the matrix squashes space flat: no inverse, the system loses information." : "Non-zero → invertible: the transformation can be undone."}`);
  },
  () => { // solve 2x2 system
    const x = R.int(1, 4), y = R.int(1, 4);
    const a1=1, b1=1, a2=1, b2=-1;
    const c1 = x + y, c2 = x - y;
    return mcq(`Solve: x + y = ${c1} and x − y = ${c2}. What is x?`, x,
      [y, c1, x + 1, Math.abs(x - 1) || 5],
      `Add the equations: 2x = ${c1 + c2} → x = ${x} (then y = ${y}). Elimination is Gaussian elimination in miniature — Module 1 of MATH 2330.`);
  },
  () => { // dimensions
    const m=R.int(2,4), n=R.int(2,4), p=R.int(2,4);
    return mcq(`A is ${m}×${n} and B is ${n}×${p}. What is the shape of AB?`,
      `${m}×${p}`, [`${n}×${n}`, `${m}×${n}`, `${p}×${m}`, "undefined"],
      `Inner dimensions (${n}) must match and cancel: (${m}×${n})·(${n}×${p}) → ${m}×${p}. Shape errors are the #1 beginner bug in NumPy and PyTorch alike.`);
  },
  () => { // scalar/vector ops
    const k = R.int(2, 4), v = [R.int(1, 5), R.int(1, 5)];
    return mcq(`${k}·[${v}] = ?`, `[${v[0]*k}, ${v[1]*k}]`,
      [`[${v[0]+k}, ${v[1]+k}]`, `[${v[0]*k}, ${v[1]}]`, `[${k}, ${v[0]*v[1]}]`, `[${v[1]*k}, ${v[0]*k}]`],
      `Scalar multiplication scales every component: [${k}·${v[0]}, ${k}·${v[1]}]. Geometrically it stretches the vector without changing direction.`);
  },
  () => { // linear transformation concept
    return mcq(`A document embedding is a 768-dimensional vector. Multiplying it by a 128×768 matrix does what?`,
      "Projects it into a 128-dimensional space (a linear transformation)",
      ["Projects it into a 128-dimensional space (a linear transformation)",
       "Makes the document longer", "Sorts its values", "Computes its probability"],
      `W·x with W (128×768) and x (768×1) gives a 128×1 vector — a learned projection. This is your 1-page summary in action: embeddings, weights, feature spaces are all linear algebra objects.`);
  },
  () => { // vector norm
    const a = R.pick([[3,4],[6,8],[5,12]]);
    const n = Math.sqrt(a[0]**2 + a[1]**2);
    return mcq(`‖[${a}]‖ (Euclidean length) = ?`, n,
      [a[0]+a[1], n+1, Math.abs(a[1]-a[0]), n*2],
      `‖v‖ = √(${a[0]}² + ${a[1]}²) = √${a[0]**2 + a[1]**2} = ${n}. Norms power cosine similarity: cos θ = (u·v)/(‖u‖‖v‖).`);
  }
];

/* ================= CALCULUS ================= */
const GEN_CALC = [
  () => { // power rule
    const a = R.int(2, 6), n = R.int(2, 4);
    return mcq(`f(x) = ${a}x^${n}. f′(x) = ?`, `${a*n}x^${n-1}`,
      [`${a}x^${n-1}`, `${a*n}x^${n}`, `${a**n}x`, `${n}x^${a}`],
      `Power rule: d/dx[axⁿ] = a·n·xⁿ⁻¹ = ${a*n}x^${n-1}. Backpropagation is this rule applied thousands of times via the chain rule.`);
  },
  () => { // derivative at a point
    const a = R.int(1, 3), b = R.int(1, 5), x0 = R.int(1, 3);
    const ans = 2*a*x0 + b;
    return mcq(`Loss L(w) = ${a}w² + ${b}w. What is the gradient dL/dw at w = ${x0}?`, ans,
      [a*x0**2 + b*x0, 2*a*x0, ans - b, ans + a],
      `dL/dw = ${2*a}w + ${b}; at w=${x0}: ${2*a}·${x0} + ${b} = ${ans}. Positive gradient → decrease w to reduce loss. That IS gradient descent.`);
  },
  () => { // zero derivative / minimum
    const a = R.int(1, 4), b = R.int(2, 8);
    const w = b / (2 * a);
    return mcq(`L(w) = ${a}w² − ${b}w + 3. At what w is the loss minimized (L′ = 0)?`,
      +w.toFixed(2), [b/a, +(w*2).toFixed(2), a/b, +(w+1).toFixed(2)],
      `L′(w) = ${2*a}w − ${b} = 0 → w = ${b}/${2*a} = ${w}. A zero derivative at a bowl-shaped minimum is why "training converged" means "gradient ≈ 0".`);
  },
  () => { // simple integral
    const a = R.pick([2, 3, 4, 6]), n = R.int(1, 3);
    return mcq(`∫ ${a}x^${n} dx = ?`, `${a}/${n+1}·x^${n+1} + C`,
      [`${a*n}x^${n-1} + C`, `${a}x^${n+1} + C`, `${a}/${n}·x^${n} + C`, `${a*(n+1)}x^${n+1} + C`],
      `Reverse power rule: raise the exponent, divide by it: ${a}x^${n+1}/${n+1} + C. Integration = accumulation (total error over time from an error rate).`);
  },
  () => { // limits
    const c = R.int(1, 4), a = R.int(1, 3);
    return mcq(`lim(x→${c}) of (x² − ${c*c})/(x − ${c}) = ?`, 2*c,
      [0, c, "undefined", c*c],
      `Factor: (x−${c})(x+${c})/(x−${c}) = x+${c} → ${2*c}. Limits formalize "what value are we approaching" — the foundation under every derivative.`);
  },
  () => { // chain rule
    const a = R.int(2, 4), n = R.int(2, 3);
    return mcq(`f(x) = (${a}x + 1)^${n}. f′(x) = ?`, `${n*a}(${a}x + 1)^${n-1}`,
      [`${n}(${a}x + 1)^${n-1}`, `${a}(${a}x + 1)^${n}`, `${n*a}x^${n-1}`, `(${a}x + 1)^${n-1}`],
      `Chain rule: outer′ × inner′ = ${n}(${a}x+1)^${n-1} · ${a}. Backprop is the chain rule composed through every layer of a network.`);
  },
  () => { // gradient direction concept
    return mcq(`During training, the gradient of the loss w.r.t. a weight is −4.2. Gradient descent will…`,
      "Increase the weight (step opposite the gradient)",
      ["Increase the weight (step opposite the gradient)", "Decrease the weight", "Set the weight to 0", "Stop training"],
      `Update rule: w ← w − η·∇L. With ∇L = −4.2, subtracting a negative *increases* w. Optimizers always walk downhill against the gradient.`);
  },
  () => { // partial derivative
    const a = R.int(2, 5), b = R.int(2, 5);
    return mcq(`f(x, y) = ${a}x²y + ${b}y. ∂f/∂x = ?`, `${2*a}xy`,
      [`${a}x² + ${b}`, `${2*a}x + ${b}`, `${a}x²`, `${2*a}xy + ${b}`],
      `Treat y as a constant: ∂/∂x[${a}x²y] = ${2*a}xy, and ∂/∂x[${b}y] = 0. Multivariable gradients (Module 5) are just a vector of these partials — one per model weight.`);
  }
];

/* ================= PYTHON ================= */
const GEN_PY = [
  () => { // range/loop output
    const n = R.int(3, 5);
    const out = [...Array(n).keys()].join(" ");
    return { ...mcq(`What does this print?`, out,
      [[...Array(n+1).keys()].join(" "), [...Array(n).keys()].map(x=>x+1).join(" "), String(n), "error"],
      `range(${n}) yields 0…${n-1}. Off-by-one intuition is the cheapest bug-prevention there is.`),
      code: `for i in range(${n}):\n    print(i, end=" ")` };
  },
  () => { // slicing
    const s = R.pick(["doctorate", "pipeline", "bridge", "gradient"]);
    const a = R.int(1, 2), b = R.int(4, Math.min(6, s.length));
    return { ...mcq(`What does this print?`, s.slice(a, b),
      [s.slice(a, b+1), s.slice(a-1, b), s.slice(b, a) || s[0], s.slice(a)],
      `s[${a}:${b}] takes indices ${a} through ${b-1} (end-exclusive) → "${s.slice(a,b)}".`),
      code: `s = "${s}"\nprint(s[${a}:${b}])` };
  },
  () => { // list ops
    const xs = [R.int(1,9), R.int(1,9), R.int(1,9)];
    const v = R.int(1, 9);
    return { ...mcq(`What does this print?`, `[${[...xs, v].join(", ")}]`,
      [`[${xs.join(", ")}]`, `[${[v, ...xs].join(", ")}]`, `[${[...xs, v, v].join(", ")}]`, "error"],
      `.append(${v}) mutates the list in place, adding to the end.`),
      code: `xs = [${xs.join(", ")}]\nxs.append(${v})\nprint(xs)` };
  },
  () => { // dict lookup
    const k = R.pick(["region", "source", "table"]);
    const v = R.pick(["east", "s3", "orders"]);
    return { ...mcq(`What does this print?`, v,
      ["KeyError", "None", k, `{"${k}": "${v}"}`],
      `meta["${k}"] retrieves the value. Use .get("${k}") when the key might be missing — it returns None instead of raising KeyError. Dict lookup is O(1): your DSA outside-practice topic.`),
      code: `meta = {"${k}": "${v}", "rows": 1200}\nprint(meta["${k}"])` };
  },
  () => { // function return
    const a = R.int(2, 6), b = R.int(2, 6);
    return { ...mcq(`What does this print?`, a*b + 1,
      [a*b, a+b+1, (a+1)*b, "None"],
      `f(${a},${b}) returns ${a}·${b}+1 = ${a*b+1}. A function without an explicit return gives None — a classic silent bug.`),
      code: `def f(x, y):\n    return x * y + 1\n\nprint(f(${a}, ${b}))` };
  },
  () => { // conditionals
    const x = R.int(1, 20);
    const ans = x % 2 === 0 ? (x % 3 === 0 ? "fizzbuzz" : "even") : "odd";
    return { ...mcq(`What does this print for x = ${x}?`, ans,
      ["even", "odd", "fizzbuzz", "error"],
      `${x} % 2 = ${x % 2}${x % 2 === 0 ? `, and ${x} % 3 = ${x % 3}` : ""} → branch "${ans}". Conditional order matters: the first true branch wins.`),
      code: `x = ${x}\nif x % 2 == 0 and x % 3 == 0:\n    print("fizzbuzz")\nelif x % 2 == 0:\n    print("even")\nelse:\n    print("odd")` };
  },
  () => { // accumulate
    const n = R.int(3, 5);
    const total = [...Array(n + 1).keys()].reduce((a, b) => a + b, 0);
    return { ...mcq(`What does this print?`, total,
      [total - n, total + n, n, n * n],
      `Accumulator sums 0+1+…+${n} = ${total}. The read–accumulate–report shape is the skeleton of your CSV summary-stats script.`),
      code: `total = 0\nfor i in range(${n + 1}):\n    total += i\nprint(total)` };
  },
  () => { // types
    return { ...mcq(`What does this print?`, "<class 'str'>",
      ["<class 'int'>", "<class 'float'>", "42", "error"],
      `input() (and CSV fields!) always arrive as strings. Forgetting int() before math is the classic data-loading bug.`),
      code: `value = "42"\nprint(type(value))` };
  }
];

/* ================= DSA ================= */
const GEN_DSA = [
  () => { // big-O of patterns
    const kind = R.pick([
      ["a single loop over n items", "O(n)"],
      ["a loop nested inside a loop, both over n", "O(n²)"],
      ["binary search on a sorted array", "O(log n)"],
      ["dict/hash-map lookup by key", "O(1)"],
      ["sorting with an efficient comparison sort", "O(n log n)"]]);
    return mcq(`What is the time complexity of ${kind[0]}?`, kind[1],
      ["O(1)", "O(log n)", "O(n)", "O(n²)", "O(n log n)"].filter(x => x !== kind[1]).slice(0, 3).concat([]),
      `${kind[1]}. Big-O answers: what happens at 10× the data volume? — the question every scalable pipeline must survive.`);
  },
  () => { // stack
    const a = R.int(1,9), b = R.int(1,9), c = R.int(1,9);
    return mcq(`Stack ops: push(${a}), push(${b}), push(${c}), pop(), pop(). What is on top now?`, a,
      [b, c, "empty", a + b],
      `LIFO: pop removes ${c}, then ${b}; ${a} remains on top. Stacks = undo history, call stacks, DFS.`);
  },
  () => { // queue
    const a = R.int(1,9), b = R.int(1,9), c = R.int(1,9);
    return mcq(`Queue ops: enqueue(${a}), enqueue(${b}), enqueue(${c}), dequeue(). What is at the front now?`, b,
      [a, c, "empty", a + c],
      `FIFO: dequeue removes ${a} (first in). Front is now ${b}. Queues = message brokers, task schedulers, BFS.`);
  },
  () => { // binary search steps
    const n = R.pick([16, 32, 64, 1024]);
    const ans = Math.log2(n);
    return mcq(`Binary search on a sorted array of ${n.toLocaleString()} items: worst-case comparisons ≈ ?`, ans,
      [n / 2, n, ans * 2, ans - 1],
      `Each comparison halves the space: log₂(${n}) = ${ans}. This is why sorted structures + indexes make lookups scale.`);
  },
  () => { // list vs dict
    const n = R.pick(["1 million", "10 million"]);
    return mcq(`You must look up metadata records by ID among ${n} records, millions of times. Best structure?`,
      "Dictionary / hash map — O(1) average lookup",
      ["Dictionary / hash map — O(1) average lookup", "List — O(n) scan each time",
       "Sorted list with linear scan", "Nested lists"],
      `Hashing jumps straight to the bucket: O(1) vs O(n) scans. This is literally your Week 15 outside-practice deliverable — be able to *explain* it, not just use it.`);
  },
  () => { // traversal
    return mcq(`In-order traversal of a binary SEARCH tree visits nodes in what order?`,
      "Ascending sorted order",
      ["Ascending sorted order", "Random order", "Level by level", "Reverse insertion order"],
      `Left → node → right on a BST yields sorted output. Level-by-level is BFS; that's a queue, not recursion.`);
  },
  () => { // hashing
    const k = R.int(20, 99), m = R.pick([7, 10]);
    return mcq(`Hash table with ${m} buckets, h(k) = k mod ${m}. Key ${k} goes to bucket…?`, k % m,
      [(k + 1) % m, m, Math.floor(k / m), (k % m + 1) % m],
      `${k} mod ${m} = ${k % m}. Collisions (two keys, one bucket) are handled by chaining or probing — Module 5 of CMPSC 2320.`);
  },
  () => { // recursion
    const n = R.int(3, 5);
    const fact = [...Array(n).keys()].reduce((a, b) => a * (b + 1), 1);
    return { ...mcq(`What does f(${n}) return?`, fact,
      [fact / n, fact * n, n * 2, n + (n-1)],
      `f(${n}) = ${n}·f(${n-1}) … down to f(0)=1 → ${n}! = ${fact}. Every recursion needs a base case or the call stack overflows.`),
      code: `def f(n):\n    if n == 0:\n        return 1\n    return n * f(n - 1)` };
  }
];

/* ================= ML MATH (doctorate extras) ================= */
const GEN_ML = [
  () => { // MSE gradient
    const yhat = R.int(4, 9), y = R.int(1, 3);
    return mcq(`One-sample squared error L = (ŷ − y)², with ŷ = ${yhat}, y = ${y}. dL/dŷ = ?`,
      2 * (yhat - y), [(yhat - y), (yhat - y) ** 2, 2 * yhat, y - yhat],
      `dL/dŷ = 2(ŷ − y) = 2(${yhat} − ${y}) = ${2*(yhat-y)}. Positive → prediction too high → the update pushes it down. Calculus meeting statistics: this is model training.`);
  },
  () => { // sigmoid
    return mcq(`σ(0) for the sigmoid σ(z) = 1/(1 + e⁻ᶻ) = ?`, "0.5",
      ["0", "1", "0.5", "e"],
      `σ(0) = 1/(1+1) = 0.5 — the "maximally uncertain" point. Sigmoids turn scores into probabilities; the 0.5 threshold is a *choice*, not a law.`);
  },
  () => { // softmax argmax
    const a = R.shuffle([1.2, 3.4, 0.5]);
    const ans = "z = " + Math.max(...a);
    return mcq(`Logits z = [${a.join(", ")}]. After softmax, which class has the highest probability?`,
      ans, a.filter(x => x !== Math.max(...a)).map(x => "z = " + x).concat(["all equal"]),
      `Softmax is monotonic: the largest logit stays the largest probability. It rescales, never reorders.`);
  },
  () => { // expected value
    const p = R.pick([0.1, 0.05]);
    const n = R.pick([1000, 5000]);
    return mcq(`An LLM-based extractor hallucinates a field with probability ${p}. Over ${n.toLocaleString()} documents, expected hallucinations?`,
      n * p, [n * p * 2, n * (1 - p), p * 100, n / p],
      `E = n·p = ${n}×${p} = ${n*p}. Expected-value framing converts "sometimes wrong" into a budget you can monitor — a very D.Eng.-flavored move.`);
  },
  () => { // cosine similarity
    return mcq(`Two document embeddings have cosine similarity 0.97. Interpretation?`,
      "They point in nearly the same direction — semantically very similar",
      ["They point in nearly the same direction — semantically very similar",
       "They are 97% identical strings", "One is 0.97× the length of the other", "They are orthogonal"],
      `cos θ = (u·v)/(‖u‖‖v‖) measures angle, not length. Near 1 → same direction. Orthogonal (unrelated) would be ≈ 0. This is RAG retrieval's core operation.`);
  },
  () => { // precision/recall
    const tp = R.int(60, 90), fp = R.int(5, 20), fn = R.int(5, 20);
    const prec = +(tp / (tp + fp)).toFixed(2);
    return mcq(`A pipeline flags records: TP=${tp}, FP=${fp}, FN=${fn}. Precision = ?`,
      prec, [+(tp/(tp+fn)).toFixed(2), +(tp/(tp+fp+fn)).toFixed(2), +(1 - prec).toFixed(2), +(prec/2).toFixed(2)],
      `Precision = TP/(TP+FP) = ${tp}/${tp+fp} = ${prec} ("when it flags, how often is it right?"). TP/(TP+FN) is recall. Choosing which to optimize is an *evaluation design* decision — your research lane.`);
  },
  () => { // learning rate intuition
    return mcq(`Gradient descent with a learning rate that is far too large will typically…`,
      "Overshoot and diverge — the loss bounces or explodes",
      ["Overshoot and diverge — the loss bounces or explodes",
       "Converge slowly but surely", "Always find the global minimum", "Have no effect"],
      `w ← w − η∇L: a huge η leaps past the valley floor and can climb the other side. Too small = crawling. Step size is the optimization intuition your calculus block builds.`);
  }
];

const SUBJECTS = [
  { id: "stat", icon: "📊", name: "Statistics", color: "#a55eea", gens: GEN_STAT, tag: "MATH 2350" },
  { id: "la", icon: "🧮", name: "Linear Algebra", color: "#f7b731", gens: GEN_LA, tag: "MATH 2330" },
  { id: "calc", icon: "∫", name: "Calculus", color: "#fc5c65", gens: GEN_CALC, tag: "MATH 2340" },
  { id: "py", icon: "🐍", name: "Python", color: "#4ecdc4", gens: GEN_PY, tag: "CMPSC 2310" },
  { id: "dsa", icon: "🌳", name: "Data Structures & Algorithms", color: "#45aaf2", gens: GEN_DSA, tag: "CMPSC 2320" },
  { id: "ml", icon: "🧠", name: "ML Math (Doctorate Extras)", color: "#7ee8fa", gens: GEN_ML, tag: "D.Eng. repair" }
];
