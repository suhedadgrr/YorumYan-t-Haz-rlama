import React, { useState } from 'react';
import { AppConfig, AppState, GeneratedResponse } from './types';
import SetupForm from './components/SetupForm';
import ResponseCard from './components/ResponseCard';
import { generateCommentResponse } from './services/geminiService';
import { 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Globe, 
  MessageCircle, 
  RefreshCw,
  ClipboardCopy,
  Check,
  Star,
  PlusCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [comment, setComment] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [starRating, setStarRating] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullCopySuccess, setFullCopySuccess] = useState(false);

  const handleSetupComplete = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setAppState(AppState.MAIN);
  };

  const handleGenerate = async () => {
    if (!comment.trim() || !config) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await generateCommentResponse(comment, config, starRating, additionalContext);
      setResponse(result);
    } catch (err) {
      console.error(err);
      setError('Yanıt üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setComment('');
    setAdditionalContext('');
    setResponse(null);
    setError(null);
    setStarRating(5);
  };

  const handleFullCopy = () => {
    if (!response) return;
    
    const formattedText = `🔄 Türkçe Çeviri:
${response.translation}

🌍 Orijinal Dilinde Yanıt:
${response.originalReply}

🇹🇷 Türkçe Yanıt:
${response.turkishReply}`;

    navigator.clipboard.writeText(formattedText);
    setFullCopySuccess(true);
    setTimeout(() => setFullCopySuccess(false), 2000);
  };

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Yorum Asistanı</h1>
        </div>
        
        {appState === AppState.MAIN && (
          <button
            onClick={() => setAppState(AppState.SETUP)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200"
          >
            <Settings className="w-4 h-4" />
            <span>Ayarları Düzenle</span>
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {appState === AppState.SETUP ? (
          <div className="mt-8">
            <SetupForm onComplete={handleSetupComplete} initialConfig={config || undefined} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Input */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                
                {/* Rating Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Müşterinin Verdiği Puan
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setStarRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= starRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {starRating <= 2 ? "Düşük (Üzgün/Kızgın)" : starRating === 3 ? "Orta (Nötr)" : "Yüksek (Mutlu)"}
                  </p>
                </div>

                {/* Comment Input */}
                <div className="mb-6">
                   <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    Müşteri Yorumu
                  </h2>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Müşterinin yorumunu buraya yapıştırın..."
                    className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Additional Context Input */}
                <div className="mb-6">
                   <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-indigo-500" />
                    Yanıta Ekle (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Örn: İndirim kodu, sipariş no sor..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Yanıta eklemek istediğiniz özel bir not veya bilgi.
                  </p>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !comment.trim()}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${
                      loading || !comment.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                    }`}
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {loading ? 'Analiz Ediliyor...' : 'Yanıt Üret'}
                  </button>
                  
                  {response && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Temizle"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
              </div>
              
              {/* Context Info (Mini Setup Preview) */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-sm">
                <h3 className="font-semibold text-slate-700 mb-2">Aktif Bağlam</h3>
                <ul className="space-y-1 text-slate-600">
                  <li><span className="font-medium">Uygulama:</span> {config?.appName}</li>
                  <li className="line-clamp-1"><span className="font-medium">Özellikler:</span> {config?.features}</li>
                  {config?.campaign && (
                    <li className="text-green-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {config.campaign}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="lg:col-span-7">
              {!response ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Puan seçin, yorum yapıştırın ve yanıt üretin.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      Algılanan Dil: <span className="text-indigo-600">{response.detectedLanguage}</span>
                    </span>
                    <button
                      onClick={handleFullCopy}
                      className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {fullCopySuccess ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                      Tümünü Kopyala
                    </button>
                   </div>

                  <ResponseCard
                    title="Türkçe Çeviri"
                    icon={<RefreshCw className="w-5 h-5 text-blue-500" />}
                    content={response.translation}
                    bgColor="bg-blue-50/50"
                    borderColor="border-blue-100"
                  />
                  
                  <ResponseCard
                    title="Orijinal Dilde Yanıt"
                    icon={<Globe className="w-5 h-5 text-green-500" />}
                    content={response.originalReply}
                    bgColor="bg-green-50/50"
                    borderColor="border-green-100"
                  />

                  <ResponseCard
                    title="Alternatif Türkçe Yanıt"
                    icon={<MessageSquare className="w-5 h-5 text-orange-500" />}
                    content={response.turkishReply}
                    bgColor="bg-orange-50/50"
                    borderColor="border-orange-100"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
