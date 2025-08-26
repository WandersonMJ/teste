function encontrarStringMaisProxima(stringBusca: string, arrayStrings: string[]): string | null {
  if (!arrayStrings || arrayStrings.length === 0) {
    return null;
  }
  
  const stringLimpa = limparString(stringBusca);
  
  let melhorMatch: string | null = null;
  let melhorScore = -1;
  
  for (const candidato of arrayStrings) {
    const score = calcularScoreCompleto(stringLimpa, candidato);
    
    if (score > melhorScore) {
      melhorScore = score;
      melhorMatch = candidato;
    }
  }
  
  // Só retorna se o score for razoável (mínimo 30%)
  return melhorScore > 0.3 ? melhorMatch : null;
}

function limparString(str: string): string {
  return str.toLowerCase()
    .replace(/\.(xlsx?|csv|txt|pdf)$/i, '') // Remove extensões de arquivo
    .replace(/^[\d\s._-]+/, '')            // Remove números/símbolos do início
    .replace(/[._-]/g, '')                 // Remove pontos, underscores e hífens
    .trim();
}

function calcularScoreCompleto(stringBusca: string, candidato: string): number {
  const candidatoLimpo = candidato.toLowerCase();
  const stringBuscaOriginal = stringBusca.toLowerCase();
  
  // 1. Match exato tem prioridade máxima
  if (stringBusca === candidatoLimpo) {
    return 1.0;
  }
  
  // 2. Verifica se um contém o outro (substring match)
  const contemCompleto = stringBusca.includes(candidatoLimpo) || candidatoLimpo.includes(stringBusca);
  if (contemCompleto) {
    const tamanhoMenor = Math.min(stringBusca.length, candidatoLimpo.length);
    const tamanhoMaior = Math.max(stringBusca.length, candidatoLimpo.length);
    return 0.8 + (tamanhoMenor / tamanhoMaior) * 0.2; // Score entre 0.8 e 1.0
  }
  
  // 3. Verifica match de palavras individuais (muito importante para códigos)
  const scorepalavras = calcularScorePalavras(stringBuscaOriginal, candidato);
  
  // 4. Similaridade por Levenshtein (fallback)
  const scoreSimilaridade = calcularSimilaridadeLevenshtein(stringBusca, candidatoLimpo);
  
  // 5. Jaro-Winkler para códigos alfanuméricos
  const scoreJaro = calcularJaroWinkler(stringBusca, candidatoLimpo);
  
  // Retorna o melhor score encontrado
  return Math.max(scorepalavras, scoreSimilaridade, scoreJaro);
}

function calcularScorePalavras(stringBusca: string, candidato: string): number {
  // Extrai partes alfanuméricas significativas
  const partesString = extrairPartes(stringBusca);
  const partesCandidato = extrairPartes(candidato.toLowerCase());
  
  if (partesString.length === 0 || partesCandidato.length === 0) {
    return 0;
  }
  
  let matchesEncontrados = 0;
  
  for (const parteString of partesString) {
    for (const parteCandidato of partesCandidato) {
      // Match exato
      if (parteString === parteCandidato) {
        matchesEncontrados += 1;
        break;
      }
      // Match parcial para códigos (R075 matches com r075, etc.)
      if (parteString.length >= 3 && parteCandidato.length >= 3) {
        if (parteString.includes(parteCandidato) || parteCandidato.includes(parteString)) {
          matchesEncontrados += 0.8;
          break;
        }
      }
    }
  }
  
  return matchesEncontrados / Math.max(partesString.length, partesCandidato.length);
}

function extrairPartes(str: string): string[] {
  // Extrai sequências alfanuméricas significativas
  const partes = str.match(/[a-z]+|\d+|[a-z]\d+|\d+[a-z]+/gi) || [];
  return partes.filter(parte => parte.length >= 2); // Ignora partes muito pequenas
}

function calcularSimilaridadeLevenshtein(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matriz: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matriz[i][0] = i;
  for (let j = 0; j <= len2; j++) matriz[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  const distancia = matriz[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - distancia) / maxLen;
}

function calcularJaroWinkler(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  if (matchWindow < 0) return 0;
  
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Encontra matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Conta transposições
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Aplica o prefixo Winkler (para códigos similares no início)
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}

// Exemplos e testes
const arrayExemplo: string[] = ['campinas', 'R293', 'R075', 'SESSAO', 'progression', 'R139'];

console.log('=== TESTES DE ACURÁCIA ===');
console.log(`'r075.xlsx' => ${encontrarStringMaisProxima('r075.xlsx', arrayExemplo)}`);
console.log(`'R293.csv' => ${encontrarStringMaisProxima('R293.csv', arrayExemplo)}`);
console.log(`'r139_dados' => ${encontrarStringMaisProxima('r139_dados', arrayExemplo)}`);
console.log(`'profissionais_sessao' => ${encontrarStringMaisProxima('profissionais_sessao', arrayExemplo)}`);

console.log('\n=== EXEMPLOS ORIGINAIS ===');
console.log(`'1. profissionais_campinas' => ${encontrarStringMaisProxima('1. profissionais_campinas', arrayExemplo)}`);
console.log(`'31.r075' => ${encontrarStringMaisProxima('31.r075', arrayExemplo)}`);
console.log(`'30.r_293' => ${encontrarStringMaisProxima('30.r_293', arrayExemplo)}`);

console.log('\n=== TESTES ADICIONAIS ===');
console.log(`'sessao_final.xlsx' => ${encontrarStringMaisProxima('sessao_final.xlsx', arrayExemplo)}`);
console.log(`'15_progression_test' => ${encontrarStringMaisProxima('15_progression_test', arrayExemplo)}`);