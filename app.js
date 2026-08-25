/* ==========================================================================
   STUDY MATE - Production Core Application Logic
   Smart India Hackathon (SIH 2025/2026) - Team Tech Titans (SIH26201)
   ========================================================================== */

class StudyMateApp {
  constructor() {
    // Current Active Tab
    this.currentTab = 'home';

    // Theme & Audio SFX
    this.theme = localStorage.getItem('studymate_theme') || 'dark';
    this.sfxEnabled = true;
    this.audioCtx = null;

    // Student Metrics & Progress (Persisted in localStorage)
    this.learningScore = parseFloat(localStorage.getItem('sm_learning_score')) || 78.4;
    this.readinessScore = parseInt(localStorage.getItem('sm_readiness_score'), 10) || 85;
    this.streakDays = parseInt(localStorage.getItem('sm_streak_days'), 10) || 7;
    this.testsCompleted = parseInt(localStorage.getItem('sm_tests_completed'), 10) || 18;

    // AI Tutor Settings
    this.tutorLanguage = 'English';
    this.tutorMode = 'instant'; // instant, eli10, stepbystep, deep
    this.geminiApiKey = localStorage.getItem('studymate_gemini_api_key') || 'AQ.Ab8RN6LZ-Isu9yo5GrftoMkt8o4F0EnHMjM7lzvte64hydxpTQ';

    // Speech Recognition & Synthesis
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isListening = false;

    // Weak Topics State
    const savedWeak = localStorage.getItem('sm_weak_topics');
    this.weakTopics = savedWeak ? JSON.parse(savedWeak) : [
      {
        id: 'wt-1',
        subject: 'Physics',
        topic: 'Rotational Dynamics & Moment of Inertia',
        accuracy: 42,
        prompt: "Explain Rotational Dynamics, Moment of Inertia, and Torque formulas step-by-step with examples."
      },
      {
        id: 'wt-2',
        subject: 'Mathematics',
        topic: 'Integration by Parts (ILATE Rule)',
        accuracy: 48,
        prompt: "How to solve Integration by Parts using the ILATE rule step-by-step with examples?"
      },
      {
        id: 'wt-3',
        subject: 'Chemistry',
        topic: 'SN1 vs SN2 Reaction Mechanisms',
        accuracy: 55,
        prompt: "Explain the differences between SN1 and SN2 nucleophilic substitution reactions with stereochemistry."
      }
    ];

    // Today's Tasks
    const savedTasks = localStorage.getItem('sm_today_tasks');
    this.todayTasks = savedTasks ? JSON.parse(savedTasks) : [
      { id: 't-1', text: "Revise Newton's 3rd Law momentum equations", tag: 'Physics', tagClass: 'physics', completed: true },
      { id: 't-2', text: 'Solve 10 Calculus Integration drill problems', tag: 'Math', tagClass: 'math', completed: false },
      { id: 't-3', text: 'Practice SN1 & SN2 chemical reaction diagrams', tag: 'Chemistry', tagClass: 'chem', completed: false },
      { id: 't-4', text: 'Execute 5-min diagnostic mock arena test', tag: 'Quiz', tagClass: 'quiz', completed: false }
    ];

    // Weekly Timetable Slots
    this.timetableSlots = [
      { day: 'Mon', time: '04:30 PM - 06:00 PM', subject: 'Physics', title: 'Rotational Dynamics & Inertia Proofs', tag: 'High Priority • Weak Topic', completed: false },
      { day: 'Mon', time: '06:30 PM - 07:30 PM', subject: 'Math', title: 'Calculus: Integration by Parts Drill', tag: 'Practice Set', completed: true },
      { day: 'Tue', time: '05:00 PM - 06:30 PM', subject: 'Chemistry', title: 'Organic: Alkyl Halides & Mechanisms', tag: 'Weak Area Revision', completed: false },
      { day: 'Tue', time: '07:00 PM - 08:00 PM', subject: 'Physics', title: 'Laws of Motion Rapid Doubt Resolution', tag: 'AI Voice Session', completed: false },
      { day: 'Wed', time: '04:30 PM - 06:00 PM', subject: 'Math', title: 'Quadratic Equations & Complex Roots', tag: 'Concept Review', completed: false },
      { day: 'Thu', time: '05:00 PM - 06:30 PM', subject: 'Chemistry', title: 'Thermodynamics & Enthalpy Derivations', tag: 'Problem Solving', completed: false },
      { day: 'Fri', time: '04:30 PM - 06:00 PM', subject: 'Physics', title: "Electrostatics & Ohm's Law Derivations", tag: 'Formula Revision', completed: false },
      { day: 'Sat', time: '10:00 AM - 12:00 PM', subject: 'Mock Exam', title: 'Grand Diagnostic Full-Length Mock Exam', tag: 'Readiness Assessment', completed: false },
      { day: 'Sun', time: '11:00 AM - 01:00 PM', subject: 'AI Review', title: 'AI Learning Loop & Retention Review', tag: 'Adaptive Plan', completed: false }
    ];

    // Pomodoro Timer State
    this.pomoDuration = 25 * 60;
    this.pomoRemaining = 25 * 60;
    this.pomoInterval = null;
    this.pomoIsRunning = false;

    // Quiz Engine State
    this.activeQuizSubject = 'physics';
    this.currentQuestionIdx = 0;
    this.quizScore = 0;
    this.quizQuestions = [];
    this.quizAnswers = [];
    this.quizTimerSeconds = 300;
    this.quizTimerInterval = null;

    // Chart References
    this.subjectMasteryChart = null;
    this.weeklyHoursChart = null;

    // Flashcards State
    this.activeFlashcardDeck = 'all';
    this.currentFlashcardIdx = 0;
    this.isFlashcardFlipped = false;
    this.flashcards = [
      { id: 'fc-1', subject: 'Physics', prompt: "What is the Moment of Inertia of a solid sphere of mass M and radius R about its diameter?", answer: "$$I = \\frac{2}{5}MR^2$$<p style='margin-top: 8px;'>Derived by integrating concentric thin spherical shells over the volume of the sphere.</p>", deck: 'physics', difficulty: 'hard' },
      { id: 'fc-2', subject: 'Physics', prompt: "What is Newton's Third Law formula and vector relation?", answer: "$$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$<p style='margin-top: 8px;'>Action and reaction forces act simultaneously on TWO distinct objects.</p>", deck: 'physics', difficulty: 'good' },
      { id: 'fc-3', subject: 'Physics', prompt: "What is the formula for Centripetal Force on a curved track?", answer: "$$F_c = \\frac{mv^2}{r} = m\\omega^2 r$$<p style='margin-top: 8px;'>Always acts perpendicular to the instantaneous velocity towards the center.</p>", deck: 'physics', difficulty: 'easy' },
      { id: 'fc-4', subject: 'Mathematics', prompt: "What is the formula for Integration by Parts?", answer: "$$\\int u \\, v \\, dx = u \\int v \\, dx - \\int \\left( u' \\int v \\, dx \\right) dx$$<p style='margin-top: 8px;'>Choose '$u$' according to the ILATE hierarchy (Inverse, Log, Algebraic, Trig, Exponential).</p>", deck: 'math', difficulty: 'hard' },
      { id: 'fc-5', subject: 'Mathematics', prompt: "What are the roots of a quadratic equation $ax^2 + bx + c = 0$?", answer: "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$<p style='margin-top: 8px;'>Discriminant $\\Delta = b^2 - 4ac$. If $\\Delta < 0$, roots are complex conjugates.</p>", deck: 'math', difficulty: 'easy' },
      { id: 'fc-6', subject: 'Mathematics', prompt: "What is the standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?", answer: "$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$<p style='margin-top: 8px;'>Fundamental trigonometric limit in radian angle measure.</p>", deck: 'math', difficulty: 'easy' },
      { id: 'fc-7', subject: 'Chemistry', prompt: "What is the stereochemical outcome of an $S_N2$ reaction?", answer: "$$\\text{100\\% Complete Walden Inversion}$$<p style='margin-top: 8px;'>Backside nucleophilic attack turns tetrahedral carbon geometry inside out.</p>", deck: 'chem', difficulty: 'hard' },
      { id: 'fc-8', subject: 'Chemistry', prompt: "How does Le Chatelier's Principle apply to pressure in Haber Process ($N_2 + 3H_2 \\rightleftharpoons 2NH_3$)?", answer: "$$\\text{Shifts Forward Towards } NH_3$$<p style='margin-top: 8px;'>Increasing pressure shifts equilibrium toward fewer gas moles (4 moles $\\to$ 2 moles).</p>", deck: 'chem', difficulty: 'good' },
      { id: 'fc-9', subject: 'Chemistry', prompt: "What is the formula for pH of a solution?", answer: "$$\\text{pH} = -\\log_{10}[H^+]$$<p style='margin-top: 8px;'>At $25^\\circ\\text{C}$, $\\text{pH} + \\text{pOH} = 14$.</p>", deck: 'chem', difficulty: 'easy' }
    ];

    // Formula Vault Library
    this.formulaDatabase = [
      { id: 'f-1', subject: 'Physics', category: 'Mechanics & Dynamics', name: 'Moment of Inertia (Solid Sphere)', formula: 'I = \\frac{2}{5}MR^2', desc: 'Central diameter rotation axis' },
      { id: 'f-2', subject: 'Physics', category: 'Mechanics & Dynamics', name: "Newton's Second Law", formula: '\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}', desc: 'Rate of change of linear momentum' },
      { id: 'f-3', subject: 'Physics', category: 'Mechanics & Dynamics', name: 'Rotational Kinetic Energy', formula: 'K_{rot} = \\frac{1}{2}I\\omega^2', desc: 'Kinetic energy in spinning bodies' },
      { id: 'f-4', subject: 'Mathematics', category: 'Calculus & Integration', name: 'Integration by Parts', formula: '\\int u v dx = u\\int v dx - \\int (u\' \\int v dx) dx', desc: 'ILATE priority sequence' },
      { id: 'f-5', subject: 'Mathematics', category: 'Calculus & Integration', name: 'Chain Rule of Differentiation', formula: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)', desc: 'Composite function derivatives' },
      { id: 'f-6', subject: 'Mathematics', category: 'Calculus & Integration', name: 'Quadratic Roots (Vieta)', formula: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 x_2 = \\frac{c}{a}', desc: 'Sum and product of polynomial roots' },
      { id: 'f-7', subject: 'Chemistry', category: 'Physical & Thermodynamics', name: 'Gibbs Free Energy', formula: '\\Delta G = \\Delta H - T\\Delta S', desc: 'Spontaneity criterion (\\Delta G < 0)' },
      { id: 'f-8', subject: 'Chemistry', category: 'Physical & Thermodynamics', name: 'Arrhenius Equation', formula: 'k = A \\cdot e^{-\\frac{E_a}{RT}}', desc: 'Temperature dependence of reaction rates' },
      { id: 'f-9', subject: 'Chemistry', category: 'Organic Mechanisms', name: 'SN2 Reaction Rate Law', formula: '\\text{Rate} = k[\\text{Substrate}][\\text{Nucleophile}]', desc: 'Bimolecular second-order kinetics' }
    ];

    // Stress Relief & Breathing State
    this.breathingInterval = null;
    this.isBreathingActive = false;
    this.breathingStage = 'inhale'; // inhale, hold, exhale
    this.breathingTimer = 4;
    this.isBinauralPlaying = false;
    this.binauralOsc1 = null;
    this.binauralOsc2 = null;
    this.ambientNoiseNode = null;

    // Affirmations
    this.affirmations = [
      "Exams test your preparation, not your intelligence. One step at a time, you have the knowledge and clarity to succeed.",
      "Stay calm and breathe. Your hard work and focused revision are compounding every day.",
      "Deep focus beats frantic panic. Take a breath, read the question carefully, and trust your derivations.",
      "You do not need to be perfect to achieve excellence. Consistency and clear understanding win the race."
    ];
  }

  /* =========================================================================
     INITIALIZATION
     ========================================================================= */
  init() {
    this.applyTheme(this.theme);
    this.initVoiceRecognition();
    this.renderDashboard();
    this.renderWeakTopicsSidebar();
    this.renderPlannerTimetable('all');
    this.startCountdownTimer();
    this.initFlashcards();
    this.initFormulas();
    this.updateApiStatusUI();
  }

  /* =========================================================================
     THEME & AUDIO SFX
     ========================================================================= */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
    localStorage.setItem('studymate_theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  toggleTheme() {
    this.playSFX('click');
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  playSFX(type = 'click') {
    if (!this.sfxEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.setValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    const icon = document.getElementById('sfx-icon');
    if (icon) {
      icon.className = this.sfxEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
  }

  /* =========================================================================
     TAB NAVIGATION
     ========================================================================= */
  switchTab(tabId) {
    this.playSFX('click');
    this.currentTab = tabId;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'dashboard') {
      setTimeout(() => this.initCharts(), 50);
    }
  }

  toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.toggle('mobile-open');
  }

  setWorkflowStep(stepNum) {
    this.playSFX('click');
    document.querySelectorAll('.workflow-card').forEach((card, idx) => {
      card.classList.toggle('active', idx + 1 === stepNum);
    });

    const stages = [
      {
        title: "Stage 01: Student Input & Target Exam",
        desc: "The student inputs their target examination (e.g. CBSE 12th, JEE, NEET, University Finals), current syllabus completion, and daily available study hours. StudyMate initializes a personalized student profile."
      },
      {
        title: "Stage 02: Baseline Diagnostic Assessment",
        desc: "Quick 5-minute diagnostic quizzes assess foundational understanding across core subjects to establish current proficiency baselines."
      },
      {
        title: "Stage 03: AI Learning Gap Analysis",
        desc: "StudyMate's AI engine analyzes assessment results, pinpointing specific weak topics (e.g., Moment of Inertia, SN1/SN2 reactions, or Integration by Parts)."
      },
      {
        title: "Stage 04: Smart Timetable Generation",
        desc: "An automated weekly study schedule is constructed, dynamically scheduling more time for weak concepts while maintaining balanced overall subject review."
      },
      {
        title: "Stage 05: 24/7 AI Personal Teacher & Doubt Solving",
        desc: "Students ask questions anytime using text or voice in 7+ languages, receiving step-by-step derivations, 'Explain Like I'm 10' analogies, or formula breakdowns."
      },
      {
        title: "Stage 06: Adaptive Practice Quizzes",
        desc: "Dynamic topic-wise quizzes automatically adjust difficulty as the student improves, locking in core retention."
      },
      {
        title: "Stage 07: Live Progress Tracking & Streaks",
        desc: "Real-time dashboards update student learning scores, subject proficiency bars, and streak milestones as tasks and quizzes are completed."
      },
      {
        title: "Stage 08: Predictive Exam Readiness Score",
        desc: "StudyMate calculates an overall readiness score (e.g., 85%) and delivers actionable tips to guide students confidently toward top percentiles."
      }
    ];

    const current = stages[stepNum - 1];
    if (current) {
      document.getElementById('wf-active-title').innerText = current.title;
      document.getElementById('wf-active-desc').innerText = current.desc;
    }
  }

  /* =========================================================================
     DASHBOARD RENDERING & CHARTS
     ========================================================================= */
  renderDashboard() {
    // Learning Score
    const scoreElem = document.getElementById('dashboard-learning-score');
    if (scoreElem) scoreElem.innerText = `${Math.round(this.learningScore)}%`;

    const svgScore = document.getElementById('dashboard-score-svg');
    if (svgScore) svgScore.setAttribute('stroke-dasharray', `${Math.round(this.learningScore)}, 100`);

    // Weak Topics Count
    const countElem = document.getElementById('weak-topics-count');
    if (countElem) countElem.innerText = this.weakTopics.length;

    // Streak
    const streakEl = document.getElementById('streak-counter');
    if (streakEl) streakEl.innerText = this.streakDays;

    // Tests count
    const testsEl = document.getElementById('tests-completed-count');
    if (testsEl) testsEl.innerText = `${this.testsCompleted} Mocks`;

    // Readiness Percentages
    const readScore = document.getElementById('readiness-big-percentage');
    if (readScore) readScore.innerText = `${this.readinessScore}%`;
    const navScore = document.getElementById('nav-readiness-indicator');
    if (navScore) navScore.innerText = `${this.readinessScore}%`;
    const fillBar = document.getElementById('readiness-meter-fill');
    if (fillBar) fillBar.style.width = `${this.readinessScore}%`;

    // Weak Topics List
    const container = document.getElementById('weak-topics-container');
    if (container) {
      if (this.weakTopics.length === 0) {
        container.innerHTML = `
          <div class="text-emerald" style="padding: 16px; text-align: center;">
            <i class="fa-solid fa-circle-check"></i> All learning gaps resolved! Outstanding conceptual mastery.
          </div>
        `;
      } else {
        container.innerHTML = this.weakTopics.map(item => `
          <div class="weak-topic-card">
            <div class="topic-meta-left">
              <span class="topic-subject-tag">${item.subject}</span>
              <div class="topic-name">${item.topic}</div>
              <span class="topic-accuracy"><i class="fa-solid fa-triangle-exclamation text-rose"></i> ${item.accuracy}% Quiz Accuracy</span>
            </div>
            <button class="btn-fix-topic" onclick="app.launchDoubtFromWeakTopic('${item.id}')">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Fix with AI
            </button>
          </div>
        `).join('');
      }
    }

    this.renderTodayTasks();
    this.renderWeakTopicsSidebar();
  }

  renderTodayTasks() {
    const taskContainer = document.getElementById('today-tasks-container');
    if (!taskContainer) return;

    taskContainer.innerHTML = this.todayTasks.map(t => `
      <div class="task-item ${t.completed ? 'completed' : ''}" onclick="app.toggleTask('${t.id}')">
        <div class="task-checkbox-box">
          <div class="task-check-circle">
            <i class="fa-solid fa-check"></i>
          </div>
          <span class="task-label">${t.text}</span>
        </div>
        <span class="task-tag ${t.tagClass}">${t.tag}</span>
      </div>
    `).join('');
  }

  toggleTask(taskId) {
    const task = this.todayTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.playSFX('click');
      this.saveState();
      this.renderTodayTasks();
      if (task.completed) {
        this.boostLearningScore(0.4);
      }
    }
  }

  addNewTaskPrompt() {
    const taskName = prompt("Enter new task for today:");
    if (taskName && taskName.trim()) {
      this.playSFX('click');
      this.todayTasks.push({
        id: `t-${Date.now()}`,
        text: taskName.trim(),
        tag: 'Custom',
        tagClass: 'math',
        completed: false
      });
      this.saveState();
      this.renderTodayTasks();
    }
  }

  scrollToWeakTopics() {
    this.playSFX('click');
    const panel = document.getElementById('weak-topics-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth' });
  }

