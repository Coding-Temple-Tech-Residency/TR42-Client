# Sprint One — Authentication Test Plan

**Project:** TR42-Client (VistaOne web + API)  
**Sprint focus:** Environment setup, auth requirements review, test planning, manual API/UI testing, defect logging.  
**Companion artifacts:** `generic-test-plan-template.md`, `authentication-test-cases.csv`

---

## 1. Document control

| Field | Value |
|--------|--------|
| **Author** | *[Your name]* |
| **Date** | *[YYYY-MM-DD]* |
| **Version** | 1.1 *(updated after sync with `origin/main`)* |

---

## 2. Purpose

Validate authentication behavior for the client dashboard: login, token verification, and (when implemented) registration and logout. Record results and file defects in the team bug tracker.

---

## 3. Scope

### In scope (Sprint One)

- Review backend auth API surface and frontend login behavior as implemented in this repository.
- API testing via Postman/Insomnia for documented endpoints.
- Manual UI testing for Login and Registration **when present**.
- Logout flow **when exposed in the UI** or per team definition (client-side token clear).
- Edge cases listed in `authentication-test-cases.csv`.

### Out of scope (unless team expands)

- Non-auth modules (dashboard business logic beyond “can access while authenticated”).
- Load/performance testing.
- Penetration testing (unless separately assigned).

---

## 4. Current repository reality (important)

Ground truth for **this folder** (`vistaone-api`, `vistaone-web`) after pulling latest `main`:

| Capability | Status |
|------------|--------|
| `POST /users/login` | Implemented; JSON `email`, `password`; validation errors **400**; bad creds **401**; rate limit **10/min** → **429**. |
| `GET /users/verify-token` | Implemented; requires `Authorization: Bearer <JWT>`; **revoked tokens** (after logout) return **401** via `jti` blacklist check. |
| `POST /users/logout` | Implemented; requires Bearer token; adds token `jti` to in-memory blacklist (`token_blacklist.py`). |
| User **registration** API | **Not present**—no `POST /users/register` (or equivalent) in blueprints. |
| **Registration** UI | **`Register.jsx`** exists (`vistaone-web/src/pages/Register.jsx`) with client-side validation and a **local success state only**—no API call yet. **`App.jsx` has no `/register` route**, so the page is not reachable via normal app navigation until a route is added. |
| **Logout** UI | **TopBar** (profile dropdown) and **SideBar** call `logout()` from `hooks/useAuth.js` (clears **`authToken`** in `localStorage`) and navigate to `/login`. |
| **Demo / fallback login** | If the backend returns **502** (proxy) or the request **errors** (network), `authServices.js` returns a **fake `demo-token`** and “success”—app can appear logged in **without a working API**. Treat as a dedicated test case / possible defect. |

**Swagger:** `vistaone-api/app/static/swagger.yaml` documents **login**, **verify-token**, and **logout**.  
**Frontend proxy:** Vite maps `/api/*` → `http://127.0.0.1:5000` (strip `/api` prefix).

**Note:** `AuthContext.jsx` defines an alternate `token` / `user` storage pattern but **`AuthProvider` is not wired in `App.jsx`**—the live login flow uses **`hooks/useAuth`** + **`authToken`**, consistent with `ProtectedRoute`.

**CSV status:** Registration **API** rows stay **Blocked** until an endpoint ships. Registration **UI** rows stay **Blocked** or **partial** until `/register` is routed (and optionally API wired). Logout **API** + **UI** rows should be **executable** on current `main`.

---

## 5. References

| Item | Location |
|------|----------|
| API routes | `vistaone-api/app/blueprints/controller/auth_routes.py` |
| OpenAPI-style spec | `vistaone-api/app/static/swagger.yaml` |
| Login UI | `vistaone-web/src/pages/Login.jsx` |
| Register UI (not routed) | `vistaone-web/src/pages/Register.jsx` |
| App routes | `vistaone-web/src/App.jsx` |
| Auth hook / `localStorage` key `authToken` | `vistaone-web/src/hooks/useAuth.js` |
| Login API client (incl. demo fallback) | `vistaone-web/src/services/authServices.js` |
| Shell + logout controls | `vistaone-web/src/components/AppShell.jsx`, `TopBar.jsx`, `SideBar.jsx` |
| Protected routes | `vistaone-web/src/routes/ProtectedRoute.jsx` |
| API tests (examples) | `vistaone-api/tests/test_controllers/test_auth_routes.py` |
| Issue template | `.github/ISSUE_TEMPLATE/sprint-story.md` |

---

## 6. Test environments

| Environment | API base (Postman) | Web app | Notes |
|-------------|-------------------|---------|--------|
| Local | `http://127.0.0.1:5000` | `http://localhost:5173` (Vite default) | Run Flask API + `npm run dev` in `vistaone-web`. |

**Postman tip:** Call the API on port **5000** directly (e.g. `POST /users/login`, `GET /users/verify-token`, `POST /users/logout` with `Authorization: Bearer <token>`). Browser calls may use `/api/users/...` on the Vite dev server.

---

## 7. Test approach

| Type | Tool / method |
|------|----------------|
| API | Postman or Insomnia; optional `python -m unittest discover -s tests` in `vistaone-api` |
| UI | Manual in Chrome (or team-required browsers) |
| Automated | Backend: `unittest` in repo; frontend: not configured in `package.json` at plan time |

---

## 8. Entry criteria

- [ ] API runs locally with valid DB/config (per team README or `.env`).
- [ ] At least one user exists (e.g. seeded or created per team process)—tests in repo use `test@email.com` / `test` with `TestingConfig`; **your** DB may differ.
- [ ] Web app runs and can reach API (proxy or CORS as configured).

---

## 9. Exit criteria

- [ ] All **executable** rows in `authentication-test-cases.csv` are run and logged (Pass/Fail/Blocked).
- [ ] **Blocked** rows have a short reason (e.g. “No registration endpoint”).
- [ ] Failures filed in **GitHub Issues** (or team tracker) with steps, expected, actual.
- [ ] Test log spreadsheet updated with dates and build/commit where possible.

---

## 10. Risks and assumptions

| Risk / assumption | Mitigation |
|-------------------|------------|
| Registration API/UI incomplete | API: blocked until shipped. UI: add `/register` route for QA or test `Register` via Storybook/temporary route. |
| Demo-token masks API failures | When testing real auth, ensure API is running; add cases for “backend down” behavior. |
| Rate limit during negative testing | Use separate minute window or throttle requests. |

---

## 11. Defect management

Each bug should include:

1. Steps to reproduce  
2. Expected result  
3. Actual result  
4. Environment (OS, browser, API URL, commit hash)


---

## 12. Execution log (paste or link)

| Date | Tester | Build / commit | Log location |
|------|--------|----------------|--------------|
| | | | *[spreadsheet URL or filename]* |

---

## 13. Summary (fill after execution)

- **Total cases (executable):**  
- **Passed / Failed / Blocked:**  
- **Open defects:** *[links]*  
- **Notes for Sprint Two:**  
