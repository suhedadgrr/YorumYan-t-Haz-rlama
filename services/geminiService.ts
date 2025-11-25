import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppConfig, GeneratedResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    translation: {
      type: Type.STRING,
      description: "The Turkish translation of the user's comment.",
    },
    originalReply: {
      type: Type.STRING,
      description: "A sincere, concise response FULLY and EXCLUSIVELY in the detected language. NO Turkish words allowed if the language is not Turkish.",
    },
    turkishReply: {
      type: Type.STRING,
      description: "A sincere, concise response in Turkish.",
    },
    detectedLanguage: {
      type: Type.STRING,
      description: "The name of the language detected in the comment (e.g., Arabic, English, German, Turkish).",
    },
  },
  required: ["translation", "originalReply", "turkishReply", "detectedLanguage"],
};

export const generateCommentResponse = async (
  comment: string,
  config: AppConfig,
  starRating: number,
  additionalContext?: string
): Promise<GeneratedResponse> => {
  
  const systemPrompt = `
    Sen profesyonel bir "Yorum Yanıtlama Asistanısın".
    Görevin; kullanıcıdan gelen yorumları analiz edip belirtilen kurallara tam uyan yanıtlar üretmektir.

    BAĞLAM BİLGİLERİ:
    - Uygulama Adı: "${config.appName}"
    - Öne Çıkarılacak Özellikler: "${config.features}"
    - İletişim E-postası: "${config.email || 'Belirtilmedi'}"
    - Kampanya/Hediye: "${config.campaign || 'Belirtilmedi'}"
    - PUAN: ${starRating} / 5 Yıldız
    - EKLENECEK ÖZEL NOT: "${additionalContext || 'Yok'}" (Bunu yanıta doğal bir şekilde yedir).

    ⚠️ ÇOK KRİTİK KURALLAR (HATA İSTEMİYORUM):

    1. **DİL TUTARLILIĞI (EN ÖNEMLİSİ):**
       - 'originalReply' alanı **%100 TESPİT EDİLEN DİLDE** olmalıdır.
       - Eğer yorum Rusça ise, yanıtın TEK BİR HARFİ BİLE Türkçe olmamalıdır (Tamamen Kiril/Rusça).
       - Eğer yorum Arapça ise, yanıt tamamen Arapça olmalıdır.
       - Eğer yorum İngilizce ise, yanıt tamamen İngilizce olmalıdır.
       - **ASLA** yarı Türkçe yarı yabancı dil cümle kurma. Yabancı dildeki yanıtta Türkçe açıklama yapma.

    2. **KARAKTER VE EMOJI SINIRI:**
       - Yanıtlar **Maksimum 350 karakter** olmalıdır. Uzatmak yasak.
       - Her yanıtın (Hem Orijinal hem Türkçe) sonuna mutlaka 💜 (Mor Kalp) emojisi ekle.

    3. **TON VE ÜSLUP:**
       - Çok samimi, sıcakkanlı ve içten ol. Robot gibi konuşma.
       - **PUANLAMA MANTIĞI:**
         - **Puan <= 2 VE Yorum Pozitifse:** Şakalı yaklaş. (Örn: "Yorum bal gibi ama yıldızlar nerede? Şaka şaka canın sağ olsun 💜").
         - **Puan Düşük + Yorum Kötü:** Çok nazik, alttan alan ve çözüm odaklı ol.
         - **Puan Yüksek:** Teşekkür et, özellikleri vurgula, samimi ol.

    GÖREVİN:
    Yorumun dilini kesin olarak tespit et. Türkçe çevirisini yap. Orijinal dilinde (asla dil karıştırmadan) yanıtla. Sonra farklı bir üslupla Türkçe yanıtla.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: comment,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7, 
    },
  });

  if (!response.text) {
    throw new Error("No response generated");
  }

  return JSON.parse(response.text) as GeneratedResponse;
};

export const refineCommentResponse = async (
  currentTurkishReply: string,
  targetLanguage: string,
  config: AppConfig
): Promise<{ originalReply: string; turkishReply: string }> => {
  const refineSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      originalReply: {
        type: Type.STRING,
        description: `The translated version of the text in ${targetLanguage}.`,
      },
      turkishReply: {
        type: Type.STRING,
        description: "The polished Turkish version.",
      },
    },
    required: ["originalReply", "turkishReply"],
  };

  const systemPrompt = `
    Sen bir metin editörü ve çevirmenisin.
    
    DURUM:
    Kullanıcı, müşteri hizmetleri yanıtı olarak şu Türkçe metni taslak olarak yazdı:
    "${currentTurkishReply}"

    GÖREVİN:
    1. **TÜRKÇE DÜZENLEME:** Bu metni daha akıcı, samimi ve profesyonel hale getir (anlamı bozmadan, yazım hatalarını gider).
       - Uygulama adı: ${config.appName}
       - Sonuna mutlaka 💜 (Mor Kalp) ekle.
       - Maksimum 350 karakter.

    2. **ÇEVİRİ (${targetLanguage}):** Düzenlenmiş Türkçe metni, BİREBİR anlamı karşılayacak şekilde **${targetLanguage}** diline çevir.
       - Eğer hedef dil Türkçe değilse, **%100 o dilde** yaz. Asla Türkçe kelime karıştırma.
       - Eğer hedef dil Rusça ise sadece Kiril alfabesi kullan.
       - Eğer hedef dil Arapça ise sadece Arapça alfabesi kullan.
       - Sonuna mutlaka 💜 (Mor Kalp) ekle.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Lütfen bu metni düzenle ve çevir.",
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: refineSchema,
      temperature: 0.7,
    },
  });

  if (!response.text) {
    throw new Error("No response generated");
  }

  return JSON.parse(response.text) as { originalReply: string; turkishReply: string };
};
