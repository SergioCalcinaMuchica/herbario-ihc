import type { Brief } from '#lib/types';

export type BriefGoal = NonNullable<Brief['goal']>;
export type BriefField = Exclude<keyof Brief, never>;
export type BriefTarget = BriefField | 'symptom';

export interface BriefOption {
  label: string;
  value: string;
  hint?: string;
}

export interface BriefQuestion {
  id: string;
  target: BriefTarget;
  title: string;
  help: string;
  chip: string;
  options: BriefOption[];
  /** Lo que la IA asumirá si el usuario no responde. */
  assumption: string;
  /** Qué cambia en la respuesta si la suposición es falsa. */
  detail: string;
}

/** Deduce la intención sin preguntarla cuando el mensaje ya la dice. */
export function inferGoal(input: string): BriefGoal | '' {
  const t = input.toLowerCase();
  if (/no s[ée] qu[ée] le pasa|no s[ée] qu[ée] pedir/.test(t)) return 'diagnosticar';
  if (/identificar|qu[ée] planta es|c[óo]mo se llama|reconocer|especie/.test(t)) {
    return 'identificar';
  }
  if (/elegir|escoger|qu[ée] planta|recomiend|opciones|busco una planta|quiero una planta|planta para/.test(t)) {
    return 'elegir';
  }
  if (/amarill|mancha|enroll|seca|seco|plaga|bicho|pulg|ara[ñn]a|pudr|marchit|no crece|se cae|telara/.test(t)) {
    return 'diagnosticar';
  }
  if (/cuidar|riego|regar|abono|fertiliz|trasplant|poda|luz|humedad/.test(t)) return 'cuidar';
  return '';
}

/** Lee los datos que el usuario ya escribió para no volver a preguntarlos. */
export function detectBrief(input: string): Partial<Brief> {
  const t = input.toLowerCase();
  const out: Partial<Brief> = {};

  if (/sin sol directo|no le da el sol|nada de sol/.test(t)) out.light = 'poca';
  else if (/sol directo|mucho sol|pleno sol|sol de (la )?(mañana|tarde)/.test(t)) out.light = 'sol';
  else if (/poca luz|sombra|sin sol|ventana norte|orientaci[óo]n norte/.test(t)) out.light = 'poca';
  else if (/luz indirecta|semisombra|junto a (la )?ventana|ventana/.test(t)) out.light = 'indirecta';

  if (/cada (2|dos) semanas|quincenal|poco riego|riego espaciado|casi no riego/.test(t)) out.water = 'bajo';
  else if (/cada (7|8|9|10|siete|ocho|nueve|diez) d|una vez a la semana|semanal/.test(t)) out.water = 'medio';
  else if (/cada (3|4|5|tres|cuatro|cinco) d|todos los d|riego abundante|mucho riego/.test(t)) out.water = 'alto';

  if (/no drena|sin (orificio|agujero)|no tiene (orificio|agujero)/.test(t)) out.drainage = 'no';
  else if (/drena|orificio|agujero/.test(t)) out.drainage = 'si';

  if (/no (tengo|hay) mascotas|sin mascotas/.test(t)) out.pets = 'sin_mascotas';
  else if (/gato|perro|mascota|niñ/.test(t)) out.pets = 'mascotas';

  if (/poco espacio|pequeñ|escritorio|estante|balc[óo]n/.test(t)) out.space = 'pequeno';
  else if (/espacio amplio|sal[óo]n|terraza|patio/.test(t)) out.space = 'amplio';

  if (/hace (una|1) semana|menos de una semana|desde (ayer|hace poco)|empez[óo] (esta|la) semana/.test(t)) {
    out.since = 'menos_semana';
  } else if (/hace (dos|2|tres|3) semanas|un par de semanas/.test(t)) out.since = 'semanas';
  else if (/hace (un|1) mes|meses|desde hace tiempo/.test(t)) out.since = 'meses';

  if (/abon|fertiliz/.test(t)) out.recent = 'abono';
  else if (/trasplant|cambi[ée] de maceta|cambio de maceta/.test(t)) out.recent = 'trasplante';
  else if (/no (la )?he (abonado|trasplantado)|sin abono|sin trasplant/.test(t)) out.recent = 'nada';

  return out;
}

export function hasSymptom(input: string): boolean {
  return /amarill|mancha|enroll|seca|seco|borde|plaga|bicho|pulg|ara[ñn]a|pudr|marchit|ca[íi]d|no crece|telara|punto/.test(
    input.toLowerCase()
  );
}

