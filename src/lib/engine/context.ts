import type { Branch, Brief, Candidate, Card } from "../types";
import { detectBrief } from "../brief";
import { FLOWERS, LOW_LIGHT, SAFE, SAFE_SUN, SUN } from "../data/candidates";

interface SelectionSet {
  candidates: Candidate[];
  label: string;
  blurb: string;
  why: string;
}

export function isSelection(input: string, brief: Brief = {}): boolean {
  // Si el usuario eligió una de las tres tareas, manda esa tarea y no las palabras sueltas.
  if (brief.goal) return brief.goal === "elegir";
  return /elegir|escoger|recomienda|recomiéndame|sugiere|sugerencias|ideas|opciones|quiero una planta|busco una planta|planta para|qué planta|que planta/.test(
    input.toLowerCase(),
  );
}

function wantsPets(t: string, brief: Brief = {}): boolean {
  return brief.pets === "mascotas" || /gato|perro|mascota|niñ|toxic/.test(t);
}

export function selectionSet(t: string, brief: Brief = {}): SelectionSet {
  const sun =
    brief.light === "sol" || /\bsol\b|solead|terraza|balc[oó]n/.test(t);
  const pets = wantsPets(t, brief);
  if (pets && sun) {
    return {
      candidates: SAFE_SUN,
      label: "Suculentas seguras al sol",
      blurb:
        "Tres suculentas que aguantan sol directo, riego espaciado y conviven con mascotas.",
      why: "Prioricé seguridad con mascotas y sol directo; descarté aloe, lavanda y las de sombra.",
    };
  }
  if (pets) {
    return {
      candidates: SAFE,
      label: "Plantas seguras con mascotas",
      blurb:
        "Sin tóxicas para gatos ni perros: la peperomia es la que más se acerca al riego quincenal; la cinta y la palma piden agua cada semana.",
      why: "Prioricé seguridad con mascotas y riego espaciado; descarté potos, ZZ y sansevieria.",
    };
  }
  if (/flor|flore/.test(t)) {
    return {
      candidates: FLOWERS,
      label: "Plantas con flor",
      blurb:
        "Tres opciones con flor en interior: la orquídea dura más y la violeta ocupa menos.",
      why: "Prioricé flor duradera y luz indirecta; descarté las que piden sol directo.",
    };
  }
  if (sun) {
    return {
      candidates: SUN,
      label: "Plantas de sol",
      blurb:
        "Tres plantas de sol directo y riego espaciado: el cactus es el más resistente y la lavanda, el más aromático.",
      why: "Prioricé sol directo y sustrato drenante; descarté las de sombra.",
    };
  }
  return {
    candidates: LOW_LIGHT,
    label: "Plantas de poca luz",
    blurb:
      "Tres plantas que viven en interior con poca luz y riego cada dos semanas. La sansevieria es la más dura; el potos, la que más crece.",
    why: "Prioricé luz indirecta, riego espaciado y tamaño de interior; descarté las que no toleran poca luz.",
  };
}

export function selectionConstraints(t: string, brief: Brief = {}): string[] {
  const out: string[] = [];
  if (brief.light === "poca" || /poca luz|sombra|sin sol|interior/.test(t))
    out.push("Poca luz");
  if (
    brief.water === "bajo" ||
    /quincenal|15 días|dos semanas|poco riego/.test(t)
  )
    out.push("Riego quincenal");
  if (wantsPets(t, brief)) out.push("Sin tóxicas para mascotas");
  if (brief.light === "sol" || /\bsol\b|solead|terraza|balc[oó]n/.test(t))
    out.push("Sol directo");
  if (/flor|flore/.test(t)) out.push("Con flor");
  if (brief.space === "pequeno" || /pequeñ|escritorio|estante|baño/.test(t))
    out.push("Poco espacio");
  return [...new Set(out)];
}

export function titleFor(input: string, brief: Brief = {}): string {
  const t = input.toLowerCase();
  if (isSelection(t, brief)) return selectionSet(t, brief).label;
  if (/bicho|pulg|araña|plaga/.test(t)) return "Plaga en el envés";
  if (/amarill|cloros|mancha|hoja/.test(t)) return "Manchas y amarilleamiento";
  if (/riego|agua|regar|humedad/.test(t)) return "Riego por peso";
  if (/trasplant|maceta|sustrato|tierra/.test(t))
    return "Trasplante paso a paso";
  if (/pod|bonsái|bonsai|alambr|abon/.test(t)) return "Poda de formación";
  return "Faltan dos datos";
}

/** Supuestos legibles que el usuario puede editar antes de sembrar. */
export function suggestAssumptions(
  input: string,
  brief: Brief = {},
): { id: string; text: string }[] {
  const t = input.toLowerCase();
  if (t.trim().length < 4) return [];
  const out: { id: string; text: string }[] = [];

  // Solo se supone lo que se deduce del relato; lo que falta se pregunta, no se rellena.
  if (/tierra.*h[úu]med|sustrato.*h[úu]med/.test(t) && !brief.water) {
    out.push({
      id: "riego_reciente",
      text: "El sustrato húmedo puede venir de un riego reciente",
    });
  }
  if (!brief.drainage && !/dren|orificio|agujero/.test(t)) {
    out.push({ id: "drenaje", text: "La maceta tiene orificio de drenaje" });
  }
  if (/amarill|mancha/.test(t) && !/semana|día|dias|mes/.test(t)) {
    out.push({ id: "tiempo", text: "El síntoma lleva menos de una semana" });
  }
  if (isSelection(t, brief)) {
    out.push({
      id: "tamano",
      text: "El espacio admite una maceta de hasta 20 cm de diámetro",
    });
  }
  return out.slice(0, 2);
}

