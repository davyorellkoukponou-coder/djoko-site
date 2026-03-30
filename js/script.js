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
  history.push({ role: 'user', content: text });

  // Simulation délai naturel
  setTimeout(() => {
    removeTyping();
    const reply = getReponse(text);
    addMessage('bot', reply);
    history.push({ role: 'assistant', content: reply });
    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }, 800);
}
const suggest = () => {
  const s = [
    "Tu veux voir le menu 😏 ?",
    "Je peux te recommander un plat 🔥",
    "Tu veux les prix ou les horaires ?",
    "Je peux te guider rapidement 😉"
  ];
  return "\n\n👉 " + s[Math.floor(Math.random() * s.length)];
};
function getReponse(msg) {
  const m = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Horaires
  if (m.match(/horaire|heure|ouvert|ferme|quand|disponible/))
    return "Nous sommes ouverts tous les jours ! Lundi au vendredi de 10h a 22h, le samedi de 10h a 23h et le dimanche de 11h a 21h. On vous attend !";

  // Adresse / localisation
  if (m.match(/adresse|ou|localise|situe|trouver|venir|quartier|lieu|plan|maps/))
    return "Vous nous trouverez au Carrefour des Trois Banques, Akpakpa, Cotonou. Facile d'acces, bien visible depuis la route principale !";

  // Téléphone / contact
  if (m.match(/telephone|appel|contact|joindre|numero|whatsapp/))
    return "Vous pouvez nous appeler ou nous ecrire sur WhatsApp au +229 97 00 00 00. Nous repondons rapidement !";

  // Email
  if (m.match(/email|mail|message|ecrire/))
    return "Ecrivez-nous a hello@djoko.bj pour toute demande. Pour les commandes speciales, utilisez commandes@djoko.bj.";

  // Menu général
  if (m.match(/menu|carte|plat|manger|specialite|propose|offre/))
    return "Notre menu comprend des Burgers, des Boxes, des Accompagnements, des Boissons et des Desserts. Tous prepares avec des ingredients locaux frais ! Rendez-vous sur la page Menu pour tout decouvrir.";

  // Burger
  if (m.match(/burger|djoko burger|kpoun/))
    return "Notre star c'est le Burger DJOKO : pain artisanal, steak local 150g et sauce piment-gingembre maison a 2 500 FCFA. Si vous aimez le piment, essayez le Kpoun Burger a 2 800 FCFA — un vrai feu !";

  // Box Amiwo
  if (m.match(/amiwo|box|wrap|akassa|grillad/))
    return "La Box Amiwo est notre signature : pate de mais revisitee avec poulet grille aux epices du Sud Benin, a 3 200 FCFA. On a aussi le Wrap Akassa a 2 700 FCFA et la Box Grillades a 4 500 FCFA pour les grandes faims !";

  // Boissons
  if (m.match(/boisson|boire|sobolo|jus|bissap|hibiscus|eau/))
    return "Notre boisson signature c'est le Sobolo Maison — hibiscus frais infuse a froid avec miel local et gingembre, a 600 FCFA. On a aussi des Jus Tropicaux frais (mangue, ananas, papaye) a 700 FCFA. Rien d'industriel ici !";

  // Desserts
  if (m.match(/dessert|sucre|gateau|beignet|glace|coco|mousse/))
    return "Nos desserts maison : Beignets au Miel (atchomon nappé de miel de coco) a 900 FCFA, et la Mousse Coco-Mangue a 1 100 FCFA. Le peche mignon de DJOKO !";

  // Prix / tarif
  if (m.match(/prix|combien|coute|tarif|fcfa|cher|budget|payer/))
    return "Nos prix vont de 600 FCFA pour une boisson jusqu'a 4 500 FCFA pour la Box Grillades. La majorite de nos plats sont entre 2 000 et 3 200 FCFA. Qualite premium, prix accessibles !";

  // Commande / livraison
  if (m.match(/commande|commander|livr|emporter|place|online|reservation/))
    return "Pour l'instant on ne fait pas encore de livraison en ligne, mais vous pouvez venir directement ou nous appeler au +229 97 00 00 00 pour une commande a emporter. On prepare tout en moins de 8 minutes !";

  // Temps de preparation
  if (m.match(/temps|attente|rapide|vite|minutes|preparation/))
    return "Chez DJOKO, votre commande est prete en moins de 8 minutes ! Tout est prepare a la commande pour garantir la fraicheur. Fast-food ne veut pas dire mauvaise qualite.";

  // Ingredients / local / frais
  if (m.match(/ingredient|local|frais|bio|sain|qualite|provenance|producteur/))
    return "100% de nos ingredients sont sources aupres de producteurs beninois locaux. Du champ a l'assiette, nous soutenons l'economie locale et garantissons la fraicheur de chaque plat.";

  // Vegetarien / régime
  if (m.match(/vegetar|vegan|sans viande|regime|allergi|gluten|intoleran/))
    return "Oui, nous avons une option vegetarienne : le Beurre-Igname (steak d'igname et pois niebe) a 2 200 FCFA. Pour les allergies specifiques, appelez-nous au +229 97 00 00 00 avant votre visite.";

  // Histoire / fondateurs
  if (m.match(/histoire|fondateur|cree|origine|debut|kofi|amina|pascal|2022/))
    return "DJOKO a ete cree en 2022 par trois amis — Kofi, Amina et Pascal — unis par leur passion pour la cuisine de rue beninoise. Partis de 500 000 FCFA en commun, ils ont ouvert DJOKO et fait la queue depasser le pate de maisons des le premier jour !";

  // Valeurs / mission
  if (m.match(/valeur|mission|vision|philosophie|engagement|fierte/))
    return "Chez DJOKO, nos trois valeurs fondamentales sont l'Authenticite (recettes inspirees des traditions du Sud Benin), la Communaute (soutien aux producteurs locaux) et l'Innovation (reinventer les classiques sans les trahir).";

  // Avis / recommandation
  if (m.match(/avis|recommande|conseil|meilleur|populaire|star|favori/))
    return "Notre plat le plus commande est le Burger DJOKO ! Si c'est votre premiere visite, on vous conseille le combo : Burger DJOKO + Frites de Plantain + Sobolo Maison. Vous ne serez pas decu !";

  // Paiement
  if (m.match(/paiement|payer|cash|carte|mobile money|momo|flooz/))
    return "Nous acceptons le cash, le Mobile Money (MTN et Moov) et les paiements par carte. Toutes les options sont disponibles pour votre confort.";

  // Parking / access
  if (m.match(/parking|garer|acces|bus|taxi|zem|transport/))
    return "Notre restaurant dispose d'un espace de stationnement. Nous sommes aussi accessible en taxi, zemidjan et bus depuis le carrefour des Trois Banques — un point de repere bien connu a Cotonou !";

  // Evenement / traiteur
  if (m.match(/evenement|anniversaire|fete|traiteur|groupe|reservation|privatise/))
    return "Oui, nous organisons des commandes de groupe et des prestations traiteur pour vos evenements ! Contactez-nous a commandes@djoko.bj ou au +229 97 00 00 00 pour en discuter.";

  // Remerciements
  if (m.match(/merci|super|genial|parfait|excellent|bravo|top|bien/))
    return "Merci beaucoup ! C'est notre mission de vous satisfaire. N'hesitez pas si vous avez d'autres questions. A bientot chez DJOKO !";

  // Salutations
  if (m.match(/bonjour|bonsoir|salut|hello|yo|coucou|bonne journee/))
    return "Bonjour et bienvenue chez DJOKO ! Je suis Djomi, votre assistant. Posez-moi toutes vos questions sur notre menu, nos horaires, notre adresse ou notre histoire. Comment puis-je vous aider ?";

  // Au revoir
  if (m.match(/au revoir|bye|a bientot|bonne soiree|bonne nuit|ciao|tchao/))
    return "Au revoir et a tres bientot chez DJOKO ! N'oubliez pas de nous rendre visite au Carrefour des Trois Banques. Bonne journee !";

  // Réponse par défaut
  const suggestions = [
  "Tu veux voir nos burgers 🍔 ou nos desserts 🍰 ?",
  "Je peux te recommander un plat 🔥 ou te montrer le menu.",
  "Tu cherches plutot un truc rapide ou un bon repas complet ?",
  "Je peux te dire les prix 💸 ou les horaires ⏰ si tu veux.",
  "Tu veux notre meilleure recommandation du moment 😏 ?"
];

const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

return "Bonne question ! Pour cette demande, je vous invite a nous contacter directement au +229 97 00 00 00 ou par email a hello@djoko.bj.\n\n👉 " + randomSuggestion;
}
})();
// update
