import { useState, useEffect, useRef } from 'react';
import { tracking } from '../utils/tracking';
import { storage } from '../utils/storage';
import { playKeySound } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { getCompletionBadge } from '../utils/contentByGender';
import { ga4Tracking } from '../utils/ga4Tracking';

interface ChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  type: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

interface Question {
  id: number;
  text: string;
  options?: string[];
  optionsByGender?: {
    HOMBRE: string[];
    MUJER: string[];
  };
  response: string;
  responseByGender?: {
    HOMBRE: string;
    MUJER: string;
  };
  dataKey: 'gender' | 'timeSeparation' | 'whoEnded' | 'relationshipDuration' | 'currentSituation' | 'exSituation' | 'commitmentLevel';
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Para calibrar el análisis, necesito saber: ¿cuál es tu género?',
    options: ['HOMBRE', 'MUJER'],
    response: 'Entendido.',
    responseByGender: {
      HOMBRE: 'Perfecto. Voy a calibrar el análisis basado en los patrones específicos de comportamiento femenino después de una ruptura. Cada respuesta que des me ayudará a entender exactamente qué está pasando con ella.',
      MUJER: 'Perfecto. Voy a calibrar el análisis basado en los patrones específicos de comportamiento masculino después de una ruptura. Cada respuesta que des me ayudará a entender exactamente qué está pasando con él.'
    },
    dataKey: 'gender',
  },
  {
    id: 2,
    text: 'Entendido. Ahora, ¿cuánto tiempo ha pasado desde que se separaron?',
    options: ['MENOS DE 1 SEMANA', '1-4 SEMANAS', '1-6 MESES', 'MÁS DE 6 MESES'],
    response: 'Registrado.',
    responseByGender: {
      HOMBRE: 'Registrado. El tiempo es crucial. En este período, el cerebro de ella pasa por fases químicas específicas. Cuanto más reciente la separación, más activa está la memoria emocional. Vamos a usar eso estratégicamente.',
      MUJER: 'Registrado. El tiempo es crucial. En este período, el cerebro de él pasa por fases químicas específicas. Cuanto más reciente la separación, más activa está la memoria emocional. Vamos a usar eso estratégicamente.'
    },
    dataKey: 'timeSeparation',
  },
  {
    id: 3,
    text: 'Bien. ¿Y cómo fue la separación? ¿Quién tomó la iniciativa?',
    optionsByGender: {
      HOMBRE: ['ELLA TERMINÓ', 'YO TERMINÉ', 'DECISIÓN MUTUA'],
      MUJER: ['ÉL TERMINÓ', 'YO TERMINÉ', 'DECISIÓN MUTUA']
    },
    response: 'Correcto.',
    responseByGender: {
      HOMBRE: 'Entiendo. Cuando ella toma la decisión de terminar, significa que algo activó un "switch" emocional en su cerebro. La buena noticia: ese switch puede revertirse si sabes exactamente qué botones presionar. Y eso es lo que vamos a descubrir.',
      MUJER: 'Entiendo. Cuando él toma la decisión de terminar, significa que algo activó un "switch" emocional en su cerebro. La buena noticia: ese switch puede revertirse si sabes exactamente qué botones presionar. Y eso es lo que vamos a descubrir.'
    },
    dataKey: 'whoEnded',
  },
  {
    id: 4,
    text: 'Registrado. ¿Por cuánto tiempo estuvieron juntos?',
    options: ['MENOS DE 6 MESES', '6 MESES-1 AÑO', '1-3 AÑOS', 'MÁS DE 3 AÑOS'],
    response: 'Ok.',
    responseByGender: {
      HOMBRE: 'Perfecto. El tiempo de relación define cuántas "anclas emocionales" creaste en su memoria. Cuanto más tiempo juntos, más profundas las conexiones neuronales. Eso trabaja a tu favor si usas el protocolo correcto.',
      MUJER: 'Perfecto. El tiempo de relación define cuántas "anclas emocionales" creaste en su memoria. Cuanto más tiempo juntos, más profundas las conexiones neuronales. Eso trabaja a tu favor si usas el protocolo correcto.'
    },
    dataKey: 'relationshipDuration',
  },
  {
    id: 5,
    text: '¿Cuál es tu situación actual con tu ex-pareja?',
    options: ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO', 'SÓLO TEMAS NECESARIOS', 'HABLAMOS A VECES', 'SOMOS AMIGOS', 'ENCUENTROS ÍNTIMOS'],
    response: 'Analizando...',
    responseByGender: {
      HOMBRE: 'Información clave. El nivel de contacto actual revela exactamente en qué fase emocional está ella. Cada escenario requiere un protocolo diferente. Si hay contacto cero, usamos una estrategia. Si hay comunicación, usamos otra completamente distinta.',
      MUJER: 'Información clave. El nivel de contacto actual revela exactamente en qué fase emocional está él. Cada escenario requiere un protocolo diferente. Si hay contacto cero, usamos una estrategia. Si hay comunicación, usamos otra completamente distinta.'
    },
    dataKey: 'currentSituation',
  },
  {
    id: 6,
    text: 'Analizando... Ahora, una información crucial: ¿tu ex-pareja ya está con otra persona?',
    optionsByGender: {
      HOMBRE: ['ESTÁ SOLTERA', 'NO ESTOY SEGURO', 'SALIENDO CASUAL', 'RELACIÓN SERIA', 'VARIAS PERSONAS'],
      MUJER: ['ESTÁ SOLTERO', 'NO ESTOY SEGURO', 'SALIENDO CASUAL', 'RELACIÓN SERIA', 'VARIAS PERSONAS']
    },
    response: 'Crucial.',
    responseByGender: {
      HOMBRE: 'Entendido. Esto cambia el mapa, pero no el destino. Incluso si ella está con alguien, hay protocolos psicológicos específicos que funcionan. De hecho, en algunos casos, esto puede ser usado estratégicamente a tu favor.',
      MUJER: 'Entendido. Esto cambia el mapa, pero no el destino. Incluso si él está con alguien, hay protocolos psicológicos específicos que funcionan. De hecho, en algunos casos, esto puede ser usado estratégicamente a tu favor.'
    },
    dataKey: 'exSituation',
  },
  {
    id: 7,
    text: 'Última pregunta para finalizar el análisis: en una escala de 1 a 4, ¿cuánto quieres recuperar esta relación?',
    optionsByGender: {
      HOMBRE: ['1 - NO ESTOY SEGURO', '2 - LO ESTOY CONSIDERANDO', '3 - LO QUIERO MUCHO', '4 - LO QUIERO CON TODA MI ALMA'],
      MUJER: ['1 - NO ESTOY SEGURA', '2 - LO ESTOY CONSIDERANDO', '3 - LO QUIERO MUCHO', '4 - LO QUIERO CON TODA MI ALMA']
    },
    response: '¡Análisis completo!',
    responseByGender: {
      HOMBRE: '¡Análisis completo! Tu nivel de compromiso define la intensidad del protocolo. Cuanto más comprometido estés, más poderosas serán las técnicas que voy a revelarte. Ahora tengo todo lo que necesito para mostrarte el camino exacto para reconquistar a ella.',
      MUJER: '¡Análisis completo! Tu nivel de compromiso define la intensidad del protocolo. Cuanto más comprometida estés, más poderosas serán las técnicas que voy a revelarte. Ahora tengo todo lo que necesito para mostrarte el camino exacto para reconquistar a él.'
    },
    dataKey: 'commitmentLevel',
  }
];

