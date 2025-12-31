import { QuizData } from '../types/quiz';

// ========================================
// VALIDAÇÃO EMOCIONAL BASEADA NAS RESPOSTAS
// ========================================

export function getEmotionalValidation(quizData: QuizData): string {
  let validation = '';
  const pronoun = quizData.gender === 'HOMBRE' ? 'ella' : 'él';
  
  // Validação por tempo de separação
  if (quizData.timeSeparation === 'MENOS DE 1 SEMANA') {
    validation = `Tu separación es reciente. Eso significa que aún hay una ventana de oportunidad donde ${pronoun} piensa en ti constantemente. `;
  } else if (quizData.timeSeparation === 'MÁS DE 6 MESES') {
    validation = `Ha pasado tiempo, pero eso no significa que sea imposible. Hay patrones psicológicos que funcionan incluso después de meses. `;
  } else {
    validation = `El tiempo que ha pasado es crucial. Estás en una fase donde ${pronoun} aún tiene recuerdos frescos, pero los patrones están cambiando. `;
  }
  
  // Validação por quem terminou
  if (quizData.whoEnded === 'ÉL/ELLA TERMINÓ') {
    validation += `Y el hecho de que ${pronoun} haya terminado es en realidad una ventaja, porque significa que ${pronoun} tuvo que tomar una decisión difícil y eso deja una huella emocional.`;
  } else if (quizData.whoEnded === 'YO TERMINÉ') {
    validation += `Y el hecho de que tú hayas terminado cambia la dinámica completamente. ${pronoun} puede estar esperando que tú des el primer paso.`;
  }
  
  return validation;
}

export function getSituationInsight(quizData: QuizData): string {
  const pronoun = quizData.gender === 'HOMBRE' ? 'ella' : 'él';
  
  const insights: Record<string, string> = {
    'CONTACTO CERO': `El contacto cero puede ser estratégico, pero también puede estar creando distancia. Necesitas saber CUÁNDO romperlo.`,
    'ME IGNORA': `Si ${pronoun} te ignora, hay una razón psicológica específica. No es personal, es un mecanismo de defensa que podemos revertir.`,
    'BLOQUEADO': `Estar bloqueado parece definitivo, pero es una reacción emocional extrema que indica que aún hay sentimientos fuertes.`,
    'SÓLO TEMAS NECESARIOS': `La comunicación mínima es una señal de que ${pronoun} está construyendo barreras emocionales, pero aún mantiene un canal abierto.`,
    'HABLAMOS A VECES': `La comunicación ocasional es una oportunidad de oro. Estás en la fase perfecta para aplicar el protocolo.`,
    'SOMOS AMIGOS': `La "amistad" después de una ruptura es un campo minado emocional. Puede ser tu mayor ventaja o tu peor enemía.`,
    'ENCUENTROS ÍNTIMOS': `Los encuentros íntimos indican que la atracción física sigue viva, pero falta la conexión emocional profunda.`
  };
  
  return insights[quizData.currentSituation || ''] || '';
}