export const tracking = {
  pageView: (pageName: string) => {
    console.log('[GA4] page_view_gamificado:', pageName);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  },

  chatStarted: () => {
    console.log('[GA4] chat_started');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_started', {
        event_category: 'engagement',
      });
    }
  },

  questionAnswered: (questionId: number, answer: string) => {
    console.log('[GA4] chat_question_answered:', { questionId, answer });
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_question_answered', {
        event_category: 'engagement',
        question_id: questionId,
        answer: answer,
      });
    }
  },

  chatCompleted: () => {
    console.log('[GA4] chat_completed');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_completed', {
        event_category: 'conversion',
      });
    }
  },

  revelationViewed: (revelationId: string) => {
    console.log('[GA4] revelation_viewed:', revelationId);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'revelation_viewed', {
        event_category: 'engagement',
        revelation_id: revelationId,
      });
    }
  },

  vslEvent: (eventType: 'started' | '25' | '50' | '75' | 'completed') => {
    console.log('[GA4] vsl_' + eventType);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'vsl_' + eventType, {
        event_category: 'video',
      });
    }
  },

  ctaClicked: (position: string) => {
    console.log('[GA4] cta_clicked:', position);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_clicked', {
        event_category: 'conversion',
        position: position,
      });
    }
  },

  countdownExpired: () => {
    console.log('[GA4] countdown_expired');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'countdown_expired', {
        event_category: 'urgency',
      });
    }
  },

  scrollDepth: (depth: number) => {
    console.log('[GA4] scroll_depth:', depth);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'scroll_depth', {
        event_category: 'engagement',
        depth: depth,
      });
    }
  },
};
