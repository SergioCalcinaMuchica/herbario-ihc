// Cuidados por planta para la tarea «Conocer sus cuidados».
// Cada ficha dice luz, riego, tierra y maceta, y el porqué de cada uno, en palabras simples.

export interface CareProfile {
  title: string;
  esencia: string;
  luz: string;
  riego: string;
  tierra: string;
  maceta: string;
  mascotas: "Segura" | "Tóxica" | "Por confirmar";
  porQue: string;
  actions: string[];
  vigilar: string;
}

const CARE: Record<string, CareProfile> = {
  "Epipremnum aureum": {
    title: "Cuidados del potos",
    esencia:
      "El potos es de las plantas más fáciles. Necesita luz sin sol directo y riego cuando la tierra se seque arriba.",
    luz: "Indirecta, tolera poca",
    riego: "Cada 7 a 10 días",
    tierra: "Suelta",
    maceta: "Con agujeros abajo",
    mascotas: "Tóxica",
    porQue:
      "Necesita luz indirecta porque el sol directo le quema las hojas. Riega cuando los primeros 2 cm de tierra estén secos, porque con la tierra siempre mojada las raíces se pudren. La tierra suelta deja pasar el agua y el aire hasta las raíces. La maceta necesita agujeros para que salga el agua que sobra. Es tóxica si un gato o un perro muerde sus hojas, así que conviene colgarla fuera de su alcance.",
    actions: [
      "Ponla cerca de una ventana donde no le dé el sol directo",
      "Toca la tierra antes de regar y riega solo si está seca arriba",
      "Vacía el plato 10 minutos después de regar",
    ],
    vigilar: "Si las hojas se ponen amarillas y blandas, estás regando de más.",
  },
  "Monstera deliciosa": {
    title: "Cuidados de la monstera",
    esencia:
      "La monstera necesita mucha luz sin sol directo y riego cuando la mitad de la tierra esté seca. Con buena luz le salen las hojas grandes con agujeros.",
    luz: "Mucha, sin sol directo",
    riego: "Cada 7 a 10 días",
    tierra: "Suelta, con trozos de corteza",
    maceta: "Con agujeros y un palo para trepar",
    mascotas: "Tóxica",
    porQue:
      "Con mucha luz indirecta salen hojas grandes con agujeros; con poca luz salen pequeñas y enteras. Riega cuando la mitad de arriba de la tierra esté seca, porque sus raíces se pudren si siempre están mojadas. Los trozos de corteza dejan pasar el aire hasta las raíces. Un palo le sirve para trepar, como hace en la naturaleza, y así crece más derecha. Es tóxica si un gato o un perro muerde sus hojas.",
    actions: [
      "Ubícala a uno o dos metros de una ventana luminosa",
      "Riega a fondo y espera a que se seque la mitad de la tierra",
      "Limpia el polvo de las hojas con un paño húmedo cada mes",
    ],
    vigilar: "Si las hojas nuevas salen sin agujeros, le falta luz.",
  },
  "Monstera adansonii": {
    title: "Cuidados de la monstera adansonii",
    esencia:
      "La adansonii necesita luz sin sol directo y riego cuando la tierra se seque arriba. Puede crecer colgando o trepando por un palo.",
    luz: "Indirecta",
    riego: "Cada 7 días",
    tierra: "Suelta, con trozos de corteza",
    maceta: "Con agujeros, colgada o con palo",
    mascotas: "Tóxica",
    porQue:
      "El sol directo quema sus hojas finas, por eso necesita luz indirecta. Riega cuando los primeros 2 cm de tierra estén secos, porque el exceso de agua pudre sus raíces. La corteza mantiene la tierra suelta y con aire. Colgada o con un palo, sus tallos largos no se quiebran. Es tóxica si un gato o un perro muerde sus hojas.",
    actions: [
      "Ponla cerca de una ventana sin sol directo",
      "Riega cuando la tierra esté seca arriba",
      "Guía sus tallos por un palo o déjalos colgar",
    ],
    vigilar: "Si los bordes de las hojas se secan, el aire de la casa está muy seco.",
  },
  "Thaumatophyllum bipinnatifidum": {
    title: "Cuidados del filodendro selloum",
    esencia:
      "El filodendro selloum necesita mucha luz sin sol fuerte y espacio, porque crece hacia los lados. Se riega cuando la tierra se seca arriba.",
    luz: "Mucha, sin sol fuerte",
    riego: "Cada 7 días",
    tierra: "Suelta",
    maceta: "Grande y con agujeros",
    mascotas: "Tóxica",
    porQue:
      "Con mucha luz sus hojas crecen grandes y recortadas; el sol fuerte del mediodía las quema. Riega cuando los primeros 3 cm de tierra estén secos, porque no le gusta estar encharcada. La tierra suelta deja respirar a las raíces. Necesita una maceta grande porque es una planta pesada y ancha. Es tóxica si un gato o un perro muerde sus hojas.",
    actions: [
      "Déjale espacio a los lados, porque sus hojas se abren mucho",
      "Riega cuando la tierra esté seca arriba",
      "Gira la maceta cada mes para que crezca pareja",
    ],
    vigilar: "Si las hojas de abajo se ponen amarillas de a una, es normal; si son muchas, riega menos.",
  },
  "Dracaena trifasciata": {
    title: "Cuidados de la sansevieria",
    esencia:
      "La sansevieria aguanta casi cualquier luz y se riega poco, cada 2 o 3 semanas. Lo que más la daña es el exceso de agua.",
    luz: "Poca o mucha, sin problema",
    riego: "Cada 2 a 3 semanas",
    tierra: "Para cactus, que seque rápido",
    maceta: "Pesada y con agujeros",
    mascotas: "Tóxica",
    porQue:
      "Aguanta poca luz y también sol suave, por eso sirve para casi cualquier rincón. Guarda agua en sus hojas, así que se riega poco. La tierra para cactus se seca rápido y evita que las raíces se pudran. Una maceta pesada evita que se caiga, porque sus hojas son altas. Puede causar vómitos si un gato o un perro la muerde.",
    actions: [
      "Riega solo cuando la tierra esté seca del todo",
      "En invierno riega una vez al mes",
      "Gira la maceta cada mes para que crezca derecha",
    ],
    vigilar: "Si la base de las hojas se pone blanda, riega menos.",
  },
  "Calathea orbifolia": {
    title: "Cuidados de la calathea",
    esencia:
      "La calathea necesita luz suave, tierra un poco húmeda siempre y aire húmedo. Es más delicada que otras plantas de interior.",
    luz: "Indirecta suave",
    riego: "Cada 5 a 7 días",
    tierra: "Que guarde algo de humedad",
    maceta: "Con agujeros abajo",
    mascotas: "Segura",
    porQue:
      "El sol directo le quema y decolora las hojas, por eso necesita luz suave. Le gusta la tierra un poco húmeda; si se seca, los bordes de las hojas se ponen marrones. La tierra debe guardar algo de humedad, pero el agua que sobra tiene que salir por los agujeros. Necesita aire húmedo, así que conviene ponerla lejos de estufas y del aire acondicionado. Es segura para gatos y perros.",
    actions: [
      "Riega con agua que haya reposado un día",
      "Pon debajo un plato con piedras y agua para dar humedad",
      "Aléjala de estufas y corrientes de aire",
    ],
    vigilar: "Si las hojas se enrollan, le falta agua o el aire está muy seco.",
  },
  "Anthurium andraeanum": {
    title: "Cuidados del anturio",
    esencia:
      "El anturio necesita mucha luz sin sol directo y riego cuando la tierra se seque arriba. Con buena luz da más flores.",
    luz: "Mucha, sin sol directo",
    riego: "Cada 5 a 7 días",
    tierra: "Muy suelta, con corteza",
    maceta: "Con agujeros, justa para sus raíces",
    mascotas: "Tóxica",
    porQue:
      "Con buena luz indirecta da más flores; el sol directo le quema las hojas. Riega cuando la parte de arriba de la tierra esté seca. Sus raíces necesitan aire, por eso la tierra debe ser muy suelta. En una maceta justa florece más que en una grande. Es tóxico si un gato o un perro lo muerde.",
    actions: [
      "Ponlo cerca de una ventana luminosa sin sol directo",
      "Riega cuando los primeros 2 cm de tierra estén secos",
      "Corta las flores secas desde abajo",
    ],
    vigilar: "Si deja de dar flores, necesita más luz.",
  },
  "Nephrolepis exaltata": {
    title: "Cuidados del helecho",
    esencia:
      "El helecho necesita luz sin sol directo y tierra que nunca se seque del todo. Pierde hojas si el aire está muy seco.",
    luz: "Indirecta",
    riego: "Cada 3 a 5 días",
    tierra: "Siempre algo húmeda",
    maceta: "Con agujeros, mejor colgada",
    mascotas: "Segura",
    porQue:
      "Con sol directo sus hojas se secan; con luz indirecta se mantiene verde. Su tierra no debe secarse del todo, porque pierde hojas muy rápido. Necesita tierra que guarde humedad, pero que deje salir el agua que sobra. Colgado, sus hojas caen sin doblarse. Es seguro para gatos y perros.",
    actions: [
      "Toca la tierra cada dos o tres días y riega si está seca",
      "Rocía las hojas con agua cuando el aire esté seco",
      "Corta las hojas secas desde abajo",
    ],
    vigilar: "Si se caen muchas hojitas, el aire está muy seco.",
  },
  "Chlorophytum comosum": {
    title: "Cuidados de la cinta",
    esencia:
      "La cinta es muy fácil: aguanta poca luz y se riega una vez por semana. Es segura para mascotas.",
    luz: "Indirecta, tolera poca",
    riego: "Cada semana",
    tierra: "Común y suelta",
    maceta: "Con agujeros, puede ir colgada",
    mascotas: "Segura",
    porQue:
      "Crece bien con luz indirecta y aguanta rincones con poca luz. Sus raíces gruesas guardan agua, así que basta con regar cuando la tierra esté seca arriba. Una tierra común y suelta es suficiente. Colgada, las plantitas nuevas que le salen caen y se pueden plantar aparte. Es segura para gatos y perros.",
    actions: [
      "Riega una vez por semana",
      "Corta las puntas secas con una tijera limpia",
      "Planta en otra maceta las plantitas nuevas que le salen",
    ],
    vigilar: "Si las puntas se ponen marrones, el agua puede tener mucho cloro.",
  },
  Phalaenopsis: {
    title: "Cuidados de la orquídea",
    esencia:
      "La orquídea necesita mucha luz sin sol directo y se riega sumergiendo la maceta. No va en tierra común, sino en corteza.",
    luz: "Mucha, sin sol directo",
    riego: "Cada 7 a 10 días",
    tierra: "Corteza, no tierra común",
    maceta: "Transparente y con agujeros",
    mascotas: "Segura",
    porQue:
      "Necesita mucha luz, pero el sol directo quema sus hojas. Se riega sumergiendo la maceta 10 minutos y dejándola escurrir, para que las raíces tomen agua sin quedar mojadas. En la naturaleza sus raíces viven pegadas a los árboles, por eso necesitan corteza. En una maceta transparente se ve si las raíces están verdes, con agua, o plateadas, sin agua. Es segura para gatos y perros.",
    actions: [
      "Sumerge la maceta en agua 10 minutos cuando las raíces se vean plateadas",
      "Deja escurrir bien antes de devolverla a su lugar",
      "No cortes las raíces que salen por fuera de la maceta",
    ],
    vigilar: "Si las hojas se arrugan, le falta agua.",
  },
};

