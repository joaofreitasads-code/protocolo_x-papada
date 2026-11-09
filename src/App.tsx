/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  ShieldCheck,
  Lock,
  Clock,
} from 'lucide-react';

interface UserAnswers {
  [step: number]: string | string[];
}

// Progressive asset preloading map: caches upcoming images in background during user idle
const STEP_PRELOAD_MAP: Record<number, string[]> = {
  1: [
    '/assets/opt1-perfil.webp',
    '/assets/opt2-perfil-v2.webp',
    '/assets/o6kk9-ppd3.webp',
    '/assets/Nar9b-ppd4.webp',
  ],
  2: [
    '/assets/VKcx7-0.webp',
    '/assets/IbC2R-1.webp',
    '/assets/tVF5j-2.webp',
    '/assets/r0QwL-3.webp',
  ],
  6: [
    '/assets/metodo-aulas-v3.webp',
    '/assets/grafico-novo.webp',
  ],
  8: [
    '/assets/new-img-1.webp',
    '/assets/new-img-2.webp',
    '/assets/new-img-3.webp',
    '/assets/new-img-4.webp',
  ],
  10: [
    '/assets/user-new-image.webp',
    '/assets/depoimento-novo.webp',
    '/assets/depoimento-2.webp',
    '/assets/depoimento-3.webp',
  ],
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 14;
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedInCurrentStep, setSelectedInCurrentStep] = useState<string | null>(null);

  // Step 7 multi-select state
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  // Step 11 loading and carousel state
  const [step11Percent, setStep11Percent] = useState<number>(0);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const carouselImages = [
    {
      src: '/assets/new-img-1.webp',
      fallback: 'https://i.imgur.com/SHrK1rU.png',
    },
    {
      src: '/assets/new-img-2.webp',
      fallback: 'https://i.imgur.com/ZCaZ4Gb.png',
    },
    {
      src: '/assets/new-img-3.webp',
      fallback: 'https://i.imgur.com/UeKpy2t.png',
    },
    {
      src: '/assets/new-img-4.webp',
      fallback: 'https://i.imgur.com/rvHBIKx.png',
    },
  ];

  // Step 12 testimonials carousel
  const [depoimentoIndex, setDepoimentoIndex] = useState<number>(0);
  const depoimentosResults = [
    {
      img: '/assets/depoimento-novo.webp',
      fallback: 'https://i.imgur.com/eJ3SPeW.png',
      name: 'Carla Menezes',
    },
    {
      img: '/assets/depoimento-2.webp',
      fallback: 'https://i.imgur.com/UnA03qI.png',
      name: 'Patrícia Santos',
    },
    {
      img: '/assets/depoimento-3.webp',
      fallback: 'https://i.imgur.com/2ceICvW.png',
      name: 'Fernanda Oliveira',
    },
  ];

  // Step 13 verification progress
  const [verifyProgress, setVerifyProgress] = useState<number>(0);

  // Step 14 VSL and CTA button state (delayed 1m30s / 90s)
  const [vslProgress, setVslProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showVslCta, setShowVslCta] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('show_button') === 'true' || params.get('btn') === '1') {
        return true;
      }
    }
    return false;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastProgressRef = useRef<number>(0);

  // Exit intent modal
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Step 11: Loading animation and carousel
  useEffect(() => {
    if (currentStep !== 11) return;

    setStep11Percent(0);
    const interval = setInterval(() => {
      setStep11Percent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(12), 400);
          return 100;
        }
        return prev + 1;
      });
    }, 45);

    const carouselTimer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearInterval(carouselTimer);
    };
  }, [currentStep, carouselImages.length]);

  // Step 13: Verification progress bar
  useEffect(() => {
    if (currentStep !== 13) return;

    setVerifyProgress(0);
    const interval = setInterval(() => {
      setVerifyProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(14), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [currentStep]);

  // Preload upcoming images in browser idle periods without thread blocking
  useEffect(() => {
    const urls = STEP_PRELOAD_MAP[currentStep];
    if (urls && urls.length > 0) {
      const idleFallback = setTimeout(() => {
        urls.forEach((url) => {
          const img = new Image();
          img.decoding = 'async';
          img.src = url;
        });
      }, 50);
      return () => clearTimeout(idleFallback);
    }
  }, [currentStep]);

  // Checkout URL construction preserving UTM parameters
  const getCheckoutUrl = () => {
    const base = 'https://appdigitalhub.com.br/c/5955893C';
    if (typeof window !== 'undefined' && window.location.search) {
      const search = window.location.search;
      return base.includes('?') ? `${base}&${search.slice(1)}` : `${base}${search}`;
    }
    return base;
  };

  const checkoutUrl = getCheckoutUrl();

  const handleCheckoutClick = () => {
    if (typeof window !== 'undefined' && 'fbq' in window && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Protocolo Xô Papada',
        value: 29.90,
        currency: 'BRL',
      });
    }
  };

  // Video progress calculation
  const calculateSmartProgress = (time: number, totalDuration: number) => {
    if (time <= 0) return 0;
    if (time >= totalDuration) return 100;
    const lastMinStart = Math.max(totalDuration - 60.0, 45.0);

    if (time < 45.0) {
      const ratio = time / 45.0;
      return 58.0 * (1.0 - Math.pow(1.0 - ratio, 1.4));
    } else if (time < lastMinStart) {
      const ratio = (time - 45.0) / (lastMinStart - 45.0);
      return 58.0 + (89.0 - 58.0) * ratio;
    } else {
      const ratio = (time - lastMinStart) / (totalDuration - lastMinStart);
      return 89.0 + (99.5 - 89.0) * Math.pow(ratio, 0.75);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const pct = calculateSmartProgress(video.currentTime, video.duration);
      if (Math.abs(pct - lastProgressRef.current) >= 0.5 || pct >= 99) {
        lastProgressRef.current = pct;
        setVslProgress(pct);
      }
    }
    // Delay: Só aparece após 1 minuto e meio (90 segundos) de vídeo
    if (!showVslCta && video.currentTime >= 90) {
      setShowVslCta(true);
    }
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (isTransitioning) return;
    if (currentStep > 1 && currentStep < 14) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const selectSingleOption = (stepNum: number, value: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedInCurrentStep(value);
    setUserAnswers((prev) => ({ ...prev, [stepNum]: value }));

    setTimeout(() => {
      goToNextStep();
      setIsTransitioning(false);
    }, 280);
  };

  // Step 7 multi-option toggles
  const handleToggleMulti = (val: string) => {
    setMultiSelected((prev) => {
      const filtered = prev.filter((item) => item !== 'nenhuma');
      if (filtered.includes(val)) {
        return filtered.filter((item) => item !== val);
      } else {
        return [...filtered, val];
      }
    });
  };

  const handleToggleNone = () => {
    setMultiSelected((prev) => {
      if (prev.includes('nenhuma')) {
        return [];
      } else {
        return ['nenhuma'];
      }
    });
  };

  const handleMultiSubmit = () => {
    if (multiSelected.length === 0) return;
    setUserAnswers((prev) => ({ ...prev, 7: multiSelected }));
    goToNextStep();
  };

  // Progress percentage calculation
  const progressPercent = Math.min(
    100,
    Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)
  );

  return (
    <div className="bg-[#F9F9F9] min-h-screen text-[#1C1513] flex flex-col font-sans antialiased">
      {/* Top Header & Progress */}
      <header className="sticky top-0 z-50 bg-[#F9F9F9]/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 transition-all duration-300">
        <div className="max-w-[28rem] mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            {currentStep > 1 && currentStep < 13 ? (
              <button
                onClick={goToPreviousStep}
                type="button"
                className="flex text-sm items-center gap-1.5 text-[#1C1513] hover:text-[#AF5655] transition-colors p-1 rounded-lg cursor-pointer"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Voltar</span>
              </button>
            ) : (
              <div className="w-14" />
            )}

            {/* Brand Logo */}
            <div className="flex items-center justify-center">
              <img
                src="/assets/new-logo-v2.webp"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/JqtWzcS.png';
                }}
                referrerPolicy="no-referrer"
                alt="Tchau Papada"
                width={204}
                height={68}
                decoding="async"
                fetchPriority="high"
                className="h-[60px] sm:h-[68px] w-auto object-contain cursor-pointer"
                onClick={() => currentStep > 1 && currentStep < 14 && setCurrentStep(1)}
              />
            </div>

            {/* Placeholder to balance back button */}
            <div className="w-14" />
          </div>

          {/* Progress Bar (hidden on step 1) */}
          {currentStep > 1 && (
            <div className="relative rounded-full overflow-hidden w-full h-2 bg-[#AF5655]/10">
              <div
                className="absolute top-0 left-0 h-full bg-[#AF5655] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[28rem] w-full mx-auto px-4 py-4 min-h-[calc(100vh-80px)] flex flex-col justify-between flex-1">
        {/* ========================================== */}
        {/* STEP 1: Tela Inicial                       */}
        {/* ========================================== */}
        {currentStep === 1 && (
          <div className="animate-fade-in-step flex flex-col gap-5 text-center">
            {/* Headline */}
            <h1 className="text-2xl sm:text-[26px] font-extrabold leading-tight text-[#1C1513]">
              Sua papada te incomoda?{' '}
              <span className="text-[#AF5655]">
                Descubra uma rotina de 15 dias para cuidar do contorno do seu rosto!
              </span>
            </h1>

            {/* Comparison Image */}
            <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100">
              <img
                src="/assets/step1-comparison.webp"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/P2oM7TS.png';
                }}
                referrerPolicy="no-referrer"
                alt="Antes e Depois da Papada"
                width={400}
                height={710}
                decoding="async"
                fetchPriority="high"
                className="w-full object-cover"
              />
            </div>

            {/* Testimonial Quote */}
            <div className="bg-white rounded-2xl p-4 text-left border border-gray-200/80 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/fernanda-avatar.webp"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.imgur.com/zS2AUbc.png';
                    }}
                    referrerPolicy="no-referrer"
                    alt="Aline Barros"
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-xs shrink-0"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#1C1513]">Aline Barros</p>
                    <p className="text-xs text-gray-400">@aline_barros27</p>
                  </div>
                </div>
                {/* 5 Stars */}
                <div className="flex text-amber-400 text-xs gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &ldquo;Eu já tinha tentado de tudo para diminuir minha papada, até emagrecer, mas nada parecia mudar. Finalmente encontrei uma rotina que fez sentido para mim e me ajudou a cuidar melhor dessa região!&rdquo;
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2 pb-6">
              <div className="relative w-full max-w-[28rem] mx-auto">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={goToNextStep}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 2: Perfil do Rosto                    */}
        {/* ========================================== */}
        {currentStep === 2 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Qual se parece mais com o seu perfil?
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                É uma avaliação rápida para te dar uma recomendação precisa
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: 'p1',
                  img: '/assets/opt1-perfil.webp',
                  fallbackImg: 'https://i.imgur.com/o1GzzsD.png',
                  title: 'Quase não aparece',
                },
                {
                  id: 'p2',
                  img: '/assets/opt2-perfil-v2.webp',
                  fallbackImg: 'https://i.imgur.com/WwXoILu.png',
                  title: 'Aparece nas fotos',
                },
                {
                  id: 'p3',
                  img: '/assets/o6kk9-ppd3.webp',
                  title: 'É bem visível',
                },
                {
                  id: 'p4',
                  img: '/assets/Nar9b-ppd4.webp',
                  title: 'É muito acentuada',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => selectSingleOption(2, opt.title)}
                  className={`option-card rounded-2xl flex flex-row-reverse items-center justify-between overflow-hidden p-2 min-h-[64px] ${
                    selectedInCurrentStep === opt.title ? 'selected' : ''
                  }`}
                >
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={opt.img}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if ('fallbackImg' in opt && opt.fallbackImg) {
                          e.currentTarget.src = opt.fallbackImg;
                        }
                      }}
                      alt={opt.title}
                      width={64}
                      height={64}
                      decoding="async"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="px-3 flex-1 text-left">
                    <p className="font-semibold text-sm sm:text-base text-[#1C1513] leading-snug">
                      {opt.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 3: Mesmo emagrecendo, continua aí?    */}
        {/* ========================================== */}
        {currentStep === 3 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Você já percebeu que sua papada continua mesmo quando perde peso?
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Queremos entender melhor sua experiência.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  emoji: '😩',
                  text: 'Sim, mesmo emagrecendo',
                },
                {
                  emoji: '😕',
                  text: 'Sou magra e tenho papada',
                },
                {
                  emoji: '🧬',
                  text: 'Acho que é genética',
                },
                {
                  emoji: '🤔',
                  text: 'Não sei dizer',
                },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSingleOption(3, opt.text)}
                  className={`option-card rounded-2xl p-4 flex items-center gap-3 min-h-[58px] ${
                    selectedInCurrentStep === opt.text ? 'selected' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 4: Qual é o seu objetivo?             */}
        {/* ========================================== */}
        {currentStep === 4 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Qual é o seu{' '}
                <span className="bg-[#AF5655] text-white px-2 py-0.5 rounded-lg inline-block">
                  objetivo?
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  emoji: '📸',
                  text: 'Ficar melhor nas fotos',
                },
                {
                  emoji: '✨',
                  text: 'Definir o contorno do rosto',
                },
                {
                  emoji: '🌷',
                  text: 'Reduzir a aparência da papada',
                },
                {
                  emoji: '💗',
                  text: 'Me sentir mais confiante',
                },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSingleOption(4, opt.text)}
                  className={`option-card rounded-2xl p-4 flex items-center gap-3 min-h-[58px] ${
                    selectedInCurrentStep === opt.text ? 'selected' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 5: Como gostaria que ficasse? (Grid)  */}
        {/* ========================================== */}
        {currentStep === 5 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Como você gostaria{' '}
                <span className="text-[#AF5655]">que ficasse a sua mandíbula?</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'grid-1', img: '/assets/VKcx7-0.webp', label: 'Opção 1' },
                { id: 'grid-2', img: '/assets/IbC2R-1.webp', label: 'Opção 2' },
                { id: 'grid-3', img: '/assets/tVF5j-2.webp', label: 'Opção 3' },
                { id: 'grid-4', img: '/assets/r0QwL-3.webp', label: 'Opção 4' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => selectSingleOption(5, opt.label)}
                  className={`option-card rounded-2xl p-3 flex flex-col items-center justify-center aspect-square ${
                    selectedInCurrentStep === opt.label ? 'selected' : ''
                  }`}
                >
                  <img
                    src={opt.img}
                    alt={opt.label}
                    width={160}
                    height={160}
                    decoding="async"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 6: Qualidade do Sono                  */}
        {/* ========================================== */}
        {currentStep === 6 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Como você costuma dormir?
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Queremos conhecer melhor sua rotina de descanso.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  emoji: '🌙',
                  text: 'Durmo muito bem',
                },
                {
                  emoji: '😌',
                  text: 'Durmo bem, mas acordo cansada',
                },
                {
                  emoji: '😟',
                  text: 'Tenho dificuldade para dormir',
                },
                {
                  emoji: '😴',
                  text: 'Durmo pouco e acordo cansada',
                },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSingleOption(6, opt.text)}
                  className={`option-card rounded-2xl p-4 flex items-center gap-3 min-h-[58px] ${
                    selectedInCurrentStep === opt.text ? 'selected' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 7: Quais destas acontecem? (Multi)    */}
        {/* ========================================== */}
        {currentStep === 7 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Você tem algum desses hábitos?
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Selecione quantos quiser.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'ronco', emoji: '😴', text: 'Ronco ao dormir' },
                { id: 'boca', emoji: '👄', text: 'Respiro pela boca' },
                {
                  id: 'mandibula',
                  emoji: '😬',
                  text: 'Aperto os dentes',
                },
                { id: 'inchado', emoji: '💧', text: 'Acordo com o rosto inchado' },
              ].map((opt) => {
                const isChecked = multiSelected.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleMulti(opt.id)}
                    className={`option-card rounded-2xl p-4 flex items-center justify-between min-h-[58px] ${
                      isChecked ? 'selected' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.emoji}</span>
                      <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-white border-white text-[#AF5655]'
                          : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              {/* Nenhum desses */}
              {(() => {
                const isNoneChecked = multiSelected.includes('nenhuma');
                return (
                  <div
                    onClick={handleToggleNone}
                    className={`option-card rounded-2xl p-4 flex items-center justify-between min-h-[58px] ${
                      isNoneChecked ? 'selected' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚫</span>
                      <p className="font-medium text-sm text-[#1C1513]">Nenhum desses</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isNoneChecked
                          ? 'bg-white border-white text-[#AF5655]'
                          : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {isNoneChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 pb-6">
              <div className="relative w-full max-w-[28rem] mx-auto">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={handleMultiSubmit}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 8: Momento do dia                     */}
        {/* ========================================== */}
        {currentStep === 8 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                Em qual momento do dia você prefere praticar seus cuidados?
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { emoji: '☀️', text: 'Pela manhã, antes de começar meu dia.' },
                { emoji: '🌷', text: 'À tarde, quando tenho um tempinho livre.' },
                { emoji: '🌙', text: 'À noite, quando consigo relaxar.' },
                { emoji: '⏰', text: 'Minha rotina é corrida, preciso de horários flexíveis.' },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSingleOption(8, opt.text)}
                  className={`option-card rounded-2xl p-4 flex items-center gap-3 min-h-[58px] ${
                    selectedInCurrentStep === opt.text ? 'selected' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 9: O que mais te incomoda             */}
        {/* ========================================== */}
        {currentStep === 9 && (
          <div className="animate-fade-in-step flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1C1513] leading-tight">
                O que mais te incomoda na papada?
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Selecione a opção que melhor descreve o que você percebe.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  emoji: '💗',
                  text: 'Gordura abaixo do queixo',
                },
                {
                  emoji: '🌸',
                  text: 'Flacidez na pele',
                },
                {
                  emoji: '✨',
                  text: 'Gordura e flacidez',
                },
                {
                  emoji: '🪞',
                  text: 'Dobrinhas no pescoço',
                },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSingleOption(9, opt.text)}
                  className={`option-card rounded-2xl p-4 flex items-center gap-3 min-h-[58px] ${
                    selectedInCurrentStep === opt.text ? 'selected' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <p className="font-medium text-sm text-[#1C1513]">{opt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 10: Mostra o Método                   */}
        {/* ========================================== */}
        {currentStep === 10 && (
          <div className="animate-fade-in-step flex flex-col gap-5 text-center">
            <div>
              <h2 className="text-2xl font-bold text-[#AF5655] leading-tight">
                Descubra uma nova forma de cuidar da sua papada e valorizar o contorno do seu rosto!
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                &ldquo;Você não precisa começar por procedimentos caros para cuidar da aparência da sua papada.&rdquo;
              </p>
            </div>

            {/* Metodo Image */}
            <div className="w-full rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm p-1">
              <img
                src="/assets/metodo-aulas-v3.webp?v=3"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/7BbXLOl.png';
                }}
                referrerPolicy="no-referrer"
                alt="Por dentro do Método Xô Papada"
                width={1254}
                height={1254}
                decoding="async"
                className="w-full object-cover rounded-xl"
              />
            </div>

            {/* Comparative Chart Image */}
            <div className="w-full rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm p-1">
              <img
                src="/assets/grafico-novo.webp"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/rPbSrq2.png';
                }}
                referrerPolicy="no-referrer"
                alt="Evolução do Contorno do Pescoço em 15 Dias"
                decoding="async"
                className="w-full object-cover rounded-xl"
              />
            </div>

            {/* Green 3D Action Button */}
            <div className="pt-2 pb-6">
              <div className="relative w-full max-w-[28rem] mx-auto">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={goToNextStep}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 11: Criando seu Plano (Loading)       */}
        {/* ========================================== */}
        {currentStep === 11 && (
          <div className="animate-fade-in-step flex flex-col gap-6 text-center py-6">
            <div>
              <h2 className="text-2xl font-bold text-[#AF5655] leading-tight">
                Criando seu plano personalizado...
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                {step11Percent < 45 && 'Entendendo o seu caso e adaptando a solução ideal...'}
                {step11Percent >= 45 &&
                  step11Percent < 80 &&
                  'Adaptando a frequência de ativação muscular ao seu perfil...'}
                {step11Percent >= 80 && 'Finalizando a personalização dos seus 15 dias...'}
              </p>
            </div>

            {/* Progress Counter Circle */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#AF5655"
                    strokeWidth="8"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * step11Percent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-[#1C1513]">
                  {Math.round(step11Percent)}%
                </span>
              </div>
            </div>

            {/* Carousel of Results */}
            <div className="w-full bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-50">
                <img
                  src={carouselImages[carouselIndex].src}
                  onError={(e) => {
                    e.currentTarget.src = carouselImages[carouselIndex].fallback;
                  }}
                  referrerPolicy="no-referrer"
                  alt={`Resultado ${carouselIndex + 1}`}
                  decoding="async"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Analisando padrão muscular e estimando tempo de resposta...
            </p>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 12: Resultados da Avaliação           */}
        {/* ========================================== */}
        {currentStep === 12 && (
          <div className="animate-fade-in-step flex flex-col gap-6 text-center">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-extrabold text-[#AF5655] leading-tight">
                Resultados da sua avaliação
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Com base nas suas respostas, aqui está o que identificamos:
              </p>
            </div>

            {/* Raio-X Image */}
            <div className="w-full rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm p-1">
              <img
                src="/assets/user-new-image.webp"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/WPguLW9.png';
                }}
                referrerPolicy="no-referrer"
                alt="Raio-X Anatômico Muscular"
                decoding="async"
                className="w-full object-cover rounded-xl"
              />
            </div>

            {/* Metric: Nível de Papada */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-700">Nível de papada:</span>
                <span className="text-lg font-extrabold text-[#AF5655]">77%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-[#AF5655] rounded-full"
                  style={{ width: '77%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span className="font-bold text-[#AF5655]">Elevado</span>
              </div>
            </div>

            {/* Donut Chart: Indice Muscular vs Gordura */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm text-center">
              <h2 className="text-xl font-bold text-[#AF5655] leading-tight">
                Índice Muscular vs. Gordura
              </h2>
              <p className="text-sm text-gray-600 mt-1 mb-4">
                Sua papada é <span className="font-bold text-[#AF5655]">65%</span> tensão muscular /
                acúmulo postural e <span className="font-bold text-gray-800">35%</span> gordura
              </p>

              {/* Donut SVG */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#F1E5E4"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#AF5655"
                    strokeWidth="12"
                    strokeDasharray={`${65 * 2.513} ${100 * 2.513}`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-[#AF5655] leading-none">65%</span>
                  <span className="text-xs text-gray-500 font-bold uppercase mt-1">Muscular</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-xs mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#AF5655]" />
                  <span className="font-medium text-gray-700">Tensão / Postura (65%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F1E5E4]" />
                  <span className="font-medium text-gray-700">Gordura (35%)</span>
                </div>
              </div>
            </div>

            {/* 🔎 O que identificamos nas suas respostas */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 text-left flex flex-col gap-3">
              <h3 className="text-base font-bold text-[#8A6310] flex items-center gap-2">
                <span>🔎</span> O que identificamos nas suas respostas
              </h3>
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Você percebe volume ou uma dobrinha abaixo do queixo.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>O contorno do rosto é uma das suas principais preocupações.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Você procura uma alternativa de autocuidado que se encaixe na sua rotina.</span>
                </p>
              </div>
            </div>

            {/* 💗 Como o Xô Papada pode fazer parte da sua rotina? */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 text-left flex flex-col gap-3.5">
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <span>💗</span> Como o Xô Papada pode fazer parte da sua rotina?
              </h3>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                <div>
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>✓</span> Rotina de 15 dias
                  </p>
                  <p className="text-emerald-800 text-xs mt-0.5 pl-4">
                    Um passo a passo organizado para acompanhar seus cuidados faciais.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>✓</span> Praticidade no dia a dia
                  </p>
                  <p className="text-emerald-800 text-xs mt-0.5 pl-4">
                    Orientações simples que você pode encaixar no horário mais conveniente.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>✓</span> Atenção ao contorno facial
                  </p>
                  <p className="text-emerald-800 text-xs mt-0.5 pl-4">
                    Um momento dedicado ao autocuidado da região do rosto e pescoço.
                  </p>
                </div>
              </div>
            </div>

            {/* Button CTA 1 */}
            <div>
              <div className="relative w-full max-w-[28rem] mx-auto">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={() => setCurrentStep(13)}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Desbloquear meu protocolo</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Carrossel de Depoimentos com Setas Laterais */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm p-1">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={depoimentosResults[depoimentoIndex].img}
                  onError={(e) => {
                    e.currentTarget.src = depoimentosResults[depoimentoIndex].fallback;
                  }}
                  referrerPolicy="no-referrer"
                  alt={`Depoimento ${depoimentosResults[depoimentoIndex].name}`}
                  decoding="async"
                  className="w-full object-cover rounded-xl transition-all duration-300"
                />

                {/* Seta Esquerda */}
                <button
                  type="button"
                  onClick={() =>
                    setDepoimentoIndex((prev) =>
                      prev === 0 ? depoimentosResults.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer z-10"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Seta Direita */}
                <button
                  type="button"
                  onClick={() =>
                    setDepoimentoIndex((prev) =>
                      prev === depoimentosResults.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer z-10"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Indicadores de Paginação */}
              <div className="flex items-center justify-center gap-2 py-2">
                {depoimentosResults.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDepoimentoIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      depoimentoIndex === idx
                        ? 'w-6 bg-[#AF5655]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ver depoimento ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Closing pitch */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <h2 className="text-xl font-extrabold text-[#AF5655] leading-tight">
                Seu próximo passo começa aqui!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Conheça a rotina Xô Papada e descubra como começar seus cuidados faciais de maneira simples e organizada.
              </p>
            </div>

            {/* Button CTA 2 */}
            <div className="pt-2 pb-6">
              <div className="relative w-full max-w-[28rem] mx-auto">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={() => setCurrentStep(13)}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Quero Acessar o Protocolo</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 13: Verificando disponibilidade       */}
        {/* ========================================== */}
        {currentStep === 13 && (
          <div className="animate-fade-in-step flex flex-col gap-6 text-center py-10">
            <div>
              <h2 className="text-2xl font-bold text-[#AF5655] leading-tight">
                Verificando disponibilidade do protocolo...
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Estamos finalizando os detalhes do seu plano exclusivo.
              </p>
            </div>

            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#AF5655] transition-all duration-300 rounded-full"
                style={{ width: `${verifyProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 14: Oferta Final / VSL                */}
        {/* ========================================== */}
        {currentStep === 14 && (
          <div className="animate-fade-in-step flex flex-col gap-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#1C1513] leading-tight">
                Você está a apenas{' '}
                <span className="bg-[#AF5655] text-white px-2 py-0.5 rounded-lg">15 dias</span> de
                uma nova versão de você.
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Deixamos uma mensagem especial antes de começar. 👇
              </p>
            </div>

            {/* Video Player (MP4 Video Stream) */}
            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="relative w-full aspect-[9/16] bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src="https://i.imgur.com/RvFjxh8.mp4"
                  preload="auto"
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setVslProgress(100);
                    setShowVslCta(true);
                  }}
                >
                  <source src="https://i.imgur.com/RvFjxh8.mp4" type="video/mp4" />
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>
              </div>

              {/* Barra de Reprodução Inteligente */}
              <div className="w-full bg-[#18181b] px-3 py-2 border-t border-white/10">
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#16a34a] rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${vslProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Elementos da Oferta Liberados Após 1 Minuto e Meio (90s) de Vídeo */}
            {showVslCta && (
              <div className="animate-fade-in-step flex flex-col gap-6 w-full">
                {/* Botão Principal Verde 3D */}
                <div className="relative w-full">
                  <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                  <a
                    href={checkoutUrl}
                    onClick={handleCheckoutClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-green-3d relative w-full py-4 px-6 text-white rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wide uppercase"
                  >
                    <span>QUERO MEU PROTOCOLO XÔ PAPADA</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </a>
                </div>

                {/* Copy Solicitada */}
                <div className="bg-emerald-50 border border-emerald-400 rounded-2xl p-4">
                  <p className="text-sm sm:text-base text-emerald-950 font-medium">
                    <strong>Condição especial exclusiva para você!</strong> Desbloqueie agora seu acesso ao Xô Papada com uma oferta especial.
                  </p>
                </div>

                {/* Botão Secundário Solicitado (Sem Valor) */}
                <div>
                  <a
                    href={checkoutUrl}
                    onClick={handleCheckoutClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Acesso Imediato</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Included Bonus Cards & Guarantee Details */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm text-left flex flex-col gap-3">
                  <h3 className="font-bold text-sm text-[#AF5655] uppercase tracking-wide">
                    O que está incluso no seu protocolo:
                  </h3>
                  <div className="space-y-2.5 text-xs text-gray-700">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Protocolo Completo Tchau Papada:</strong> Exercícios de 5 a 10 min por dia adaptados ao seu caso.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bônus 1:</strong> Hábitos diários que pioram sua papada sem perceber.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bônus 2:</strong> Os 3 alimentos que incham seu rosto sem subir de peso.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bônus 3:</strong> A postura ao dormir e como corrigir em menos de 1 min.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bônus 4:</strong> Acesso exclusivo à comunidade e suporte tira-dúvidas.</span>
                    </div>
                  </div>

                  {/* 30-Day Guarantee Box */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 mt-2">
                    <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Garantia Incondicional de 30 Dias</h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        15 dias para fazer o protocolo e mais 15 dias de margem. Se não tiver resultados, devolvemos 100% do seu dinheiro.
                      </p>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center text-[10px] text-gray-500 font-semibold">
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Compra 100% Segura</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Acesso Imediato</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Garantia Total</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Exit Intent Modal (Mid-Quiz Retention) */}
      {showExitModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
          }}
          className="items-center justify-center p-4 animate-fade-in-step"
        >
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl border border-gray-100 flex flex-col gap-4 max-w-[24rem] w-full mx-auto">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ⚠️
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1C1513] leading-tight tracking-tight">
                NÃO SAIA AGORA!
              </h3>
              <p className="text-xs font-bold text-[#AF5655] uppercase tracking-wider mt-1">
                Falta pouco para terminar!
              </p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Menos de <strong>15 segundos</strong> para finalizar o teste e receber seu protocolo personalizado.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <div className="relative w-full">
                <div className="btn-pulse-wave absolute inset-0 w-full h-full bg-[#17a34a] rounded-xl pointer-events-none" />
                <button
                  onClick={() => setShowExitModal(false)}
                  type="button"
                  className="btn-green-3d relative w-full py-4 px-4 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>CONTINUAR PROTOCOLO</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <button
                onClick={() => {
                  setShowExitModal(false);
                  setCurrentStep(14);
                }}
                type="button"
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 hover:text-[#AF5655] transition-colors cursor-pointer"
              >
                Quero receber agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
