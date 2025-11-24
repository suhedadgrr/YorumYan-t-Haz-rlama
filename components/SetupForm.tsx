import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Rocket, Save } from 'lucide-react';

interface SetupFormProps {
  onComplete: (config: AppConfig) => void;
  initialConfig?: AppConfig;
}

const SetupForm: React.FC<SetupFormProps> = ({ onComplete, initialConfig }) => {
  const [appName, setAppName] = useState(initialConfig?.appName || '');
  const [features, setFeatures] = useState(initialConfig?.features || '');
  const [email, setEmail] = useState(initialConfig?.email || '');
  const [campaign, setCampaign] = useState(initialConfig?.campaign || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appName && features) {
      onComplete({ appName, features, email, campaign });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6 text-indigo-600">
        <Rocket className="w-8 h-8" />
        <h2 className="text-2xl font-bold text-slate-800">Asistan Kurulumu</h2>
      </div>
      
      <p className="mb-8 text-slate-600">
        Asistanı kullanmaya başlamadan önce, yanıtların uygulamanıza özel olması için aşağıdaki bilgileri doldurun.
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