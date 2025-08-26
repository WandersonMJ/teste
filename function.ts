function encontrarStringMaisProxima(stringBusca, arrayStrings) {
  if (!arrayStrings || arrayStrings.length === 0) {
    return null;
  }
  
  // Normaliza a string de busca (remove números, pontos, underscores e converte para lowercase)
  const stringNormalizada = stringBusca.toLowerCase()
    .replace(/[0-9._]/g, '')
    .trim();
  
  let melhorMatch = null;
  let melhorScore = -1;
  
  for (const candidato of arrayStrings) {
    const candidatoNormalizado = candidato.toLowerCase();
    
    // Verifica se a string normalizada está contida no candidato ou vice-versa
    const contemString = stringNormalizada.includes(candidatoNormalizado) || 
                        candidatoNormalizado.includes(stringNormalizada);
    
    if (contemString) {
      // Calcula um score baseado no tamanho da correspondência
      const tamanhoCorrespondencia = Math.min(stringNormalizada.length, candidatoNormalizado.length);
      const score = tamanhoCorrespondencia / Math.max(stringNormalizada.length, candidatoNormalizado.length);
      
      if (score > melhorScore) {
        melhorScore = score;
        melhorMatch = candidato;
      }
    }
  }
  
  // Se não encontrou correspondência por inclusão, tenta por similaridade de caracteres
  if (!melhorMatch) {
    for (const candidato of arrayStrings) {
      const candidatoNormalizado = candidato.toLowerCase();
      const score = calcularSimilaridade(stringNormalizada, candidatoNormalizado);
      
      if (score > melhorScore && score > 0.3) { // Threshold mínimo de 30%
        melhorScore = score;
        melhorMatch = candidato;
      }
    }
  }
  
  return melhorMatch;
}

// Função auxiliar para calcular similaridade entre duas strings
function calcularSimilaridade(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Matriz para programação dinâmica (Levenshtein distance)
  const matriz = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  // Inicializa primeira linha e coluna
  for (let i = 0; i <= len1; i++) matriz[i][0] = i;
  for (let j = 0; j <= len2; j++) matriz[0][j] = j;
  
  // Calcula distância
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matriz[i][j] = matriz[i - 1][j - 1];
      } else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j] + 1,     // deleção
          matriz[i][j - 1] + 1,     // inserção
          matriz[i - 1][j - 1] + 1  // substituição
        );
      }
    }
  }
  
  // Converte distância em similaridade (0 a 1)
  const distancia = matriz[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - distancia) / maxLen;
}

// Exemplos de uso
const arrayExemplo = ['campinas', 'R293', 'R075'];

console.log('Testando os exemplos:');
console.log(`'1. profissionais_campinas' => ${encontrarStringMaisProxima('1. profissionais_campinas', arrayExemplo)}`);
console.log(`'31.r075' => ${encontrarStringMaisProxima('31.r075', arrayExemplo)}`);
console.log(`'30.r_293' => ${encontrarStringMaisProxima('30.r_293', arrayExemplo)}`);

// Testes adicionais
console.log('\nTestes adicionais:');
console.log(`'campinas_teste' => ${encontrarStringMaisProxima('campinas_teste', arrayExemplo)}`);
console.log(`'r293_dados' => ${encontrarStringMaisProxima('r293_dados', arrayExemplo)}`);
console.log(`'075' => ${encontrarStringMaisProxima('075', arrayExemplo)}`);