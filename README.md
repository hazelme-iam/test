# CarePoint Health Clinic — Patient Registration & Intake System

A modern, accessible outpatient clinic portal designed following Human-Computer Interaction (HCI) principles. The system connects patient account authentication, multi-step clinical intake, and consultation booking confirmation into a smooth, linear experience.

---

## Overview

The application provides patients with a reliable, structured way to sign up or log in, fill out clinical intake requirements step-by-step, and verify their details before booking an outpatient consultation.

### The 3 Connected Stages

```
[ 1. Authentication ] ──▶ [ 2. Information Stepper ] ──▶ [ 3. Review & Confirmation ]
```

---

## Stage Breakdown

### 1. Authentication (Sign In & Registration)
- **Account Sign In**: Allows registered patients to access their profile using their email and password.
- **New Account Registration**: Allows new patients to register with their full name, email, password, and optional HMO/insurance provider.
- **Seamless Transition**: Account details automatically carry over into the clinical intake form upon submission.

### 2. Information Form (Clinical Intake Stepper)
A guided multi-step form that breaks clinical data collection into logical, manageable sections:
- **Step 1: Personal & Contact Information**
  - Full name, email address, date of birth, and standard 11-digit Philippine mobile number (`09XX XXX XXXX`).
- **Step 2: Clinic & Consultation**
  - Department selection (e.g., Internal Medicine, Pediatrics, Cardiology, Dental, OB-GYN, Dermatology) and consultation reason.
- **Step 3: Medical History & Emergency Contacts**
  - Separate fields for emergency contact person's full name and Philippine mobile number.
  - Drug allergies, medical conditions, or health notes.
- **Non-Destructive Navigation**: Patients can navigate back and forth between steps without losing any previously entered data.

### 3. Review & Confirmation
- **Summary Review**: Presents a complete summary card of all entered personal, clinical, and emergency contact details for review.
- **Accessible Verification Dialog**: A confirmation modal displays essential booking details with clear action buttons (`Cancel` and `Confirm & Submit`).
- **Official Clinic Slip**: Upon confirmation, generates an official intake slip with a unique reference number (`#CP-2026-XXXX`), triage status, and clinic arrival instructions.

---

## Key HCI & Design Features

- **Single-Column Form Hierarchy**: Forms follow a clear single-column vertical path from top to bottom, minimizing cognitive load.
- **Immediate, Non-Punitive Error Feedback**: Clear inline error messages appear when required fields are missing or invalid, and automatically dismiss as the user corrects their input.
- **Philippine Mobile Number Formatting**: Automatic masking and strict validation for 11-digit Philippine mobile numbers starting with `09` (e.g., `09XX XXX XXXX`).
- **Dedicated Light & Dark Themes**: Dual-palette color system designed specifically for both light and dark environments, toggled via accessible SVG icons.
- **Clean Professional Aesthetic**: Strictly avoids emojis and visual distractions, maintaining a professional medical standard.

---

## Getting Started

Open `index.html` in any modern web browser:

```powershell
Start-Process "index.html"
```

No build step or external dependencies are required; the application runs entirely on vanilla HTML5, CSS3, and JavaScript.