const GOAL: BriefQuestion = {
  id: 'goal',
  target: 'goal',
  title: '¿Qué te sería más útil?',
  help: 'Con esto decido si la respuesta debe diagnosticar, cuidar o comparar plantas.',
  chip: 'Objetivo',
  options: [
    { label: 'Saber qué le pasa', value: 'diagnosticar', hint: 'Diagnóstico' },
    { label: 'Identificar una planta', value: 'identificar', hint: 'Rasgos' },
    { label: 'Aprender a cuidarla', value: 'cuidar', hint: 'Cuidados' },
    { label: 'Elegir una planta', value: 'elegir', hint: 'Comparar' }
  ],
  assumption: 'Quieres saber qué le pasa a la planta.',
  detail: 'Si buscabas cuidados o una recomendación, el enfoque de la respuesta cambia.'
};

const SYMPTOM: BriefQuestion = {
  id: 'symptom',
  target: 'symptom',
  title: '¿Qué ves en la planta?',
  help: 'Un síntoma concreto cambia el diagnóstico. Si no ves nada raro, también sirve.',
  chip: 'Síntoma',
  options: [
    { label: 'Hojas amarillas', value: 'amarillas' },
    { label: 'Manchas o bordes secos', value: 'manchas' },
    { label: 'Hojas enrolladas o caídas', value: 'enrolladas' },
    { label: 'Bichos o telarañas', value: 'bichos' },
    { label: 'No veo nada raro', value: 'nada' }
  ],
  assumption: 'No hay un síntoma visible; la planta solo no crece como esperabas.',
  detail: 'Si hay un síntoma concreto, el diagnóstico puede ser mucho más específico.'
};

const SINCE: BriefQuestion = {
  id: 'since',
  target: 'since',
  title: '¿Desde cuándo lo notas?',
  help: 'Si empezó esta semana busco un cambio reciente; si lleva meses, miro el cuidado de fondo.',
  chip: 'Desde cuándo',
  options: [
    { label: 'Menos de una semana', value: 'menos_semana' },
    { label: 'Dos o tres semanas', value: 'semanas' },
    { label: 'Más de un mes', value: 'meses', hint: 'Puede ser crónico' }
  ],
  assumption: 'El síntoma empezó hace menos de una semana.',
  detail: 'Si lleva más tiempo, el daño puede ser crónico y el tratamiento cambia.'
};

const DRAINAGE: BriefQuestion = {
  id: 'drainage',
  target: 'drainage',
  title: '¿La maceta tiene agujeros?',
  help: 'Si no drena, el agua se queda en el fondo y el diagnóstico cambia.',
  chip: 'Drenaje',
  options: [
    { label: 'Sí, drena', value: 'si' },
    { label: 'No tiene', value: 'no', hint: 'El agua se estanca' }
  ],
  assumption: 'La maceta tiene orificio de drenaje.',
  detail: 'Si no drena, el exceso de agua pudre la raíz y el amarilleamiento no se detiene.'
};

const WATER: BriefQuestion = {
  id: 'water',
  target: 'water',
  title: '¿Cada cuánto la riegas?',
  help: 'El riego es la causa más común de hojas amarillas y raíces podridas.',
  chip: 'Riego',
  options: [
    { label: 'Cada 3-5 días', value: 'alto' },
    { label: 'Cada 7-10 días', value: 'medio' },
    { label: 'Cada 2 semanas o más', value: 'bajo' }
  ],
  assumption: 'La riegas más o menos cada semana.',
  detail: 'Si riegas mucho más o mucho menos, el diagnóstico cambia.'
};

const RECENT: BriefQuestion = {
  id: 'recent',
  target: 'recent',
  title: '¿La has abonado o trasplantado hace poco?',
  help: 'Un abono o un trasplante reciente explica muchos cambios de hoja.',
  chip: 'Abono o trasplante',
  options: [
    { label: 'Aboné', value: 'abono' },
    { label: 'Trasplanté', value: 'trasplante' },
    { label: 'Ninguna', value: 'nada' }
  ],
  assumption: 'No la has abonado ni trasplantado en las últimas semanas.',
  detail: 'El exceso de abono o un trasplante reciente cambian la causa probable.'
};

const LIGHT: BriefQuestion = {
  id: 'light',
  target: 'light',
  title: '¿Cuánta luz recibe?',
  help: 'La luz decide qué plantas sobreviven y cuánto riego necesitan.',
  chip: 'Luz',
  options: [
    { label: 'Sol directo', value: 'sol', hint: 'Varias horas de sol' },
    { label: 'Luz indirecta', value: 'indirecta', hint: 'Junto a una ventana' },
    { label: 'Poca luz', value: 'poca', hint: 'Sombra o interior' }
  ],
  assumption: 'La planta recibe luz indirecta.',
  detail: 'Con sol directo puede quemarse; con poca luz crece lento y consume menos agua.'
};

const PETS: BriefQuestion = {
  id: 'pets',
  target: 'pets',
  title: '¿Hay gatos o perros en casa?',
  help: 'Descarto plantas tóxicas antes de recomendarte una.',
  chip: 'Mascotas',
  options: [
    { label: 'Sí', value: 'mascotas' },
    { label: 'No', value: 'sin_mascotas' }
  ],
  assumption: 'No hay mascotas en casa.',
  detail: 'Si las hay, descarto las plantas tóxicas para gatos y perros.'
};

