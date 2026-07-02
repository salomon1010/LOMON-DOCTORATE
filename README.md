# Lomon Doctorate Academy 🎓

A personal command center for the **PSU Great Valley Bridge Program → Fall 2027 D.Eng. reapplication**.

Built as a static multi-page site (no server, no build step). All progress is stored in your browser's localStorage — check off days, log quiz scores, drill randomized zyBook-style questions, and log research papers. XP, badges and streaks update across every page.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Command center — today's mission, course rings, countdowns |
| `plan.html` | The 15-week / 105-day plan (Jul 6 – Oct 18, 2026), checkable day by day |
| `courses.html` | All 5 bridge courses in mentor order, module gates, quiz score log, 1-page summaries, outside practice |
| `practice.html` | zyBook-style Practice Arena — randomized questions for Stats, Linear Algebra, Calculus, Python, DSA + ML Math |
| `research.html` | D.Eng. Repair Track — topic shortlist, paper reading log, literature memo, road to Fall 2027 |
| `progress.html` | Achievement system — XP, levels, badge wall, streak calendar, charts, backup/export |

## The plan (mentor-advised)

1. **MATH 2350 Statistics** (Weeks 1–3)
2. **MATH 2330 Linear Algebra** (Weeks 4–6)
3. **MATH 2340 Calculus** (Weeks 7–9)
4. **CMPSC 2310 Foundations of Programming** (Weeks 10–12)
5. **CMPSC 2320 Data Structures & Algorithms** (Weeks 13–15)

Weekly rhythm (8 hrs while working full-time): Mon/Wed/Fri 2h bridge sessions · Tue 1h paper reading · Thu 1h research refinement · Sat practice arena · Sun review.

## Deploy to GitHub Pages

**Option A — its own site:**
1. Create a new repo, e.g. `LOMON-DOCTORATE`
2. Upload everything in this folder (keep `css/` and `js/` structure)
3. Repo → Settings → Pages → Source: `main` branch, `/ (root)` → Save
4. Site appears at `https://salomon1010.github.io/LOMON-DOCTORATE/`

**Option B — inside LOMON-ACADEMY:**
1. Copy this folder into the existing repo as `doctorate/`
2. Push — site appears at `https://salomon1010.github.io/LOMON-ACADEMY/doctorate/`

Via command line:
```bash
cd lomon-doctorate-academy
git init && git add -A && git commit -m "Lomon Doctorate Academy"
git remote add origin https://github.com/salomon1010/LOMON-DOCTORATE.git
git branch -M main && git push -u origin main
```
Then enable Pages in repo settings.

## Notes

- Progress is per-browser. Use **Achievements → Export progress** to back up or move devices.
- To change the start date, edit `START_DATE` in `js/data.js`.
- Charts load from the Chart.js CDN (progress page only); everything else is fully offline.
