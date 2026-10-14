## Quick repository orientation

- This project is a small Flask-based portfolio/resume site with RDF-backed data.
- Backend entry: `backend2/app.py` — returns an initial rendered page (GET) and accepts a POST with JSON {"profile_user": "Name"} to return filtered JSON for the selected profile.
- RDF loader / business logic: `backend2/pyscript/grapher.py` — loads `backend2/database/resume.ttl` using rdflib, runs SPARQL queries and produces a nested JSON structure used by the frontend.
- SPARQL queries: `backend2/pyscript/rdfquery.py` — contains all query text and prefixes. Update queries here when changing data needs.
- Templates: `backend2/templates/index.html` and `backend/templates/index_rdf.html` — server-rendered HTML. JSON payload inserted into the page inside a <script id="all-data-container"> tag.
- Frontend: `backend2/static/script.js` — reads the JSON from `#all-data-container`, renders the UI and issues POST requests to `/` when switching profiles.

## Why things are structured this way

- RDF (TTL) is the single source of truth. Python (rdflib) queries the TTL and transforms results into a JSON shape the JS can consume. That keeps UI code simple and decoupled from SPARQL.
- SPARQL query strings live in one file (`rdfquery.py`) to make it easy to change data access without touching rendering logic.

## Important data shapes (used across code)

- The backend returns a JSON object with these top-level keys (used heavily by `script.js`):
  - NameList, Name, Details, Category, Education, WorkExperience, Skills, Certificate, SkillType, Project, ProjectClass, Service, Social
- Example minimal payload shape:

  {
    "NameList": ["Nwiwu Uzoma", "Kcenia Tsvetkova"],
    "Name": "Nwiwu Uzoma",
    "Details": [{"personURI":"...","dob":"...","aboutMe":"...","photo":"assets/profile.jpg"}],
    "Category": [{"main":"Software"}],
    "Education": [{"main":"...","schoolName":"...","startDate":"...","endDate":"..."}],
    ...
  }

## How to run locally (dev)

1. Create and activate a Python venv (recommended).
2. Install runtime deps (Flask and rdflib).
3. Run the backend app.

PowerShell (from repo root):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend2/app.py
```

Notes:
- No database server is needed. `grapher.py` parses `backend2/database/resume.ttl` once with rdflib (path resolved relative to the file; override with `RESUME_GRAPH_PATH`) and runs the SPARQL queries in memory.
- App runs in debug mode by default; set `FLASK_DEBUG=0` to disable.

## Deploying (free)

- The data is static, so the site is pre-built: `python backend2/build_static.py` writes `dist/` (index.html, `data/<slug>.json` per person, `static/`).
- `.github/workflows/pages.yml` runs that build on every push to `main` and publishes to GitHub Pages (Settings → Pages → Source: GitHub Actions).
- The frontend loads other profiles from `data/<slug>.json` (relative URL). Flask serves the same path via the `/data/<slug>.json` route, so local dev and the static site behave the same. Keep `slugify()` in `app.py` and `script.js` in sync.
- Use relative asset URLs (`static/...`, not `/static/...`) in JS so the site works under `https://<user>.github.io/<repo>/`.

## Where to make common changes

- Change RDF data (TTL): `backend2/database/resume.ttl`.
- Modify queries: `backend2/pyscript/rdfquery.py` (be careful with string formatting placeholders `{person}` and `{person_name}` used by `grapher.py`).
- Change how RDF is transformed: `backend2/pyscript/grapher.py` (helper methods: `aggregate_by_keys`, `process_uri_fragment`, `format_date_string`).
- Change template or JSON injection: `backend2/templates/index.html`.
- Change UI rendering/filters: `backend2/static/script.js` (look for functions like `getAllData`, `renderAllData`, `fetchFilteredCV`).

## Tips for editing safely

- If you edit SPARQL queries, test them quickly using rdflib by importing the Graph and running the query in a small REPL snippet — queries are concatenated with `get_prefix()`.
- When changing JSON keys, update both `grapher.py` (producer) and `script.js` (consumer). Search for the key name to find both sides (e.g., `WorkExperience`).
- Watch for path strings in TTL that reference static assets (e.g., `foaf:status "assets/profile.jpg"` and `backend2/static/*`). These feed into the rendered HTML as `/static/...`.

## Debugging checklist

- Browser console: check for JSON parsing errors (script reads `#all-data-container`).
- Network tab: verify POST to `/` returns JSON when changing profile.
- Backend logs: Flask prints server errors to the console when running in debug.
- rdflib issues: ensure `resume.ttl` is present and valid Turtle; parse errors will show stack traces from rdflib.

## Files to inspect when working on features

- `backend2/app.py` — request handling and how JSON is built.
- `backend2/pyscript/grapher.py` — RDF parsing and JSON assembly.
- `backend2/pyscript/rdfquery.py` — SPARQL queries and prefixes.
- `backend2/static/script.js` — front-end rendering and filtering logic.
- `backend2/database/resume.ttl` — data source and asset references.

If anything here is unclear or you'd like the file to include examples for a particular change (editing queries, adding a field, or changing the front-end contract), tell me which area and I will iterate.
