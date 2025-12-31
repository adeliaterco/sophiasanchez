import { ReactNode, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  useEffect(() => {
    // ========================================
    // ✅ UTMIFY PIXEL
    // ========================================
    window.pixelId = "692a51417601ebc1d4536861";
    const utmifyPixelScript = document.createElement("script");
    utmifyPixelScript.setAttribute("async", "");
    utmifyPixelScript.setAttribute("defer", "");
    utmifyPixelScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    document.head.appendChild(utmifyPixelScript);

    // ========================================
    // ✅ UTMIFY UTM TRACKER
    // ========================================
    const utmifyUtmScript = document.createElement("script");
    utmifyUtmScript.setAttribute("src", "https://cdn.utmify.com.br/scripts/utms/latest.js");
    utmifyUtmScript.setAttribute("data-utmify-prevent-subids", "");
    utmifyUtmScript.setAttribute("async", "");
    utmifyUtmScript.setAttribute("defer", "");
    document.head.appendChild(utmifyUtmScript);

    // ========================================
    // ✅ GOOGLE ANALYTICS 4 (GA4)
    // ========================================
    const ga4Script = document.createElement("script");
    ga4Script.async = true;
    ga4Script.src = "https://www.googletagmanager.com/gtag/js?id=G-G6B4TMDNTK";
    document.head.appendChild(ga4Script);

    const ga4ConfigScript = document.createElement("script");
    ga4ConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-G6B4TMDNTK');
    `;
    document.head.appendChild(ga4ConfigScript);

    console.log("✅ Pixels carregados: Utmify Pixel, Utmify UTM, GA4");

  }, []); // ✅ Executa apenas 1 vez quando o componente monta

  return (
    <>
      {/* ✅ Renderiza os componentes filhos (Chat, Result, etc) */}
      {children}
    </>
  );
}