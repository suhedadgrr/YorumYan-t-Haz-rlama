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
      description: "A sincere, concise response FULLY in the same language as the comment. Must be fluent and grammatically correct.",
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
    Sen bir "Yorum Yanıtlama Asistanısın".
    Görevin; kullanıcıdan gelen yorumları analiz edip en uygun, doğal, samimi ve birbirinden farklı otomatik yanıtlar üretmektir.

    BAĞLAM BİLGİLERİ:
    - Uygulama Adı: "${config.appName}"
    - Öne Çıkarılacak Özellikler: "${config.features}"
    - İletişim E-postası: "${config.email || 'Belirtilmedi'}"
    - Kampanya/Hediye: "${config.campaign || 'Belirtilmedi'}"
    - KULLANICININ VERDİĞİ PUAN: ${starRating} / 5 Yıldız
    - EKLENECEK ÖZEL NOT (Kullanıcının bu isteğini mutlaka yanıta doğal bir şekilde yedir): "${additionalContext || 'Yok'}"

    DİL VE YANIT KURALLARI (ÇOK ÖNEMLİ):
    1. **Dil Tespiti:** Yorumun hangi dilde yazıldığını kesin ve doğru bir şekilde tespit et. (Özellikle Arapça, Rusça, Farsça gibi Latin alfabesi kullanmayan dillere dikkat et).
    2. **Orijinal Dil Yanıtı ("originalReply"):** 
       - Yanıt **TAMAMEN** tespit edilen dilde olmalıdır.
       - **Örnek:** Yorum Arapça ise yanıt baştan sona Arap harfleriyle ve düzgün bir Arapça ile yazılmalıdır. Asla yarı Türkçe yarı Arapça yazma.
       - Yorum İngilizce ise tamamen İngilizce, Almanca ise tamamen Almanca olmalıdır.
       - O dilin doğal konuşma yapısını ve kültürel nezaket kalıplarını kullan.
    3. **Türkçe Yanıtlar:** Yorumun Türkçe çevirisini ve Türkçe yanıtını hazırla.
    
    ÇOK ÖNEMLİ KISITLAMALAR:
    - Yanıtlar **KESİNLİKLE 350 karakteri geçmemeli**. Kısa, net ve öz olmalı.
    - Ton: **Çok samimi, içten ve bizden biri gibi**. Kurumsal robot ağzından kaçın.
    - **MOR KALP ZORUNLULUĞU**: Her yanıtın (Hem Orijinal Dil hem Türkçe) sonunda veya en uygun yerinde mutlaka 💜 (Mor Kalp) emojisi kullan. Başka renk kalp kullanma.
    
    PUANLAMA MANTIĞI:
    - **Eğer puan <= 2 VE Yorum Pozitifse/Güzelse**: Şakalı, esprili ve takılan bir dille yanıt ver. (Örnek: "Bizi övüp yıldızları kısmışsın üzdün bizi şaka şaka baş tacısın 💜" tadında).
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
      temperature: 0.75, // Balanced for creativity and language accuracy
    },
  });

  if (!response.text) {
    throw new Error("No response generated");
  }

  return JSON.parse(response.text) as GeneratedResponse;
};