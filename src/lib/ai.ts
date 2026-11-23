import diseaseSpecialtyMap from "@/data/disease-specialty-map.json";

export interface RedFlagResult {
  isRedFlag: boolean;
  reason?: string;
  suggestedSpecialty?: string;
}

// Red-flag emergency triggers in English, Hindi, and Hinglish aliases (PRD F5)
const RED_FLAG_KEYWORDS = [
  // Chest pain / Heart attack
  "chest pain",
  "sine me dard",
  "seene me dard",
  "सीने में दर्द",
  "heart attack",
  "दिल का दौरा",
  "angina",
  "left arm pain",
  // Severe breathlessness
  "breathlessness",
  "shortness of breath",
  "sans phoolna",
  "saans nahi aa rahi",
  "सांस फूलना",
  "suffocation",
  "gasping",
  // Stroke / Paralysis signs
  "stroke",
  "paralysis",
  "falij",
  "lakwa",
  "लकवा",
  "face drooping",
  "arm weakness",
  "slurred speech",
  // Severe bleeding / Trauma
  "severe bleeding",
  "heavy bleeding",
  "khoon beh raha",
  "बहुत ज्यादा खून",
  "profuse bleeding",
  "arterial bleed",
  // Unconsciousness / Seizures
  "unconscious",
  "behoshi",
  "behosh",
  "बेहोश",
  "seizure",
  "fits",
  "mirgi",
  "दौरा",
  "collapsed",
  "fainted",
];

export function detectRedFlags(input: string): RedFlagResult {
  const lower = input.toLowerCase();

  for (const kw of RED_FLAG_KEYWORDS) {
    if (lower.includes(kw)) {
      let specialty = "Emergency Medicine";
      if (lower.includes("chest") || lower.includes("heart") || lower.includes("sine") || lower.includes("seene")) {
        specialty = "Cardiology";
      } else if (lower.includes("stroke") || lower.includes("paralysis") || lower.includes("lakwa") || lower.includes("slur")) {
        specialty = "Neurology";
      } else if (lower.includes("breath") || lower.includes("sans") || lower.includes("saans")) {
        specialty = "Pulmonology";
      }

      return {
        isRedFlag: true,
        reason: `Emergency symptom detected matching keyword: "${kw}"`,
        suggestedSpecialty: specialty,
      };
    }
  }

  // Check matching specialty from map
  let matchedSpecialty: string | undefined;
  for (const item of diseaseSpecialtyMap) {
    if (
      lower.includes(item.name_en.toLowerCase()) ||
      lower.includes(item.name_hi) ||
      item.aliases.some((a) => lower.includes(a.toLowerCase()))
    ) {
      matchedSpecialty = item.specialty;
      break;
    }
  }

  return {
    isRedFlag: false,
    suggestedSpecialty: matchedSpecialty || "General Medicine",
  };
}