function assumptionTopics(text: string): string[] {
  const t = text.toLowerCase();
  const out: string[] = [];
  if (/luz|sol|sombra|ventana/.test(t)) out.push("luz");
  if (/riego|agua|regar|humedad|seca|seco/.test(t)) out.push("riego");
  if (/dren|orificio|maceta|sustrato/.test(t)) out.push("drenaje");
  if (/interior|exterior|terraza|balc|habitaci|baño|oficina/.test(t))
    out.push("lugar");
  if (/mascota|gato|perro|niñ|toxic/.test(t)) out.push("mascotas");
  if (/semana|día|dias|mes|empez/.test(t)) out.push("tiempo");
  if (/espacio|cm|diámetro|grande|peque/.test(t)) out.push("espacio");
  return out;
}

/** Sustituye solo cartas generadas; conserva lo que el usuario confirmó, editó o escribió. */
export function mergeGenerated(existing: Card[], generated: Card[]): Card[] {
  const keep = existing.filter((c) => c.phase !== "generacion");
  const covered = new Set(
    keep
      .filter((c) => c.type === "supuesto")
      .flatMap((c) => assumptionTopics(c.text)),
  );
  const keys = new Set(keep.map((c) => `${c.type}|${c.text}`));
  const fresh = generated
    .filter((c) => !keys.has(`${c.type}|${c.text}`))
    .filter(
      (c) =>
        c.type !== "supuesto" ||
        !assumptionTopics(c.text).some((topic) => covered.has(topic)),
    )
    .map((c) => ({ ...c, phase: "generacion" as const }));
  return [...keep, ...fresh];
}

export function briefSummary(brief: Brief | undefined): string[] {
  if (!brief) return [];
  const out: string[] = [];
  const goal = (
    {
      elegir: "Elegir planta",
      identificar: "Identificar",
      diagnosticar: "Diagnosticar",
      cuidar: "Cuidar",
    } as Record<string, string>
  )[brief.goal ?? ""];
  const light = (
    {
      poca: "Luz poca",
      indirecta: "Luz indirecta",
      sol: "Sol directo",
    } as Record<string, string>
  )[brief.light ?? ""];
  const water = (
    { bajo: "Riego bajo", medio: "Riego medio", alto: "Riego alto" } as Record<
      string,
      string
    >
  )[brief.water ?? ""];
  const drain = (
    {
      si: "Con drenaje",
      no: "Sin drenaje",
      no_se: "Drenaje por confirmar",
    } as Record<string, string>
  )[brief.drainage ?? ""];
  const pets = (
    { mascotas: "Con mascotas", sin_mascotas: "Sin mascotas" } as Record<
      string,
      string
    >
  )[brief.pets ?? ""];
  const space = (
    { pequeno: "Espacio pequeño", amplio: "Espacio amplio" } as Record<
      string,
      string
    >
  )[brief.space ?? ""];
  const since = (
    {
      menos_semana: "Empezó esta semana",
      semanas: "Dos o tres semanas",
      meses: "Más de un mes",
    } as Record<string, string>
  )[brief.since ?? ""];
  const recent = (
    {
      abono: "Abono reciente",
      trasplante: "Trasplante reciente",
      nada: "Sin abono ni trasplante",
    } as Record<string, string>
  )[brief.recent ?? ""];
  [goal, light, water, drain, pets, space, since, recent].forEach(
    (v) => v && out.push(v),
  );
  return out;
}

function speciesFromText(t: string): string | null {
  if (/calathea/.test(t)) return "Calathea orbifolia";
  if (/bonsái|bonsai|olmo/.test(t)) return "Ulmus parvifolia";
  if (/anturio/.test(t)) return "Anthurium andraeanum";
  if (/adansonii/.test(t)) return "Monstera adansonii";
  if (/monstera/.test(t)) return "Monstera deliciosa";
  if (/selloum|filodendro selloum/.test(t)) return "Thaumatophyllum bipinnatifidum";
  if (/\bcinta\b|malamadre/.test(t)) return "Chlorophytum comosum";
  if (/sansevieria/.test(t)) return "Dracaena trifasciata";
  if (/potos/.test(t)) return "Epipremnum aureum";
  if (/orquídea|orquidea|phalaenopsis/.test(t)) return "Phalaenopsis";
  if (/helecho|nephrolepis/.test(t)) return "Nephrolepis exaltata";
  return null;
}

/** Especie que el usuario nombró en su mensaje, sin heredar la de la rama. */
export function promptSpecies(input: string): string | null {
  return speciesFromText(input.toLowerCase());
}

export function detectSpecies(t: string, branch: Branch): string {
  if (branch.species && branch.species !== "Selección" && branch.species !== "Especie por identificar")
    return branch.species;
  return speciesFromText(t) ?? "Especie por identificar";
}

