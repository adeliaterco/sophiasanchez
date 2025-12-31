import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Chat from './components/Chat';
import Result from './components/Result';
import Layout from './components/Layout'; // ✅ NOVO IMPORT
import { storage } from './utils/storage';

type Page = 'landing' | 'chat' | 'resultado';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      fbclid: urlParams.get('fbclid') || undefined,
      gclid: urlParams.get('gclid') || undefined,
    };

    const hasParams = Object.values(utmParams).some(val => val !== undefined);
    if (hasParams) {
      storage.saveUTMParams(utmParams);
    }

    const path = window.location.pathname;
    if (path.includes('/chat')) {
      setCurrentPage('chat');
    } else if (path.includes('/resultado')) {
      setCurrentPage('resultado');
    } else {
      setCurrentPage('landing');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.history.pushState({}, '', `/${page === 'landing' ? '' : page}`);
    window.scrollTo(0, 0);
  };

  return (
    <Layout> {/* ✅ ENVOLVE TUDO COM LAYOUT */}
      <div className="app">
        {currentPage === 'landing' && <Landing onNavigate={handleNavigate} />}
        {currentPage === 'chat' && <Chat onNavigate={handleNavigate} />}
        {currentPage === 'resultado' && <Result onNavigate={handleNavigate} />}
      </div>
    </Layout>
  );
}

export default App;