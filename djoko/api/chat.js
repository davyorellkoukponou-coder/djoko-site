// api/chat.js — Proxy sécurisé Gemini
// La clé API est lue depuis les variables d'environnement Vercel (jamais exposée au client)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const apiKey = process.env.GEMINI_API_KEY; // ← Stockée dans Vercel, jamais dans le code
  if (!apiKey) return res.status(500).json({ error: 'Clé API non configurée' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message requis' });

  // Contexte de l'entreprise transmis à Gemini
  const systemContext = `Tu es Djômi, l'assistant virtuel de DJÔKÔ, un fast-food béninois moderne et premium situé à Cotonou, Bénin.

DJÔKÔ est né en 2026 de la passion de trois amis pour la cuisine de rue béninoise. Notre mission : sublimer les saveurs locales avec une expérience moderne, rapide et accessible. Le nom "Djôkô" vient du fon et évoque le plaisir gourmand.

Nos spécialités :
- Le Burger Djôkô (pain artisanal, steak local, sauce piment-gingembre)
- La Box Amiwo (pâte de maïs revisitée avec poulet grillé)
- Les Frites de plantain croustillantes
- La Boisson Sobolo (hibiscus frais maison)
- Le Wrap Akassa (akassa croustillant façon wrap)

Valeurs : Authenticité, Rapidité, Qualité locale, Fierté béninoise.
Adresse : Carrefour des Trois Banques, Cotonou | Tel : +229 97 00 00 00
Horaires : 10h–22h tous les jours

Réponds toujours en français, de façon chaleureuse, conviviale et professionnelle. Tu peux répondre aux questions sur le menu, les horaires, les valeurs, l'histoire. Si on te pose des questions hors sujet, ramène poliment la conversation sur DJÔKÔ.`;

  // Formater l'historique pour Gemini
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemContext }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Erreur Gemini');

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas compris.';
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Erreur Gemini:', err);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' });
  }
}
