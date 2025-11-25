import React, { useState } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';

interface ResponseCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  bgColor: string;
  borderColor: string;
  onEdit?: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ title, icon, content, bgColor, borderColor, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 rounded-xl border ${borderColor} ${bgColor} relative group transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          {icon}
          <h3>{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-white/50 text-slate-600 hover:text-indigo-600 transition-colors"
              title="Metni Düzenle"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/50 text-slate-600 hover:text-indigo-600 transition-colors"
            title="Metni Kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{content}</p>
    </div>
  );
};

export default ResponseCard;
