# Safe Arrival — Workspace AI Rules

Welcome, AI Agent. You are assisting in developing the **Safe Arrival** React Native / Expo application. To ensure consistency, efficiency, and robust memory, you MUST adhere to the following rules:

---

## 1. Documentation-First Approach
- Before performing any research, editing files, or writing code, you must read the project's documentation in the root and under `AI_Documentation/`.
- Start by checking the central dashboard: [Project Overview](file:///c:/Users/ULTRON/Documents/Safe_Arrival/AI_Documentation/Project_Overview.md).
- Cross-reference design constraints in [Design.md](file:///c:/Users/ULTRON/Documents/Safe_Arrival/AI_Documentation/Design.md) and deployment instructions in [CICD_Setup.md](file:///c:/Users/ULTRON/Documents/Safe_Arrival/AI_Documentation/CICD_Setup.md).

## 2. Memorization & Troubleshooting Logs
- Whenever you fix a bug, solve an issue, or add a major feature, you **MUST** document it.
- Append the issue details, error logs, root cause, and code solutions directly to [Troubleshooting & Common Issues](file:///c:/Users/ULTRON/Documents/Safe_Arrival/AI_Documentation/Troubleshooting_&_Common_Issues.md) or create a specific note inside `AI_Documentation/Troubleshooting/`.
- This ensures that you and future AI agents will instantly search and find the resolution if the same issue arises again.

## 2a. Mandatory Documentation Update (After Every Change)
- **During every work session**: after completing code changes (fix, feature, refactor, config update), you MUST automatically update the relevant `AI_Documentation/*.md` files before declaring done.
- **Scope**: at minimum check and update: `File_Inventory.md` (if files added/removed/renamed), `Database_Schema.md` (if DB nodes or fields changed), and `Troubleshooting_&_Common_Issues.md` (if a bug was fixed). If nothing changed in those areas, no update needed.
- **Rationale**: This guarantees `AI_Documentation/` always mirrors the live project state. Any future AI agent can read the docs and start coding immediately without re-reading every source file. Never skip this step.

## 3. Technology Stack & Coding Standards
- **Framework:** Expo (React Native) with Expo Router for navigation (e.g., folder-based routing in `app/`).
- **Styling:** Follow the styles, borders, and margins defined in [Design.md](file:///c:/Users/ULTRON/Documents/Safe_Arrival/AI_Documentation/Design.md). Maintain Light/Dark theme compatibility.
- **State Management:** Follow context patterns established in the `context/` directory.
- **Verification:** Always verify code for linting/type errors and ensure any new assets are added correctly.
