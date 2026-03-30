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

  /* ── Base de réponses hardcodées ─────────────────────────── */
  const FAQ = [
    {
      keys: ['horaire', 'heure', 'ouvert', 'ferme', 'ouverture', 'fermeture', 'disponible', 'quand'],
      reply: '🕙 Nous sommes ouverts du lundi au vendredi de 10h à 22h, et le samedi de 10h à 23h. Le dimanche on se repose, mais on revient lundi avec encore plus d\'énergie ! 😄'
    },
    {
      keys: ['adresse', 'localisation', 'où', 'situe', 'trouver', 'emplacement', 'lieu', 'carrefour'],
      reply: '📍 Vous nous trouverez au Carrefour 3 Banques, Cotonou. C\'est facile à trouver, tout le monde connaît le coin ! 🗺️'
    },
    {
      keys: ['telephone', 'téléphone', 'appeler', 'numero', 'numéro', 'contact', 'joindre'],
      reply: '📞 Vous pouvez nous appeler au +229 97 00 00 00 ou nous écrire à hello@djoko.bj. On répond vite ! 😊'
    },
    {
      keys: ['menu', 'carte', 'plat', 'manger', 'choisir', 'propose', 'vente'],
      reply: '🍽️ Notre menu comprend :\n• 🍔 Burgers (Le Burger Djôkô, Le Royal Piment, Le Végétal…)\n• 📦 Boxes (Box frite au poulet, Wrap Akassa, Plateau Brochettes…)\n• 🍟 Accompagnements (frites, alloco, piment sauce…)\n• 🥤 Boissons et desserts\n\nVous pouvez tout voir sur notre page Menu ! 👉'
    },
    {
      keys: ['prix', 'coute', 'coûte', 'combien', 'tarif', 'fcfa', 'cfa', 'cher'],
      reply: '💰 Nos prix démarrent à 600 FCFA pour les accompagnements. Les burgers sont entre 2 200 et 2 800 FCFA. Les boxes de 3 200 à 4 500 FCFA. Qualité béninoise à prix accessibles ! 🇧🇯'
    },
    {
      keys: ['burger', 'djoko', 'royal', 'végétal', 'vegetal'],
      reply: '🍔 Nos burgers phares :\n• Le Burger Djôkô – 2 500 FCFA (pain miel de coco, steak 150g, sauce piment-gingembre)\n• Le Royal Piment – 2 800 FCFA\n• Le Végétal – 2 200 FCFA\nTous préparés avec des produits locaux frais !'
    },
    {
      keys: ['box', 'poulet', 'brochette', 'akassa', 'wrap', 'plateau'],
      reply: '📦 Nos Boxes :\n• Box frite au poulet – 3 200 FCFA\n• Wrap Akassa – 2 700 FCFA\n• Plateau Brochettes (bœuf + poulet, frites de plantain, sauce arachide) – 4 500 FCFA\nParfait pour partager ou pour un repas complet !'
    },
    {
      keys: ['accompagnement', 'frite', 'alloco', 'plantain', 'boisson', 'dessert'],
      reply: '🍟 Accompagnements & extras :\n• Frites – 1 500 FCFA\n• Alloco (plantain frit) – 1 700 FCFA\n• Boissons à partir de 600 FCFA\n• Desserts à partir de 700 FCFA\nDe quoi compléter votre repas !'
    },
    {
      keys: ['livraison', 'livrer', 'delivery', 'domicile', 'commander'],
      reply: '🛵 Pour les commandes et livraisons, appelez-nous directement au +229 97 00 00 00 ou passez via notre page Menu. On fera notre maximum pour vous régaler chez vous ! 😋'
    },
    {
      keys: ['réserver', 'reserver', 'reservation', 'réservation', 'table', 'groupe'],
      reply: '🪑 Pour réserver une table ou organiser un événement de groupe, contactez-nous au +229 97 00 00 00 ou par email à hello@djoko.bj. On s\'occupe de tout !'
    },
    {
      keys: ['histoire', 'propos', 'qui', 'djoko', 'fondateur', 'marque'],
      reply: '🇧🇯 DJÔKÔ, c\'est le fast-food béninois qui célèbre les saveurs de chez nous avec une expérience moderne et accessible. Notre mission : sublimer les recettes locales pour que tu reviennes toujours ! Découvrez notre histoire sur la page À propos. 💛'
    },
    {
      keys: ['merci', 'super', 'cool', 'génial', 'bravo', 'top'],
      reply: 'Merci à vous ! 😊 C\'est pour vous que DJÔKÔ existe. N\'hésitez pas si vous avez d\'autres questions !'
    },
    {
      keys: ['bonjour', 'salut', 'hello', 'bonsoir', 'bjr', 'coucou', 'yo'],
      reply: 'Bonjour ! 👋 Bienvenue chez DJÔKÔ, le fast-food béninois premium. Je suis Djômi, votre assistant. Comment puis-je vous aider ? Menu, horaires, adresse… posez-moi vos questions ! 🍔'
    },
    {
      keys: ['bye', 'au revoir', 'bonne journée', 'merci bonne', 'à bientôt', 'ciao'],
      reply: 'À très bientôt chez DJÔKÔ ! 👋 Bonne journée et venez nous voir au Carrefour 3 Banques 😄🇧🇯'
    },
  ];

  function getAutoReply(text) {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const item of FAQ) {
      if (item.keys.some(k => lower.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
        return item.reply;
      }
    }
    return '🤔 Je ne suis pas sûr de comprendre votre question. Vous pouvez m\'interroger sur notre menu, nos prix, nos horaires, notre adresse ou nous contacter directement au +229 97 00 00 00 ! 😊';
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    showTyping();

    // Simuler un délai naturel (300–700ms)
    const delay = 300 + Math.random() * 400;
    setTimeout(() => {
      removeTyping();
      addMessage('bot', getAutoReply(text));
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }, delay);
  }
})();
// update
