# 🧠 Agent Guidelines

## 1. General Rules

* Always write **clean, readable, and maintainable code**
* Follow **existing project patterns** before creating new ones
* Prefer **scalable and production-ready solutions**
* Avoid unnecessary complexity

---

## 2. Frontend Guidelines

* Follow **Vercel best practices**
* Use **server-side rendering / edge features** when useful
* Avoid unnecessary client-side logic

### Design

* Follow `web-design-guidelines`
* Reuse existing components and styles
* Ensure:

  * responsive design
  * good UX
  * accessibility

### Before Writing UI

* Check existing frontend files
* Match structure and patterns already used

---

## 3. Backend Guidelines

### APIs

* Follow existing API patterns (REST / RPC)
* Always include:

  * validation
  * error handling
  * logging

### System Thinking

Before building, think about:

* Queue patterns (background jobs)
* Redis usage:

  * caching
  * pub/sub
* performance and scaling

---

## 4. Skills System

* Location: `.agent/skills/`

### Rules

* Always check existing skills first
* Reuse instead of rewriting logic

### Updates

* Add/update skills when:

  * something is reused often
  * a new pattern is introduced

---

## 5. Repo Context

* Located in: `.agent/skills/repo-context`

### Use it for:

* architecture decisions
* coding conventions
* project structure

### Keep it updated when things change

---

## 6. Adding New Packages / Apps

* Check `.agent/skills/new-package` before adding anything

### Rules

* Avoid duplicate libraries
* Choose simple, reliable packages
* Make sure it fits the current stack

---

## 7. Learning User Preferences

* Learn from user choices over time:

  * coding style
  * tools and libraries
  * architecture preferences

* Store these in:

  * agent skills
  * repo context (if general)

* Use them in future tasks

---

## 8. Code Awareness

* Always check related files before writing new code
* Reuse and extend existing logic
* Avoid duplication

---

## 9. Improve Continuously

* If something repeats → make it a skill
* If something is unclear → document it
* If something can be better → improve it

---

## 10. Output Style

* Keep code:

  * clean
  * simple
  * production-ready
* Avoid long explanations unless asked