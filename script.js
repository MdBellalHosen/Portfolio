const typedText = document.getElementById('typedText');
const words = ['Software Engineer', 'AI Developer', 'UI/UX Designer', 'Graphic Designer', 'Creative Problem Solver'];
let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typedText) return;
  const current = words[wordIndex];
  typedText.textContent = current.slice(0, charIndex);

  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(typeLoop, 90);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(typeLoop, 50);
  } else {
    deleting = !deleting;
    if (!deleting) wordIndex = (wordIndex + 1) % words.length;
    setTimeout(typeLoop, 800);
  }
}

typeLoop();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + '+';
          clearInterval(timer);
        } else {
          el.textContent = current;
        }
      }, 50);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.6 });

counters.forEach((counter) => counterObserver.observe(counter));

const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const themeOptions = document.querySelectorAll('.theme-option');
const scrollProgress = document.getElementById('scrollProgress');
const codeTabs = document.querySelectorAll('.code-tab');
const codeSnippet = document.getElementById('codeSnippet');
const codeLabel = document.getElementById('codeLabel');
const hireHeader = document.getElementById('hireHeader');
const contactOverlay = document.getElementById('contactOverlay');
const closeOverlay = document.getElementById('closeOverlay');
const storedTheme = localStorage.getItem('portfolio-theme') || 'default';
applyTheme(storedTheme);

function applyTheme(theme) {
  document.body.dataset.theme = theme === 'default' ? 'dark' : theme;
  if (themeToggle) {
    const label = theme === 'default' ? '☀️' : theme === 'dark' ? '🌙' : '✨';
    themeToggle.textContent = label;
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.body.dataset.theme || 'dark';
    const next = current === 'dark' ? 'cyber' : 'dark';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

themeOptions.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.theme;
    applyTheme(value);
    localStorage.setItem('portfolio-theme', value);
  });
});

const projectCards = document.querySelectorAll('.project-card');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

const projectDetails = {
  ai: {
    title: 'AI Assistant Platform',
    body: 'Overview: A smart assistant focused on productivity. Problem: Users needed faster access to documents and tasks. Solution: Built a conversational workspace with automation and smooth UI. Challenges: balancing speed with accuracy. Result: improved daily workflow and engagement.'
  },
  ecommerce: {
    title: 'Modern E-commerce',
    body: 'Overview: A polished storefront with fast checkout and strong product storytelling. Problem: Conversion rate and trust were limiting growth. Solution: Redesigned the funnel and introduced richer product presentation. Result: smoother browsing and better customer retention.'
  },
  design: {
    title: 'Creative Design System',
    body: 'Overview: A scalable UI design system for launch-ready interfaces. Problem: Teams needed consistency across products. Solution: Created reusable components, tokens, and documentation. Result: faster development and a stronger brand presence.'
  }
};

projectCards.forEach((card) => {
  card.addEventListener('click', () => {
    const detail = projectDetails[card.dataset.project];
    if (detail) {
      modalTitle.textContent = detail.title;
      modalBody.textContent = detail.body;
      modal.classList.add('open');
    }
  });
});

closeModal?.addEventListener('click', () => modal.classList.remove('open'));
modal?.addEventListener('click', (event) => {
  if (event.target === modal) modal.classList.remove('open');
});

const testimonialItems = document.querySelectorAll('.testimonial');
let currentTestimonial = 0;
setInterval(() => {
  testimonialItems.forEach((item) => item.classList.remove('active'));
  currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
  testimonialItems[currentTestimonial].classList.add('active');
}, 4000);

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatButtons = document.querySelectorAll('.chip-btn');

function appendMessage(text, type = 'bot') {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function answerPrompt(text) {
  const lower = text.toLowerCase();
  if (lower.includes('project')) return 'I have worked on AI assistants, e-commerce experiences, and design systems. I can share details for any of them.';
  if (lower.includes('resume')) return 'My resume is available from the Resume section and the Download Resume button.';
  if (lower.includes('skill')) return 'My skills span frontend, backend, databases, design, and animation tools.';
  if (lower.includes('contact')) return 'You can reach me at bellam546@gmail.com or +8801855087421.';
  return 'I can help with projects, skills, education, experience, and contact details.';
}

chatSend?.addEventListener('click', () => {
  const val = chatInput.value.trim();
  if (!val) return;
  appendMessage(val, 'user');
  chatInput.value = '';
  setTimeout(() => appendMessage(answerPrompt(val)), 400);
});

chatButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.dataset.prompt;
    appendMessage(prompt, 'user');
    setTimeout(() => appendMessage(answerPrompt(prompt)), 400);
  });
});

const gamePrompt = document.getElementById('gamePrompt');
const gameInput = document.getElementById('gameInput');
const gameCheck = document.getElementById('gameCheck');
const gameResult = document.getElementById('gameResult');

if (gameCheck) {
  gameCheck.addEventListener('click', () => {
    const expected = 'I build digital experiences.';
    const actual = gameInput.value.trim();
    if (actual === expected) {
      gameResult.textContent = 'Perfect! You nailed the typing sprint.';
    } else {
      gameResult.textContent = 'Almost there — try again.';
    }
  });
}

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('mousemove', (event) => {
  if (cursorGlow) {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }
});

const snippets = {
  html: `<section class="hero">
  <h1>Hi, I'm Bellal</h1>
  <p>I build digital experiences.</p>
</section>`,
  css: `.hero {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, #6ee7ff, #8b5cf6);
}`,
  js: `const greet = (name) => \`Hello, ${name}!\`;
console.log(greet('Bellal'));`,
  python: `def build_portfolio(name):
    return f"Hello {name}, your site is ready"`,
  sql: `SELECT name, role FROM developers
WHERE skills LIKE '%AI%';`
};

const labels = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
  python: 'portfolio.py',
  sql: 'queries.sql'
};

function updateSnippet(lang) {
  codeSnippet.innerHTML = snippets[lang]
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\s/g, '&nbsp;');
  codeLabel.textContent = labels[lang];
  codeTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.lang === lang));
}

codeTabs.forEach((tab) => {
  tab.addEventListener('click', () => updateSnippet(tab.dataset.lang));
});

updateSnippet('html');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (scrollTop / height) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
});

const skillChips = document.querySelectorAll('.skill-chip');
const skillRings = document.querySelectorAll('.skill-ring');

function filterSkills(category) {
  skillRings.forEach((ring) => {
    if (category === 'all' || ring.dataset.category === category) {
      ring.style.display = 'grid';
    } else {
      ring.style.display = 'none';
    }
  });
}

skillChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    skillChips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    filterSkills(chip.dataset.skill);
  });
});

filterSkills('all');

if (hireHeader && contactOverlay) {
  hireHeader.addEventListener('click', () => {
    contactOverlay.classList.add('open');
  });
}

closeOverlay?.addEventListener('click', () => {
  contactOverlay?.classList.remove('open');
});

contactOverlay?.addEventListener('click', (event) => {
  if (event.target === contactOverlay) {
    contactOverlay.classList.remove('open');
  }
});

const form = document.querySelector('.contact-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Thanks! Your message has been captured for the portfolio demo.');
});
