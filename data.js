// ============================================================
// DATA.JS — Base de datos del inventario IES Lacimurga
// Edita este archivo para añadir, modificar o eliminar items
// ============================================================

const CATEGORIAS = [
  { id: "balones",           nombre: "Balones",           icono: "⚽" },
  { id: "juegos-de-mesa",    nombre: "Juegos de mesa",    icono: "♟️" },
  { id: "ropa",              nombre: "Ropa",              icono: "👕", subcategorias: ["Camisetas", "Polos", "Pantalones", "Chaquetas"] },
  { id: "exposiciones",      nombre: "Exposiciones",      icono: "🖼️" },
  { id: "material-deportivo",nombre: "Material deportivo",icono: "🏅", subcategorias: ["Colchonetas", "Aros y cuerdas", "Raquetas y palas"] },
];

// ---------------------------------------------------------------
// MATERIALES
// Campos disponibles:
//   id          — identificador único (string, sin espacios)
//   nombre      — nombre del material
//   codigo      — código de referencia
//   categoria   — debe coincidir con un id de CATEGORIAS
//   subcategoria— (opcional) subcategoría
//   imagen      — URL de imagen (puede ser ruta local o URL externa)
//   descripcion — texto libre
//   notas       — nota general del artículo
//
// Para artículos SIN tallas (balones, mesas, etc.):
//   cantidad    — número total
//   estanteria  — ubicación en almacén
//   notas_item  — notas específicas
//
// Para artículos CON tallas (ropa):
//   tallas      — array de objetos { talla, cantidad, estanteria, notas }
//   colores_relacionados — array de ids de otros materiales que son el
//                          mismo artículo en distinto color
// ---------------------------------------------------------------

