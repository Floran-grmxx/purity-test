import type { Question } from "../types";

export const alcoolQuestions: Question[] = [
  {
    id: "alcool-01",
    text: "As-tu déjà bu de l'alcool dans ta vie ?",
    answers: [
      { label: "Jamais une goutte", points: 0 },
      { label: "Juste pour goûter", points: 1 },
      { label: "Plusieurs fois", points: 2 },
      { label: "Régulièrement", points: 3 },
    ],
  },
  {
    id: "alcool-02",
    text: "Au plus fort de ta consommation, à quelle fréquence buvais-tu de l'alcool ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 1 }],
    answers: [
      { label: "Moins d'une fois par an", points: 0 },
      { label: "Quelques fois par an", points: 1 },
      { label: "Chaque mois", points: 2 },
      { label: "Chaque semaine", points: 3 },
      { label: "Presque tous les jours", points: 4 },
    ],
  },
  {
    id: "alcool-03",
    text: "À ta période où tu buvais le plus, combien de verres prenais-tu dans une soirée normale ? (1 verre = 1 demi-pinte de bière, 1 verre de vin ou 1 shot ; 1 cocktail ≈ 2 verres)",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 1 }],
    answers: [
      { label: "Aucun", points: 0 },
      { label: "1 ou 2", points: 1 },
      { label: "3 à 5", points: 2 },
      { label: "6 à 10", points: 3 },
      { label: "Plus de 10", points: 4 },
    ],
  },
  {
    id: "alcool-04",
    text: "Combien de verres as-tu bus pendant ta soirée la plus arrosée ? (1 verre = 1 demi-pinte de bière, 1 verre de vin ou 1 shot ; 1 cocktail ≈ 2 verres)",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 1 }],
    answerLimits: [
      { question: "alcool-03", allowed: { 2: [1, 2, 3, 4, 5], 3: [2, 3, 4, 5], 4: [3, 4, 5] } },
    ],
    answers: [
      { label: "1 ou 2", points: 0 },
      { label: "3 à 5", points: 1 },
      { label: "6 à 10", points: 2 },
      { label: "11 à 15", points: 3 },
      { label: "16 à 25", points: 4 },
      { label: "Plus de 25", points: 5 },
    ],
  },
  {
    id: "alcool-05",
    text: "À quel âge as-tu pris ta première vraie cuite ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "18 ans ou plus", points: 1 },
      { label: "16 ou 17 ans", points: 2 },
      { label: "Avant 16 ans", points: 3 },
    ],
  },
  {
    id: "alcool-06",
    text: "Au plus fort de ta consommation, à quelle fréquence finissais-tu vraiment ivre (bourré·e) ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answerLimits: [
      { question: "alcool-02", allowed: { 0: [0, 1], 1: [0, 1], 2: [0, 1, 2], 3: [0, 1, 2, 3] } },
    ],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "Quelques fois par an", points: 1 },
      { label: "Chaque mois", points: 2 },
      { label: "Chaque semaine", points: 3 },
      { label: "Plusieurs fois par semaine", points: 4 },
    ],
  },
  {
    id: "alcool-07",
    text: "As-tu déjà eu un trou noir (blackout) après avoir bu ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 2 },
      { label: "2 à 10 fois", points: 3 },
      { label: "Plus de 10 fois", points: 4 },
    ],
  },
  {
    id: "alcool-08",
    text: "Combien de fois t'es-tu réveillé·e sans aucun souvenir de la veille ?",
    requires: { question: "alcool-07", minAnswerIndex: 1 },
    answerLimits: [
      { question: "alcool-07", allowed: { 1: [0, 1], 2: [0, 1, 2] } },
    ],
    answers: [
      { label: "Jamais tout, il me reste des bribes", points: 0 },
      { label: "1 ou 2 fois", points: 2 },
      { label: "Moins de 10 fois", points: 4 },
      { label: "Moins de 25 fois", points: 6 },
      { label: "Trop pour compter", points: 8 },
    ],
  },
  {
    id: "alcool-09",
    text: "Pendant un blackout, t'a-t-on raconté des choses que tu ne pouvais pas croire avoir faites ?",
    requires: { question: "alcool-07", minAnswerIndex: 2 },
    answers: [
      { label: "Non, rien à signaler", points: 0 },
      { label: "Quelques anecdotes gênantes", points: 3 },
      { label: "Des choses sérieuses", points: 5 },
      { label: "Plusieurs fois des choses graves", points: 7 },
    ],
  },
  {
    id: "alcool-10",
    text: "As-tu déjà vomi à cause de l'alcool ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-11",
    text: "As-tu déjà bu jusqu'à ne plus tenir debout ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-12",
    text: "À ta période la plus festive, à quelle fréquence jouais-tu à des jeux à boire (beer pong, etc.) ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answerLimits: [
      { question: "alcool-02", allowed: { 0: [0, 1], 1: [0, 1], 2: [0, 1, 2] } },
    ],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "Quelques fois par an", points: 1 },
      { label: "Chaque mois", points: 2 },
      { label: "Presque à chaque soirée", points: 3 },
    ],
  },
  {
    id: "alcool-13",
    text: "As-tu déjà dit ou fait une grosse honte en étant bourré·e ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Trop de fois pour compter", points: 3 },
    ],
  },
  {
    id: "alcool-14",
    text: "As-tu déjà envoyé un message ou passé un appel gênant en étant bourré·e ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-15",
    text: "As-tu déjà eu une gueule de bois qui a duré plus d'une journée entière ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-16",
    text: "As-tu déjà raté un cours, un boulot ou un rendez-vous important à cause d'une cuite ?",
    onlyIf: [{ question: "alcool-05", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-17",
    text: "As-tu déjà conduit un véhicule après avoir bu ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 1 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 2 },
      { label: "2 à 10 fois", points: 3 },
      { label: "Plus de 10 fois", points: 4 },
    ],
  },
  {
    id: "alcool-18",
    text: "Au pire, à quelle fréquence as-tu pris le volant en sachant avoir trop bu ?",
    requires: { question: "alcool-17", minAnswerIndex: 1 },
    answerLimits: [
      { question: "alcool-17", allowed: { 1: [0, 1], 2: [0, 1, 2, 3] } },
    ],
    answers: [
      { label: "Jamais, je me pensais sous la limite", points: 0 },
      { label: "Vraiment exceptionnel", points: 2 },
      { label: "Quelques fois par an", points: 4 },
      { label: "Chaque mois", points: 6 },
      { label: "Régulièrement", points: 8 },
    ],
  },
  {
    id: "alcool-19",
    text: "As-tu déjà eu un contrôle, un accident ou un retrait de permis lié à l'alcool ?",
    requires: { question: "alcool-17", minAnswerIndex: 1 },
    answers: [
      { label: "Non, jamais rien", points: 0 },
      { label: "Un contrôle limite", points: 3 },
      { label: "Une amende ou un retrait", points: 5 },
      { label: "Un accident", points: 7 },
    ],
  },
  {
    id: "alcool-20",
    text: "As-tu déjà bu seul·e, sans occasion particulière ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 1 }],
    answerLimits: [
      { question: "alcool-02", allowed: { 0: [0, 1] } },
    ],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-21",
    text: "Au plus fort de ta consommation, à quelle fréquence buvais-tu seul·e chez toi ?",
    requires: { question: "alcool-20", minAnswerIndex: 2 },
    answerLimits: [
      { question: "alcool-02", allowed: { 0: [0], 1: [0, 1], 2: [0, 1, 2], 3: [0, 1, 2, 3] } },
      { question: "alcool-20", allowed: { 2: [0, 1], 3: [1, 2, 3, 4] } },
    ],
    answers: [
      { label: "Quasiment jamais", points: 0 },
      { label: "Quelques fois par an", points: 2 },
      { label: "Chaque mois", points: 4 },
      { label: "Chaque semaine", points: 6 },
      { label: "Presque tous les jours", points: 8 },
    ],
  },
  {
    id: "alcool-22",
    text: "As-tu déjà repris un verre le lendemain matin pour faire passer la gueule de bois ?",
    requires: { question: "alcool-05", minAnswerIndex: 1 },
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 3 },
      { label: "2 à 10 fois", points: 5 },
      { label: "Plus de 10 fois", points: 7 },
    ],
  },
  {
    id: "alcool-23",
    text: "As-tu déjà bu de l'alcool fort cul sec (shots) plusieurs fois dans la même soirée ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-24",
    text: "As-tu déjà enchaîné plusieurs jours de suite à boire de façon importante ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "1 fois", points: 1 },
      { label: "2 à 10 fois", points: 2 },
      { label: "Plus de 10 fois", points: 3 },
    ],
  },
  {
    id: "alcool-25",
    text: "T'a-t-on déjà dit que tu buvais trop, ou as-tu déjà essayé de réduire sans y arriver ?",
    onlyIf: [{ question: "alcool-01", minAnswerIndex: 2 }],
    answers: [
      { label: "Jamais", points: 0 },
      { label: "On me l'a dit une fois", points: 1 },
      { label: "Plusieurs fois", points: 2 },
      { label: "Souvent, et j'ai du mal à réduire", points: 3 },
    ],
  },
];
