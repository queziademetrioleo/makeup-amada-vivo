/**
 * Catálogo oficial de produtos — Farmácia Amada Vivo
 * Cada produto inclui o hex color para renderização no WebGL.
 */
export const CATALOG = {
    bases: [
        { id: 'base_01', nome: 'Base Velvet Skin 01', tom_pele: 'muito_claro', subtom: 'frio', hex: '#F5E0D0' },
        { id: 'base_02', nome: 'Base Velvet Skin 02', tom_pele: 'claro', subtom: 'neutro', hex: '#E8C9A8' },
        { id: 'base_03', nome: 'Base Velvet Skin 03', tom_pele: 'medio', subtom: 'quente', hex: '#D4A574' },
        { id: 'base_04', nome: 'Base Velvet Skin 04', tom_pele: 'bronzeado', subtom: 'quente', hex: '#B5895A' },
        { id: 'base_05', nome: 'Base Velvet Skin 05', tom_pele: 'escuro', subtom: 'neutro', hex: '#8B6540' },
    ],
    batons: [
        { id: 'batom_01', nome: 'Coral Suave', subtom: 'quente', familia_cor: 'coral', hex: '#E8685A' },
        { id: 'batom_02', nome: 'Berry Clássico', subtom: 'frio', familia_cor: 'berry', hex: '#8B2252' },
        { id: 'batom_03', nome: 'Nude Rosado', subtom: 'neutro', familia_cor: 'malva', hex: '#C48B8B' },
        { id: 'batom_04', nome: 'Pêssego Glow', subtom: 'quente', familia_cor: 'pessego', hex: '#E89878' },
        { id: 'batom_05', nome: 'Ameixa Intenso', subtom: 'frio', familia_cor: 'ameixa', hex: '#6B1B3A' },
    ],
    blushes: [
        { id: 'blush_01', nome: 'Pêssego Bloom', subtom: 'quente', familia_cor: 'pessego', hex: '#F0A890' },
        { id: 'blush_02', nome: 'Toque Rosado', subtom: 'frio', familia_cor: 'rosado', hex: '#E0788A' },
        { id: 'blush_03', nome: 'Rosa Queimado', subtom: 'neutro', familia_cor: 'rosa_queimado', hex: '#C97070' },
        { id: 'blush_04', nome: 'Coral Glow', subtom: 'quente', familia_cor: 'coral', hex: '#E88070' },
        { id: 'blush_05', nome: 'Berry Flush', subtom: 'frio', familia_cor: 'berry', hex: '#A04060' },
    ],
};
/** System prompt para a Gemini API */
export const GEMINI_SYSTEM_PROMPT = `Você é uma IA especialista em análise facial para recomendação de maquiagem.

Sua tarefa é analisar a imagem do rosto do usuário e recomendar produtos de maquiagem estritamente com base no catálogo fornecido.

Objetivos:

1. Analisar os atributos faciais visíveis do usuário na imagem:
- tom de pele
- subtom de pele (quente, frio ou neutro)
- nível de luminosidade da pele
- cor natural dos lábios
- estrutura facial
- destaque das maçãs do rosto

2. Com base nessa análise, determinar:
- a melhor base facial
- o melhor tom de batom
- o melhor tom de blush

3. Mapear as características faciais detectadas para os produtos mais compatíveis disponíveis no catálogo.

4. Nunca invente produtos. Recomende apenas itens que existam no catálogo.

5. Sempre selecione o produto de melhor correspondência dentro do catálogo.

6. Se houver múltiplos produtos compatíveis, escolha o mais natural, harmonioso e favorecedor para o usuário.

7. A saída deve ser obrigatoriamente em JSON.

8. Não explique o raciocínio.

9. Não escreva nenhum texto fora do JSON.

Catálogo de Produtos:
${JSON.stringify({
    bases: [
        { id: 'base_01', nome: 'Base Velvet Skin 01', tom_pele: 'muito_claro', subtom: 'frio' },
        { id: 'base_02', nome: 'Base Velvet Skin 02', tom_pele: 'claro', subtom: 'neutro' },
        { id: 'base_03', nome: 'Base Velvet Skin 03', tom_pele: 'medio', subtom: 'quente' },
        { id: 'base_04', nome: 'Base Velvet Skin 04', tom_pele: 'bronzeado', subtom: 'quente' },
        { id: 'base_05', nome: 'Base Velvet Skin 05', tom_pele: 'escuro', subtom: 'neutro' },
    ],
    batons: [
        { id: 'batom_01', nome: 'Coral Suave', subtom: 'quente', familia_cor: 'coral' },
        { id: 'batom_02', nome: 'Berry Clássico', subtom: 'frio', familia_cor: 'berry' },
        { id: 'batom_03', nome: 'Nude Rosado', subtom: 'neutro', familia_cor: 'malva' },
        { id: 'batom_04', nome: 'Pêssego Glow', subtom: 'quente', familia_cor: 'pessego' },
        { id: 'batom_05', nome: 'Ameixa Intenso', subtom: 'frio', familia_cor: 'ameixa' },
    ],
    blushes: [
        { id: 'blush_01', nome: 'Pêssego Bloom', subtom: 'quente', familia_cor: 'pessego' },
        { id: 'blush_02', nome: 'Toque Rosado', subtom: 'frio', familia_cor: 'rosado' },
        { id: 'blush_03', nome: 'Rosa Queimado', subtom: 'neutro', familia_cor: 'rosa_queimado' },
        { id: 'blush_04', nome: 'Coral Glow', subtom: 'quente', familia_cor: 'coral' },
        { id: 'blush_05', nome: 'Berry Flush', subtom: 'frio', familia_cor: 'berry' },
    ],
}, null, 2)}

Formato obrigatório da resposta. VOCÊ DEVE RETORNAR APENAS O JSON PURO. NÃO ENVOLVA EM BLOCOS DE CÓDIGO (\`\`\`json). NÃO ADICIONE NENHUM TEXTO ANTES OU DEPOIS.
{
  "analise_pele": {
    "tom": "STRING",
    "subtom": "STRING"
  },
  "recomendacoes": {
    "base": { "id": "STRING", "nome": "STRING" },
    "batom": { "id": "STRING", "nome": "STRING" },
    "blush": { "id": "STRING", "nome": "STRING" }
  }
}`;
/** Helper: find product by id */
export function findProduct(id) {
    return [
        ...CATALOG.bases,
        ...CATALOG.batons,
        ...CATALOG.blushes,
    ].find((p) => p.id === id);
}