export default function Chat({ onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // ✅ SISTEMA DE PRESERVAÇÃO DE UTMs
  // ========================================
  const ensureUTMs = () => {
    try {
      const storedUTMs = localStorage.getItem('quiz_utms');
      if (storedUTMs) {
        const utms = JSON.parse(storedUTMs);
        console.log('✅ UTMs preservadas no Chat:', utms);
        
        // Sincroniza com Utmify se disponível
        if (window.location.search === '' && Object.keys(utms).length > 0) {
          const utmString = Object.entries(utms)
            .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
            .join('&');
          window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
          console.log('✅ UTMs anexadas à URL do Chat');
        }
      } else {
        console.log('ℹ️ Nenhuma UTM armazenada encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao preservar UTMs:', error);
    }
  };

  useEffect(() => {
    // ✅ GARANTE QUE AS UTMs ESTEJAM PRESERVADAS
    ensureUTMs();

    tracking.pageView('chat');
    tracking.chatStarted();
    
    ga4Tracking.chatPageView();
    ga4Tracking.chatStarted();

    const initialMessage: Message = {
      type: 'bot',
      text: 'Hola. Soy Ricardo Abreu, especialista en reconquista mediante psicología conductual. Mi sistema detectó tu búsqueda de respuestas. Estoy aquí para analizar tu caso.',
      isTyping: true,
    };

    setMessages([initialMessage]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages([{ ...initialMessage, isTyping: false }]);
      setTimeout(() => setShowOptions(true), 300);
    }, initialMessage.text.length * 50);

    return () => {
      if (typewriterTimeoutRef.current) clearTimeout(typewriterTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartAnalysis = () => {
    playKeySound();
    setShowOptions(false);
    setCurrentQuestion(0);
    askQuestion(0);
  };

  const askQuestion = (questionIndex: number) => {
    const question = QUESTIONS[questionIndex];
    const newMessage: Message = {
      type: 'bot',
      text: question.text,
      isTyping: true,
    };

    setMessages(prev => [...prev, newMessage]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));
      setTimeout(() => setShowOptions(true), 300);
    }, question.text.length * 50);
  };

  const handleAnswer = (option: string) => {
    playKeySound();
    const question = QUESTIONS[currentQuestion];

    setMessages(prev => [...prev, { type: 'user', text: option }]);
    setShowOptions(false);
    setIsProcessing(true);

    const answer: QuizAnswer = {
      questionId: question.id,
      question: question.text,
      answer: option,
    };

    const quizData = storage.getQuizData();
    quizData.answers.push(answer);
    quizData[question.dataKey] = option;
    storage.saveQuizData(quizData);

    tracking.questionAnswered(question.id, option);
    ga4Tracking.questionAnswered(question.id, question.text, option);

    const newProgress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    setProgress(newProgress);

    setTimeout(() => {
      setIsProcessing(false);

      let responseText = question.response;
      
      if (question.responseByGender && quizData.gender) {
        const gender = quizData.gender as 'HOMBRE' | 'MUJER';
        responseText = question.responseByGender[gender] || question.response;
      }

      const responseMessage: Message = {
        type: 'bot',
        text: responseText,
        isTyping: true,
      };

      setMessages(prev => [...prev, responseMessage]);

      typewriterTimeoutRef.current = setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));

        if (currentQuestion < QUESTIONS.length - 1) {
          setTimeout(() => {
            setCurrentQuestion(currentQuestion + 1);
            askQuestion(currentQuestion + 1);
          }, 800);
        } else {
          tracking.chatCompleted();
          ga4Tracking.chatCompleted();
          
          setTimeout(() => {
            const finalMessage: Message = {
              type: 'bot',
              text: 'Análisis concluido. Tu plan personalizado está listo para ser revelado. Haz clic abajo para accederlo.',
              isTyping: true,
            };
            setMessages(prev => [...prev, finalMessage]);

            typewriterTimeoutRef.current = setTimeout(() => {
              setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));
              setTimeout(() => setShowOptions(true), 300);
            }, finalMessage.text.length * 50);
          }, 1000);
        }
      }, responseText.length * 50);
    }, 1500);
  };

  const handleViewPlan = () => {
    tracking.ctaClicked('chat_complete');
    ga4Tracking.chatCTAClick();
    onNavigate('resultado');
  };

  const getQuestionOptions = (question: Question): string[] => {
    const quizData = storage.getQuizData();
    
    if (question.optionsByGender && quizData.gender) {
      const gender = quizData.gender as 'HOMBRE' | 'MUJER';
      return question.optionsByGender[gender] || question.options || [];
    }
    
    return question.options || [];
  };

  const isComplete = progress === 100;
  const quizData = storage.getQuizData();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">ANÁLISIS: {Math.round(progress)}%</p>
        {isProcessing && <p className="processing-text">ANALIZANDO DATOS...</p>}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="avatar-small">RA</div>
            )}
            <div className="message-bubble">
              {msg.isTyping ? (
                <TypewriterText text={msg.text} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
          </div>
        )}

        {showOptions && currentQuestion === -1 && (
          <div className="options-container">
            <button className="option-button" onClick={handleStartAnalysis}>
              EMPEZAR ANÁLISIS
            </button>
          </div>
        )}

        {showOptions && currentQuestion >= 0 && currentQuestion < QUESTIONS.length && !isComplete && (
          <div className="options-container">
            {getQuestionOptions(QUESTIONS[currentQuestion]).map((option, idx) => (
              <button key={idx} className="option-button" onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        {showOptions && isComplete && (
          <div className="options-container">
            <div 
              className="completion-badge" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(74, 222, 128, 0.1))',
                borderRadius: '16px',
                marginBottom: '16px',
                border: '2px solid rgba(234, 179, 8, 0.5)',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)'
              }}
            >
              <div style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: '900',
                color: 'rgb(250, 204, 21)',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                {getCompletionBadge(quizData.gender || 'HOMBRE').title}
              </div>
              <div style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: 'white',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {getCompletionBadge(quizData.gender || 'HOMBRE').subtitle}
              </div>
            </div>
            <button className="option-button cta-final" onClick={handleViewPlan}>
              VER MI PLAN PERSONALIZADO
            </button>
            <p className="completion-count">+12.847 planes revelados</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}<span className="cursor">▋</span></span>;
}