import type { AnswersByCategory, CategoryId } from "../data/types";
import { categories } from "../data/categories";
import { sanitizeAnswers, visibleQuestions } from "./questions";

/** One sentence per category, from the most innocent tier to the most extreme. */
const TIER_SENTENCES: Record<CategoryId, [string, string, string, string, string]> = {
  sexe: [
    "Côté sexe, c'est le calme plat : tu gardes ça pour plus tard (ou pour jamais).",
    "Côté sexe, tu restes sage : quelques expériences, rien qui choquerait ta grand-mère.",
    "Côté sexe, tu as exploré un peu plus que la moyenne sans perdre le nord.",
    "Côté sexe, tu as un vrai CV, et pas seulement en position du missionnaire.",
    "Côté sexe, tu as tout essayé ou presque : le Kamasutra prend des notes.",
  ],
  drogue: [
    "La drogue ? Jamais touché, ton corps est un temple.",
    "La drogue, tu y as goûté du bout des lèvres, par curiosité.",
    "La drogue, tu connais : quelques soirées bien chargées au compteur.",
    "La drogue fait clairement partie de ton histoire, et pas qu'un peu.",
    "La drogue, tu as fait le tour de la pharmacie, et de l'arrière-boutique.",
  ],
  alcool: [
    "L'alcool ? Eau plate et jus de fruits, tu es le Sam de service.",
    "L'alcool, avec modération, au vrai sens du mot.",
    "L'alcool, tu sais faire la fête et tu as quelques lendemains difficiles en mémoire.",
    "L'alcool et toi, c'est une longue histoire pleine de trous noirs.",
    "L'alcool, ton foie mérite une médaille, ou un arrêt maladie.",
  ],
  moral: [
    "Moralement, tu es irréprochable, presque suspect.",
    "Moralement, quelques petits arrangements avec la vérité, comme tout le monde.",
    "Moralement, tu sais tordre les règles quand ça t'arrange.",
    "Moralement, ta conscience a appris à se taire.",
    "Moralement, ton rapport à la loi et aux autres est très… flexible.",
  ],
  hygiene: [
    "Côté hygiène, propre comme un sou neuf.",
    "Côté hygiène, quelques flemmes, rien de grave.",
    "Côté hygiène, tu vis selon la règle des 5 secondes, et pas que pour la nourriture.",
    "Côté hygiène, tes colocs ont sûrement un avis sur la question.",
    "Côté hygiène, même les mouches gardent leurs distances.",
  ],
};

/** Same tiers, written about someone else (shown on a shared result link). */
const SHARED_TIER_SENTENCES: Record<CategoryId, [string, string, string, string, string]> = {
  sexe: [
    "Côté sexe, c'est le calme plat : c'est gardé pour plus tard (ou pour jamais).",
    "Côté sexe, plutôt sage : quelques expériences, rien qui choquerait une grand-mère.",
    "Côté sexe, un peu plus d'exploration que la moyenne, sans perdre le nord.",
    "Côté sexe, un vrai CV, et pas seulement en position du missionnaire.",
    "Côté sexe, tout a été essayé ou presque : le Kamasutra prend des notes.",
  ],
  drogue: [
    "La drogue ? Jamais touché, ce corps est un temple.",
    "La drogue, goûtée du bout des lèvres, par curiosité.",
    "La drogue, c'est connu : quelques soirées bien chargées au compteur.",
    "La drogue fait clairement partie de l'histoire, et pas qu'un peu.",
    "La drogue : le tour de la pharmacie a été fait, et de l'arrière-boutique.",
  ],
  alcool: [
    "L'alcool ? Eau plate et jus de fruits : le Sam de service.",
    "L'alcool, avec modération, au vrai sens du mot.",
    "L'alcool : la fête est maîtrisée, avec quelques lendemains difficiles en mémoire.",
    "L'alcool, c'est une longue histoire pleine de trous noirs.",
    "L'alcool : ce foie mérite une médaille, ou un arrêt maladie.",
  ],
  moral: [
    "Moralement, irréprochable, presque suspect.",
    "Moralement, quelques petits arrangements avec la vérité, comme tout le monde.",
    "Moralement, les règles se tordent quand ça arrange.",
    "Moralement, la conscience a appris à se taire.",
    "Moralement, un rapport à la loi et aux autres très… flexible.",
  ],
  hygiene: [
    "Côté hygiène, propre comme un sou neuf.",
    "Côté hygiène, quelques flemmes, rien de grave.",
    "Côté hygiène, la règle des 5 secondes s'applique, et pas que pour la nourriture.",
    "Côté hygiène, les colocs ont sûrement un avis sur la question.",
    "Côté hygiène, même les mouches gardent leurs distances.",
  ],
};

