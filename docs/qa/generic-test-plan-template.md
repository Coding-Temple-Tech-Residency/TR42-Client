# Test Plan Template

Replace bracketed placeholders with project-specific values.

---

## 1. Document control

| Field | Value |
|--------|--------|
| **Project** | [Project name] |
| **Sprint / release** | [e.g. Sprint 3, v1.2.0] |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Version** | [1.0] |

---

## 2. Purpose

[Briefly state why this test effort exists—for example: validate new features, regression before release, compliance with acceptance criteria.]

---

## 3. Scope

### In scope

- [Feature or area 1]
- [Feature or area 2]

### Out of scope

- [Explicit exclusions—e.g. third-party billing, mobile apps]

---

## 4. References

| Item | Location / link |
|------|-------------------|
| Repository | [URL] |
| API documentation | [Swagger / OpenAPI URL or path] |
| Design / wireframes | [Figma / PDF link] |
| User stories / tickets | [Jira / GitHub Project link] |
| Environment config | [README section or Confluence] |

---

## 5. Test environments

| Environment | Base URL (API) | Base URL (Web) | Browser(s) | Notes |
|-------------|----------------|----------------|------------|--------|
| Local | [e.g. http://127.0.0.1:5000] | [e.g. http://localhost:5173] | [Chrome, Safari, …] | [venv, Node version] |
| Staging | [ ] | [ ] | [ ] | [ ] |

---

## 6. Test approach

| Type | Description | Owner / tool |
|------|-------------|--------------|
| API | Request/response validation (Postman, Insomnia, automated tests) | [ ] |
| UI / manual | User flows in browser | [ ] |
| Automated (unit/integration) | [Framework: pytest, Vitest, Cypress, …] | [ ] |
| Regression | [Subset of full suite when applicable] | [ ] |

---

## 7. Entry criteria

Testing may start when:

- [ ] Build is available in the target environment.
- [ ] [Critical dependency—e.g. database migrated, feature flag on.]

---

## 8. Exit criteria

This test cycle is complete when:

- [ ] All **in-scope** tests for the sprint are executed or explicitly **blocked** with a reason.
- [ ] Critical / high defects are fixed or accepted with documented risk.
- [ ] Results are recorded in the test log / spreadsheet.

---

## 9. Risks and assumptions

| Risk / assumption | Mitigation |
|-------------------|------------|
| [e.g. No test data for role X] | [e.g. Request seed script from dev] |
| [ ] | [ ] |

---

## 10. Defect management

- **Tracker:** [GitHub Issues / Jira / …]
- **Required fields per bug:** steps to reproduce, expected result, actual result, environment (browser, OS, build/commit).

---

## 11. Schedule (optional)

| Milestone | Target date |
|-----------|-------------|
| Test plan review | [ ] |
| Test execution start | [ ] |
| Test execution complete | [ ] |

---

## 12. Sign-off (optional)

| Role | Name | Date |
|------|------|------|
| QA | | |
| Product / mentor | | |
