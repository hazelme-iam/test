// ==========================================================================
// Connected HCI Flow Controller: Auth ➔ Stepper ➔ Confirmation
// Manages real-time error handling, data flow, navigation, and modal logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    currentPhase: 1, // 1: Auth, 2: Stepper, 3: Completed
    stepperStep: 1,   // 1, 2, 3
    data: {
      fullname: '',
      email: '',
      company: '',
      team: '',
      role: ''
    }
  };

  // Cache DOM elements
  // Phase 1 (Auth)
  const stageAuth = document.getElementById('stage-auth');
  const authForm = document.getElementById('auth-form');
  const authFullname = document.getElementById('auth-fullname');
  const authEmail = document.getElementById('auth-email');
  const authCompany = document.getElementById('auth-company');
  const authOk = document.getElementById('auth-ok');
  const authServerError = document.getElementById('auth-server-error');
  const btnProceedStepper = document.getElementById('btn-proceed-stepper');

  // Phase 2 (Stepper)
  const stageStepper = document.getElementById('stage-stepper');
  const stepperCard = document.getElementById('stepper-card');
  const stepperStepLabel = document.getElementById('stepper-step-label');
  const stepperServerError = document.getElementById('stepper-server-error');
  const stepperOk = document.getElementById('stepper-ok');

  const stepName = document.getElementById('step-name');
  const stepEmail = document.getElementById('step-email');
  const stepTeam = document.getElementById('step-team');
  const stepRole = document.getElementById('step-role');

  const panel1 = document.getElementById('stepper-panel-1');
  const panel2 = document.getElementById('stepper-panel-2');
  const panel3 = document.getElementById('stepper-panel-3');

  const bar1 = document.getElementById('bar-1');
  const bar2 = document.getElementById('bar-2');
  const bar3 = document.getElementById('bar-3');

  const btnStepperBackToAuth = document.getElementById('btn-stepper-back-to-auth');
  const btnStep1Next = document.getElementById('btn-step-1-next');
  const btnStep2Back = document.getElementById('btn-step-2-back');
  const btnStep2Next = document.getElementById('btn-step-2-next');
  const btnStep3Back = document.getElementById('btn-step-3-back');
  const btnStep3Submit = document.getElementById('btn-step-3-submit');

  // Review Elements
  const revName = document.getElementById('rev-name');
  const revEmail = document.getElementById('rev-email');
  const revCompany = document.getElementById('rev-company');
  const revTeam = document.getElementById('rev-team');
  const revRole = document.getElementById('rev-role');

  // Phase 3 (Confirmation Modal)
  const confirmBackdrop = document.getElementById('confirm-backdrop');
  const dialogCancel = document.getElementById('dialog-cancel');
  const dialogConfirm = document.getElementById('dialog-confirm');
  const dialogErrorMsg = document.getElementById('dialog-error-msg');

  // Final Card
  const finalCard = document.getElementById('final-card');
  const finalAccount = document.getElementById('final-account');
  const finalTeam = document.getElementById('final-team');
  const btnRestartFlow = document.getElementById('btn-restart-flow');

  // Tracker Nodes
  const node1 = document.getElementById('node-1');
  const node2 = document.getElementById('node-2');
  const node3 = document.getElementById('node-3');

  // Testing Toolbar
  const simServerError = document.getElementById('sim-server-error');
  const btnFillValid = document.getElementById('btn-fill-valid');
  const btnFillInvalid = document.getElementById('btn-fill-invalid');
  const btnResetFlow = document.getElementById('btn-reset-flow');

  let lastFocusedElement = null;

  // ========================================================================
  // Navigation & Tracker Helpers
  // ========================================================================
  function setPhase(phase) {
    state.currentPhase = phase;

    stageAuth.classList.toggle('active', phase === 1);
    stageStepper.classList.toggle('active', phase === 2);
    finalCard.classList.toggle('show', phase === 3);

    // Update Tracker Nodes
    if (phase === 1) {
      node1.className = 'tracker-node active';
      node2.className = 'tracker-node';
      node3.className = 'tracker-node';
    } else if (phase === 2) {
      node1.className = 'tracker-node done';
      node2.className = 'tracker-node active';
      node3.className = 'tracker-node';
    } else if (phase === 3) {
      node1.className = 'tracker-node done';
      node2.className = 'tracker-node done';
      node3.className = 'tracker-node done';
    }
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
      "Step 1 of 3 · Account",
      "Step 2 of 3 · Team details",
      "Step 3 of 3 · Review & Submit"
    ];
    stepperStepLabel.textContent = stepTitles[step - 1];

    if (step === 3) {
      // Sync review data
      revName.textContent = state.data.fullname || stepName.value.trim() || '—';
      revEmail.textContent = state.data.email || stepEmail.value.trim() || '—';
      revCompany.textContent = state.data.company || 'None specified';
      revTeam.textContent = state.data.team || stepTeam.value.trim() || '—';
      revRole.textContent = state.data.role || stepRole.value.trim() || '—';
    }

    // Auto-focus active input
    const activeInput = stepperCard.querySelector('.panel.active input');
    if (activeInput) {
      setTimeout(() => activeInput.focus(), 50);
    }
  }

  // ========================================================================
  // Validation Utilities (HCI: Immediate, non-punitive feedback)
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

  // Bind real-time input error clearing for all fields
  const allInputs = [authFullname, authEmail, authCompany, stepName, stepEmail, stepTeam, stepRole];
  allInputs.forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      const wrapper = input.closest('.field');
      if (wrapper) wrapper.classList.remove('invalid');
      authServerError.classList.remove('show');
      stepperServerError.classList.remove('show');
      dialogErrorMsg.style.display = 'none';
      authOk.classList.remove('show');
      btnProceedStepper.classList.remove('show');
    });
  });

  // ========================================================================
  // Phase 1: Auth Form Execution
  // ========================================================================
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authServerError.classList.remove('show');

    const validName = validateField(authFullname, val => val.length >= 2);
    const validEmail = validateField(authEmail, val => isEmailValid(val));

    if (!validName || !validEmail) {
      authOk.classList.remove('show');
      btnProceedStepper.classList.remove('show');
      // HCI: Focus first invalid field
      authForm.querySelector('.field.invalid input')?.focus();
      return;
    }

    // Check for simulated server-side failure
    if (simServerError.checked) {
      authServerError.textContent = "Server Error: Email address already registered in this organization. Please use another.";
      authServerError.classList.add('show');
      authOk.classList.remove('show');
      btnProceedStepper.classList.remove('show');
      authEmail.closest('.field').classList.add('invalid');
      authEmail.focus();
      return;
    }

    // Save state
    state.data.fullname = authFullname.value.trim();
    state.data.email = authEmail.value.trim();
    state.data.company = authCompany.value.trim();

    // Show success feedback
    authOk.textContent = "Account details look good — ready to continue.";
    authOk.classList.add('show');
    btnProceedStepper.classList.add('show');

    // Prepopulate Phase 2 Stepper fields
    stepName.value = state.data.fullname;
    stepEmail.value = state.data.email;
  });

  btnProceedStepper.addEventListener('click', () => {
    setPhase(2);
    setStepperStep(1);
  });

  // ========================================================================
  // Phase 2: Stepper (Multi-Form) Execution
  // ========================================================================
  btnStepperBackToAuth.addEventListener('click', () => {
    // Non-destructive backward step to Auth Form
    setPhase(1);
    authFullname.focus();
  });

  btnStep1Next.addEventListener('click', () => {
    const validName = validateField(stepName, val => val.length >= 2);
    const validEmail = validateField(stepEmail, val => isEmailValid(val));

    if (validName && validEmail) {
      state.data.fullname = stepName.value.trim();
      state.data.email = stepEmail.value.trim();
      setStepperStep(2);
    } else {
      stepperCard.querySelector('.panel.active .field.invalid input')?.focus();
    }
  });

  btnStep2Back.addEventListener('click', () => {
    setStepperStep(1);
  });

  btnStep2Next.addEventListener('click', () => {
    const validTeam = validateField(stepTeam, val => val.length >= 2);
    const validRole = validateField(stepRole, val => val.length >= 1);

    if (validTeam && validRole) {
      state.data.team = stepTeam.value.trim();
      state.data.role = stepRole.value.trim();
      setStepperStep(3);
    } else {
      stepperCard.querySelector('.panel.active .field.invalid input')?.focus();
    }
  });

  btnStep3Back.addEventListener('click', () => {
    setStepperStep(2);
    stepperOk.classList.remove('show');
  });

  // Submit on Step 3 triggers Phase 3 Confirmation Dialog
  btnStep3Submit.addEventListener('click', () => {
    openConfirmationDialog();
  });

  // ========================================================================
  // Phase 3: Confirmation Dialog Execution
  // ========================================================================
  function openConfirmationDialog() {
    lastFocusedElement = document.activeElement;
    dialogErrorMsg.style.display = 'none';
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
    // Simple Tab Trap
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

  dialogCancel.addEventListener('click', () => {
    closeConfirmationDialog();
  });

  dialogConfirm.addEventListener('click', () => {
    // Check for simulated server-side error during confirmation
    if (simServerError.checked) {
      dialogErrorMsg.textContent = "Server Error: Unable to provision workspace. Please retry.";
      dialogErrorMsg.style.display = 'block';
      dialogConfirm.focus();
      return;
    }

    // Success!
    closeConfirmationDialog();

    // Populate final details
    finalAccount.textContent = `${state.data.fullname} (${state.data.email})`;
    finalTeam.textContent = `${state.data.team} · ${state.data.role}`;

    // Switch to Final Card & Done State
    setPhase(3);
  });

  // Close when clicking outside dialog box
  confirmBackdrop.addEventListener('click', (e) => {
    if (e.target === confirmBackdrop) {
      closeConfirmationDialog();
    }
  });

  btnRestartFlow.addEventListener('click', resetEntireFlow);

  // ========================================================================
  // Test Controls: Fill Valid / Fill Invalid / Reset
  // ========================================================================
  btnFillValid.addEventListener('click', () => {
    authFullname.value = "Alex Morgan";
    authEmail.value = "alex.morgan@designco.com";
    authCompany.value = "DesignCo Inc.";

    stepName.value = "Alex Morgan";
    stepEmail.value = "alex.morgan@designco.com";
    stepTeam.value = "Product Experience Team";
    stepRole.value = "Lead Product Designer";

    state.data = {
      fullname: "Alex Morgan",
      email: "alex.morgan@designco.com",
      company: "DesignCo Inc.",
      team: "Product Experience Team",
      role: "Lead Product Designer"
    };

    // Remove any invalid markers
    document.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    authServerError.classList.remove('show');
    stepperServerError.classList.remove('show');
    dialogErrorMsg.style.display = 'none';

    // Submit Phase 1 to activate ready state
    authOk.textContent = "Account details look good — ready to continue.";
    authOk.classList.add('show');
    btnProceedStepper.classList.add('show');
  });

  btnFillInvalid.addEventListener('click', () => {
    if (state.currentPhase === 1) {
      authFullname.value = "J"; // Too short
      authEmail.value = "invalid-email"; // Malformed
      authForm.dispatchEvent(new Event('submit'));
    } else if (state.currentPhase === 2) {
      if (state.stepperStep === 1) {
        stepName.value = "A";
        stepEmail.value = "bad@";
        btnStep1Next.click();
      } else if (state.stepperStep === 2) {
        stepTeam.value = "X";
        stepRole.value = "";
        btnStep2Next.click();
      }
    }
  });

  function resetEntireFlow() {
    authForm.reset();
    stepName.value = '';
    stepEmail.value = '';
    stepTeam.value = '';
    stepRole.value = '';

    state.data = { fullname: '', email: '', company: '', team: '', role: '' };

    document.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    authOk.classList.remove('show');
    btnProceedStepper.classList.remove('show');
    authServerError.classList.remove('show');
    stepperServerError.classList.remove('show');
    stepperOk.classList.remove('show');
    dialogErrorMsg.style.display = 'none';

    setPhase(1);
    setStepperStep(1);
    authFullname.focus();
  }

  btnResetFlow.addEventListener('click', resetEntireFlow);
});
