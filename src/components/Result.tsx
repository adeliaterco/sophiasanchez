import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { playKeySound, getHotmartUrl } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { ga4Tracking } from '../utils/ga4Tracking';

import { 
    getTitle, 
    getLoadingMessage, 
    getCopy, 
    getVentana72Copy,
    getOfferTitle,
    getFeatures, 
    getCTA,
    getFaseText
} from '../utils/contentByGender';
import { getEmotionalValidation } from '../utils/emotionalValidation';

interface ResultProps {
    onNavigate: (page: string) => void;
}

export default function Result({ onNavigate }: ResultProps) {
    // --- ESTADO UNIFICADO E CONTROLE DE FLUXO ---
    const [currentPhase, setCurrentPhase] = useState(0);
    const [fadeOutPhase, setFadeOutPhase] = useState<number | null>(null);

    // --- ESTADOS PARA O DELAY DO BOTÃO DO VÍDEO ---
    const [videoButtonDelayLeft, setVideoButtonDelayLeft] = useState(20);
    const [isVideoButtonEnabled, setIsVideoButtonEnabled] = useState(false);

    // --- ESTADO PARA OS CHECKMARKS DOS BOTÕES ---
    const [buttonCheckmarks, setButtonCheckmarks] = useState<{[key: number]: boolean}>({
        0: false,
        1: false,
        2: false
    });

    // --- PERSISTÊNCIA DO TIMER NO LOCALSTORAGE ---
    const getInitialTime = () => {
        const savedTimestamp = localStorage.getItem('quiz_timer_start');
        if (savedTimestamp) {
            const startTime = parseInt(savedTimestamp);
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = (47 * 60) - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        localStorage.setItem('quiz_timer_start', Date.now().toString());
        return 47 * 60;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTime());
    const [spotsLeft, setSpotsLeft] = useState(storage.getSpotsLeft());
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);
    const [peopleBuying, setPeopleBuying] = useState(Math.floor(Math.random() * 5) + 1);

    const quizData = storage.getQuizData();
    const diagnosticoSectionRef = useRef<HTMLDivElement>(null);
    const videoSectionRef = useRef<HTMLDivElement>(null);
    const ventana72SectionRef = useRef<HTMLDivElement>(null);
    const offerSectionRef = useRef<HTMLDivElement>(null);

    const gender = quizData.gender || 'HOMBRE';

    const loadingSteps = [
        { icon: '📊', text: 'Respuestas procesadas', duration: 0 },
        { icon: '🧠', text: 'Generando tu diagnóstico personalizado...', duration: 1000 }
    ];

    // --- SISTEMA DE PRESERVAÇÃO DE UTMs ---
    const getUTMs = (): Record<string, string> => {
        try {
            const storedUTMs = localStorage.getItem('quiz_utms');
            return storedUTMs ? JSON.parse(storedUTMs) : {};
        } catch (error) {
            return {};
        }
    };

    const ensureUTMs = () => {
        const utms = getUTMs();
        if (Object.keys(utms).length > 0 && window.location.search === '') {
            const utmString = Object.entries(utms)
                .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
                .join('&');
            window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
        }
    };

    const appendUTMsToHotmartURL = (): string => {
        const baseURL = getHotmartUrl();
        const utms = getUTMs();
        if (Object.keys(utms).length === 0) return baseURL;
        const url = new URL(baseURL);
        Object.entries(utms).forEach(([key, value]) => url.searchParams.set(key, value as string));
        return url.toString();
    };

    // --- EFEITO PRINCIPAL DE PROGRESSÃO ---
    useEffect(() => {
        ensureUTMs();
        ga4Tracking.resultPageView();

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 4;
            });
        }, 100);

        loadingSteps.forEach((step, index) => {
            setTimeout(() => setLoadingStep(index), step.duration);
        });

        const timerPhase1 = setTimeout(() => {
            setCurrentPhase(1);
            playKeySound();
            ga4Tracking.revelationViewed('Por qué te dejó', 1);
        }, 2500);

        const countdownInterval = setInterval(() => setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1)), 1000);

        const spotsInterval = setInterval(() => {
            setSpotsLeft(prev => {
                if (prev > 15) {
                    const newSpots = prev - 1;
                    storage.setSpotsLeft(newSpots);
                    ga4Tracking.spotsUpdated(newSpots);
                    return newSpots;
                }
                return prev;
            });
        }, 45000);

        const buyingInterval = setInterval(() => {
            setPeopleBuying(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                let newCount = prev + change;
                if (newCount < 1) newCount = 1;
                if (newCount > 7) newCount = 7;
                return newCount;
            });
        }, Math.floor(Math.random() * 10000) + 5000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timerPhase1);
            clearInterval(countdownInterval);
            clearInterval(spotsInterval);
            clearInterval(buyingInterval);
        };
    }, []);

    // --- EFEITO PARA O DELAY DO BOTÃO DO VÍDEO (FASE 2) ---
    useEffect(() => {
        let delayInterval: NodeJS.Timeout;
        if (currentPhase === 2) {
            setVideoButtonDelayLeft(20);
            setIsVideoButtonEnabled(false);

            delayInterval = setInterval(() => {
                setVideoButtonDelayLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(delayInterval);
                        setIsVideoButtonEnabled(true);
                        ga4Tracking.videoButtonUnlocked({ unlock_time_seconds: 50, video_name: 'VSL Plan Personalizado' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (delayInterval) clearInterval(delayInterval);
        };
    }, [currentPhase]);

    // Injeção VTurb
    useEffect(() => {
        if (currentPhase !== 2 || !videoSectionRef.current) return;
        const timer = setTimeout(() => {
            const vslPlaceholder = videoSectionRef.current.querySelector('.vsl-placeholder');
            if (vslPlaceholder) {
                vslPlaceholder.innerHTML = `
                    <div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000; border-radius: 8px; overflow: hidden;">
                        <vturb-smartplayer id="vid-694bc5dff757812677c3b148" style="display: block; margin: 0 auto; width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></vturb-smartplayer>
                    </div>
                `;
                if (!document.querySelector('script[src*="player.js"]')) {
                    const s = document.createElement("script");
                    s.src = "https://scripts.converteai.net/d1055f81-b10e-4e76-a928-5438e4f7acf6/players/694bc5dff757812677c3b148/v4/player.js";
                    s.async = true;
                    document.head.appendChild(s);
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPhase]);

    // --- EFEITO PARA SCROLL AUTOMÁTICO ---
    useEffect(() => {
        let targetRef: React.RefObject<HTMLDivElement> | null = null;
        switch (currentPhase) {
            case 1: targetRef = diagnosticoSectionRef; break;
            case 2: targetRef = videoSectionRef; break;
            case 3: targetRef = ventana72SectionRef; break;
            case 4: targetRef = offerSectionRef; break;
        }

        if (targetRef && targetRef.current) {
            setTimeout(() => {
                targetRef!.current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100); 
        }
    }, [currentPhase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- HANDLERS DE CLIQUE DOS BOTÕES COM TRANSIÇÃO ---
    const handlePhase1ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 0: true }));
        setFadeOutPhase(1);

        setTimeout(() => {
            setCurrentPhase(2);
            ga4Tracking.phaseProgressionClicked({ phase_from: 1, phase_to: 2, button_name: 'Desbloquear El Vídeo Secreto' });
            ga4Tracking.videoStarted();
            setFadeOutPhase(null);
        }, 1300);
    };

    const handlePhase2ButtonClick = () => {
        if (!isVideoButtonEnabled) return;
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 1: true }));
        setFadeOutPhase(2);

        setTimeout(() => {
            setCurrentPhase(3);
            ga4Tracking.phaseProgressionClicked({ phase_from: 2, phase_to: 3, button_name: 'Revelar VENTANA DE 72 HORAS' });
            ga4Tracking.revelationViewed('Ventana 72 Horas', 2);
            setFadeOutPhase(null);
        }, 1300);
    };

    const handlePhase3ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 2: true }));
        setFadeOutPhase(3);

        setTimeout(() => {
            setCurrentPhase(4);
            ga4Tracking.phaseProgressionClicked({ phase_from: 3, phase_to: 4, button_name: 'Revelar Mi Plan Personalizado' });
            ga4Tracking.revelationViewed('Oferta Revelada', 3);
            ga4Tracking.offerRevealed();
            setFadeOutPhase(null);
        }, 1300);
    };

    const handleCTAClick = () => {
        ga4Tracking.ctaBuyClicked('result_buy_main');
        window.open(appendUTMsToHotmartURL(), '_blank');
    };

    // --- HELPER PARA EMOJI DO DELAY ---
    const getDelayEmoji = (secondsLeft: number) => {
        const progress = (50 - secondsLeft) / 50;
        if (progress < 0.2) return '😴';
        if (progress < 0.4) return '⏳';
        if (progress < 0.7) return '🔥';
        return '🚀';
    };

    const phases = ['Diagnóstico', 'Vídeo', 'Ventana 72h', 'Solución'];

    return (
        <div className="result-container">
            <div className="result-header">
                <h1 className="result-title">Tu Plan Personalizado Está Listo</h1>
                <div className="urgency-bar">
                    <span className="urgency-icon">⚠️</span>
                    <span className="urgency-text">Tu análisis expira en: {formatTime(timeLeft)}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '8px' }}>
                    Por seguridad, tu diagnóstico personalizado estará disponible solo por 47 minutos.
                </p>
            </div>

            {/* BARRA DE PROGRESSO UNIFICADA */}
            {currentPhase > 0 && (
                <div className="progress-bar-container fade-in">
                    {phases.map((label, index) => (
                        <div key={index} className={`progress-step ${currentPhase > index + 1 ? 'completed' : ''} ${currentPhase === index + 1 ? 'active' : ''}`}>
                            <div className="step-circle">{currentPhase > index + 1 ? '✅' : index + 1}</div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="revelations-container">
                
                {/* LOADING ACELERADO */}
                {currentPhase === 0 && (
                    <div className="revelation fade-in loading-box-custom">
                        <div className="loading-inner">
                            <div className="spin-brain">🧠</div>
                            <h2>ANALIZANDO TU CASO</h2>
                            <p>{getLoadingMessage(gender)}</p>
                            <div className="loading-steps-list">
                                {loadingSteps.map((step, i) => (
                                    <div key={i} className={`loading-step-item ${i <= loadingStep ? 'active' : ''}`}>
                                        {i < loadingStep ? '✅' : step.icon} {step.text}
                                    </div>
                                ))}
                            </div>
                            <div className="progress-outer"><div className="progress-inner" style={{ width: `${loadingProgress}%` }}></div></div>
                            <div className="progress-labels"><span>{loadingProgress}%</span><span>⏱️ {Math.ceil((100 - loadingProgress) / 10)}s...</span></div>
                        </div>
                    </div>
                )}

                {/* FASE 1: DIAGNÓSTICO */}
                {currentPhase === 1 && (
                    <div 
                        ref={diagnosticoSectionRef} 
                        className={`revelation fade-in ${fadeOutPhase === 1 ? 'fade-out' : ''}`}
                    >
                        <div className="revelation-header">
                            <div className="revelation-icon">💔</div>
                            <h2>{getTitle(gender)}</h2>
                        </div>
                        
                        <div className="quiz-summary-box">
                            <p className="summary-title">📋 TU SITUACIÓN ESPECÍFICA</p>
                            <div className="summary-grid">
                                <div><span>✓</span> <strong>Tiempo:</strong> {quizData.timeSeparation || 'No especificado'}</div>
                                <div><span>✓</span> <strong>Quién terminó:</strong> {quizData.whoEnded || 'No especificado'}</div>
                                <div><span>✓</span> <strong>Contacto:</strong> {quizData.currentSituation || 'No especificado'}</div>
                                <div><span>✓</span> <strong>Compromiso:</strong> {quizData.commitmentLevel || 'No especificado'}</div>
                            </div>
                        </div>

                        <p className="revelation-text" style={{ whiteSpace: 'pre-line' }}>{getCopy(quizData)}</p>

                        <div className="emotional-validation">
                            <p><strong>Tu situación específica:</strong><br />{getEmotionalValidation(quizData)}</p>
                        </div>

                        {buttonCheckmarks[0] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <button 
                                className="cta-button btn-green btn-size-1 btn-animation-fadein" 
                                onClick={handlePhase1ButtonClick}
                            >
                                🔓 Desbloquear El Vídeo Secreto
                            </button>
                        )}
                    </div>
                )}

                {/* FASE 2: VÍDEO */}
                {currentPhase === 2 && (
                    <div 
                        ref={videoSectionRef} 
                        className={`revelation fade-in vsl-revelation ${fadeOutPhase === 2 ? 'fade-out' : ''}`}
                    >
                        <div className="revelation-header">
                            <h2>Ahora solo falta un paso más para recuperar a la mujer que amas.</h2>
                        </div>
                        <div className="vsl-container">
                            <div className="vsl-placeholder"></div> 
                        </div>

                        {buttonCheckmarks[1] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <div className="video-delay-indicator">
                                {!isVideoButtonEnabled ? (
                                    <>
                                        <p className="delay-text">
                                            {getDelayEmoji(videoButtonDelayLeft)} Próxima sección en {videoButtonDelayLeft} segundos...
                                        </p>
                                        <div className="delay-progress-bar-container">
                                            <div 
                                                className="delay-progress-bar" 
                                                style={{ width: `${((50 - videoButtonDelayLeft) / 50) * 100}%` }}
                                            ></div>
                                        </div>
                                        <button 
                                            className="cta-button btn-yellow btn-size-2 btn-animation-bounce disabled" 
                                            disabled
                                        >
                                            Revelar VENTANA DE 72 HORAS
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="cta-button btn-yellow btn-size-2 btn-animation-bounce" 
                                        onClick={handlePhase2ButtonClick}
                                    >
                                        Revelar VENTANA DE 72 HORAS
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ✅ DEPOIMENTOS ESTRATÉGICOS - INSERIDO AQUI */}
                        <div className="testimonials-section fade-in" style={{
                            marginTop: 'clamp(32px, 6vw, 48px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(20px, 4vw, 24px)'
                        }}>
                            {/* DEPOIMENTO 1 - HOMEM (PRIORIDADE) */}
                            <div className="testimonial-card" style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
                                border: '2px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '16px',
                                padding: 'clamp(20px, 5vw, 28px)',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                gap: 'clamp(16px, 4vw, 20px)',
                                alignItems: 'flex-start'
                            }}>
                                <img 
                                    src="https://comprarplanseguro.shop/wp-content/uploads/2025/08/Captura-de-Tela-2025-08-08-as-19.24.05.png" 
                                    alt="Carlos M." 
                                    style={{
                                        width: 'clamp(60px, 15vw, 80px)',
                                        height: 'clamp(60px, 15vw, 80px)',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid rgba(16, 185, 129, 0.6)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: 'clamp(8px, 2vw, 12px)'
                                    }}>
                                        <strong style={{
                                            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                            color: '#10b981'
                                        }}>
                                            Carlos M.
                                        </strong>
                                        <span style={{
                                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                                            color: 'rgba(255,255,255,0.6)'
                                        }}>
                                            • 29 años • Buenos Aires
                                        </span>
                                    </div>
                                    <div style={{
                                        color: '#facc15',
                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                        marginBottom: 'clamp(8px, 2vw, 10px)'
                                    }}>
                                        ⭐⭐⭐⭐⭐
                                    </div>
                                    <p style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                        lineHeight: '1.6',
                                        color: 'white',
                                        margin: 0,
                                        fontStyle: 'italic'
                                    }}>
                                        "Ella estaba con otro tipo. Yo estaba destruido. 
                                        El <strong style={{ color: '#10b981' }}>Módulo 4 (Protocolo de Emergencia)</strong> 
                                        me salvó de cometer errores fatales. Seguí las 3 fases de la Ventana de 72 Horas al pie de la letra, 
                                        y en 19 días ella terminó con él y volvió conmigo. 
                                        <strong style={{ color: '#facc15' }}> No lo hubiera creído si no me pasaba a mí</strong>. 
                                        Ricardo sabe exactamente cómo funciona la mente femenina."
                                    </p>
                                    <div style={{
                                        marginTop: 'clamp(12px, 3vw, 16px)',
                                        padding: 'clamp(8px, 2vw, 12px)',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #10b981'
                                    }}>
                                        <p style={{
                                            fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                                            color: 'rgba(255,255,255,0.8)',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            <strong style={{ color: '#10b981' }}>✓ Resultado:</strong> Reconquista en 19 días | 
                                            <strong style={{ color: '#10b981' }}> ✓ Situación:</strong> Ella con otra persona
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* DEPOIMENTO 2 - HOMEM (CONTATO ZERO) */}
                            <div className="testimonial-card" style={{
                                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(250, 204, 21, 0.1))',
                                border: '2px solid rgba(234, 179, 8, 0.4)',
                                borderRadius: '16px',
                                padding: 'clamp(20px, 5vw, 28px)',
                                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)',
                                display: 'flex',
                                gap: 'clamp(16px, 4vw, 20px)',
                                alignItems: 'flex-start'
                            }}>
                                <img 
                                    src="https://comprarplanseguro.shop/wp-content/uploads/2025/08/Captura-de-Tela-2025-08-08-as-19.01.05.png" 
                                    alt="Diego R." 
                                    style={{
                                        width: 'clamp(60px, 15vw, 80px)',
                                        height: 'clamp(60px, 15vw, 80px)',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid rgba(234, 179, 8, 0.6)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: 'clamp(8px, 2vw, 12px)'
                                    }}>
                                        <strong style={{
                                            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                            color: '#eab308'
                                        }}>
                                            Diego R.
                                        </strong>
                                        <span style={{
                                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                                            color: 'rgba(255,255,255,0.6)'
                                        }}>
                                            • 32 años • Ciudad de México
                                        </span>
                                    </div>
                                    <div style={{
                                        color: '#facc15',
                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                        marginBottom: 'clamp(8px, 2vw, 10px)'
                                    }}>
                                        ⭐⭐⭐⭐⭐
                                    </div>
                                    <p style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                        lineHeight: '1.6',
                                        color: 'white',
                                        margin: 0,
                                        fontStyle: 'italic'
                                    }}>
                                        "Llevábamos 5 meses sin hablar. Ella me bloqueó de todo. 
                                        Pensé que era imposible. Apliqué el <strong style={{ color: '#eab308' }}>Protocolo de Contacto Zero Inverso</strong> 
                                        del Módulo 1, y en 13 días ella me desbloqueó y me escribió primero. 
                                        Hoy llevamos 3 meses juntos de nuevo, <strong style={{ color: '#facc15' }}>y la relación es 10 veces mejor</strong>. 
                                        Este método funciona incluso en casos extremos como el mío."
                                    </p>
                                    <div style={{
                                        marginTop: 'clamp(12px, 3vw, 16px)',
                                        padding: 'clamp(8px, 2vw, 12px)',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #eab308'
                                    }}>
                                        <p style={{
                                            fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                                            color: 'rgba(255,255,255,0.8)',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            <strong style={{ color: '#eab308' }}>✓ Resultado:</strong> Reconquista en 13 días | 
                                            <strong style={{ color: '#eab308' }}> ✓ Situación:</strong> Bloqueado 5 meses
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FASE 3: VENTANA 72H */}
                {currentPhase === 3 && (
                    <div 
                        ref={ventana72SectionRef} 
                        className={`revelation fade-in ventana-box-custom ${fadeOutPhase === 3 ? 'fade-out' : ''}`}
                    >
                        <div className="ventana-header-custom">
                            <span>⚡</span>
                            <h2>LA VENTANA DE 72 HORAS</h2>
                        </div>
                        <p className="ventana-intro">{getVentana72Copy(gender)}</p>
                        <div className="fases-list">
                            {[1, 2, 3].map(f => (
                                <div key={f} className="fase-item-custom">
                                    <strong>FASE {f} ({f === 1 ? '0-24h' : f === 2 ? '24-48h' : '48-72h'})</strong>
                                    <p>{getFaseText(gender, f)}</p>
                                </div>
                            ))}
                        </div>
                        <img 
                            src="https://comprarplanseguro.shop/wp-content/uploads/2025/10/imagem3-nova.webp" 
                            alt="Ventana 72h" 
                            className="ventana-img"
                        />

                        {buttonCheckmarks[2] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <button 
                                className="cta-button btn-orange btn-size-3 btn-animation-pulse" 
                                onClick={handlePhase3ButtonClick}
                            >
                                ⚡ Revelar Mi Plan Personalizado
                            </button>
                        )}
                    </div>
                )}

                {/* ✅ FASE 4: OFERTA (OTIMIZADA) */}
                {currentPhase >= 4 && (
                    <div ref={offerSectionRef} className="revelation fade-in offer-section-custom">
                        <div className="offer-badge">OFERTA EXCLUSIVA</div>
                        <h2 className="offer-title-main">{getOfferTitle(gender)}</h2>

                        {/* ✅ NOVO: STACK DE VALOR VISUAL */}
                        <div className="value-stack-box" style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(234, 179, 8, 0.1))',
                            border: '3px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 5vw, 32px)',
                            marginBottom: 'clamp(24px, 5vw, 32px)',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                                color: '#10b981',
                                textAlign: 'center',
                                marginBottom: 'clamp(16px, 4vw, 24px)',
                                fontWeight: '900'
                            }}>
                                💎 LO QUE RECIBES HOY
                            </h3>
                            
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'clamp(8px, 2vw, 12px)',
                                marginBottom: 'clamp(16px, 4vw, 20px)'
                            }}>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>
                                        📱 Módulo 1: Cómo Hablar Con {gender === 'HOMBRE' ? 'Ella' : 'Él'}
                                    </span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>👥 Módulo 2: Cómo Encontrarte</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>❤️ Módulo 3: Reconquista Definitiva</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>🚨 Módulo 4: Protocolo de Emergencia</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>🎁 Bônus: Scripts + Guías</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$15</strong>
                                </div>
                            </div>

                            <div style={{
                                borderTop: '2px solid rgba(16, 185, 129, 0.3)',
                                paddingTop: 'clamp(12px, 3vw, 16px)',
                                marginBottom: 'clamp(12px, 3vw, 16px)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'clamp(8px, 2vw, 12px)'
                                }}>
                                    <span style={{ 
                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
                                        color: 'rgba(255,255,255,0.7)',
                                        textDecoration: 'line-through'
                                    }}>
                                        VALOR TOTAL:
                                    </span>
                                    <strong style={{ 
                                        fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', 
                                        color: 'rgba(255,255,255,0.7)',
                                        textDecoration: 'line-through'
                                    }}>
                                        $123
                                    </strong>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ 
                                        fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', 
                                        color: '#facc15',
                                        fontWeight: '900'
                                    }}>
                                        PRECIO HOY:
                                    </span>
                                    <strong style={{ 
                                        fontSize: 'clamp(2rem, 8vw, 3rem)', 
                                        color: '#10b981',
                                        fontWeight: '900'
                                    }}>
                                        $9.90
                                    </strong>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(250, 204, 21, 0.2)',
                                border: '2px solid rgba(250, 204, 21, 0.5)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 16px)',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                    color: '#facc15',
                                    fontWeight: '700',
                                    margin: 0
                                }}>
                                    🔥 92% DE DESCUENTO - SOLO HOY
                                </p>
                            </div>
                        </div>

                        {/* BOX DE DADOS DO QUIZ NA OFERTA (MANTIDO) */}
                        <div className="quiz-summary-box" style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '2px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '30px'
                        }}>
                            <p style={{
                                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                                color: 'rgb(253, 224, 71)',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontWeight: 'bold'
                            }}>
                                Basado en tu situación específica:
                            </p>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                                color: 'white',
                                lineHeight: '1.8'
                            }}>
                                <li>✓ <strong>Tiempo:</strong> {quizData.timeSeparation || 'No especificado'}</li>
                                <li>✓ <strong>Quién terminó:</strong> {quizData.whoEnded || 'No especificado'}</li>
                                <li>✓ <strong>Contacto:</strong> {quizData.currentSituation || 'No especificado'}</li>
                                <li>✓ <strong>Compromiso:</strong> {quizData.commitmentLevel || 'No especificado'}</li>
                            </ul>
                        </div>

                        {/* FEATURES COM CHECKMARKS (MANTIDO) */}
                        <div className="offer-features" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(12px, 3vw, 16px)',
                            marginBottom: 'clamp(24px, 5vw, 32px)'
                        }}>
                            {getFeatures(gender).map((feature, index) => (
                                <div key={index} className="feature" style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'clamp(10px, 3vw, 12px)',
                                    padding: 'clamp(8px, 2vw, 12px) 0'
                                }}>
                                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{
                                        minWidth: 'clamp(20px, 5vw, 24px)',
                                        width: 'clamp(20px, 5vw, 24px)',
                                        height: 'clamp(20px, 5vw, 24px)',
                                        marginTop: '2px',
                                        color: '#4ade80'
                                    }}>
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.125rem)',
                                        lineHeight: '1.5',
                                        flex: 1
                                    }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* PREÇO E DESCONTO (MANTIDO) */}
                        <div className="price-box">
                            <p className="price-old">Precio regular: $123</p>
                            <p className="price-new">$9.90</p>
                            <p className="price-discount">💰 92% de descuento HOY</p>
                        </div>

                        {/* ✅ ALTERADO: CTA OTIMIZADO COM PREÇO E URGÊNCIA */}
                        <button 
                            className="cta-button btn-green btn-size-4 btn-animation-glowshake" 
                            onClick={handleCTAClick}
                            style={{
                                fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)',
                                padding: 'clamp(18px, 4vw, 24px)',
                                lineHeight: '1.4'
                            }}
                        >
                            <span style={{ display: 'block', marginBottom: '4px' }}>
                                🚀 SÍ, QUIERO ACCESO POR $9.90
                            </span>
                            <span style={{ 
                                display: 'block', 
                                fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                                opacity: 0.9,
                                fontWeight: '600'
                            }}>
                                ⏰ {formatTime(timeLeft)} RESTANTES
                            </span>
                        </button>

                        {/* ✅ NOVO: GARANTIA DESTACADA */}
                        <div className="guarantee-section" style={{
                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(16, 185, 129, 0.1))',
                            border: '3px solid rgba(74, 222, 128, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 5vw, 32px)',
                            margin: 'clamp(24px, 5vw, 32px) 0',
                            textAlign: 'center',
                            boxShadow: '0 8px 32px rgba(74, 222, 128, 0.3)'
                        }}>
                            <div style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', marginBottom: '12px' }}>
                                🛡️
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                                color: '#4ade80',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontWeight: '900'
                            }}>
                                GARANTÍA BLINDADA DE 30 DÍAS
                            </h3>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 4vw, 1.15rem)',
                                lineHeight: '1.6',
                                color: 'white',
                                marginBottom: '16px'
                            }}>
                                Si en 30 días no ves resultados concretos en tu reconquista, 
                                <strong style={{ color: '#4ade80' }}> devolvemos el 100% de tu dinero</strong>, 
                                sin preguntas, sin burocracia.
                            </p>
                            <p style={{
                                fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                                color: 'rgba(255,255,255,0.8)',
                                fontStyle: 'italic'
                            }}>
                                ✓ Riesgo CERO para ti<br/>
                                ✓ Reembolso en 24-48 horas<br/>
                                ✓ Sin complicaciones
                            </p>
                        </div>

                        {/* PROVA SOCIAL REAL (MANTIDO) */}
                        <div className="real-proof-box">
                            <p>⭐ <strong>4.8/5 estrellas</strong> (2.341 avaliações verificadas)</p>
                            <p>📱 Última compra hace 4 minutos</p>
                        </div>

                        {/* TRUST ICONS (MANTIDO) */}
                        <div className="trust-icons">
                            <span>🔒 Compra segura</span>
                            <span>✅ Acceso instantáneo</span>
                            <span>↩️ 30 días de garantía</span>
                        </div>

                        {/* GRID DE URGÊNCIA OTIMIZADO (MANTIDO) */}
                        <div className="final-urgency-grid-optimized">
                            <div className="urgency-item-compact">
                                <span style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', opacity: 0.8 }}>Tiempo:</span>
                                <strong style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>{formatTime(timeLeft)}</strong>
                            </div>
                            <div className="urgency-item-compact">
                                <span style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', opacity: 0.8 }}>Vacantes:</span>
                                <strong style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>{spotsLeft}/50</strong>
                            </div>
                        </div>

                        {/* CONTADOR DE PESSOAS COMPRANDO (MANTIDO) */}
                        <p className="people-buying-counter" style={{
                            textAlign: 'center',
                            color: 'rgb(74, 222, 128)',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            marginTop: 'clamp(12px, 3vw, 16px)',
                            marginBottom: 'clamp(8px, 2vw, 12px)',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            opacity: 0.85
                        }}>
                            ✨ {peopleBuying} comprando ahora
                        </p>

                        {/* PROVA SOCIAL +12.847 (MANTIDO) */}
                        <p className="social-proof-count" style={{
                            textAlign: 'center',
                            color: 'rgb(74, 222, 128)',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            marginBottom: 'clamp(8px, 2vw, 12px)',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            opacity: 0.85
                        }}>
                            ✓ +12.847 reconquistas exitosas
                        </p>

                        {/* EXCLUSIVIDADE (MANTIDO) */}
                        <p className="guarantee-text" style={{
                            textAlign: 'center',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            lineHeight: '1.6',
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: '0 8px'
                        }}>
                            Exclusivo para quien completó el análisis personalizado
                        </p>
                    </div>
                )}
            </div>

            {/* STICKY FOOTER (MANTIDO) */}
            {currentPhase >= 4 && (
                <div className="sticky-footer-urgency fade-in-up">
                    ⏰ {formatTime(timeLeft)} • {spotsLeft} spots restantes
                </div>
            )}

            <style jsx>{`
                .result-container { padding-bottom: 100px; }
                .diagnostic-pulse { animation: diagnosticPulse 1s ease-in-out 2; }
                @keyframes diagnosticPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(234, 179, 8, 0.3); }
                    50% { transform: scale(1.02); box-shadow: 0 12px 48px rgba(234, 179, 8, 0.5); }
                }
                .loading-box-custom { background: rgba(234, 179, 8, 0.1); border: 2px solid #eab308; border-radius: 16px; padding: 40px; text-align: center; }
                .quiz-summary-box { background: rgba(234, 179, 8, 0.1); border: 2px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px; }
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; }
                .summary-grid span { color: #4ade80; }
                .price-box { text-align: center; margin-bottom: 25px; }
                .price-old { text-decoration: line-through; opacity: 0.6; margin: 0; }
                .price-new { font-size: 3rem; color: #facc15; font-weight: 900; margin: 5px 0; }
                .price-discount { color: #4ade80; font-weight: bold; }
                
                /* CTA BUTTONS STYLES */
                .cta-button { 
                    width: 100%; 
                    color: black; 
                    font-weight: 900; 
                    padding: 20px; 
                    border-radius: 12px; 
                    border: 3px solid white; 
                    cursor: pointer; 
                    margin-top: 20px;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: clamp(1rem, 4vw, 1.5rem);
                }
                .cta-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(50%);
                }
                .cta-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                }

                /* Button Colors */
                .btn-green { background: #10b981; }
                .btn-green:hover:not(:disabled) { background: #059669; }
                .btn-yellow { background: #eab308; }
                .btn-yellow:hover:not(:disabled) { background: #ca8a04; }
                .btn-orange { background: #f97316; }
                .btn-orange:hover:not(:disabled) { background: #ea580c; }

                /* Button Sizes */
                .btn-size-1 { font-size: 1rem; }
                .btn-size-2 { font-size: 1.125rem; }
                .btn-size-3 { font-size: 1.25rem; }
                .btn-size-4 { font-size: 1.5rem; }

                /* Button Animations */
                .btn-animation-fadein { animation: fadeIn 0.6s ease-in-out; }
                .btn-animation-bounce { animation: bounce 1s infinite; }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .btn-animation-pulse { animation: pulse 1.5s infinite; }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }
                .btn-animation-glowshake { animation: glowshake 2s infinite; }
                @keyframes glowshake {
                    0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
                    25% { transform: translateX(-2px) scale(1.01); box-shadow: 0 0 20px rgba(16, 185, 129, 1); }
                    50% { transform: translateX(2px) scale(1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
                    75% { transform: translateX(-2px) scale(1.01); box-shadow: 0 0 20px rgba(16, 185, 129, 1); }
                }

                /* CHECKMARK STYLES */
                .checkmark-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 20px;
                    min-height: 80px;
                }
                .checkmark-glow {
                    font-size: 4rem;
                    animation: checkmarkShine 1s ease-in-out;
                }
                @keyframes checkmarkShine {
                    0% { 
                        opacity: 0;
                        transform: scale(0.5);
                        filter: brightness(1);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.1);
                        filter: brightness(1.8);
                    }
                    100% { 
                        opacity: 1;
                        transform: scale(1);
                        filter: brightness(1);
                    }
                }

                /* FADE OUT ANIMATION */
                .fade-out {
                    animation: fadeOutAnimation 0.3s ease-out forwards;
                }
                @keyframes fadeOutAnimation {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }

                .real-proof-box { background: rgba(74, 222, 128, 0.1); border: 2px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 15px; text-align: center; color: #4ade80; margin: 20px 0; }
                .trust-icons { display: flex; justify-content: center; gap: 15px; color: #4ade80; font-size: 0.85rem; margin-bottom: 20px; flex-wrap: wrap; }
                
                /* GRID DE URGÊNCIA OTIMIZADO */
                .final-urgency-grid-optimized { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: clamp(8px, 2vw, 12px);
                    margin: clamp(16px, 4vw, 20px) 0;
                }
                .urgency-item-compact { 
                    background: rgba(0,0,0,0.3); 
                    padding: clamp(10px, 3vw, 12px); 
                    border-radius: 8px; 
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .sticky-footer-urgency { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.95); padding: 15px; color: #fde047; text-align: center; z-index: 1000; border-top: 2px solid #eab308; font-weight: bold; }
                .progress-bar-container { display: flex; justify-content: space-between; margin: 20px auto; max-width: 800px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 12px; position: sticky; top: 0; z-index: 999; backdrop-filter: blur(5px); }
                .progress-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; color: rgba(255,255,255,0.5); font-size: 0.8rem; }
                .step-circle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; margin-bottom: 5px; }
                .progress-step.active .step-circle { background: #eab308; color: black; }
                .progress-step.completed .step-circle { background: #4ade80; color: white; }
                .ventana-img { width: 100%; max-width: 600px; border-radius: 12px; margin: 20px auto; display: block; }
                .emotional-validation { background: rgba(74, 222, 128, 0.1); border: 2px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px; color: #4ade80; }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes loadingDots {
                    0%, 20% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .fade-in { animation: fadeIn 0.6s ease-in-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(100%); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* STYLES PARA O DELAY DO BOTÃO DO VÍDEO */
                .video-delay-indicator {
                    background: rgba(0,0,0,0.4);
                    border: 2px solid #eab308;
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                    text-align: center;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .delay-text {
                    font-size: 1.1rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .delay-progress-bar-container {
                    width: 100%;
                    height: 10px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 5px;
                    overflow: hidden;
                }
                .delay-progress-bar {
                    height: 100%;
                    background: #eab308;
                    width: 0%;
                    transition: width 1s linear;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    );
}