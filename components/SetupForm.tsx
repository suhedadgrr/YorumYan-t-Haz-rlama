import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { Rocket, Save, Trash2 } from 'lucide-react';

interface SetupFormProps {
  onComplete: (config: AppConfig) => void;
  initialConfig?: AppConfig;
  onClear?: () => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onComplete, initialConfig, onClear }) => {
  const [appName, setAppName] = useState(initialConfig?.appName || '');
  const [features, setFeatures] = useState(initialConfig?.features || '');
  const [email, setEmail] = useState(initialConfig?.email || '');
  const [campaign, setCampaign] = useState(initialConfig?.campaign || '');

  // Update local state if initialConfig changes (e.g. after clear)
  useEffect(() => {
    setAppName(initialConfig?.appName || '');
    setFeatures(initialConfig?.features || '');
    setEmail(initialConfig?.email || '');
    setCampaign(initialConfig?.campaign || '');
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appName && features) {
      onComplete({ appName, features, email, campaign });
    }
  };

  const handleClear = () => {
    if (window.confirm("Kayıtlı uygulama bilgileri silinecek. Emin misiniz?")) {
      setAppName('');
      setFeatures('');
      setEmail('');
      setCampaign('');
      if (onClear) onClear();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-indigo-600">
          <Rocket className="w-8 h-8" />
          <h2 className="text-2xl font-bold text-slate-800">Asistan Kurulumu</h2>
        </div>
        {initialConfig && onClear && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
            title="Kayıtlı verileri sil"
          >
            <Trash2 className="w-4 h-4" />
            Verileri Temizle
          </button>
        )}
      </div>
      
      <p className="mb-8 text-slate-600">
        Asistanı kullanmaya başlamadan önce, yanıtların uygulamanıza özel olması için aşağıdaki bilgileri doldurun.
        Verileriniz tarayıcınızda saklanacaktır.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Uygulama Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
            placeholder="Örn: HızlıGetir"
          />
          <p className="mt-1 text-xs text-slate-500">Yanıtlarda uygulamanızdan bu isimle bahsedilecektir.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Öne Çıkarılacak Özellikler <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
            placeholder="Örn: 7/24 Canlı Destek, Işık hızında teslimat, Güvenli ödeme altyapısı..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              İletişim E-posta (Opsiyonel)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
              placeholder="destek@ornek.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kampanya / Hediye (Opsiyonel)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
              placeholder="Örn: İlk siparişe %10 indirim"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-4"
        >
          <Save className="w-5 h-5" />
          Kaydet ve Başla
        </button>
      </form>
    </div>
  );
};

export default SetupForm;