/** Whose result is described: the player's own, or someone else's shared one. */
export type PortraitPerspective = "self" | "shared";

/** Notable answers worth quoting, from the most striking (highest weight). */
interface Highlight {
  question: string;
  minAnswerIndex: number;
  text: string;
  weight: number;
}

export const HIGHLIGHTS: Highlight[] = [
  { question: "sexe-02", minAnswerIndex: 3, text: "plus de 25 partenaires au compteur", weight: 8 },
  { question: "sexe-20", minAnswerIndex: 2, text: "déjà participé à une vraie partouze", weight: 9 },
  { question: "sexe-19", minAnswerIndex: 1, text: "déjà goûté aux plans à plusieurs", weight: 6 },
  { question: "sexe-15", minAnswerIndex: 1, text: "déjà poussé la porte d'un club libertin", weight: 6 },
  { question: "sexe-16", minAnswerIndex: 3, text: "le BDSM dans la peau", weight: 7 },
  { question: "sexe-25", minAnswerIndex: 1, text: "déjà trompé quelqu'un", weight: 7 },
  { question: "sexe-28", minAnswerIndex: 1, text: "déjà payé ou été payé·e pour du sexe", weight: 8 },
  { question: "sexe-08", minAnswerIndex: 3, text: "fait l'amour dans au moins 4 lieux insolites", weight: 5 },
  { question: "drogue-02", minAnswerIndex: 5, text: "fumé du cannabis tous les jours", weight: 7 },
  { question: "drogue-13", minAnswerIndex: 1, text: "déjà touché aux drogues dures", weight: 10 },
  { question: "drogue-20", minAnswerIndex: 2, text: "déjà revendu de la drogue", weight: 9 },
  { question: "drogue-11", minAnswerIndex: 1, text: "déjà fait au moins un trip psychédélique", weight: 5 },
  { question: "drogue-17", minAnswerIndex: 1, text: "déjà conduit sous l'emprise de la drogue", weight: 8 },
  { question: "alcool-04", minAnswerIndex: 5, text: "déjà dépassé les 25 verres en une soirée", weight: 8 },
  { question: "alcool-07", minAnswerIndex: 3, text: "plus de 10 blackouts à ton actif", weight: 7 },
  { question: "alcool-17", minAnswerIndex: 1, text: "déjà pris le volant après avoir bu", weight: 7 },
  { question: "alcool-22", minAnswerIndex: 1, text: "déjà soigné une gueule de bois avec un verre", weight: 6 },
  { question: "moral-07", minAnswerIndex: 4, text: "volé pour plus de 2 000 € au total", weight: 9 },
  { question: "moral-23", minAnswerIndex: 2, text: "déjà été condamné·e par la justice", weight: 9 },
  { question: "moral-03", minAnswerIndex: 3, text: "fait passer un examen à quelqu'un d'autre", weight: 8 },
  { question: "moral-21", minAnswerIndex: 3, text: "déjà envoyé quelqu'un à l'hôpital lors d'une bagarre", weight: 10 },
  { question: "moral-13", minAnswerIndex: 3, text: "fraudé le fisc pour des sommes conséquentes", weight: 7 },
  { question: "hygiene-03", minAnswerIndex: 3, text: "tenu plus d'une semaine sans douche", weight: 7 },
  { question: "hygiene-07", minAnswerIndex: 3, text: "fait l'impasse sur le lavage de mains après les toilettes", weight: 6 },
  { question: "hygiene-12", minAnswerIndex: 3, text: "mangé ce qui tombe par terre, peu importe le sol", weight: 5 },
  { question: "hygiene-16", minAnswerIndex: 4, text: "laissé la vaisselle moisir dans l'évier", weight: 5 },
];