/** Cuidados generales cuando no se sabe qué planta es. */
const GENERIC: CareProfile = {
  title: "Cuidados básicos de tu planta",
  esencia:
    "Como no sé qué planta es, te doy los cuidados que sirven para la mayoría de plantas de interior. Si me dices su nombre o cómo son sus hojas, te los doy exactos.",
  luz: "Indirecta",
  riego: "Cuando la tierra esté seca arriba",
  tierra: "Suelta",
  maceta: "Con agujeros abajo",
  mascotas: "Por confirmar",
  porQue:
    "Casi todas las plantas de interior prefieren luz sin sol directo, porque el sol fuerte quema las hojas. Regar solo cuando la tierra está seca arriba evita que las raíces se pudran. La tierra suelta deja pasar el agua y el aire. La maceta necesita agujeros para que salga el agua que sobra.",
  actions: [
    "Ponla cerca de una ventana donde no le dé el sol directo",
    "Toca la tierra antes de regar y riega solo si está seca arriba",
    "Dime su nombre o cómo son sus hojas para darte cuidados exactos",
  ],
  vigilar: "Si tienes gato o perro, confirma si la planta es tóxica antes de dejarla a su alcance.",
};

/** Ficha de cuidados de una especie, o null si no la conocemos. */
export function careFor(species: string): CareProfile | null {
  return CARE[species] ?? null;
}

export function careOrGeneric(species: string): CareProfile {
  return careFor(species) ?? GENERIC;
}

/** Datos de cuidado para mostrar como parámetros. */
export function careParams(p: CareProfile) {
  return [
    { label: "Luz", value: p.luz },
    { label: "Riego", value: p.riego },
    { label: "Tierra", value: p.tierra },
    { label: "Maceta", value: p.maceta },
    { label: "Mascotas", value: p.mascotas },
  ];
}
