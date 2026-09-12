# Connected HCI Flow: Auth Form ➔ Workspace Stepper ➔ Confirmation

This project implements a connected onboarding flow following strict Human-Computer Interaction (HCI) standards, accessible markup, and comprehensive error handling.

## The 3-Phase Connected Workflow

```
[ Phase 1: Auth Form ] ──▶ [ Phase 2: Stepper Multi-Form ] ──▶ [ Phase 3: Confirmation Dialog ]
```

1. **Phase 1: Single-Column Auth Form (`Create account`)**
   - Single-column vertical layout: `Full name`, `Work email`, and `Company (optional)`.
   - **Error Handling**: Missing name or malformed email highlights fields with red borders (`#B42318`) and displays inline `.error` text. Focus automatically jumps to the first invalid field.
   - **Dynamic Recovery**: Errors dismiss automatically in real-time as the user types valid information.
   - **Advance to Stepper**: On valid submission, shows the green `.ok` confirmation banner (`"Account details look good — ready to continue."`) and activates `"Continue to Join Workspace →"`.

2. **Phase 2: Stepper Multi-Form (`Join workspace`)**
   - Automatically pre-populates the user's name and email from Phase 1.
   - **Step 1 of 3 (Account)**: Review/edit name and email with validation before proceeding. Includes a `"Back to Auth"` button to return to Phase 1 without data loss.
   - **Step 2 of 3 (Team details)**: Validates `Team name` (2+ characters) and `Your role` (Placeholder: `e.g. Designer`). Provides `"Back"` button to return to Step 1.
   - **Step 3 of 3 (Review & Submit)**: Summary review card displaying all entered details (Name, Email, Company, Team, Role). Clicking `"Submit"` triggers Phase 3.

3. **Phase 3: Confirmation Dialog (Modal)**
   - Displays modal backdrop with explicit verbs (`Confirm` and `Cancel`), eliminating ambiguous "OK" buttons.
   - Headings: `Confirm “Q3 roadmap”?`, `Selected: Q3 roadmap`.
   - Clicking `"Cancel"` closes the dialog and keeps the user on Step 3 of the stepper so they can edit.
   - Clicking `"Confirm"` completes the onboarding, marking all tracker nodes complete and showing the final setup card.

---

## Interactive Testing Toolbar

At the top of `index.html`, you will find dedicated test controls:
- **"Trigger Errors"**: Instantly inputs invalid data and submits, letting you observe all validation and error states immediately.
- **"Simulate Server-Side Error"**: A checkbox toggle that simulates server rejections (e.g. "Email already registered" or "Network timeout"), demonstrating graceful server error recovery.
- **"Fill Valid Data"**: Automatically pre-fills valid information to speed through end-to-end testing.
- **"Reset Flow"**: Restores everything to the initial clean state.

---

## Running the Application

Open `index.html` in any browser:
```powershell
Start-Process "c:\Users\User\OneDrive\Desktop\ui\index.html"
```