const MAX_HIGHLIGHTS = 3;

function tierOf(score: number): number {
  if (score <= 5) return 0;
  if (score <= 25) return 1;
  if (score <= 50) return 2;
  if (score <= 75) return 3;
  return 4;
}

function joinFrench(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

/** Opening line contrasting the strongest and the weakest categories. */
function opening(scores: Record<CategoryId, number>, perspective: PortraitPerspective): string {
  const self = perspective === "self";
  const ranked = categories
    .map((c) => ({ label: c.label.toLowerCase(), score: scores[c.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  if (highest.score <= 5) {
    return self
      ? "Tu es d'une pureté rare : soit tu mens, soit tu vis dans un monastère."
      : "Une pureté rare : soit c'est un mensonge, soit une vie au monastère.";
  }
  if (lowest.score >= 60) {
    return self
      ? "Tu es au taquet partout : aucune catégorie n'a été épargnée."
      : "Au taquet partout : aucune catégorie n'a été épargnée.";
  }
  if (highest.score - lowest.score >= 40) {
    return self
      ? `Ton profil est plein de contrastes : sage en ${lowest.label}, déchaîné·e en ${highest.label}.`
      : `Un profil plein de contrastes : sage en ${lowest.label}, déchaîné·e en ${highest.label}.`;
  }
  const runnerUp = ranked[1];
  if (highest.score >= 60 && highest.score - runnerUp.score <= 10) {
    return self
      ? `Tes points forts (ou tes points faibles), c'est : ${highest.label} et ${runnerUp.label}.`
      : `Les points forts (ou les points faibles), c'est : ${highest.label} et ${runnerUp.label}.`;
  }
  if (highest.score >= 60) {
    return self
      ? `Ton point fort (ou ton point faible), c'est clairement : ${highest.label}.`
      : `Le point fort (ou le point faible), c'est clairement : ${highest.label}.`;
  }
  return self
    ? "Ton profil est plutôt homogène : aucune catégorie ne déborde vraiment."
    : "Un profil plutôt homogène : aucune catégorie ne déborde vraiment.";
}

/** Most striking answers actually shown and kept, at most one per category first. */
function highlights(answers: AnswersByCategory): string[] {
  const matched: Highlight[] = [];
  for (const category of categories) {
    const clean = sanitizeAnswers(category, answers[category.id]);
    const shown = new Set(visibleQuestions(category, clean).map((q) => q.id));
    for (const highlight of HIGHLIGHTS) {
      const chosen = clean[highlight.question];
      if (shown.has(highlight.question) && chosen != null && chosen >= highlight.minAnswerIndex) {
        matched.push(highlight);
      }
    }
  }
  matched.sort((a, b) => b.weight - a.weight);
  // Prefer variety: the best highlight of each category, then the rest.
  const usedCategories = new Set<string>();
  const varied = matched.filter((h) => {
    const category = h.question.split("-")[0];
    if (usedCategories.has(category)) return false;
    usedCategories.add(category);
    return true;
  });
  const rest = matched.filter((h) => !varied.includes(h));
  return [...varied, ...rest].slice(0, MAX_HIGHLIGHTS).map((h) => h.text);
}

/**
 * Short personalised description of a player, built from category scores and,
 * when available, the most striking answers (only the player has them: share
 * links carry scores only).
 */
export function buildPortrait(
  scores: Record<CategoryId, number>,
  answers?: AnswersByCategory,
  perspective: PortraitPerspective = "self",
): string[] {
  const sentences = perspective === "self" ? TIER_SENTENCES : SHARED_TIER_SENTENCES;
  const paragraphs = [opening(scores, perspective)];
  paragraphs.push(
    categories.map((c) => sentences[c.id][tierOf(scores[c.id] ?? 0)]).join(" "),
  );
  const notable = answers ? highlights(answers) : [];
  if (notable.length > 0) {
    paragraphs.push(`Mention spéciale : tu as ${joinFrench(notable)}.`);
  }
  return paragraphs;
}