const MATERIALES = [

  // ── BALONES ────────────────────────────────────────────────
  {
    id: "balon-futbol",
    nombre: "Balón de fútbol",
    categoria: "balones",
    imagen: 'images/balondefutbol.png',
    descripcion: "Balón oficial de fútbol talla 5, apto para césped natural y artificial.",
    cantidad: 12,
    estanteria: "Est. A — Estante 1",
    notas_item: "Varios sin inflar",
  },
  {
    id: "balon-baloncesto",
    nombre: "Balón de baloncesto",
    categoria: "balones",
    imagen: 'images/balondebaloncesto.png',
    descripcion: "Balón de baloncesto talla 7 para uso en pabellón.",
    cantidad: 8,
    estanteria: "Est. A — Estante 2",
    notas_item: null,
  },
  {
    id: "balon-voley",
    nombre: "Balón de voleibol",
    categoria: "balones",
    imagen: 'images/balondevoleibol.png',
    descripcion: "Balón de voleibol oficial, cuero sintético.",
    cantidad: 6,
    estanteria: "Est. A — Estante 3",
    notas_item: null,
  },

  // ── JUEGOS DE MESA ─────────────────────────────────────────
  {
    id: "ajedrez-1",
    nombre: "Ajedrez clásico",
    categoria: "juegos-de-mesa",
    imagen: 'images/ajedrez.png',
    descripcion: "Tablero de ajedrez de madera con piezas incluidas.",
    cantidad: 5,
    estanteria: "Est. B — Estante 1",
    notas_item: "Falta 1 alfil en juego nº3",
  },
  {
    id: "parchis-1",
    nombre: "Parchís",
    categoria: "juegos-de-mesa",
    imagen: 'images/parchis.png',
    descripcion: "Parchís para 4 jugadores, tablero grande de cartón duro.",
    cantidad: 4,
    estanteria: "Est. B — Estante 2",
    notas_item: null,
  },

  // ── ROPA ───────────────────────────────────────────────────
  {
    id: "polo-negro",
    nombre: "Polo negro",
    codigo: "5416512",
    categoria: "ropa",
    subcategoria: "Polos",
    imagen: 'images/polonegro.png',
    descripcion: "Polo escolar oficial IES Lacimurga, color negro, manga corta.",
    tallas: [
      { talla: "S",  cantidad: 12, estanteria: "Aún por clasificar", notas: "En uso por alumnos de 3 ESO" },
      { talla: "M",  cantidad: 6,  estanteria: "Burro C",            notas: null },
      { talla: "L",  cantidad: 21, estanteria: "Burro A",            notas: "Sin estampar" },
      { talla: "XL", cantidad: 4,  estanteria: "Burro A",            notas: null },
    ],
    colores_relacionados: ["polo-blanco", "polo-azul"],
  },
  {
    id: "polo-blanco",
    nombre: "Polo blanco",
    codigo: "5416513",
    categoria: "ropa",
    subcategoria: "Polos",
    imagen: 'images/poloblanco.png',
    descripcion: "Polo escolar oficial IES Lacimurga, color blanco, manga corta.",
    tallas: [
      { talla: "S",  cantidad: 8,  estanteria: "Burro B", notas: null },
      { talla: "M",  cantidad: 14, estanteria: "Burro B", notas: null },
      { talla: "L",  cantidad: 9,  estanteria: "Burro A", notas: "Sin estampar" },
    ],
    colores_relacionados: ["polo-negro", "polo-azul"],
  },
  {
    id: "polo-azul",
    nombre: "Polo azul marino",
    codigo: "5416514",
    categoria: "ropa",
    subcategoria: "Polos",
    imagen: 'images/poloazul.png',
    descripcion: "Polo escolar oficial IES Lacimurga, color azul marino, manga corta.",
    tallas: [
      { talla: "M",  cantidad: 3,  estanteria: "Burro C", notas: "Últimas unidades" },
      { talla: "L",  cantidad: 7,  estanteria: "Burro C", notas: null },
      { talla: "XL", cantidad: 2,  estanteria: "Burro C", notas: null },
    ],
    colores_relacionados: ["polo-negro", "polo-blanco"],
  },
  {
    id: "camiseta-blanca",
    nombre: "Camiseta blanca",
    codigo: "5416600",
    categoria: "ropa",
    subcategoria: "Camisetas",
    imagen: 'images/camisetablanca.png',
    descripcion: "Camiseta técnica para educación física, tejido transpirable.",
    tallas: [
      { talla: "S",  cantidad: 20, estanteria: "Burro D", notas: null },
      { talla: "M",  cantidad: 25, estanteria: "Burro D", notas: null },
      { talla: "L",  cantidad: 18, estanteria: "Burro D", notas: null },
      { talla: "XL", cantidad: 10, estanteria: "Burro D", notas: null },
    ],
    colores_relacionados: [],
  },

  // ── EXPOSICIONES ───────────────────────────────────────────
  {
    id: "panel-expo-universo",
    nombre: "Panel expo universo",
    categoria: "exposiciones",
    imagen: 'images/panelexpouniverso.png',
    descripcion: "Set de paneles sobre el universo y el sistema solar. 12 paneles de 60×90 cm.",
    cantidad: 6,
    estanteria: "Gancho C",
    notas_item: "Banner con soporte",
  },
  {
    id: "panel-expo-agua",
    nombre: "Panel expo ciclo del agua",
    categoria: "exposiciones",
    imagen: 'images/panelexpoagua.png',
    descripcion: "Exposición didáctica sobre el ciclo del agua. 8 paneles.",
    cantidad: 8,
    estanteria: "Gancho D",
    notas_item: null,
  },

  // ── MATERIAL DEPORTIVO ─────────────────────────────────────
  {
    id: "colchoneta-grande",
    nombre: "Colchoneta grande",
    categoria: "material-deportivo",
    subcategoria: "Colchonetas",
    imagen: 'images/colchoneta.png',
    descripcion: "Colchoneta de gimnasia de 200×100×8 cm, espuma de alta densidad.",
    cantidad: 15,
    estanteria: "Almacén principal — pared izquierda",
    notas_item: null,
  },
  {
    id: "aro-gimnasia",
    nombre: "Aro de gimnasia",
    categoria: "material-deportivo",
    subcategoria: "Aros y cuerdas",
    imagen: 'images/arogimnasia.png',
    descripcion: "Aro de plástico para gimnasia rítmica, diámetro 60 cm.",
    cantidad: 20,
    estanteria: "Est. C — Estante 1",
    notas_item: "Varios con golpes pero funcionales",
  },
  {
    id: "raqueta-tenis",
    nombre: "Raqueta de tenis",
    categoria: "material-deportivo",
    subcategoria: "Raquetas y palas",
    imagen: 'images/raquetatenis.png',
    descripcion: "Raqueta de tenis de aluminio, para uso escolar.",
    cantidad: 24,
    estanteria: "Est. D — Estante 1",
    notas_item: "12 sin encordar",
  },
  {
    id: "pala-ping-pong",
    nombre: "Pala de ping-pong",
    categoria: "material-deportivo",
    subcategoria: "Raquetas y palas",
    imagen: 'images/palapingpong.png',
    descripcion: "Pala de ping-pong estándar, goma de doble cara.",
    cantidad: 16,
    estanteria: "Est. D — Estante 2",
    notas_item: null,
  },
];