export async function generateAIHealthGuidance(
  userMessage: string,
  language: string = "en"
): Promise<{ reply: string; isRedFlag: boolean; suggestedSpecialty: string }> {
  const redFlagCheck = detectRedFlags(userMessage);

  const apiKey = process.env.AI_API_KEY;
  const isHindi = language === "hi";

  // System instruction forced strictly per PRD Section 5 F5 & Section 9:
  // - Warm, simple, human language in the user's chosen language
  // - Immediate first-aid or first steps
  // - When to see a doctor
  // - NEVER a definitive diagnosis or prescription drug dosages
  // - Always end with a medical navigation disclaimer
  const systemPrompt = `You are the AarogyaPath AI Health Assistant.
Target language: ${isHindi ? "Hindi (हिन्दी)" : "English"}.
Crucial rules:
1. Provide immediate, safe first-aid guidance and first steps.
2. Specify clearly when the person should visit a clinic or hospital.
3. NEVER provide a medical diagnosis or specific prescription drug dosages.
4. If symptoms sound urgent, advise immediate medical attention.
5. End your response with this brief disclaimer line:
${isHindi ? "अस्वीकरण: यह केवल प्राथमिक जानकारी है, चिकित्सा सलाह या दवा की खुराक नहीं। आवश्यकता होने पर तुरंत चिकित्सक से संपर्क करें।" : "Disclaimer: This is first-step guidance, not a medical diagnosis or prescription. Consult a certified doctor for health concerns."}
Keep your response concise, helpful, and caring.`;

  if (apiKey) {
    try {
      // Connect to Google Gemini API (free tier / standard REST endpoint)
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nUser situation: ${userMessage}` },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.4,
        },
      };

      const res = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const text =
          json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text.trim(),
            isRedFlag: redFlagCheck.isRedFlag,
            suggestedSpecialty: redFlagCheck.suggestedSpecialty || "General Medicine",
          };
        }
      }
    } catch {
      // Gracefully fall back to rule-based response so demo never crashes
    }
  }

  // Graceful rule-based health guidance fallback (works offline / zero-key)
  let fallbackReply = "";
  if (isHindi) {
    if (redFlagCheck.isRedFlag) {
      fallbackReply = `यह एक गंभीर आपातकालीन स्थिति हो सकती है। कृपया तुरंत 108 पर कॉल करें या निकटतम अस्पताल के इमरजेंसी वार्ड में जाएं।\n\nप्राथमिक कदम:\n1. मरीज को शांत रखें और आराम की मुद्रा में लिटाएं या बैठाएं।\n2. तंग कपड़े ढीले करें और ताजी हवा आने दें।\n3. मरीज को कुछ भी खाने या पीने को न दें।\n\nअस्वीकरण: यह केवल प्राथमिक जानकारी है, चिकित्सा सलाह या दवा की खुराक नहीं। आवश्यकता होने पर तुरंत चिकित्सक से संपर्क करें।`;
    } else {
      fallbackReply = `आपके बताए गए लक्षणों के लिए प्राथमिक देखभाल:\n\n1. पर्याप्त मात्रा में पानी या ORS का घोल पिएं और शरीर को हाइड्रेटेड रखें।\n2. पूरा आराम करें और भारी शारीरिक श्रम से बचें।\n3. यदि लक्षण 24-48 घंटों से अधिक बने रहें या स्थिति बिगड़े, तो विशेषज्ञ डॉक्टर से परामर्श अवश्य लें।\n\nअस्वीकरण: यह केवल प्राथमिक जानकारी है, चिकित्सा सलाह या दवा की खुराक नहीं। आवश्यकता होने पर तुरंत चिकित्सक से संपर्क करें।`;
    }
  } else {
    if (redFlagCheck.isRedFlag) {
      fallbackReply = `This symptom may indicate an emergency. Please dial 108 immediately or proceed to the nearest hospital emergency department.\n\nImmediate steps:\n1. Keep the patient calm, rested, and in a comfortable posture.\n2. Loosen tight clothing and ensure good airflow.\n3. Do not give solid foods or unprescribed medications.\n\nDisclaimer: This is first-step guidance, not a medical diagnosis or prescription. Consult a certified doctor for health concerns.`;
    } else {
      fallbackReply = `Here is safe initial guidance for your described symptoms:\n\n1. Stay well hydrated by drinking clean water, electrolytes, or warm fluids.\n2. Get adequate rest and monitor your body temperature and symptoms.\n3. If your symptoms persist beyond 24-48 hours, worsen, or cause significant discomfort, please consult a qualified physician.\n\nDisclaimer: This is first-step guidance, not a medical diagnosis or prescription. Consult a certified doctor for health concerns.`;
    }
  }

  return {
    reply: fallbackReply,
    isRedFlag: redFlagCheck.isRedFlag,
    suggestedSpecialty: redFlagCheck.suggestedSpecialty || "General Medicine",
  };
}
