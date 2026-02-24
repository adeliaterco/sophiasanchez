import { useEffect } from 'react';
import { storage } from '../utils/storage';
import { ga4Tracking } from '../utils/ga4Tracking';

interface LandingProps {
    onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
    // ========================================
    // ✅ SISTEMA DE CAPTURA DE UTMs (PRESERVADO)
    // ========================================
    const captureUTMs = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const utms: Record<string, string> = {};

            const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
            utmParams.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });

            const clickIds = ['fbclid', 'gclid', 'ttclid'];
            clickIds.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });

            if (Object.keys(utms).length > 0) {
                localStorage.setItem('quiz_utms', JSON.stringify(utms));
                console.log('✅ UTMs capturadas:', utms);
            } else {
                console.log('ℹ️ Nenhuma UTM encontrada na URL');
            }
        } catch (error) {
            console.error('❌ Erro ao capturar UTMs:', error);
        }
    };

    useEffect(() => {
        // ✅ CAPTURA UTMs ASSIM QUE A PÁGINA CARREGA
        captureUTMs();

        // Removido: tracking.pageView (gerenciado pelo Utmify)
        ga4Tracking.landingPageView();

        // Removido: scrollObserver (não necessário)
    }, []);

    const handleCTAClick = () => {
        // Removido: tracking.ctaClicked (gerenciado pelo Utmify)
        ga4Tracking.landingCTAClick();
        onNavigate('chat');
    };

    return (
        <div className="landing-container">
            <div className="matrix-bg"></div>
            <div className="scanlines"></div>

            <div className="content-wrapper">
                <main className="landing-main-simple">

                    {/* ========================================
                        ✅ HEADLINE NOVA - COPY ATUALIZADA
                        ======================================== */}
                    <h1 className="headline-simple">
                        <span className="headline-text">
                            El silencio de tu ex <span className="highlight-orange">no significa que sea tarde</span>.<br />
                            Pero cada día que pasa, <span className="highlight-orange">se vuelve más difícil</span>.
                        </span>
                    </h1>

                    {/* ✅ SUB - NOVO ELEMENTO */}
                    <p className="subtitle-simple">
                        Responde 7 preguntas y te digo el <strong>próximo paso exacto</strong> para que ella vuelva a verte.
                    </p>

                    {/* CTA GRANDE COM ANIMAÇÃO DE PULSAÇÃO */}
                    <div className="cta-section-simple">
                        <button className="cta-button-simple" onClick={handleCTAClick}>
                            <span className="cta-glow"></span>
                            <span className="cta-icon">⏰</span>
                            <span className="cta-text">DESCUBRIR SI AÚN HAY TIEMPO</span>
                        </button>
                    </div>

                </main>

                {/* FOOTER MINIMALISTA */}
                <footer className="landing-footer-simple">
                    <p className="disclaimer-simple">
                        🔒 Anónimo • 2 minutos • Sin juicio • Sin email
                    </p>
                </footer>
            </div>

            {/* CSS INLINE */}
            <style jsx="true">{`
                .landing-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #000;
                    overflow: hidden;
                }

                .matrix-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }

                .scanlines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                }

                .content-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 800px;
                    padding: 2rem;
                }

                .landing-main-simple {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3rem;
                    min-height: 70vh;
                }

                /* ========================================
                   HEADLINE COM DESTAQUES LARANJA/AMARELO
                   ======================================== */
                .headline-simple {
                    text-align: center;
                    font-size: 2.5rem;
                    line-height: 1.3;
                    color: #fff;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .alert-emoji {
                    font-size: 4rem;
                    animation: pulse 2s infinite;
                }

                .headline-text {
                    font-size: 2.2rem;
                    font-weight: 700;
                    line-height: 1.3;
                }

                .highlight-orange {
                    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 800;
                }

                .highlight-orange-italic {
                    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 800;
                    font-style: italic;
                }

                /* ✅ NOVO - SUBTITLE */
                .subtitle-simple {
                    text-align: center;
                    font-size: 1.25rem;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.6;
                    margin: 0;
                    max-width: 580px;
                }

                .subtitle-simple strong {
                    color: #fff;
                    font-weight: 700;
                }

                @keyframes pulse {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.7; 
                        transform: scale(1.1);
                    }
                }

                /* ========================================
                   CTA COM ANIMAÇÃO DE PULSAÇÃO
                   ======================================== */
                .cta-section-simple {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }

                .cta-button-simple {
                    background: linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    padding: 2rem 3rem;
                    font-size: 1.5rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    min-width: 90%;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    animation: pulse-cta 2s ease-in-out infinite;
                }

                @keyframes pulse-cta {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    }
                    50% { 
                        transform: scale(1.05);
                        box-shadow: 0 12px 32px rgba(255, 59, 59, 0.7);
                    }
                }

                .cta-button-simple:hover {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 12px 32px rgba(255, 59, 59, 0.6);
                    animation: none;
                }

                .cta-button-simple:active {
                    transform: translateY(-2px) scale(1.02);
                }

                .cta-icon {
                    font-size: 2rem;
                }

                .cta-text {
                    position: relative;
                    z-index: 2;
                }

                .cta-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: glow-slide 3s infinite;
                    z-index: 1;
                }

                @keyframes glow-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                /* FOOTER MINIMALISTA */
                .landing-footer-simple {
                    text-align: center;
                    padding: 2rem 0;
                    margin-top: 4rem;
                }

                .disclaimer-simple {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                /* RESPONSIVO */
                @media (max-width: 768px) {
                    .headline-simple {
                        font-size: 1.8rem;
                    }

                    .alert-emoji {
                        font-size: 3rem;
                    }

                    .headline-text {
                        font-size: 1.6rem;
                    }

                    .subtitle-simple {
                        font-size: 1.1rem;
                    }

                    .cta-button-simple {
                        padding: 1.5rem 2rem;
                        font-size: 1.2rem;
                        min-width: 100%;
                    }

                    .cta-icon {
                        font-size: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .headline-text {
                        font-size: 1.4rem;
                    }

                    .subtitle-simple {
                        font-size: 1rem;
                    }

                    .cta-button-simple {
                        padding: 1.25rem 1.5rem;
                        font-size: 1rem;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
}