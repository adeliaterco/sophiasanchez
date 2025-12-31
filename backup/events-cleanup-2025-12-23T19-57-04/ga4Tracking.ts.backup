// 
// SISTEMA DE TRACKING GA4
// 

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class GA4Tracking {
  
  // ✅ Verifica se o gtag está disponível
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  // ✅ Envia evento genérico
  private sendEvent(eventName: string, params?: Record<string, any>) {
    if (this.isAvailable()) {
      window.gtag('event', eventName, params);
      console.log(`📊 GA4 Event: ${eventName}`, params);
    } else {
      console.warn('⚠️ GA4 não disponível ainda');
    }
  }

  // 
  // LANDING PAGE
  // 

  landingPageView() {
    this.sendEvent('page_view', {
      page_title: 'Landing Page',
      page_location: window.location.href,
      page_path: '/'
    });
  }

  landingCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'Iniciar Análisis',
      button_location: 'landing_primary',
      page: 'landing'
    });
  }

  landingScrollDepth(depth: number) {
    this.sendEvent('scroll_depth', {
      depth_percentage: depth,
      page: 'landing'
    });
  }

  // 
  // CHAT
  // 

  chatPageView() {
    this.sendEvent('page_view', {
      page_title: 'Chat Analysis',
      page_location: window.location.href,
      page_path: '/chat'
    });
  }

  chatStarted() {
    this.sendEvent('chat_started', {
      page: 'chat'
    });
  }

  questionAnswered(questionId: number, questionText: string, answer: string) {
    this.sendEvent('question_answered', {
      question_id: questionId,
      question_text: questionText,
      answer: answer,
      page: 'chat'
    });
  }

  chatCompleted() {
    this.sendEvent('chat_completed', {
      page: 'chat'
    });
  }

  chatCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'Ver Mi Plan Personalizado',
      button_location: 'chat_complete',
      page: 'chat'
    });
  }

  // 
  // RESULTADO
  // 

  resultPageView() {
    this.sendEvent('page_view', {
      page_title: 'Result Page',
      page_location: window.location.href,
      page_path: '/resultado'
    });
  }

  revelationViewed(revelationName: string) {
    this.sendEvent('revelation_viewed', {
      revelation_name: revelationName,
      page: 'resultado'
    });
  }

  videoStarted() {
    this.sendEvent('video_started', {
      video_name: 'VSL Plan Personalizado',
      page: 'resultado'
    });
  }

  offerRevealed() {
    this.sendEvent('offer_revealed', {
      page: 'resultado'
    });
  }

  offerViewed() {
    this.sendEvent('offer_viewed', {
      page: 'resultado'
    });
  }

  ctaBuyClicked(buttonLocation: string) {
    this.sendEvent('cta_buy_click', {
      button_name: 'Comprar Ahora',
      button_location: buttonLocation,
      page: 'resultado',
      value: 1 // Você pode adicionar o valor do produto aqui
    });
  }

  // 
  // CONVERSÃO (IMPORTANTE!)
  // 

  purchase(value: number, currency: string = 'BRL') {
    this.sendEvent('purchase', {
      transaction_id: `TXN-${Date.now()}`,
      value: value,
      currency: currency,
      items: [{
        item_name: 'Plan de Reconquista 21 Días',
        item_category: 'Digital Product',
        price: value,
        quantity: 1
      }]
    });
  }

  // 
  // COUNTDOWN & URGÊNCIA
  // 

  spotsUpdated(spotsLeft: number) {
    if (spotsLeft === 20 || spotsLeft === 10 || spotsLeft === 5) {
      this.sendEvent('spots_alert', {
        spots_remaining: spotsLeft,
        page: 'resultado'
      });
    }
  }

  // 
  // NOVOS EVENTOS PARA PROGRESSÃO MANUAL E VSL DINÂMICO
  // 

  /**
   * Registra o clique no botão "Continuar" para avançar de fase.
   * @param phaseFrom Número da fase de origem.
   * @param phaseTo Número da fase de destino.
   * @param timeSpent Tempo em segundos gasto na fase de origem.
   */
  phaseProgressionClicked(phaseFrom: number, phaseTo: number, timeSpent: number) {
    this.sendEvent('phase_progression_clicked', {
      phase_from: phaseFrom,
      phase_to: phaseTo,
      time_spent_seconds: Math.round(timeSpent / 1000), // Converte para segundos
      page: 'resultado'
    });
  }

  /**
   * Registra o clique no botão "Desbloquear Vídeo".
   * @param unlockTime Tempo em segundos desde o início da fase do vídeo até o clique.
   * @param videoName Nome do vídeo.
   */
  videoButtonUnlocked(unlockTime: number, videoName: string) {
    this.sendEvent('video_button_unlocked', {
      unlock_time_seconds: Math.round(unlockTime / 1000), // Converte para segundos
      video_name: videoName,
      page: 'resultado'
    });
  }

  /**
   * Registra quando o vídeo é finalmente exibido após o delay de desbloqueio.
   * @param videoDuration Duração total do vídeo em segundos (se conhecida).
   * @param unlockDelay Tempo de delay aplicado antes da exibição do vídeo em ms.
   */
  videoUnlockedViewed(videoDuration: number, unlockDelay: number) {
    this.sendEvent('video_unlocked_viewed', {
      video_duration_seconds: videoDuration,
      unlock_delay_ms: unlockDelay,
      page: 'resultado'
    });
  }

  /**
   * Registra quando o fallback automático de progressão de fase é acionado.
   * @param phase Número da fase onde o timeout ocorreu.
   * @param timeSpentSeconds Tempo em segundos gasto na fase antes do timeout.
   */
  phaseTimeoutWarning(phase: number, timeSpentSeconds: number) {
    this.sendEvent('phase_timeout_warning', {
      phase_number: phase,
      time_spent_seconds: timeSpentSeconds,
      page: 'resultado'
    });
  }

  /**
   * Registra quando a seção de oferta é alcançada.
   * @param pathTaken Caminho percorrido pelo usuário (ex: "manual", "timeout_phase1").
   * @param totalTimeSpent Tempo total em segundos gasto na página até a oferta.
   */
  offerSectionReached(pathTaken: string, totalTimeSpent: number) {
    this.sendEvent('offer_section_reached', {
      path_taken: pathTaken,
      total_time_spent_seconds: Math.round(totalTimeSpent / 1000), // Converte para segundos
      page: 'resultado'
    });
  }

  /**
   * Registra a impressão do CTA final (geralmente no sticky footer).
   * @param ctaPosition Posição do CTA (ex: "sticky_footer", "main_offer_button").
   * @param visibilityTime Tempo em segundos que o CTA esteve visível.
   */
  finalCtaImpression(ctaPosition: string, visibilityTime: number) {
    this.sendEvent('final_cta_impression', {
      cta_position: ctaPosition,
      visibility_time_seconds: Math.round(visibilityTime / 1000), // Converte para segundos
      page: 'resultado'
    });
  }
}

// ✅ Exporta instância única
export const ga4Tracking = new GA4Tracking();