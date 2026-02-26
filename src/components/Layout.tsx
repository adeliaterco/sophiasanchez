import { ReactNode, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    pixelId: string;
    google_tag_manager: any;
  }
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  useEffect(() => {
    // ========================================
    // ✅ PREVENIR CARREGAMENTO DUPLICADO
    // ========================================
    if (window.google_tag_manager) {
      console.log('GTM já está carregado');
      return;
    }

    // ========================================
    // ✅ INICIALIZAR DATALAYER
    // ========================================
    window.dataLayer = window.dataLayer || [];
    
    // ✅ PUSH DO GTM.START (OBRIGATÓRIO)
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // ========================================
    // ✅ GOOGLE TAG MANAGER WEB (DIRETO DO GOOGLE)
    // ========================================
    const gtmId = 'GTM-T8M558NG';
    
    // ✅ CRIAR E INSERIR SCRIPT DO GTM
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    
    // ✅ CALLBACK APÓS CARREGAMENTO
    gtmScript.onload = () => {
      console.log('✅ GTM Web carregado com sucesso');
    };
    
    gtmScript.onerror = () => {
      console.error('❌ Erro ao carregar GTM');
    };
    
    // ✅ INSERIR NO HEAD (PRIMEIRO SCRIPT)
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }

    // ========================================
    // ✅ UTMIFY PIXEL
    // ========================================
    window.pixelId = "699fb21f66b4e999b2645ba9";
    const utmifyPixelScript = document.createElement("script");
    utmifyPixelScript.async = true;
    utmifyPixelScript.defer = true;
    utmifyPixelScript.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";
    document.head.appendChild(utmifyPixelScript);

    // ========================================
    // ✅ UTMIFY UTM TRACKER
    // ========================================
    const utmifyUtmScript = document.createElement("script");
    utmifyUtmScript.src = "https://cdn.utmify.com.br/scripts/utms/latest.js";
    utmifyUtmScript.setAttribute("data-utmify-prevent-subids", "");
    utmifyUtmScript.async = true;
    utmifyUtmScript.defer = true;
    document.head.appendChild(utmifyUtmScript);

    // ✅ LOG DE DEBUG
    console.log('🚀 GTM Web inicializado');

  }, []);

  return (
    <>
      {/* GTM NoScript (fallback) */}
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-T8M558NG"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      
      {children}
    </>
  );
}