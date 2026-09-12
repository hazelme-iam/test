// ==========================================================================
// CarePoint Health Clinic: Patient Portal Controller
// Single-column forms, explicit labels, Philippine phone validation, zero emojis
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const ACCOUNTS_KEY = 'carepoint_registered_patients';

  function getAccounts() {
    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        fullname: 'Maria Santos',
        email: 'maria.santos@carepoint.ph',
        password: 'patient123',
        company: 'Maxicare HMO'
      }
    ];
  }

  function saveAccount(acc) {
    const list = getAccounts();
    list.push(acc);
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // Application State
  const state = {
    currentPhase: 1, // 1: Auth, 2: Stepper, 3: Review/Confirmation, 4: Done
    stepperStep: 1,   // 1, 2, 3
    authMode: 'signin', // 'signin' or 'register'
    data: {
      fullname: '',
      email: '',
      company: '',
      phone: '',
      dob: '',
      dept: '',
      reason: '',
      shift: '',
      hmo: '',
      emergencyName: '',
      emergencyPhone: '',
      allergies: ''
    }
  };

  // DOM Elements: Stages
  const stageAuth = document.getElementById('stage-auth');
  const stageStepper = document.getElementById('stage-stepper');
  const stageConfirmation = document.getElementById('stage-confirmation');
  const finalCard = document.getElementById('final-card');

  // DOM Elements: Phase 1 (Auth)
  const tabSignin = document.getElementById('tab-signin');
  const tabRegister = document.getElementById('tab-register');
  const formSignin = document.getElementById('form-signin');
  const formRegister = document.getElementById('form-register');
  const linkGoRegister = document.getElementById('link-go-register');
  const linkGoSignin = document.getElementById('link-go-signin');

  const signinEmail = document.getElementById('signin-email');
  const signinPassword = document.getElementById('signin-password');
  const signinError = document.getElementById('signin-error');

  const regFullname = document.getElementById('reg-fullname');
  const regEmail = document.getElementById('reg-email');
  const regPassword = document.getElementById('reg-password');
  const regCompany = document.getElementById('reg-company');
  const regError = document.getElementById('register-error');
  const regOk = document.getElementById('reg-ok');

  // DOM Elements: Phase 2 (Stepper)
  const stepperCard = document.getElementById('stepper-card');
  const stepperStepLabel = document.getElementById('stepper-step-label');
  const bar1 = document.getElementById('bar-1');
  const bar2 = document.getElementById('bar-2');
  const bar3 = document.getElementById('bar-3');

  const panel1 = document.getElementById('stepper-panel-1');
  const panel2 = document.getElementById('stepper-panel-2');
  const panel3 = document.getElementById('stepper-panel-3');

  const stepName = document.getElementById('step-name');
  const stepEmail = document.getElementById('step-email');
  const stepPhone = document.getElementById('step-phone');
  const stepDob = document.getElementById('step-dob');

  const stepDept = document.getElementById('step-dept');
  const stepReason = document.getElementById('step-reason');
  const stepShift = document.getElementById('step-shift');
  const stepHmo = document.getElementById('step-hmo');

  const stepEmergencyName = document.getElementById('step-emergency-name');
  const stepEmergencyPhone = document.getElementById('step-emergency-phone');
  const stepAllergies = document.getElementById('step-allergies');

  const btnStepperBackToAuth = document.getElementById('btn-stepper-back-to-auth');
  const btnStep1Next = document.getElementById('btn-step-1-next');
  const btnStep2Back = document.getElementById('btn-step-2-back');
  const btnStep2Next = document.getElementById('btn-step-2-next');
  const btnStep3Back = document.getElementById('btn-step-3-back');
  const btnStep3Next = document.getElementById('btn-step-3-next');

  // DOM Elements: Phase 3 (Review & Modal)
  const revName = document.getElementById('rev-name');
  const revEmail = document.getElementById('rev-email');
  const revPhone = document.getElementById('rev-phone');
  const revDob = document.getElementById('rev-dob');
  const revDept = document.getElementById('rev-dept');
  const revReason = document.getElementById('rev-reason');
  const revShift = document.getElementById('rev-shift');
  const revHmo = document.getElementById('rev-hmo');
  const revEmergencyName = document.getElementById('rev-emergency-name');
  const revEmergencyPhone = document.getElementById('rev-emergency-phone');
  const revAllergies = document.getElementById('rev-allergies');

  const btnConfBack = document.getElementById('btn-conf-back');
  const btnConfOpenModal = document.getElementById('btn-conf-open-modal');

  const confirmBackdrop = document.getElementById('confirm-backdrop');
  const dialogCancel = document.getElementById('dialog-cancel');
  const dialogConfirm = document.getElementById('dialog-confirm');
  const modalPatientName = document.getElementById('modal-patient-name');
  const modalDeptName = document.getElementById('modal-dept-name');
  const modalReasonName = document.getElementById('modal-reason-name');
  const modalShiftName = document.getElementById('modal-shift-name');

  // DOM Elements: Final Card
  const slipRefCode = document.getElementById('slip-ref-code');
  const slipPatient = document.getElementById('slip-patient');
  const slipContact = document.getElementById('slip-contact');
  const slipDept = document.getElementById('slip-dept');
  const slipReason = document.getElementById('slip-reason');
  const slipShift = document.getElementById('slip-shift');
  const btnNewPatient = document.getElementById('btn-new-patient');

  let lastFocusedElement = null;

  // Set today as the maximum date for DOB picker
  if (stepDob) {
    const today = new Date().toISOString().split('T')[0];
    stepDob.setAttribute('max', today);
  }

  // ========================================================================
  // Philippine Phone Validation & Formatting Helpers
  // Standard format: 09XXXXXXXXX (strictly 11 digits, starting with 09)
  // ========================================================================
  function isPHMobileValid(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return /^09\d{9}$/.test(digits);
  }

  function formatPHMobile(phone) {
    let digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('639') && digits.length === 12) {
      digits = '0' + digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('09')) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return phone;
  }

  function isEmergencyContactValid(val) {
    const text = val.trim();
    if (text.length < 5) return false;
    const hasLetters = /[a-zA-Z]{2,}/.test(text);
    const cleanDigits = text.replace(/\D/g, '');
    const hasPhone = /09\d{9}/.test(cleanDigits);
    return hasLetters && hasPhone;
  }

  function isDOBValid(dobStr) {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    const now = new Date();
    if (isNaN(dob.getTime())) return false;
    const ageYears = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
    return dob < now && ageYears <= 125 && ageYears >= 0;
  }

  // ========================================================================
  // Navigation & Phase Transitions
  // ========================================================================
  function setPhase(phase) {
    state.currentPhase = phase;

    stageAuth.classList.toggle('active', phase === 1);
    stageStepper.classList.toggle('active', phase === 2);
    stageConfirmation.classList.toggle('active', phase === 3);
    finalCard.classList.toggle('show', phase === 4);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setStepperStep(step) {
    state.stepperStep = step;

    panel1.classList.toggle('active', step === 1);
    panel2.classList.toggle('active', step === 2);
    panel3.classList.toggle('active', step === 3);

    bar1.classList.toggle('on', step >= 1);
    bar2.classList.toggle('on', step >= 2);
    bar3.classList.toggle('on', step >= 3);

    const stepTitles = [
      "Step 1 of 3 · Personal & Contact",
      "Step 2 of 3 · Clinic & Consultation",
      "Step 3 of 3 · Medical History & Emergency"
    ];
    stepperStepLabel.textContent = stepTitles[step - 1];

    // Focus active step's first input
    setTimeout(() => {
      const activePanel = stepperCard.querySelector('.panel.active');
      const firstInput = activePanel?.querySelector('input, select');
      firstInput?.focus();
    }, 50);
  }

  // ========================================================================
  // Validation Utilities (HCI: Immediate, Non-Punitive Feedback)
  // ========================================================================
  function validateField(inputEl, testFn) {
    const wrapper = inputEl.closest('.field');
    const isValid = testFn(inputEl.value.trim());
    if (!isValid) {
      wrapper.classList.add('invalid');
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      wrapper.classList.remove('invalid');
      inputEl.removeAttribute('aria-invalid');
    }
    return isValid;
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Real-time error clearance
  const allInputs = [
    signinEmail, signinPassword,
    regFullname, regEmail, regPassword, regCompany,
    stepName, stepEmail, stepPhone, stepDob,
    stepDept, stepReason, stepShift, stepHmo,
    stepEmergencyName, stepEmergencyPhone, stepAllergies
  ];

  allInputs.forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      const wrapper = inp.closest('.field');
      if (wrapper) wrapper.classList.remove('invalid');
      signinError?.classList.remove('show');
      regError?.classList.remove('show');
    });
  });

  // Strictly limit to 11 numbers and auto-format as 09XX XXX XXXX
  function attachPhoneFormatter(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      let digits = inputEl.value.replace(/\D/g, '');
      // If international 639 was pasted, convert to 09
      if (digits.startsWith('639') && digits.length >= 12) {
        digits = '0' + digits.slice(2);
      }
      // Limit to strictly 11 digits
      if (digits.length > 11) {
        digits = digits.slice(0, 11);
      }
      // Format into 09XX XXX XXXX mask
      if (digits.length > 7) {
        inputEl.value = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else if (digits.length > 4) {
        inputEl.value = `${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else {
        inputEl.value = digits;
      }
    });

    // Re-verify on blur
    inputEl.addEventListener('blur', () => {
      if (isPHMobileValid(inputEl.value)) {
        inputEl.value = formatPHMobile(inputEl.value);
      }
    });
  }

  attachPhoneFormatter(stepPhone);
  attachPhoneFormatter(stepEmergencyPhone);

  // ========================================================================
  // Phase 1: Authentication Logic (Sign In vs Register Toggle)
  // ========================================================================
  function setAuthMode(mode) {
    state.authMode = mode;
    const isSignin = mode === 'signin';

    tabSignin.classList.toggle('active', isSignin);
    tabRegister.classList.toggle('active', !isSignin);
    tabSignin.setAttribute('aria-selected', isSignin ? 'true' : 'false');
    tabRegister.setAttribute('aria-selected', !isSignin ? 'true' : 'false');

    formSignin.classList.toggle('active', isSignin);
    formRegister.classList.toggle('active', !isSignin);

    signinError.classList.remove('show');
    regError.classList.remove('show');
    regOk.classList.remove('show');

    if (isSignin) {
      signinEmail.focus();
    } else {
      regFullname.focus();
    }
  }

  tabSignin.addEventListener('click', () => setAuthMode('signin'));
  tabRegister.addEventListener('click', () => setAuthMode('register'));
  linkGoRegister.addEventListener('click', () => setAuthMode('register'));
  linkGoSignin.addEventListener('click', () => setAuthMode('signin'));

  // 1A: Sign In Submission
  formSignin.addEventListener('submit', (e) => {
    e.preventDefault();
    signinError.classList.remove('show');

    const validEmail = validateField(signinEmail, val => isEmailValid(val));
    const validPassword = validateField(signinPassword, val => val.length > 0);

    if (!validEmail || !validPassword) {
      formSignin.querySelector('.field.invalid input')?.focus();
      return;
    }

    const emailVal = signinEmail.value.trim().toLowerCase();
    const passVal = signinPassword.value;

    const accounts = getAccounts();
    const matched = accounts.find(a => a.email.toLowerCase() === emailVal && a.password === passVal);

    if (!matched) {
      signinError.textContent = "Invalid email or password. Please check your credentials or register.";
      signinError.classList.add('show');
      signinPassword.closest('.field').classList.add('invalid');
      signinPassword.focus();
      return;
    }

    // Success login! Load patient data
    state.data.fullname = matched.fullname;
    state.data.email = matched.email;
    state.data.company = matched.company || '';

    // Populate Stepper fields
    stepName.value = state.data.fullname;
    stepEmail.value = state.data.email;
    if (state.data.company && !stepHmo.value) {
      stepHmo.value = state.data.company;
    }

    // Advance to Stepper
    setPhase(2);
    setStepperStep(1);
  });

  // 1B: Registration Submission
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    regError.classList.remove('show');
    regOk.classList.remove('show');

    const validName = validateField(regFullname, val => val.length >= 2);
    const validEmail = validateField(regEmail, val => isEmailValid(val));
    const validPassword = validateField(regPassword, val => val.length >= 6);

    if (!validName || !validEmail || !validPassword) {
      formRegister.querySelector('.field.invalid input')?.focus();
      return;
    }

    const emailVal = regEmail.value.trim().toLowerCase();
    const accounts = getAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === emailVal);

    if (existing) {
      regError.textContent = "A patient account with this email already exists. Please sign in.";
      regError.classList.add('show');
      regEmail.closest('.field').classList.add('invalid');
      regEmail.focus();
      return;
    }

    // Register account
    const newAcc = {
      fullname: regFullname.value.trim(),
      email: regEmail.value.trim(),
      password: regPassword.value,
      company: regCompany.value.trim()
    };
    saveAccount(newAcc);

    state.data.fullname = newAcc.fullname;
    state.data.email = newAcc.email;
    state.data.company = newAcc.company;

    // Show success feedback
    regOk.textContent = "Account details look good — ready to continue.";
    regOk.classList.add('show');

    // Prepopulate Phase 2 Stepper fields
    stepName.value = state.data.fullname;
    stepEmail.value = state.data.email;
    stepHmo.value = state.data.company;

    // Smooth transition to Stepper
    setTimeout(() => {
      setPhase(2);
      setStepperStep(1);
    }, 700);
  });

  // ========================================================================
  // Phase 2: Information Form (Stepper Multi-Form)
  // ========================================================================
  btnStepperBackToAuth.addEventListener('click', () => {
    setPhase(1);
    setAuthMode('signin');
  });

  // Step 1 -> Step 2
  btnStep1Next.addEventListener('click', () => {
    const validName = validateField(stepName, val => val.length >= 2);
    const validEmail = validateField(stepEmail, val => isEmailValid(val));
    const validPhone = validateField(stepPhone, val => isPHMobileValid(val));
    const validDob = validateField(stepDob, val => isDOBValid(val));

    if (validName && validEmail && validPhone && validDob) {
      state.data.fullname = stepName.value.trim();
      state.data.email = stepEmail.value.trim();
      state.data.phone = formatPHMobile(stepPhone.value.trim());
      state.data.dob = stepDob.value;

      setStepperStep(2);
    } else {
      stepperCard.querySelector('.panel.active .field.invalid input')?.focus();
    }
  });

  // Step 2 -> Step 1
  btnStep2Back.addEventListener('click', () => {
    setStepperStep(1);
  });

  // Step 2 -> Step 3
  btnStep2Next.addEventListener('click', () => {
    const validDept = validateField(stepDept, val => val.length > 0);
    const validReason = validateField(stepReason, val => val.length > 0);

    if (validDept && validReason) {
      state.data.dept = stepDept.value;
      state.data.reason = stepReason.value;
      state.data.shift = stepShift.value;
      state.data.hmo = stepHmo.value.trim() || 'Self-Pay / Cash';

      setStepperStep(3);
    } else {
      stepperCard.querySelector('.panel.active .field.invalid select, .panel.active .field.invalid input')?.focus();
    }
  });

  // Step 3 -> Step 2
  btnStep3Back.addEventListener('click', () => {
    setStepperStep(2);
  });

  // Step 3 -> Phase 3 (Review & Confirmation)
  btnStep3Next.addEventListener('click', () => {
    const validEmergName = validateField(stepEmergencyName, val => val.length >= 2);
    const validEmergPhone = validateField(stepEmergencyPhone, val => isPHMobileValid(val));
    const validAllergies = validateField(stepAllergies, val => val.length >= 2);

    if (validEmergName && validEmergPhone && validAllergies) {
      state.data.emergencyName = stepEmergencyName.value.trim();
      state.data.emergencyPhone = formatPHMobile(stepEmergencyPhone.value.trim());
      state.data.allergies = stepAllergies.value.trim();

      // Populate Summary Review in Phase 3
      revName.textContent = state.data.fullname;
      revEmail.textContent = state.data.email;
      revPhone.textContent = state.data.phone;
      revDob.textContent = state.data.dob;

      revDept.textContent = state.data.dept;
      revReason.textContent = state.data.reason;
      revShift.textContent = state.data.shift;
      revHmo.textContent = state.data.hmo;

      revEmergencyName.textContent = state.data.emergencyName;
      revEmergencyPhone.textContent = state.data.emergencyPhone;
      revAllergies.textContent = state.data.allergies;

      setPhase(3);
    } else {
      stepperCard.querySelector('.panel.active .field.invalid input')?.focus();
    }
  });

  // ========================================================================
  // Phase 3: Review, Confirmation & Modal
  // ========================================================================
  btnConfBack.addEventListener('click', () => {
    setPhase(2);
    setStepperStep(3);
  });

  function openConfirmationDialog() {
    lastFocusedElement = document.activeElement;

    modalPatientName.textContent = state.data.fullname;
    modalDeptName.textContent = state.data.dept;
    modalReasonName.textContent = state.data.reason;
    modalShiftName.textContent = state.data.shift;

    confirmBackdrop.classList.add('open');
    confirmBackdrop.setAttribute('aria-hidden', 'false');
    dialogConfirm.focus();
    document.addEventListener('keydown', handleModalKeys);
  }

  function closeConfirmationDialog() {
    confirmBackdrop.classList.remove('open');
    confirmBackdrop.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleModalKeys);
    lastFocusedElement?.focus();
  }

  function handleModalKeys(e) {
    if (e.key === 'Escape') {
      closeConfirmationDialog();
    }
    // Keyboard Focus Trap
    if (e.key === 'Tab') {
      const focusable = [dialogCancel, dialogConfirm];
      if (e.shiftKey && document.activeElement === focusable[0]) {
        focusable[1].focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === focusable[1]) {
        focusable[0].focus();
        e.preventDefault();
      }
    }
  }

  btnConfOpenModal.addEventListener('click', openConfirmationDialog);
  dialogCancel.addEventListener('click', closeConfirmationDialog);

  confirmBackdrop.addEventListener('click', (e) => {
    if (e.target === confirmBackdrop) {
      closeConfirmationDialog();
    }
  });

  // Final Confirmation Submit
  dialogConfirm.addEventListener('click', () => {
    closeConfirmationDialog();

    // Generate unique clinical reference code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const refCode = `#CP-2026-${randomCode}`;

    slipRefCode.textContent = refCode;
    slipPatient.textContent = state.data.fullname;
    slipContact.textContent = `${state.data.email} · ${state.data.phone}`;
    slipDept.textContent = state.data.dept;
    slipReason.textContent = state.data.reason;
    slipShift.textContent = state.data.shift;

    // Advance to Final Completion State
    setPhase(4);
  });

  // Reset / Register Another Patient
  btnNewPatient.addEventListener('click', () => {
    formRegister.reset();
    formSignin.reset();
    stepPhone.value = '';
    stepDob.value = '';
    stepDept.value = '';
    stepReason.value = '';
    stepShift.value = 'Morning Shift (8:00 AM - 12:00 PM)';
    stepHmo.value = '';
    stepEmergencyName.value = '';
    stepEmergencyPhone.value = '';
    stepAllergies.value = '';

    document.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));

    setPhase(1);
    setAuthMode('signin');
  });

  // ========================================================================
  // Theme Manager: Dedicated Light & Dark Palettes (Not simple inversion)
  // ========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const btnDemoLight = document.getElementById('btn-demo-light');
  const btnDemoDark = document.getElementById('btn-demo-dark');
  const THEME_KEY = 'carepoint_portal_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    if (themeToggleBtn) {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      themeToggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      themeToggleBtn.setAttribute('title', `Switch to ${nextTheme} mode`);
    }
  }

  // Load saved theme or system preference
  let initialTheme = 'light';
  try {
    initialTheme = localStorage.getItem(THEME_KEY) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) {}
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  if (btnDemoLight) {
    btnDemoLight.addEventListener('click', () => applyTheme('light'));
  }
  if (btnDemoDark) {
    btnDemoDark.addEventListener('click', () => applyTheme('dark'));
  }
});