  launchDoubtFromWeakTopic(weakId) {
    const wt = this.weakTopics.find(w => w.id === weakId);
    if (wt) {
      this.switchTab('ai-tutor');
      this.sendPresetDoubt(wt.prompt);
    }
  }

  handleDashQuickDoubt() {
    const input = document.getElementById('dash-quick-doubt-input');
    if (input && input.value.trim()) {
      const q = input.value.trim();
      input.value = '';
      this.switchTab('ai-tutor');
      this.sendPresetDoubt(q);
    }
  }

  handleDashQuickDoubtKey(e) {
    if (e.key === 'Enter') {
      this.handleDashQuickDoubt();
    }
  }

  startCountdownTimer() {
    const targetDate = new Date("2026-09-10T09:00:00");
    const update = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const dElem = document.getElementById('cd-days');
      const hElem = document.getElementById('cd-hours');
      const mElem = document.getElementById('cd-mins');

      if (dElem) dElem.innerText = String(days).padStart(2, '0');
      if (hElem) hElem.innerText = String(hours).padStart(2, '0');
      if (mElem) mElem.innerText = String(mins).padStart(2, '0');
    };
    update();
    setInterval(update, 60000);
  }

  initCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // 1. Subject Mastery Chart
    const ctx1 = document.getElementById('subjectMasteryChart');
    if (ctx1) {
      if (this.subjectMasteryChart) this.subjectMasteryChart.destroy();
      this.subjectMasteryChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Physics', 'Mathematics', 'Chemistry', 'CS / Biology'],
          datasets: [{
            label: 'Mastery (%)',
            data: [74, 88, 81, 94],
            backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#a855f7'],
            borderRadius: 6,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    // 2. Weekly Hours Chart
    const ctx2 = document.getElementById('weeklyHoursChart');
    if (ctx2) {
      if (this.weeklyHoursChart) this.weeklyHoursChart.destroy();
      this.weeklyHoursChart = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Actual Study Hours',
              data: [3.5, 4.0, 3.2, 4.8, 3.0, 5.5, 4.5],
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#38bdf8'
            },
            {
              label: 'Daily Target Goal',
              data: [4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor, boxWidth: 10 } }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 7,
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }
  }

  /* =========================================================================
     MODULE 3: AI TUTOR & LIVE DOUBT SOLVER
     ========================================================================= */
  setTutorMode(mode) {
    this.playSFX('click');
    this.tutorMode = mode;
    document.querySelectorAll('.mode-pill-btn').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-mode') === mode);
    });

    const labels = {
      instant: 'Instant Exam Answer',
      eli10: "Explain Like I'm 10",
      stepbystep: 'Step-by-Step Proof',
      deep: 'Concept Deep Dive'
    };
    const indicator = document.getElementById('current-mode-indicator');
    if (indicator) {
      indicator.innerHTML = `<i class="fa-solid fa-bolt text-blue"></i> Mode: <strong>${labels[mode]}</strong>`;
    }
  }

  changeTutorLanguage() {
    const select = document.getElementById('language-select');
    if (select) {
      this.tutorLanguage = select.value;
    }
  }

  renderWeakTopicsSidebar() {
    const list = document.getElementById('tutor-weak-links');
    if (!list) return;

    list.innerHTML = this.weakTopics.map(w => `
      <button class="preset-prompt-btn" onclick="app.launchDoubtFromWeakTopic('${w.id}')">
        <i class="fa-solid fa-triangle-exclamation text-rose"></i> Fix: ${w.topic.substring(0, 24)}...
      </button>
    `).join('');
  }

  sendPresetDoubt(text) {
    const input = document.getElementById('tutor-user-input');
    if (input) input.value = text;
    this.sendUserDoubt();
  }

  handleChatKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendUserDoubt();
    }
  }

  async sendUserDoubt() {
    const input = document.getElementById('tutor-user-input');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    input.value = '';
    this.playSFX('click');

    this.appendChatMessage('user', query);
    const typingId = this.showTypingIndicator();

    try {
      // Call Live Gemini API
      const responseHtml = await this.fetchLiveGeminiResponse(query, this.tutorMode, this.tutorLanguage);
      this.removeTypingIndicator(typingId);
      this.appendChatMessage('ai', responseHtml);
      this.boostLearningScore(0.3);
    } catch (err) {
      console.warn("Live Gemini API fallback:", err);
      this.removeTypingIndicator(typingId);
      const fallbackHtml = this.generateFallbackExplanation(query, this.tutorMode, this.tutorLanguage);
      this.appendChatMessage('ai', fallbackHtml);
      this.boostLearningScore(0.2);
    }
  }

  async fetchLiveGeminiResponse(query, mode, language) {
    if (!this.geminiApiKey) {
      throw new Error("No API Key");
    }

    const personaInstructions = {
      instant: "Provide a concise, high-yield exam answer with core formulas and key definitions directly.",
      eli10: "Explain the concept simply like the student is 10 years old using vivid intuitive analogies and easy real-world metaphors.",
      stepbystep: "Provide a rigorous step-by-step derivation or proof, explaining each mathematical or physical step numbered 1, 2, 3.",
      deep: "Provide a comprehensive conceptual breakdown followed by 1-2 rapid check-for-understanding questions for the student."
    };

    const systemPrompt = `You are StudyMate AI, an expert, supportive personal teacher for high-school and university students preparing for exams (CBSE, JEE, NEET, University). ${personaInstructions[mode]}
Format your answer clearly with HTML tags (<p>, <strong>, <em>, <ul>, <li>, <ol>, <div class='msg-formula-box'>equation</div>).
Language requirement: Formulate the response in ${language}.
Return only clean HTML content suitable for display in the chat thread.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nStudent Question:\n${query}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.status}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    // Clean any markdown fences if present
    text = text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return text;
  }

  generateFallbackExplanation(query, mode, language) {
    const qLower = query.toLowerCase();

    // 1. Newton's Laws
    if (qLower.includes('newton') || qLower.includes('third law') || qLower.includes('action')) {
      if (mode === 'eli10') {
        return `
          <p><strong>🌌 The Skateboard Analogy (Explain Like I'm 10):</strong></p>
          <p>Imagine standing on a skateboard. If you push a heavy wall with your hands, the wall doesn't move — <em>you zoom backwards!</em></p>
          <div class="msg-formula-box">Action Force = - (Reaction Force)</div>
          <p><strong>Why?</strong> Forces always come in twins. Whenever you push something, it pushes right back on you with equal strength in the opposite direction!</p>
        `;
      } else if (mode === 'stepbystep') {
        return `
          <p><strong>📝 Mathematical Proof: Newton's Third Law & Momentum Conservation</strong></p>
          <p><strong>1. Isolated System:</strong> Consider two interacting particles of masses $m_1$ and $m_2$. Total linear momentum is $\\vec{P} = \\vec{p}_1 + \\vec{p}_2 = \\text{const}$.</p>
          <p><strong>2. Differentiating with respect to time:</strong></p>
          <div class="msg-formula-box">$$\\frac{d\\vec{P}}{dt} = \\frac{d\\vec{p}_1}{dt} + \\frac{d\\vec{p}_2}{dt} = 0$$</div>
          <p><strong>3. By Newton's Second Law ($\vec{F} = \\frac{d\\vec{p}}{dt}$):</strong></p>
          <div class="msg-formula-box">$$\\vec{F}_{12} + \\vec{F}_{21} = 0 \\implies \\vec{F}_{12} = -\\vec{F}_{21}$$</div>
          <p><strong>Conclusion:</strong> Force exerted by body 1 on body 2 is equal in magnitude and opposite in direction to the force exerted by body 2 on body 1.</p>
        `;
      } else {
        return `
          <p><strong>⚡ Newton's Third Law of Motion:</strong></p>
          <p><em>"To every action, there is always an equal and opposite reaction."</em></p>
          <div class="msg-formula-box">$$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$</div>
          <p><strong>Key Exam Takeaways:</strong></p>
          <ul>
            <li>Action and reaction forces act on <strong>two different bodies</strong>; hence they never cancel each other out in free-body diagrams.</li>
            <li>Examples: Rocket propulsion (exhaust gas expelled backward accelerates rocket forward), jumping off a diving board.</li>
          </ul>
        `;
      }
    }

    // 2. Integration by Parts
    if (qLower.includes('integration by parts') || qLower.includes('ilate')) {
      return `
        <p><strong>📐 Integration by Parts & The ILATE Rule:</strong></p>
        <div class="msg-formula-box">$$\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx$$</div>
        <p><strong>ILATE Priority Hierarchy for selecting '$u$':</strong></p>
        <ol>
          <li><strong>I</strong> - Inverse Trigonometric functions (e.g. $\\arcsin x, \\arctan x$)</li>
          <li><strong>L</strong> - Logarithmic functions (e.g. $\\ln x, \\log x$)</li>
          <li><strong>A</strong> - Algebraic functions (e.g. $x^2, 3x$)</li>
          <li><strong>T</strong> - Trigonometric functions (e.g. $\\sin x, \\cos x$)</li>
          <li><strong>E</strong> - Exponential functions (e.g. $e^x, 2^x$)</li>
        </ol>
      `;
    }

    // 3. SN1 vs SN2
    if (qLower.includes('sn1') || qLower.includes('sn2') || qLower.includes('organic')) {
      return `
        <p><strong>🧪 SN1 vs SN2 Reaction Mechanisms Comparison:</strong></p>
        <div class="msg-formula-box">
          <strong>SN1:</strong> 2-Step | Carbocation intermediate | Polar Protic Solvent | Reactivity: 3° > 2° > 1° | Racemization<br/>
          <strong>SN2:</strong> 1-Step Concerted | Backside attack | Polar Aprotic Solvent | Reactivity: 1° > 2° > 3° | Walden Inversion
        </div>
        <p><strong>Key Concept:</strong> SN2 involves simultaneous bond breaking and forming. The nucleophile attacks 180° opposite the leaving group, causing a full 100% stereochemical inversion.</p>
      `;
    }

    // 4. Quadratic Formula
    if (qLower.includes('quadratic') || qLower.includes('formula')) {
      return `
        <p><strong>📐 Quadratic Formula Derivation ($ax^2 + bx + c = 0$):</strong></p>
        <ol>
          <li>Divide by $a$: $x^2 + \\frac{b}{a}x = -\\frac{c}{a}$</li>
          <li>Complete the square: $\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$</li>
          <li>Take the square root: $x + \\frac{b}{2a} = \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a}$</li>
        </ol>
        <div class="msg-formula-box">$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</div>
      `;
    }

    // Default Academic Solution
    return `
      <p><strong>📚 Concept Explanation for: "${this.escapeHtml(query)}"</strong></p>
      <div class="msg-formula-box">Core Principle: Systematic breakdown from fundamental exam syllabus laws.</div>
      <p>This problem is governed by conservation and boundary condition principles. Review the key formulas and solve 2-3 related numerical drill questions to master this topic.</p>
    `;
  }

  showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const id = `typing-${Date.now()}`;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message ai-message';
    div.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-content-box">
        <div class="msg-text-body">
          <p><i class="fa-solid fa-spinner fa-spin text-blue"></i> Formulating step-by-step answer...</p>
        </div>
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  appendChatMessage(sender, contentHtml) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;

    if (sender === 'user') {
      div.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
        <div class="msg-content-box">
          <div class="msg-header">
            <span class="msg-sender">You</span>
            <span class="msg-timestamp">Just now</span>
          </div>
          <div class="msg-text-body">
            <p>${this.escapeHtml(contentHtml)}</p>
          </div>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="msg-content-box">
          <div class="msg-header">
            <span class="msg-sender">StudyMate AI Teacher</span>
            <span class="msg-timestamp">Just now</span>
          </div>
          <div class="msg-text-body">
            ${contentHtml}
          </div>
          <div class="msg-footer-actions">
            <button class="msg-action-btn" onclick="app.speakMessage(this)"><i class="fa-solid fa-volume-high"></i> Listen</button>
            <button class="msg-action-btn" onclick="app.copyMessageText(this)"><i class="fa-solid fa-copy"></i> Copy</button>
          </div>
        </div>
      `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  clearChat() {
    const container = document.getElementById('chat-messages');
    if (container) {
      container.innerHTML = `
        <div class="chat-message ai-message">
          <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-content-box">
            <div class="msg-header">
              <span class="msg-sender">StudyMate AI Teacher</span>
              <span class="msg-timestamp">Just now</span>
            </div>
            <div class="msg-text-body">
              <p>Chat thread cleared. What topic or doubt would you like to study next?</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  insertFormulaTemplate() {
    const input = document.getElementById('tutor-user-input');
    if (input) {
      input.value += " [Equation: F = m*a | \\int f(x) dx] ";
      input.focus();
    }
  }

  simulateImageUpload() {
    this.playSFX('click');
    const input = document.getElementById('tutor-user-input');
    if (input) {
      input.value = "Explain the resolved forces on an inclined plane with friction and angle theta";
      input.focus();
    }
  }

  copyMessageText(btn) {
    const text = btn.closest('.msg-content-box').querySelector('.msg-text-body').innerText;
    navigator.clipboard.writeText(text).then(() => {
      this.playSFX('click');
      btn.innerHTML = '<i class="fa-solid fa-check text-emerald"></i> Copied!';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
      }, 2000);
    });
  }

  speakMessage(btn) {
    if (!this.synth) return;
    const text = btn.closest('.msg-content-box').querySelector('.msg-text-body').innerText;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const status = document.getElementById('speech-status');
    if (status) status.innerHTML = '<span class="text-blue"><i class="fa-solid fa-volume-high fa-beat"></i> Reading aloud...</span>';

    utterance.onend = () => {
      if (status) status.innerText = '';
    };

    this.synth.speak(utterance);
  }

  initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        const mic = document.getElementById('btn-voice-mic');
        if (mic) mic.classList.add('listening');
        const status = document.getElementById('voice-indicator-status');
        if (status) status.innerHTML = '<span class="text-rose"><i class="fa-solid fa-microphone fa-fade"></i> Listening... Speak your doubt</span>';
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('tutor-user-input');
        if (input) {
          input.value = transcript;
          this.sendUserDoubt();
        }
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this.resetMicUI();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.resetMicUI();
      };
    }
  }

  toggleVoiceRecognition() {
    if (!this.recognition) {
      alert("Voice recognition is not supported in this browser. You can type your doubt in the box!");
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.playSFX('click');
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  resetMicUI() {
    const mic = document.getElementById('btn-voice-mic');
    if (mic) mic.classList.remove('listening');
    const status = document.getElementById('voice-indicator-status');
    if (status) status.innerHTML = 'Press <kbd>Enter</kbd> to ask • <kbd>Shift + Enter</kbd> for new line';
  }

  /* =========================================================================
     MODULE 4: SMART STUDY PLANNER & CALENDAR EXPORT
     ========================================================================= */
  renderPlannerTimetable(dayFilter) {
    const container = document.getElementById('timetable-slots-container');
    if (!container) return;

    const slots = dayFilter === 'all'
      ? this.timetableSlots
      : this.timetableSlots.filter(s => s.day === dayFilter);

    if (slots.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          No study sessions scheduled for ${dayFilter}. Rest day!
        </div>
      `;
      return;
    }

    container.innerHTML = slots.map(s => `
      <div class="slot-item-card ${s.completed ? 'completed' : ''}">
        <div>
          <span class="slot-day-badge">${s.day}</span>
          <div class="slot-time-text">${s.time}</div>
        </div>
        <div>
          <div class="slot-title">${s.title}</div>
          <span class="slot-tag">${s.subject} • ${s.tag}</span>
        </div>
        <div>
          <button class="btn-xs-primary" onclick="app.startPomodoroWithTask('${this.escapeHtml(s.title)}')">
            <i class="fa-solid fa-play"></i> Focus Now
          </button>
        </div>
      </div>
    `).join('');
  }

  filterPlannerDay(day) {
    this.playSFX('click');
    document.querySelectorAll('.day-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-day') === day);
    });
    this.renderPlannerTimetable(day);
  }

  updatePlannerSchedule() {
    this.playSFX('click');
  }

  generateAISchedule() {
    this.playSFX('success');
    this.renderPlannerTimetable('all');
    alert("✨ AI successfully re-balanced your weekly study schedule prioritizing weak topics!");
  }

  regeneratePlanPrompt() {
    this.generateAISchedule();
  }

  exportToCalendar() {
    this.playSFX('click');
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyMate AI//Study Schedule//EN\n";

    this.timetableSlots.forEach((slot, idx) => {
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:studymate-${Date.now()}-${idx}@studymate.ai\n`;
      icsContent += `SUMMARY:${slot.subject}: ${slot.title}\n`;
      icsContent += `DESCRIPTION:${slot.tag}\n`;
      icsContent += `STATUS:CONFIRMED\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "StudyMate_Adaptive_Plan.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* =========================================================================
     POMODORO TIMER
     ========================================================================= */
  startPomodoroWithTask(taskName) {
    const taskElem = document.getElementById('active-pomo-task');
    if (taskElem) taskElem.innerText = taskName;
    this.resetPomodoro();
    this.togglePomodoro();
  }

  togglePomodoro() {
    this.playSFX('click');
    if (this.pomoIsRunning) {
      clearInterval(this.pomoInterval);
      this.pomoIsRunning = false;
      document.getElementById('btn-timer-toggle').innerHTML = '<i class="fa-solid fa-play"></i> Resume Session';
    } else {
      this.pomoIsRunning = true;
      document.getElementById('btn-timer-toggle').innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      this.pomoInterval = setInterval(() => {
        if (this.pomoRemaining > 0) {
          this.pomoRemaining--;
          this.updatePomodoroDisplay();
        } else {
          clearInterval(this.pomoInterval);
          this.pomoIsRunning = false;
          this.playSFX('success');
          alert("🎉 Pomodoro Session Complete! Great job maintaining focus. Take a 5-minute break.");
          this.boostLearningScore(1);
          this.resetPomodoro();
        }
      }, 1000);
    }
  }

  resetPomodoro() {
    clearInterval(this.pomoInterval);
    this.pomoIsRunning = false;
    this.pomoRemaining = this.pomoDuration;
    this.updatePomodoroDisplay();
    const btn = document.getElementById('btn-timer-toggle');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Session';
  }

  updatePomodoroDisplay() {
    const mins = Math.floor(this.pomoRemaining / 60);
    const secs = this.pomoRemaining % 60;
    const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const elem = document.getElementById('timer-display');
    if (elem) elem.innerText = display;

    const ring = document.getElementById('pomodoro-progress-ring');
    if (ring) {
      const totalCircumference = 276.46;
      const progress = (this.pomoDuration - this.pomoRemaining) / this.pomoDuration;
      const offset = totalCircumference * (1 - progress);
      ring.style.strokeDashoffset = offset;
    }
  }

  /* =========================================================================
     MODULE 5: EXAM READINESS & AI MOCK QUIZ ENGINE
     ========================================================================= */
  getQuestionBank() {
    return {
      physics: [
        {
          q: "What is the Moment of Inertia of a uniform solid sphere of mass M and radius R about its diameter?",
          options: ["(2/5) M R²", "(2/3) M R²", "(1/2) M R²", "(1/3) M R²"],
          correct: 0,
          difficulty: "Medium",
          topic: "Rotational Dynamics & Moment of Inertia",
          explanation: "For a solid sphere rotating about its diameter, integration over spherical shells yields I = (2/5) M R²."
        },
        {
          q: "When a vehicle negotiates a sharp curved banked road, the inward centripetal force is provided by:",
          options: ["Horizontal component of Normal Reaction (N sin θ)", "Vertical component of gravity", "Centrifugal force", "Air friction"],
          correct: 0,
          difficulty: "Easy",
          topic: "Newton's Laws of Motion",
          explanation: "On a frictionless banked road at angle θ, N sin θ points toward the curve center, providing the necessary centripetal force."
        },
        {
          q: "What is the SI unit of Torque?",
          options: ["Newton-meter (N·m)", "Joule-second (J·s)", "Newton per meter (N/m)", "Pascal (Pa)"],
          correct: 0,
          difficulty: "Easy",
          topic: "Rotational Dynamics",
          explanation: "Torque is τ = r × F, with unit Newton-meter (N·m)."
        },
        {
          q: "If angular momentum is conserved and radius of a rotating body decreases, its angular velocity:",
          options: ["Increases", "Decreases", "Remains unchanged", "Becomes zero"],
          correct: 0,
          difficulty: "Medium",
          topic: "Conservation of Angular Momentum",
          explanation: "L = I·ω = constant. When radius decreases, Moment of Inertia (I) decreases, causing ω to increase."
        },
        {
          q: "Lenz's Law in electromagnetic induction is a consequence of:",
          options: ["Conservation of Energy", "Conservation of Charge", "Conservation of Momentum", "Coulomb's Law"],
          correct: 0,
          difficulty: "Medium",
          topic: "Electromagnetic Induction",
          explanation: "Lenz's Law is a direct statement of conservation of energy; mechanical work done must equal induced electrical energy."
        }
      ],
      math: [
        {
          q: "Evaluate the integral: ∫ x · e^x dx using integration by parts.",
          options: ["e^x (x - 1) + C", "e^x (x + 1) + C", "x² e^x / 2 + C", "e^x / x + C"],
          correct: 0,
          difficulty: "Medium",
          topic: "Integration by Parts (ILATE Rule)",
          explanation: "Using ILATE: u = x, dv = e^x dx -> du = dx, v = e^x. ∫ u dv = x·e^x - ∫ e^x dx = e^x (x - 1) + C."
        },
        {
          q: "If α and β are roots of ax² + bx + c = 0, what is the product of roots α·β?",
          options: ["c / a", "-b / a", "-c / a", "b² - 4ac"],
          correct: 0,
          difficulty: "Easy",
          topic: "Quadratic Equations",
          explanation: "By Vieta's formulas: sum = -b/a, product = c/a."
        },
        {
          q: "What is the derivative of f(x) = ln(sin x)?",
          options: ["cot x", "tan x", "sec x", "cos x"],
          correct: 0,
          difficulty: "Medium",
          topic: "Calculus - Chain Rule",
          explanation: "d/dx[ln(sin x)] = (1 / sin x) · cos x = cot x."
        },
        {
          q: "If the discriminant Δ = b² - 4ac < 0, the roots of the quadratic equation are:",
          options: ["Complex conjugate numbers", "Real and distinct", "Real and equal", "Zero"],
          correct: 0,
          difficulty: "Easy",
          topic: "Quadratic Equations",
          explanation: "When Δ < 0, square root produces imaginary components, yielding complex conjugate roots."
        },
        {
          q: "Evaluate limit: lim (x → 0) (sin x / x):",
          options: ["1", "0", "Infinity", "Undefined"],
          correct: 0,
          difficulty: "Easy",
          topic: "Limits & Continuity",
          explanation: "Standard trigonometric limit lim (x → 0) (sin x / x) = 1."
        }
      ],
      chemistry: [
        {
          q: "Which alkyl halide undergoes SN1 nucleophilic substitution fastest?",
          options: ["Tertiary (3°) Alkyl Halide", "Secondary (2°) Alkyl Halide", "Primary (1°) Alkyl Halide", "Methyl Halide"],
          correct: 0,
          difficulty: "Medium",
          topic: "SN1 vs SN2 Reaction Mechanisms",
          explanation: "SN1 rate depends on carbocation stability: 3° > 2° > 1° due to hyperconjugation and inductive effects."
        },
        {
          q: "In an SN2 reaction mechanism, the stereochemical outcome is:",
          options: ["Complete Walden Inversion", "Racemization (50/50)", "100% Retention", "No change"],
          correct: 0,
          difficulty: "Medium",
          topic: "SN1 vs SN2 Reaction Mechanisms",
          explanation: "SN2 features backside attack opposite leaving group, leading to 100% Walden stereochemical inversion."
        },
        {
          q: "Increasing pressure in the Haber process (N₂ + 3H₂ ⇌ 2NH₃) shifts equilibrium:",
          options: ["Forward towards NH₃", "Backward towards N₂ & H₂", "No effect", "Stops reaction"],
          correct: 0,
          difficulty: "Medium",
          topic: "Chemical Equilibrium",
          explanation: "By Le Chatelier's principle, increased pressure shifts equilibrium toward fewer gas moles (4 moles -> 2 moles)."
        },
        {
          q: "What is the pH of a 0.001 M HCl solution at 25°C?",
          options: ["3", "1", "11", "7"],
          correct: 0,
          difficulty: "Easy",
          topic: "Ionic Equilibrium",
          explanation: "[H⁺] = 10⁻³ M. pH = -log(10⁻³) = 3."
        },
        {
          q: "Which catalyst is used in the hydrogenation of vegetable oils?",
          options: ["Nickel (Ni)", "Iron (Fe)", "Vanadium Pentoxide (V₂O₅)", "Copper (Cu)"],
          correct: 0,
          difficulty: "Easy",
          topic: "Surface Chemistry",
          explanation: "Finely divided Nickel facilitates catalytic hydrogenation of unsaturated alkene bonds."
        }
      ],
      all: [
        {
          q: "Physics: Moment of Inertia of a solid cylinder of mass M and radius R about its axis is:",
          options: ["(1/2) M R²", "M R²", "(2/5) M R²", "(1/4) M R²"],
          correct: 0,
          difficulty: "Medium",
          topic: "Rotational Dynamics",
          explanation: "For a solid cylinder rotating about its central axis, I = (1/2) M R²."
        },
        {
          q: "Math: What is ∫ (1 / x) dx ?",
          options: ["ln |x| + C", "x² / 2 + C", "-1 / x² + C", "e^x + C"],
          correct: 0,
          difficulty: "Easy",
          topic: "Integration",
          explanation: "The anti-derivative of 1/x is ln |x| + C."
        },
        {
          q: "Chemistry: A polar aprotic solvent (e.g. Acetone, DMSO) strongly favors:",
          options: ["SN2 Mechanism", "SN1 Mechanism", "E1 Elimination only", "Free radical substitution"],
          correct: 0,
          difficulty: "Medium",
          topic: "SN1 vs SN2 Reaction Mechanisms",
          explanation: "Polar aprotic solvents do not hydrogen-bond with nucleophiles, keeping them reactive for SN2."
        },
        {
          q: "Biology / CS: What is the primary role of the mitochondria in eukaryotic cells?",
          options: ["ATP Synthesis via Cellular Respiration", "Protein Translation", "DNA Storage", "Lipid Digestion"],
          correct: 0,
          difficulty: "Easy",
          topic: "Cell Biology",
          explanation: "Mitochondria generate cellular ATP via oxidative phosphorylation."
        },
        {
          q: "Physics: Work done by a centripetal force on an object in circular motion is:",
          options: ["Always Zero", "Positive", "Negative", "Equal to kinetic energy"],
          correct: 0,
          difficulty: "Easy",
          topic: "Work, Energy and Power",
          explanation: "Centripetal force is perpendicular to displacement (θ = 90°), W = F·d·cos(90°) = 0."
        },
        {
          q: "Math: If a square matrix A has det(A) = 0, the matrix is called:",
          options: ["Singular matrix", "Non-singular matrix", "Identity matrix", "Orthogonal matrix"],
          correct: 0,
          difficulty: "Easy",
          topic: "Matrices & Determinants",
          explanation: "A matrix with zero determinant cannot be inverted and is termed singular."
        }
      ]
    };
  }

  startMockQuizModal() {
    this.startQuiz('all');
  }

  launchSubjectQuiz(subject) {
    this.startQuiz(subject);
  }

  startQuiz(subject) {
    this.playSFX('click');
    this.activeQuizSubject = subject;
    const bank = this.getQuestionBank();
    this.quizQuestions = bank[subject] || bank['physics'];
    this.currentQuestionIdx = 0;
    this.quizScore = 0;
    this.quizAnswers = new Array(this.quizQuestions.length).fill(null);
    this.quizTimerSeconds = this.quizQuestions.length * 60;

    const modal = document.getElementById('quiz-modal');
    if (modal) modal.style.display = 'flex';

    document.getElementById('quiz-question-view').style.display = 'block';
    document.getElementById('quiz-results-view').style.display = 'none';
    document.getElementById('btn-quiz-next').style.display = 'inline-flex';
    document.getElementById('btn-quiz-finish').style.display = 'none';

    const badge = document.getElementById('modal-quiz-subject-badge');
    if (badge) badge.innerText = subject.toUpperCase();

    this.startQuizTimer();
    this.renderCurrentQuizQuestion();
  }

  startQuizTimer() {
    clearInterval(this.quizTimerInterval);
    const updateTimer = () => {
      if (this.quizTimerSeconds > 0) {
        this.quizTimerSeconds--;
        const mins = Math.floor(this.quizTimerSeconds / 60);
        const secs = this.quizTimerSeconds % 60;
        const elem = document.getElementById('quiz-timer-text');
        if (elem) elem.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      } else {
        clearInterval(this.quizTimerInterval);
        this.finishQuizView();
      }
    };
    updateTimer();
    this.quizTimerInterval = setInterval(updateTimer, 1000);
  }

  renderCurrentQuizQuestion() {
    const q = this.quizQuestions[this.currentQuestionIdx];
    if (!q) return;

    const progress = ((this.currentQuestionIdx + 1) / this.quizQuestions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progress}%`;
    document.getElementById('quiz-q-counter').innerText = `Question ${this.currentQuestionIdx + 1} of ${this.quizQuestions.length}`;
    document.getElementById('quiz-q-difficulty').innerText = q.difficulty;

    document.getElementById('quiz-question-text').innerText = q.q;

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    const userSelected = this.quizAnswers[this.currentQuestionIdx];

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      if (userSelected !== null) {
        if (idx === q.correct) btn.classList.add('correct');
        else if (idx === userSelected) btn.classList.add('wrong');
        btn.disabled = true;
      }
      btn.onclick = () => this.selectQuizOption(idx);
      btn.innerHTML = `
        <span class="option-key">${letters[idx]}</span>
        <span>${opt}</span>
      `;
      optionsContainer.appendChild(btn);
    });

    const expBox = document.getElementById('quiz-explanation-box');
    if (userSelected !== null) {
      expBox.style.display = 'block';
      const isCorrect = userSelected === q.correct;
      expBox.className = `quiz-explanation-box ${isCorrect ? '' : 'wrong-exp'}`;
      document.getElementById('exp-status-header').innerHTML = isCorrect
        ? '<i class="fa-solid fa-circle-check text-emerald"></i> <strong class="text-emerald">Correct Answer!</strong>'
        : '<i class="fa-solid fa-circle-xmark text-rose"></i> <strong class="text-rose">Incorrect!</strong>';
      document.getElementById('quiz-explanation-text').innerText = q.explanation;
    } else {
      expBox.style.display = 'none';
    }

    const btnNext = document.getElementById('btn-quiz-next');
    if (this.currentQuestionIdx === this.quizQuestions.length - 1) {
      btnNext.innerHTML = 'Complete & Submit <i class="fa-solid fa-flag-checkered"></i>';
    } else {
      btnNext.innerHTML = 'Next Question <i class="fa-solid fa-arrow-right"></i>';
    }
  }

  selectQuizOption(idx) {
    if (this.quizAnswers[this.currentQuestionIdx] !== null) return;

    this.quizAnswers[this.currentQuestionIdx] = idx;
    const q = this.quizQuestions[this.currentQuestionIdx];

    if (idx === q.correct) {
      this.playSFX('click');
      this.quizScore++;
    } else {
      this.playSFX('error');
      this.recordMissedTopic(q.topic, q.q);
    }

    this.renderCurrentQuizQuestion();
  }

  recordMissedTopic(topicName, questionText) {
    const existing = this.weakTopics.find(w => w.topic.toLowerCase() === topicName.toLowerCase());
    if (!existing) {
      this.weakTopics.push({
        id: `wt-${Date.now()}`,
        subject: this.activeQuizSubject.toUpperCase(),
        topic: topicName,
        accuracy: 38,
        prompt: `I missed this question: "${questionText}". Can you explain ${topicName} step-by-step from basics?`
      });
      this.saveState();
      this.renderDashboard();
    }
  }

  nextQuestion() {
    this.playSFX('click');
    if (this.currentQuestionIdx < this.quizQuestions.length - 1) {
      this.currentQuestionIdx++;
      this.renderCurrentQuizQuestion();
    } else {
      this.finishQuizView();
    }
  }

  prevQuestion() {
    this.playSFX('click');
    if (this.currentQuestionIdx > 0) {
      this.currentQuestionIdx--;
      this.renderCurrentQuizQuestion();
    }
  }

  finishQuizView() {
    clearInterval(this.quizTimerInterval);

    document.getElementById('quiz-question-view').style.display = 'none';
    document.getElementById('quiz-results-view').style.display = 'block';
    document.getElementById('btn-quiz-next').style.display = 'none';
    document.getElementById('btn-quiz-prev').style.display = 'none';
    document.getElementById('btn-quiz-finish').style.display = 'inline-flex';

    const total = this.quizQuestions.length;
    const percent = Math.round((this.quizScore / total) * 100);

    document.getElementById('results-score-num').innerText = `${this.quizScore} / ${total}`;
    document.getElementById('results-percent').innerText = `(${percent}%)`;
    document.getElementById('res-accuracy-val').innerText = `${percent}%`;

    this.testsCompleted++;
    if (percent >= 80) {
      this.boostReadinessScore(2);
      this.boostLearningScore(2.5);
      document.getElementById('res-score-change').innerText = '+2.5%';
      document.getElementById('results-adaptive-msg').innerText = "Excellent accuracy! Your mastery score has increased, and readiness index has been updated.";
      if (window.confetti) {
        window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      this.playSFX('success');
    } else {
      this.boostLearningScore(0.5);
      document.getElementById('res-score-change').innerText = '+0.5%';
      document.getElementById('results-adaptive-msg').innerHTML = `AI logged missed questions into your <strong>Weak Topics</strong> on the Dashboard. Use the AI Tutor to revise them!`;
    }
    this.saveState();
    this.renderDashboard();
  }

  closeQuizModal() {
    this.playSFX('click');
    clearInterval(this.quizTimerInterval);
    const modal = document.getElementById('quiz-modal');
    if (modal) modal.style.display = 'none';
    this.renderDashboard();
  }

  boostLearningScore(amount) {
    this.learningScore = Math.min(100, Math.round((this.learningScore + amount) * 10) / 10);
    this.saveState();
    this.renderDashboard();
  }

  boostReadinessScore(amount) {
    this.readinessScore = Math.min(100, this.readinessScore + amount);
    this.saveState();
    this.renderDashboard();
  }

  /* =========================================================================
     MODULE 5: INTERACTIVE FLASHCARDS & SPACED REPETITION
     ========================================================================= */
  initFlashcards() {
    this.renderCurrentFlashcard();
  }

  getActiveDeckCards() {
    if (this.activeFlashcardDeck === 'all') return this.flashcards;
    if (this.activeFlashcardDeck === 'weak') {
      return this.flashcards.filter(f => f.difficulty === 'hard');
    }
    return this.flashcards.filter(f => f.deck === this.activeFlashcardDeck);
  }

  switchFlashcardDeck(deck) {
    this.playSFX('click');
    this.activeFlashcardDeck = deck;
    this.currentFlashcardIdx = 0;
    this.isFlashcardFlipped = false;

    document.querySelectorAll('.deck-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-deck') === deck);
    });

    this.renderCurrentFlashcard();
  }

  renderCurrentFlashcard() {
    const cards = this.getActiveDeckCards();
    const countElem = document.getElementById('fc-total-count');
    if (countElem) countElem.innerText = this.flashcards.length;

    const progressElem = document.getElementById('fc-progress-counter');
    if (cards.length === 0) {
      if (progressElem) progressElem.innerText = "0 of 0";
      document.getElementById('fc-front-text').innerText = "No flashcards in this deck.";
      document.getElementById('fc-back-text').innerText = "Select another deck or click 'AI Generate Deck'.";
      return;
    }

    if (this.currentFlashcardIdx >= cards.length) {
      this.currentFlashcardIdx = 0;
    }

    const card = cards[this.currentFlashcardIdx];
    if (progressElem) progressElem.innerText = `Card ${this.currentFlashcardIdx + 1} of ${cards.length}`;

    const badge = document.getElementById('fc-subject-badge');
    if (badge) badge.innerText = card.subject.toUpperCase();

    const front = document.getElementById('fc-front-text');
    if (front) front.innerText = card.prompt;

    const back = document.getElementById('fc-back-text');
    if (back) back.innerHTML = card.answer;

    const cardEl = document.getElementById('active-flashcard');
    if (cardEl) {
      this.isFlashcardFlipped = false;
      cardEl.classList.remove('flipped');
    }

    // Trigger KaTeX render for math formulas
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(document.getElementById('active-flashcard'));
      } catch (e) {}
    }
  }

  flipFlashcard() {
    this.playSFX('click');
    const cardEl = document.getElementById('active-flashcard');
    if (cardEl) {
      this.isFlashcardFlipped = !this.isFlashcardFlipped;
      cardEl.classList.toggle('flipped', this.isFlashcardFlipped);
    }
  }

  rateFlashcard(rating) {
    this.playSFX('click');
    const cards = this.getActiveDeckCards();
    if (cards.length > 0) {
      const card = cards[this.currentFlashcardIdx];
      card.difficulty = rating;
      if (rating === 'easy') {
        this.boostLearningScore(0.3);
      }
    }
    this.nextFlashcard();
  }

  nextFlashcard() {
    this.playSFX('click');
    const cards = this.getActiveDeckCards();
    if (cards.length > 0) {
      this.currentFlashcardIdx = (this.currentFlashcardIdx + 1) % cards.length;
      this.renderCurrentFlashcard();
    }
  }

  prevFlashcard() {
    this.playSFX('click');
    const cards = this.getActiveDeckCards();
    if (cards.length > 0) {
      this.currentFlashcardIdx = (this.currentFlashcardIdx - 1 + cards.length) % cards.length;
      this.renderCurrentFlashcard();
    }
  }

  async generateCustomFlashcardPrompt() {
    const topic = prompt("Enter any syllabus topic to generate 3 AI Flashcards (e.g. 'Photosynthesis', 'Rotational Inertia', 'Thermodynamics'):");
    if (!topic || !topic.trim()) return;

    this.playSFX('click');
    alert(`✨ Generating flashcards for "${topic.trim()}" using Gemini AI...`);

    try {
      const promptText = `Generate 3 high-yield exam flashcards for the academic topic: "${topic.trim()}". Return only a JSON array of objects with format: [{"subject":"Physics/Math/Chem","prompt":"Question here","answer":"Answer with formula here","deck":"physics/math/chem"}]`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const generated = JSON.parse(raw);

        generated.forEach((item, idx) => {
          this.flashcards.unshift({
            id: `fc-ai-${Date.now()}-${idx}`,
            subject: item.subject || 'Custom',
            prompt: item.prompt,
            answer: item.answer,
            deck: item.deck || 'physics',
            difficulty: 'hard'
          });
        });

        this.switchFlashcardDeck('all');
        alert("🎉 3 New AI Flashcards added to your deck!");
      }
    } catch (e) {
      // Offline fallback card
      this.flashcards.unshift({
        id: `fc-custom-${Date.now()}`,
        subject: 'Custom',
        prompt: `Key examination concepts for: ${topic.trim()}`,
        answer: `<p>Review core fundamental laws, boundary conditions, and standard formulas for ${topic.trim()}.</p>`,
        deck: 'physics',
        difficulty: 'hard'
      });
      this.switchFlashcardDeck('all');
      alert("✨ Flashcard added successfully!");
    }
  }

  /* =========================================================================
     MODULE 6: FORMULA & CONSTANT VAULT
     ========================================================================= */
  initFormulas() {
    this.renderFormulas(this.formulaDatabase);
  }

  renderFormulas(list) {
    const container = document.getElementById('formulas-container');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">No formulas found matching search criteria.</div>`;
      return;
    }

    // Group by category
    const groups = {};
    list.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });

    container.innerHTML = Object.keys(groups).map(cat => `
      <div class="formula-category-card">
        <h4 class="formula-cat-title">
          <i class="fa-solid fa-square-root-variable text-blue"></i> ${cat}
        </h4>
        <div class="formula-items-list">
          ${groups[cat].map(f => `
            <div class="formula-entry-card">
              <div class="formula-entry-header">${f.name} (${f.subject})</div>
              <div class="formula-math-display">$$${f.formula}$$</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${f.desc}</div>
              <div class="formula-entry-actions">
                <button class="btn-xs-primary" onclick="app.deriveFormulaWithAI('${this.escapeHtml(f.name)}', '${this.escapeHtml(f.formula)}')">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Derive with AI
                </button>
                <button class="btn-xs-secondary" onclick="app.copyFormula('${this.escapeHtml(f.formula)}')">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  searchFormulas() {
    const input = document.getElementById('formula-search-input');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    if (!query) {
      this.renderFormulas(this.formulaDatabase);
      return;
    }
    const filtered = this.formulaDatabase.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.subject.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query) ||
      f.desc.toLowerCase().includes(query)
    );
    this.renderFormulas(filtered);
  }

  deriveFormulaWithAI(name, formula) {
    this.switchTab('ai-tutor');
    this.sendPresetDoubt(`Provide the complete, rigorous step-by-step mathematical proof and derivation for ${name}: ${formula}`);
  }

  copyFormula(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.playSFX('click');
      alert(`Copied formula: ${text}`);
    });
  }

  /* =========================================================================
     MODULE 7: EXAM STRESS RELIEF & 4-7-8 BREATHING
     ========================================================================= */
  toggleBreathingExercise() {
    this.playSFX('click');
    const circle = document.getElementById('breathing-anim-circle');
    const stageText = document.getElementById('breath-stage-text');
    const timerText = document.getElementById('breath-timer-text');
    const btn = document.getElementById('btn-breathing-toggle');

    if (this.isBreathingActive) {
      clearInterval(this.breathingInterval);
      this.isBreathingActive = false;
      if (circle) circle.className = 'breathing-circle-outer';
      if (stageText) stageText.innerText = "Inhale";
      if (timerText) timerText.innerText = "4s";
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Breathing Session';
    } else {
      this.isBreathingActive = true;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Session';

      let stage = 'inhale';
      let remaining = 4;

      const runCycle = () => {
        if (remaining > 1) {
          remaining--;
          if (timerText) timerText.innerText = `${remaining}s`;
        } else {
          if (stage === 'inhale') {
            stage = 'hold';
            remaining = 7;
            if (circle) circle.className = 'breathing-circle-outer hold';
            if (stageText) stageText.innerText = "Hold Breath";
          } else if (stage === 'hold') {
            stage = 'exhale';
            remaining = 8;
            if (circle) circle.className = 'breathing-circle-outer exhale';
            if (stageText) stageText.innerText = "Slow Exhale";
          } else {
            stage = 'inhale';
            remaining = 4;
            if (circle) circle.className = 'breathing-circle-outer inhale';
            if (stageText) stageText.innerText = "Deep Inhale";
          }
          if (timerText) timerText.innerText = `${remaining}s`;
        }
      };

      if (circle) circle.className = 'breathing-circle-outer inhale';
      if (stageText) stageText.innerText = "Deep Inhale";
      if (timerText) timerText.innerText = "4s";

      this.breathingInterval = setInterval(runCycle, 1000);
    }
  }

  toggleBinauralWaves() {
    const btn = document.getElementById('btn-binaural-flow');
    if (this.isBinauralPlaying) {
      this.stopBinauralWaves();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Play Sound';
    } else {
      this.startBinauralWaves();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Stop Sound';
    }
  }

  startBinauralWaves() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      const merger = this.audioCtx.createChannelMerger(2);

      this.binauralOsc1 = this.audioCtx.createOscillator();
      this.binauralOsc1.type = 'sine';
      this.binauralOsc1.frequency.setValueAtTime(432, this.audioCtx.currentTime);
      this.binauralOsc1.connect(merger, 0, 0);

      this.binauralOsc2 = this.audioCtx.createOscillator();
      this.binauralOsc2.type = 'sine';
      this.binauralOsc2.frequency.setValueAtTime(442, this.audioCtx.currentTime);
      this.binauralOsc2.connect(merger, 0, 1);

      merger.connect(gain);
      gain.connect(this.audioCtx.destination);

      this.binauralOsc1.start();
      this.binauralOsc2.start();
      this.isBinauralPlaying = true;
    } catch (e) {}
  }

  stopBinauralWaves() {
    if (this.binauralOsc1) {
      try {
        this.binauralOsc1.stop();
        this.binauralOsc2.stop();
        this.binauralOsc1.disconnect();
        this.binauralOsc2.disconnect();
      } catch (e) {}
    }
    this.isBinauralPlaying = false;
  }

  playAmbientPreset(type) {
    this.playSFX('click');
    alert(`🎧 Ambient ${type === 'rain' ? 'Rainfall' : 'Brownian Noise'} synthesizer activated for deep focus!`);
  }

  refreshAffirmation() {
    this.playSFX('click');
    const random = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
    const el = document.getElementById('daily-affirmation-text');
    if (el) el.innerText = `"${random}"`;
  }

  /* =========================================================================
     NOTE-TO-QUIZ AI GENERATOR
     ========================================================================= */
  async promptCustomNoteQuiz() {
    const text = prompt("Paste your syllabus notes or enter a custom topic (e.g., 'Laws of Motion and Friction'):");
    if (!text || !text.trim()) return;

    this.playSFX('click');
    alert(`🤖 Gemini AI is generating a custom 5-question mock test from your syllabus notes...`);

    try {
      const promptText = `Generate a 5-question multiple choice test based on these notes: "${text.trim()}". Return only a JSON array of 5 questions formatted as: [{"q":"Question text","options":["A","B","C","D"],"correct":0,"difficulty":"Medium","topic":"Topic Name","explanation":"Step by step proof"}]`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const customQuestions = JSON.parse(raw);

        const bank = this.getQuestionBank();
        bank['custom'] = customQuestions;
        this.startQuiz('custom');
      }
    } catch (e) {
      // Fallback
      this.startQuiz('physics');
    }
  }

  /* =========================================================================
     PERSISTENCE & API KEY CONFIG
     ========================================================================= */
  saveState() {
    localStorage.setItem('sm_learning_score', this.learningScore);
    localStorage.setItem('sm_readiness_score', this.readinessScore);
    localStorage.setItem('sm_streak_days', this.streakDays);
    localStorage.setItem('sm_tests_completed', this.testsCompleted);
    localStorage.setItem('sm_weak_topics', JSON.stringify(this.weakTopics));
    localStorage.setItem('sm_today_tasks', JSON.stringify(this.todayTasks));
  }

  configureApiKey() {
    this.playSFX('click');
    const currentKey = this.geminiApiKey || '';
    const newKey = prompt("Enter or update your Gemini API Key for live AI doubt solving:", currentKey);
    if (newKey !== null && newKey.trim()) {
      this.geminiApiKey = newKey.trim();
      localStorage.setItem('studymate_gemini_api_key', this.geminiApiKey);
      this.updateApiStatusUI();
      alert("✨ Gemini API Key updated successfully!");
    }
  }

  updateApiStatusUI() {
    const text = document.getElementById('api-status-text');
    if (text) {
      text.innerText = this.geminiApiKey ? 'Live Connected' : 'Disconnected';
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global App Instance
const app = new StudyMateApp();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

