export const typewriterEffect = (
  element: HTMLElement,
  text: string,
  speed: number = 50,
  callback?: () => void
) => {
  let index = 0;
  element.textContent = '';

  const interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);

  return () => clearInterval(interval);
};

export const playKeySound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('Audio not supported');
  }
};

export const getHotmartUrl = (): string => {
  const baseUrl = 'https://pay.hotmart.com/F100142422S?off=g0y3vexd';
  const params = new URLSearchParams(window.location.search);
  const utmParams: string[] = [];

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(param => {
    const value = params.get(param);
    if (value) utmParams.push(`${param}=${encodeURIComponent(value)}`);
  });

  const timestamp = Date.now();
  utmParams.push(`xcod=${timestamp}`);
  utmParams.push(`sck=${timestamp + 1000}`);
  utmParams.push(`bid=${timestamp + 2000}`);

  return `${baseUrl}&${utmParams.join('&')}`;
};
