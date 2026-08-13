import type { Question } from "../types";

/**
 * بنك أسئلة أساسي (بذرة أولية) يعمل بدون اتصال بوكيل الذكاء الاصطناعي، لضمان
 * عمل التطبيق فور التثبيت. بمجرد تفعيل Edge Functions (انظر supabase/functions)
 * يقوم الوكيل بتوليد أسئلة جديدة باستمرار وتخزينها في جدول question_bank
 * ليتوسع البنك تلقائيًا ويقل احتمال تكرار نفس الأسئلة بين المحاولات.
 */
export const SAMPLE_QUESTIONS: Question[] = [
  // فهم المسموع
  {
    id: "co-1",
    skill_area: "comprehension_orale",
    section: "orale",
    difficulty_clb: 5,
    type: "mcq",
    passage:
      "Bonjour à tous, je vous rappelle que la réunion d'équipe hebdomadaire est déplacée à jeudi 14h dans la salle B, au lieu de mercredi comme d'habitude.",
    prompt: "Que propose principalement l'interlocuteur dans cet extrait ?",
    options: [
      { id: "a", text: "Une modification des horaires de travail." },
      { id: "b", text: "L'organisation d'une réunion d'équipe hebdomadaire." },
      { id: "c", text: "L'annulation du projet en cours." },
      { id: "d", text: "Une augmentation du budget alloué." },
    ],
    correct_option_id: "b",
    explanation: "المتحدث يعلن عن تغيير موعد اجتماع الفريق الأسبوعي، لا عن تغيير ساعات العمل أو إلغاء مشروع.",
    tags: ["dialogue", "travail"],
  },
  {
    id: "co-2",
    skill_area: "comprehension_orale",
    section: "orale",
    difficulty_clb: 6,
    type: "mcq",
    passage:
      "Au Québec, l'hiver peut être rigoureux avec des températures descendant parfois sous les -25 degrés. Il est donc conseillé de bien s'équiper avant de sortir.",
    prompt: "Quel conseil est donné dans cet extrait ?",
    options: [
      { id: "a", text: "Éviter de sortir en hiver." },
      { id: "b", text: "S'habiller chaudement avant de sortir." },
      { id: "c", text: "Déménager dans une autre province." },
      { id: "d", text: "Attendre le printemps pour voyager." },
    ],
    correct_option_id: "b",
    tags: ["climat", "quebec"],
  },
  // فهم المقروء
  {
    id: "ce-1",
    skill_area: "comprehension_ecrite",
    section: "ecrite",
    difficulty_clb: 6,
    type: "mcq",
    passage:
      "Avis aux résidents : en raison de travaux de réfection sur la rue Saint-Denis, la circulation sera interdite entre les rues Rachel et Mont-Royal du 3 au 15 mars. Un itinéraire alternatif sera mis en place.",
    prompt: "Quel est l'objet principal de cet avis ?",
    options: [
      { id: "a", text: "Informer d'une fermeture de rue temporaire." },
      { id: "b", text: "Annoncer un nouveau règlement de stationnement." },
      { id: "c", text: "Inviter les résidents à un événement." },
      { id: "d", text: "Signaler une panne d'électricité." },
    ],
    correct_option_id: "a",
    tags: ["avis", "circulation"],
  },
  {
    id: "ce-2",
    skill_area: "comprehension_ecrite",
    section: "ecrite",
    difficulty_clb: 7,
    type: "mcq",
    passage:
      "Chère équipe, suite à la baisse des ventes du dernier trimestre, la direction a décidé de revoir notre stratégie marketing. Une réunion sera organisée la semaine prochaine pour en discuter collectivement.",
    prompt: "Pourquoi la direction souhaite-t-elle organiser une réunion ?",
    options: [
      { id: "a", text: "Pour féliciter l'équipe des bons résultats." },
      { id: "b", text: "Pour discuter d'une nouvelle stratégie marketing suite à la baisse des ventes." },
      { id: "c", text: "Pour annoncer des licenciements." },
      { id: "d", text: "Pour présenter un nouveau produit." },
    ],
    correct_option_id: "b",
    tags: ["entreprise", "email"],
  },
  // القواعد والمفردات
  {
    id: "gl-1",
    skill_area: "grammaire_lexique",
    section: "grammaire",
    difficulty_clb: 5,
    type: "mcq",
    prompt: "Complétez : « Il faut que tu ___ à l'heure demain. »",
    options: [
      { id: "a", text: "viens" },
      { id: "b", text: "viennes" },
      { id: "c", text: "venir" },
      { id: "d", text: "venu" },
    ],
    correct_option_id: "b",
    explanation: "بعد « il faut que » يجب استخدام صيغة الـ subjonctif présent: « que tu viennes ».",
    tags: ["subjonctif"],
  },
  {
    id: "gl-2",
    skill_area: "grammaire_lexique",
    section: "grammaire",
    difficulty_clb: 6,
    type: "mcq",
    prompt: "Choisissez le mot correct : « Ce restaurant, c'est celui ___ je t'ai parlé. »",
    options: [
      { id: "a", text: "que" },
      { id: "b", text: "qui" },
      { id: "c", text: "dont" },
      { id: "d", text: "où" },
    ],
    correct_option_id: "c",
    explanation: "الفعل « parler de » يتطلب « dont » كضمير موصول.",
    tags: ["pronoms_relatifs"],
  },
  // التعبير الكتابي
  {
    id: "ee-1",
    skill_area: "expression_ecrite",
    section: "ecrite_expression",
    difficulty_clb: 6,
    type: "open_written",
    prompt:
      "Vous écrivez à votre nouveau voisin pour vous présenter et l'inviter à prendre un café. Rédigez un message court et courtois (60-80 mots).",
    tags: ["email", "presentation"],
  },
  {
    id: "ee-2",
    skill_area: "expression_ecrite",
    section: "ecrite_expression",
    difficulty_clb: 8,
    type: "open_written",
    prompt:
      "Donnez votre opinion sur le télétravail : présente-t-il plus d'avantages ou d'inconvénients ? Justifiez votre point de vue (120-150 mots).",
    tags: ["opinion", "travail"],
  },
  // التعبير الشفهي
  {
    id: "eo-1",
    skill_area: "expression_orale",
    section: "orale_expression",
    difficulty_clb: 5,
    type: "open_spoken",
    prompt: "Présentez-vous en une minute : votre nom, votre origine, votre métier et vos passe-temps.",
    tags: ["presentation"],
  },
  {
    id: "eo-2",
    skill_area: "expression_orale",
    section: "orale_expression",
    difficulty_clb: 7,
    type: "open_spoken",
    prompt:
      "Votre ami hésite entre s'installer à Montréal ou à Québec. Donnez-lui votre avis avec des arguments concrets (1-2 minutes).",
    tags: ["conseil", "quebec"],
  },
];
