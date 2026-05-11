// lib/product-detection/utils/guessRoom.js
// Infere o cômodo sugerido com base no nome do produto.

const ROOM_PATTERNS = [
  {
    room: "sala",
    pattern:
      /sofá|sofa|rack|tapete|poltrona|luminária|luminaria|quadro|aparador|tv\b|televisão|televisao|home theater|projetor/i,
  },
  {
    room: "quarto",
    pattern:
      /cama|colchão|colchao|cabeceira|guarda.roupa|guarda.roupa|cômoda|comoda|criado.mudo|travesseiro|edredom|lençol|lencol|cortina quarto|abajur/i,
  },
  {
    room: "cozinha",
    pattern:
      /panela|frigideira|geladeira|fogão|fogao|micro.ondas|liquidificador|batedeira|airfryer|air fryer|prato|talher|copo|tábua|tabua|escorredor|lixeira cozinha|filtro água|filtro agua/i,
  },
  {
    room: "banheiro",
    pattern:
      /toalha|saboneteira|box|vaso sanitário|vaso sanitario|cuba|torneira|espelho.*banh|porta.shampoo|suporte.*papel/i,
  },
];

/**
 * Sugere um cômodo com base no nome do produto.
 * @param {string|null|undefined} name
 * @returns {string} ID do cômodo ou "outro"
 */
export function guessRoom(name) {
  if (!name) return "outro";
  const match = ROOM_PATTERNS.find(({ pattern }) => pattern.test(name));
  return match?.room ?? "outro";
}