const SPACE: BriefQuestion = {
  id: 'space',
  target: 'space',
  title: '¿Cuánto sitio hay?',
  help: 'El tamaño cambia qué plantas puedo recomendarte.',
  chip: 'Espacio',
  options: [
    { label: 'Poco', value: 'pequeno', hint: 'Escritorio o estante' },
    { label: 'Amplio', value: 'amplio', hint: 'Suelo o terraza' }
  ],
  assumption: 'Cabe una maceta de hasta 20 cm de diámetro.',
  detail: 'Con poco espacio descarto plantas grandes.'
};

const LEAF_TRAIT: BriefQuestion = {
  id: 'leaf_trait',
  target: 'symptom',
  title: '¿Cómo son sus hojas?',
  help: 'La forma y textura de la hoja descarta la mayoría de confusiones comunes.',
  chip: 'Hojas',
  options: [
    { label: 'Grandes, anchas o con cortes', value: 'hoja_ancha' },
    { label: 'Carnosas o gruesas', value: 'hoja_carnosa', hint: 'Tipo suculenta' },
    { label: 'Alargadas en espada o cinta', value: 'hoja_espada' },
    { label: 'Pequeñas en enredadera o finas', value: 'hoja_fina' }
  ],
  assumption: 'Tiene hojas verdes medianas sin suculencia marcada.',
  detail: 'Si tiene hojas carnosas, en espada o divididas, la familia botánica cambia por completo.'
};

const GROWTH_HABIT: BriefQuestion = {
  id: 'growth_habit',
  target: 'symptom',
  title: '¿Qué porte tiene la planta?',
  help: 'El modo de crecimiento separa especies parecidas de un mismo género.',
  chip: 'Porte',
  options: [
    { label: 'Erguida desde la base', value: 'porte_erguido' },
    { label: 'Colgante o trepadora', value: 'porte_colgante' },
    { label: 'En roseta compacta', value: 'porte_roseta' },
    { label: 'Con tallo o tronco leñoso', value: 'porte_lenoso' }
  ],
  assumption: 'Crece erguida en maceta sin tallo leñoso.',
  detail: 'Un porte colgante, en roseta o leñoso descarta especies erectas.'
};

function isAnswered(question: BriefQuestion, brief: Brief): boolean {
  if (question.target === 'symptom') return false;
  return !!brief[question.target];
}

/**
 * Preguntas que de verdad cambian la respuesta, en orden de impacto.
 * Solo devuelve las que el mensaje no responde ya.
 */
export function questionsFor(input: string, brief: Brief = {}): BriefQuestion[] {
  if (input.trim().length < 4) return [];

  const detected = detectBrief(input);
  const answered: Brief = { ...detected, ...brief };
  const goal = (brief.goal || inferGoal(input)) as BriefGoal | '';
  const out: BriefQuestion[] = [];

  if (!goal) out.push(GOAL);

  if (goal === 'diagnosticar') {
    if (!hasSymptom(input)) out.push(SYMPTOM);
    out.push(SINCE, DRAINAGE, WATER, RECENT);
  } else if (goal === 'identificar') {
    out.push(LEAF_TRAIT, GROWTH_HABIT, LIGHT);
  } else if (goal === 'cuidar') {
    out.push(LIGHT, WATER, DRAINAGE, RECENT);
  } else if (goal === 'elegir') {
    out.push(PETS, LIGHT, SPACE, WATER);
  }

  return out.filter((q) => !isAnswered(q, answered));
}

const SYMPTOM_TEXT: Record<string, string> = {
  amarillas: 'Tiene hojas amarillas.',
  manchas: 'Tiene manchas y los bordes secos.',
  enrolladas: 'Tiene las hojas enrolladas o caídas.',
  bichos: 'Veo bichos o telarañas en las hojas.',
  nada: 'No veo nada raro, pero no crece como esperaba.',
  hoja_ancha: 'Sus hojas son grandes y anchas.',
  hoja_carnosa: 'Sus hojas son carnosas y gruesas.',
  hoja_espada: 'Sus hojas son alargadas en forma de espada.',
  hoja_fina: 'Tiene hojas pequeñas o finas.',
  porte_erguido: 'Crece erguida desde la base.',
  porte_colgante: 'Tiene porte colgante o trepador.',
  porte_roseta: 'Crece en roseta compacta.',
  porte_lenoso: 'Tiene tallo o tronco leñoso.'
};

/** Añade el síntoma al mensaje sin convertirlo en un formulario. */
export function applySymptom(input: string, value: string): string {
  const add = SYMPTOM_TEXT[value];
  if (!add) return input;
  const base = input.trim().replace(/[.!?]+$/, '');
  return base ? `${base}. ${add}` : add;
}
