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
      description: "A sincere, concise response in the same language as the comment.",
    },
    turkishReply: {
      type: Type.STRING,
      description: "A sincere, concise response in Turkish.",
    },
    detectedLanguage: {
      type: Type.STRING,
      description: "The name of the language detected in the comment (e.g., English, German, Turkish).",
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
    Sen bir "Yorum Yanıtlama Asistanısın".
    Görevin; kullanıcıdan gelen yorumları analiz edip en uygun, doğal, samimi ve birbirinden farklı otomatik yanıtlar üretmektir.

    BAĞLAM BİLGİLERİ:
    - Uygulama Adı: "${config.appName}"
    - Öne Çıkarılacak Özellikler: "${config.features}"
    - İletişim E-postası: "${config.email || 'Belirtilmedi'}"
    - Kampanya/Hediye: "${config.campaign || 'Belirtilmedi'}"
    - KULLANICININ VERDİĞİ PUAN: ${starRating} / 5 Yıldız
    - EKLENECEK ÖZEL NOT (Kullanıcının bu isteğini mutlaka yanıta doğal bir şekilde yedir): "${additionalContext || 'Yok'}"

    KURALLAR:
    1. Yorumun Türkçeye çevirisini yap.
    2. Yorum hangi dildeyse o dilde yanıtla.
    3. Yorumu Türkçe olarak yanıtla.
    
    ÇOK ÖNEMLİ KISITLAMALAR:
    - Yanıtlar **KESİNLİKLE 350 karakteri geçmemeli**. Kısa, net ve öz olmalı.
    - Ton: **Çok samimi, içten ve bizden biri gibi**. Kurumsal ve soğuk dilden kaçın.
    - **MOR KALP ZORUNLULUĞU**: Her yanıtın sonunda veya en uygun yerinde mutlaka 💜 (Mor Kalp) emojisi kullan. Başka renk kalp kullanma.
    
    PUANLAMA MANTIĞI:
    - **Eğer puan <= 2 VE Yorum Pozitifse/Güzelse**: Şakalı, esprili ve takılan bir dille yanıt ver. (Örnek: "Bizi övüp neden düşük puan verdin üzdün bizi şaka şaka sevgiler" tadında ama daha profesyonel).
    - Düşük Puan + Kötü Yorum: Çözüm odaklı, nazik ve telafi edici ol.
    - Yüksek Puan: Teşekkür et ve emoji ile samimiyeti pekiştir.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: comment,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8, // Slightly higher for creativity/sincerity
    },
  });

  if (!response.text) {
    throw new Error("No response generated");
  }

  return JSON.parse(response.text) as GeneratedResponse;
};
