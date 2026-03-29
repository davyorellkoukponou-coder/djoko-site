/* ============================================================
   DJÔKÔ — script.js
   Bonus 1 : JS pour site professionnel
   - Navbar scroll effect
   - Animations au scroll (Intersection Observer)
   - Menu hamburger amélioré
   - Validation formulaire de contact
   - Filtre menu par catégorie
   Bonus 2 : Chatbot Djômi (proxy Vercel sécurisé)
   ============================================================ */

'use strict';

/* ── 1. Navbar scroll effect ──────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 2. Révélation éléments au scroll ─────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Délai en cascade pour chaque élément
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, entry.target.dataset.delay || 0);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el, i) => {
    el.dataset.delay = i * 80;
    observer.observe(el);
  });
})();

/* ── 3. Compteurs stats (à propos) ───────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── 4. Filtre menu par catégorie ────────────────────────── */
(function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Activer bouton
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;

      menuItems.forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;

        if (show) {
          item.style.display = '';
          // Petite animation
          requestAnimationFrame(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 10);
          });
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* ── 5. Validation formulaire contact ────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');

  // Validation en temps réel
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  function validateField(field) {
    const val = field.value.trim();
    let valid = true;
    let msg = '';

    if (field.required && !val) {
      valid = false; msg = 'Ce champ est obligatoire.';
    } else if (field.type === 'email' && val) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) { valid = false; msg = 'Email invalide.'; }
    } else if (field.id === 'nom' && val && val.length < 2) {
      valid = false; msg = 'Minimum 2 caractères.';
    } else if (field.id === 'message' && val && val.length < 10) {
      valid = false; msg = 'Votre message est trop court.';
    }

    field.classList.toggle('is-invalid', !valid);
    field.classList.toggle('is-valid', valid && !!val);

    const errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains('invalid-feedback')) {
      errorEl.textContent = msg;
    }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });

    if (!allValid) {
      feedback.className = 'form-feedback error';
      feedback.textContent = '⚠️ Veuillez corriger les erreurs avant d\'envoyer.';
      return;
    }

    // Simulation d'envoi (pas de backend réel pour ce projet)
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    setTimeout(() => {
      feedback.className = 'form-feedback success';
      feedback.textContent = '✅ Merci ! Votre message a bien été envoyé. Nous vous répondrons sous 24h.';
      form.reset();
      form.querySelectorAll('.is-valid').forEach(f => f.classList.remove('is-valid'));
      btn.disabled = false;
      btn.textContent = 'Envoyer le message';

      // Masquer après 6s
      setTimeout(() => { feedback.className = 'form-feedback'; }, 6000);
    }, 1500);
  });
})();

/* ── 6. Chatbot Djômi ────────────────────────────────────── */
(function initChatbot() {
  const bubble  = document.getElementById('chatbotBubble');
  const panel   = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotClose');
  const input   = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const messages = document.getElementById('chatbotMessages');

  if (!bubble || !panel) return;

  // Historique de conversation
  let history = [];
  let isLoading = false;

  // Ouvrir / fermer
  bubble.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    if (isOpen && messages.children.length === 0) {
      // Message d'accueil
      addMessage('bot', 'Bonjour ! 👋 Je suis Djômi, l\'assistant de DJÔKÔ. Comment puis-je vous aider aujourd\'hui ? Vous pouvez me poser des questions sur notre menu, nos horaires, ou notre histoire !');
    }
  });

  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Envoyer avec Entrée
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot typing';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    showTyping();

    // Ajouter à l'historique
    history.push({ role: 'user', content: text });

    try {
      const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCnZb8lR1fSKabrptKQIuwhQW02qtiQtek`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: text }] }],
      generationConfig: { maxOutputTokens: 300 }
    })
  }
);

if (!res.ok) throw new Error('Erreur Gemini');

const data = await res.json();
removeTyping();

const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
      addMessage('bot', reply);
    } catch (err) {
      removeTyping();
      addMessage('bot', 'Désolé, je rencontre une difficulté technique. Réessayez dans un moment ou appelez-nous au +229 97 00 00 00 ! 😊');
      console.error('Chatbot error:', err);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }
})();
