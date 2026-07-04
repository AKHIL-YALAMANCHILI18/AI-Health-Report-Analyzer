import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to check if API key exists
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or is using the default placeholder.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const isTransientError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  const status = error.status || error.statusCode || (error.error && error.error.code);
  const statusStr = String(status || "");
  
  if (statusStr.includes("429") || statusStr.includes("503") || statusStr.includes("500") || statusStr.includes("504")) {
    return true;
  }
  
  if (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("500") ||
    msg.includes("high demand") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted") ||
    msg.includes("temporary") ||
    msg.includes("unavailable")
  ) {
    return true;
  }
  
  try {
    const parsed = JSON.parse(error.message);
    const code = parsed?.error?.code;
    if (code === 503 || code === 429 || code === 500) {
      return true;
    }
  } catch (e) {}
  
  return false;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && isTransientError(error)) {
      console.warn(`Transient Gemini API error encountered: ${error.message || error}. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API: Analyze Report using Gemini Multimodal OCR + Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Missing file base64 data" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.log("No valid Gemini API key found. Falling back to scientifically realistic OCR analysis simulated on the server.");
      // Generate very high fidelity simulated report data
      const mockResult = generateRealisticMockReport(fileName || "blood_report.pdf");
      return res.json({
        source: "mock-backend-fallback",
        analysis: mockResult,
        warning: "Running in mock mode. Add your GEMINI_API_KEY in Settings > Secrets for real AI OCR analysis."
      });
    }

    console.log("Analyzing health report using Gemini 3.5 Flash...");

    // Set up standard prompt for OCR + Analysis
    const prompt = `
      You are an expert clinical pathologist and medical report analyzer.
      Analyze the attached medical report / blood test report image.
      First, perform OCR to extract all medical values, patient demographics, and test parameters.
      Then, analyze every single biomarker found in the report.
      
      Generate a response strictly conforming to the following JSON structure. All fields are required.
      
      JSON Structure:
      {
        "metadata": {
          "patientName": "Extracted patient name or 'Unknown'",
          "age": "Extracted age (integer or string) or 'Unknown'",
          "gender": "Extracted gender or 'Unknown'",
          "hospital": "Extracted hospital/lab name or 'Unknown'",
          "doctor": "Extracted referring doctor or 'Unknown'",
          "testDate": "Extracted test date or 'Unknown'",
          "reportDate": "Extracted report date or 'Unknown'",
          "confidenceScore": 95
        },
        "healthScores": {
          "overallWellnessScore": 78,
          "bloodHealth": 85,
          "kidneyHealth": 90,
          "liverHealth": 88,
          "heartHealth": 72,
          "metabolicHealth": 65,
          "immuneIndicators": 80
        },
        "biomarkers": [
          {
            "name": "e.g., Hemoglobin",
            "category": "e.g., Blood Health / Liver Health / Kidney Health / Heart Health / Metabolic Health / Immune Indicators",
            "value": 11.2,
            "unit": "g/dL",
            "normalRange": "12.0 - 16.0",
            "status": "low", 
            "explanation": "A simple-English explanation of what this biomarker means.",
            "whyItMatters": "Why this parameter is vital for long-term physiological health.",
            "possibleCauses": "Possible general, everyday educational causes (e.g., low iron intake, dehydration). Explicitly keep this educational.",
            "lifestyleSuggestions": "Practical lifestyle, diet, or exercise tips to improve this marker.",
            "followUpQuestions": "Recommended specific questions the user can ask their healthcare provider about this marker."
          }
        ],
        "summary": "A cohesive executive summary of the health report. Write this in a warm, professional, encouraging healthcare SaaS tone, highlighting areas of excellence and areas that might need gentle lifestyle adjustments.",
        "riskIndicators": [
          {
            "condition": "e.g., Mild Anemia / Metabolic Risk / Dehydration",
            "riskLevel": "Low / Moderate / High",
            "description": "Educational explanation of the risk indicator based on the extracted biomarkers, explaining that this is not a diagnosis."
          }
        ]
      }
      
      Guidelines:
      - Classify "status" as exactly "normal", "high", "low", or "critical".
      - Extract all parameters visible (like Red Blood Cells, Hemoglobin, LDL Cholesterol, HDL Cholesterol, Triglycerides, Glucose, Creatinine, AST, ALT, WBC, etc.).
      - Double-check normal ranges and compare the value carefully.
      - Add a clear educational disclaimer.
    `;

    // Strip out standard mime wrapper if included in base64
    const base64Data = fileBase64.replace(/^data:image\/[a-z]+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Data,
      },
    };

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: prompt }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }));

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const parsedResponse = JSON.parse(text.trim());
    return res.json({
      source: "gemini-api",
      analysis: parsedResponse,
    });

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze report using Gemini AI.",
      details: error.message,
      // Provide fallback so UX is uninterrupted even with API key issues
      fallback: generateRealisticMockReport("blood_report.pdf")
    });
  }
});

// API: Compare two reports
app.post("/api/compare", async (req, res) => {
  const { report1, report2 } = req.body;
  try {
    if (!report1 || !report2) {
      return res.status(400).json({ error: "Please provide both reports to compare" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Direct mock comparison on backend fallback
      return res.json({
        source: "mock-backend-fallback",
        comparison: performMockComparison(report1, report2)
      });
    }

    console.log("Comparing reports using Gemini...");
    const prompt = `
      You are an expert healthcare data scientist and clinical analyzer.
      Compare the following two health report summaries of the same patient and analyze their progress over time.
      
      Report 1 (Earlier): ${JSON.stringify(report1)}
      Report 2 (Later): ${JSON.stringify(report2)}
      
      Analyze the differences in biomakers and health scores.
      Return a response strictly in the following JSON format:
      
      {
        "scoreChange": {
          "wellness": 5, 
          "blood": 2,
          "kidney": 0,
          "liver": -3,
          "heart": 8,
          "metabolic": 12,
          "immune": 1
        },
        "improvedMarkers": [
          {
            "name": "e.g., LDL Cholesterol",
            "previous": "150 mg/dL",
            "current": "115 mg/dL",
            "reason": "Educational note on why this improved (e.g. dietary fiber intake or cardiovascular workouts)."
          }
        ],
        "worsenedMarkers": [
          {
            "name": "e.g., ALT (Liver Enzyme)",
            "previous": "30 U/L",
            "current": "48 U/L",
            "reason": "Educational note on why this may have elevated (e.g. alcohol consumption or intense weightlifting)."
          }
        ],
        "overallProgressSummary": "A beautifully drafted, high-quality, professional educational evaluation of the progress the user is making."
      }
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    }));

    const parsedComparison = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      source: "gemini-api",
      comparison: parsedComparison
    });

  } catch (error: any) {
    console.error("Comparison error:", error);
    res.status(500).json({
      error: "Failed to compare reports using AI",
      details: error.message,
      fallback: performMockComparison(report1, report2)
    });
  }
});

// API: Chat using Gemini Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();
    const modelName = model || "gemini-3.5-flash";

    if (!ai) {
      console.log("No valid Gemini API key found for chat. Returning simulated diagnostic chat response.");
      const lastMsg = messages[messages.length - 1]?.parts?.[0]?.text || "Hello";
      const reply = generateSimulatedChatResponse(lastMsg, messages);
      return res.json({
        source: "mock-backend-fallback",
        text: reply,
        warning: "Running in mock mode. Add your GEMINI_API_KEY in Settings > Secrets for real-time AI chat."
      });
    }

    console.log(`Chatting with Gemini model ${modelName}...`);

    // Prepare contents correctly for generateContent
    // Each message is of type { role: string, parts: [{ text: string }] }
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.parts?.[0]?.text || "" }]
    }));

    const response = await withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction || "You are a professional, highly empathetic healthcare AI advisor. Provide insightful, clinically accurate, educational information regarding general wellness and medical terminology. Always emphasize that your advice is educational and does not constitute a physical medical diagnosis.",
        temperature: 0.7,
      },
    }));

    return res.json({
      source: "gemini-api",
      text: response.text || "I was unable to formulate a response.",
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to communicate with AI chat service.",
      details: error.message,
    });
  }
});

// API: Analyze miscellaneous photo using Gemini Multimodal Pro
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, category, customPrompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image base64 data." });
    }

    const ai = getGeminiClient();
    const modelName = "gemini-3.1-pro-preview"; // Use gemini-3.1-pro-preview for complex image understanding

    if (!ai) {
      console.log("No valid Gemini API key found for image analysis. Returning simulated analysis.");
      return res.json({
        source: "mock-backend-fallback",
        analysis: generateSimulatedImageAnalysis(category || "general"),
        warning: "Running in mock mode. Add your GEMINI_API_KEY in Settings > Secrets for real multimodal vision AI analysis."
      });
    }

    console.log(`Analyzing image using ${modelName} for category: ${category}...`);

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: cleanBase64,
      },
    };

    let prompt = `
      You are an expert multimodal wellness analyzer. Analyze this image.
      Provide a highly detailed clinical, visual, or nutritional evaluation based on the category of the image.
      
      Category: ${category || "general"}
      User's Custom Query/Focus: ${customPrompt || "Analyze this image and explain what it is and what wellness insights can be derived."}
      
      Respond strictly with a structured JSON object containing:
      {
        "title": "A short descriptive title for the analysis",
        "description": "A detailed 2-3 paragraph explanation of what is in the image, its visual quality, and high-level observations.",
        "insights": [
          {
            "parameter": "Focus point (e.g. Nutritional Composition, Presentation, Visual indicators)",
            "observation": "What you specifically notice",
            "clinicalImplication": "Educational health meaning or nutritional implication"
          }
        ],
        "recommendations": [
          "Actionable recommendation 1",
          "Actionable recommendation 2",
          "Actionable recommendation 3"
        ],
        "disclaimer": "An educational medical disclaimer highlighting that this AI image scan is not a clinical diagnosis."
      }
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: [imagePart, { text: prompt }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }));

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      source: "gemini-api",
      analysis: parsedResponse,
    });

  } catch (error: any) {
    console.error("Image analysis API error:", error);
    res.status(500).json({
      error: "Failed to analyze image using Gemini Multimodal Pro.",
      details: error.message,
    });
  }
});

// API: Generate specialized Clinical Intelligence tasks (Doctor letter, meal/workout, goals)
app.post("/api/intelligence", async (req, res) => {
  try {
    const { task, reportData, profileData } = req.body;
    if (!task) {
      return res.status(400).json({ error: "Intelligence task name is required." });
    }

    const ai = getGeminiClient();
    const modelName = "gemini-3.5-flash"; // Use gemini-3.5-flash for general tasks

    if (!ai) {
      console.log(`No valid Gemini API key found. Returning simulated clinical intelligence output for: ${task}`);
      return res.json({
        source: "mock-backend-fallback",
        result: generateSimulatedIntelligenceResult(task, reportData, profileData),
        warning: "Running in mock mode. Add your GEMINI_API_KEY in Settings > Secrets for real-time AI medical writing."
      });
    }

    console.log(`Generating clinical intelligence output for: ${task}...`);

    let prompt = "";
    if (task === "doctor_letter") {
      prompt = `
        You are an expert clinical communication writer.
        Draft a high-quality, professional, and respectful letter/email that a patient can send to their primary care physician.
        The purpose is to share their recent blood test results, highlight biomarkers of concern, and ask highly structured, specific questions.
        
        Patient Profile: ${JSON.stringify(profileData || {})}
        Report Details: ${JSON.stringify(reportData || {})}
        
        Write the letter in standard medical-professional format. Keep it concise, respectful, and clinically structured.
        Emphasize that the patient wants to discuss these findings at their next clinical checkup.
        
        Return a JSON object:
        {
          "subject": "Email Subject Line",
          "salutation": "Dear Doctor...",
          "body": "Complete letter body with structured sections.",
          "questions": ["Specific clinical question 1", "Specific clinical question 2"],
          "closing": "Sincerely..."
        }
      `;
    } else if (task === "meal_plan") {
      prompt = `
        You are a clinical sports nutritionist.
        Design a highly targeted, anti-inflammatory, micronutrient-rich 1-day meal plan that specifically addresses the patient's biomarker concerns (e.g., lowering LDL cholesterol, regulating blood sugar, or enhancing hemoglobin).
        
        Patient Profile: ${JSON.stringify(profileData || {})}
        Biomarkers: ${JSON.stringify(reportData?.biomarkers || [])}
        
        The meal plan must be clean, easy to prepare, and specify exactly why each meal was chosen for their specific biomarkers.
        
        Return a JSON object:
        {
          "focus": "Core focus of this meal plan (e.g. Cardioprotective & Glycemic Regulation)",
          "meals": {
            "breakfast": { "name": "Meal Name", "ingredients": ["ing 1", "ing 2"], "biomarkerImpact": "Why this meal helps specific biomarkers" },
            "lunch": { "name": "Meal Name", "ingredients": ["ing 1", "ing 2"], "biomarkerImpact": "Why this meal helps specific biomarkers" },
            "snack": { "name": "Meal Name", "ingredients": ["ing 1", "ing 2"], "biomarkerImpact": "Why this meal helps specific biomarkers" },
            "dinner": { "name": "Meal Name", "ingredients": ["ing 1", "ing 2"], "biomarkerImpact": "Why this meal helps specific biomarkers" }
          },
          "nutritionalRules": [
            "Clinical nutritional rule 1",
            "Clinical nutritional rule 2"
          ]
        }
      `;
    } else if (task === "workout_plan") {
      prompt = `
        You are a clinical exercise physiologist.
        Create a customized workout protocol specifically designed to improve metabolic insulin sensitivity and cardiovascular lipid clearance.
        
        Patient Profile: ${JSON.stringify(profileData || {})}
        Biomarkers: ${JSON.stringify(reportData?.biomarkers || [])}
        
        The plan should include cardiovascular pacing, progressive resistance suggestions, and active recovery, along with physiological safety markers.
        
        Return a JSON object:
        {
          "planName": "Workout protocol name",
          "weeklyStructure": "E.g. 3 resistance days, 2 cardio days",
          "sessions": [
            { "name": "Session title", "type": "Resistance/Cardio", "exercises": ["ex 1", "ex 2"], "physiologicalFocus": "Why this helps their biomarkers" }
          ],
          "safetyGuidelines": [
            "Safety guideline 1",
            "Safety guideline 2"
          ]
        }
      `;
    } else {
      prompt = `
        You are a preventive wellness coach. Create a list of 4 highly focused, micro-habits / health goals based on:
        Patient: ${JSON.stringify(profileData || {})}
        Report: ${JSON.stringify(reportData || {})}
        
        Return a JSON object:
        {
          "goals": [
            { "title": "Goal title", "biomarkerTarget": "Which marker", "protocol": "Action step", "trackingMetric": "How to track" }
          ]
        }
      `;
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }));

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      source: "gemini-api",
      result: parsedResponse,
    });

  } catch (error: any) {
    console.error("Clinical Intelligence API error:", error);
    res.status(500).json({
      error: "Failed to generate Clinical Intelligence.",
      details: error.message,
    });
  }
});

function generateSimulatedChatResponse(message: string, history: any[]) {
  const lowercase = message.toLowerCase();
  if (lowercase.includes("hello") || lowercase.includes("hi")) {
    return "Hello! I am your clinical AI assistant. I can help explain your lab biomarkers, suggest wellness routines, or analyze health trends. How can I guide your wellness journey today?";
  }
  if (lowercase.includes("cholesterol") || lowercase.includes("ldl")) {
    return "LDL (Low-Density Lipoprotein) is often called 'bad' cholesterol because elevated levels can gradually build up in arterial walls. To manage this educationally, consider increasing soluble fiber (like oats, beans, and brussels sprouts), adding avocados or walnuts, and aiming for at least 150 minutes of moderate aerobic cardiovascular exercise per week. Would you like a customized heart-healthy nutrition guide?";
  }
  if (lowercase.includes("glucose") || lowercase.includes("sugar")) {
    return "Your blood glucose measures the concentration of sugar in your bloodstream. Slightly elevated fasting glucose (e.g., above 100 mg/dL) suggests metabolic monitoring. Focus on high-fiber complex carbohydrates (like quinoa and oats) paired with high-quality proteins and healthy fats to slow sugar absorption, and consider standard resistance training to improve muscle insulin sensitivity.";
  }
  if (lowercase.includes("diet") || lowercase.includes("eat") || lowercase.includes("recipe")) {
    return "A highly supportive nutrition framework includes leafy greens, antioxidant-rich berries, high-quality lean proteins (or legumes like lentils), and fiber-rich ancient grains. Staying hydrated with 2.5+ liters of water daily is also vital to keep renal filtration metrics (like creatinine and BUN) in optimal balance.";
  }
  return "I understand your question regarding that wellness indicator. From an educational perspective, that biomarker reflects systemic physiological homeostasis. It is highly responsive to regular physical exercise, anti-inflammatory whole-foods, consistent circadian sleep routines, and steady hydration. I highly encourage discussing this with your primary care provider to map these suggestions to your exact clinical biology.";
}

function generateSimulatedImageAnalysis(category: string) {
  if (category === "food") {
    return {
      title: "Mediterranean Grain & Protein Plate",
      description: "Visual analysis shows a vibrant, highly nutritious meal featuring a base of ancient grains, grilled lean chicken breast slices, mixed cherry tomatoes, roasted broccoli florets, and a light dollop of hummus. The color density is excellent, indicating high micronutrient and antioxidant variety.",
      insights: [
        {
          parameter: "Macronutrient Balance",
          observation: "High-quality lean protein, complex slow-release carbohydrates, and healthy monounsaturated fats.",
          clinicalImplication: "Extremely beneficial for steady glycemic control, sustained muscle protein synthesis, and endothelial support."
        },
        {
          parameter: "Dietary Soluble Fiber",
          observation: "Rich in roasted broccoli and ancient grain husks.",
          clinicalImplication: "Crucial for accelerating digestive transit, lowering serum LDL cholesterol, and supporting gut microbiota."
        }
      ],
      recommendations: [
        "Maintain this outstanding ratio of protein to fiber to support muscle repair and stable blood sugar.",
        "Consider adding a light drizzle of extra virgin olive oil to increase fat-soluble vitamin absorption.",
        "Keep refined carbohydrate sources minimal to maintain high vascular metabolic resilience."
      ],
      disclaimer: "Disclaimer: This visual evaluation is purely educational and simulated. It does not replace dietitian consultation."
    };
  }
  if (category === "prescription" || category === "label") {
    return {
      title: "Clinical Supplement Label Scan",
      description: "Text extraction detects an active organic Vitamin D3 (Cholecalciferol, 5000 IU) formulation with added Vitamin K2 (MK-7, 100 mcg). The bottle is standard amber glass, protecting key compound structures from high-energy UV light degradation.",
      insights: [
        {
          parameter: "Vitamin D3 + K2 Synergy",
          observation: "Cholecalciferol matched with menaquinone-7.",
          clinicalImplication: "Vitamin D3 enhances calcium absorption in the bowel, while Vitamin K2 directs calcium specifically to bone tissue, preventing vascular calcification."
        },
        {
          parameter: "High Dosage Warning",
          observation: "5000 IU is a potent daily therapeutic dosage.",
          clinicalImplication: "Highly effective for correcting moderate-to-severe Vitamin D deficiencies, but serum calcium levels should be monitored to prevent hypercalcemia."
        }
      ],
      recommendations: [
        "Take with a fat-containing meal (like eggs, salmon, or avocado) as Vitamin D is highly lipophilic (fat-soluble).",
        "Consider getting a follow-up 25-hydroxyvitamin D blood panel in 8-12 weeks to calibrate dosage.",
        "Avoid co-ingestion with heavy calcium carbonate supplements unless specifically directed by a clinical physician."
      ],
      disclaimer: "Disclaimer: This AI label analysis is for educational guidance only. Always confirm supplement protocols with your personal physician."
    };
  }
  return {
    title: "General Fitness & Lifestyle Capture",
    description: "Multi-parameter vision analysis confirms a high-contrast workout log or physical routine tracker. Visual layout suggests active cardiovascular training blocks alternated with progressive overload resistance metrics.",
    insights: [
      {
        parameter: "Training Density",
        observation: "Structured hypertrophy ranges paired with high-intensity aerobic pacing blocks.",
        clinicalImplication: "Promotes mitochondrial density, cardiac stroke volume expansion, and exceptional systemic insulin receptor sensitivity."
      }
    ],
    recommendations: [
      "Ensure muscle repair is supported with 1.6-2.0g of protein per kg of body weight daily.",
      "Integrate deep diaphragmatic breathing post-workout to quickly down-regulate sympathetic neurological tone.",
      "Calibrate hydration with added sodium/potassium electrolytes on intensive perspiration days."
    ],
    disclaimer: "Disclaimer: This visual audit is simulated for educational purposes. It is not an athletic training plan."
  };
}

function generateSimulatedIntelligenceResult(task: string, reportData: any, profileData: any) {
  const patientName = profileData?.name || "Alex Mercer";
  if (task === "doctor_letter") {
    return {
      subject: `Patient Portal: Clinical Lab Discussion Request (Patient: ${patientName})`,
      salutation: "Dear Dr. Evelyn Vance, MD,",
      body: `I am writing to share the results of my recent blood panel conducted on ${reportData?.metadata?.testDate || "2026-06-15"}. The digital analysis highlighted a few markers that fall outside optimal ranges. Specifically, my LDL Cholesterol is elevated at 142 mg/dL, and my Fasting Blood Glucose sits at 104 mg/dL. Conversely, my liver enzymes (ALT: 32 U/L), kidney filtration (Creatinine: 0.95 mg/dL), and immune markers (WBC: 6.8 x10^3/uL) reside in excellent physiological ranges. I have already initiated a supportive diet high in soluble fiber and structured cardiovascular cardio blocks to support my blood lipids and metabolic profile. I would appreciate reviewing these numbers and discuss if any additional follow-up assessments are recommended at my next clinic checkup.`,
      questions: [
        "Are there specific secondary indicators, like HbA1c or an ApoB lipofraction, that would give us a more precise long-term cardiovascular and metabolic risk assessment?",
        "Do you recommend any specific target range for my LDL based on my overall lifestyle, or should we continue with purely therapeutic lifestyle modifications for the next 3 to 6 months?"
      ],
      closing: "Thank you for your dedicated care and guidance.\n\nSincerely,\n\n" + patientName
    };
  }
  if (task === "meal_plan") {
    return {
      focus: "Cardioprotective Lipid Clearance & Glycemic Stability",
      meals: {
        breakfast: {
          name: "High-Fiber Steel-Cut Oats with Berries & Flaxseeds",
          ingredients: ["1/2 cup steel-cut oats", "1/2 cup organic blueberries", "1 tbsp ground flaxseeds", "1 scoop pea protein isolate", "Cinnamon"],
          biomarkerImpact: "Oat beta-glucans physically bind bile acids in the intestine, driving hepatic clearance of serum LDL cholesterol, while organic fiber prevents glucose spiking."
        },
        lunch: {
          name: "Organic Spinach Salad with Grilled Salmon & Avocado",
          ingredients: ["4 oz wild-caught salmon", "2 cups baby spinach", "1/2 Hass avocado", "Pumpkin seeds", "Lemon juice dressing"],
          biomarkerImpact: "High concentrations of EPA/DHA Omega-3 fatty acids actively lower triglycerides and elevate high-density cardiosupportive lipids."
        },
        snack: {
          name: "Hummus with Celery & Cucumber Spears",
          ingredients: ["3 tbsp roasted garlic hummus", "2 celery ribs", "1 Persian cucumber"],
          biomarkerImpact: "An ultra-low glycemic load snack that delivers essential water-soluble minerals without taxing pancreas insulin secretion."
        },
        dinner: {
          name: "Cajun Tofu & Quinoa Bowl with Sautéed Broccoli",
          ingredients: ["5 oz extra firm tofu", "1/2 cup cooked quinoa", "1 cup steamed organic broccoli florets", "Garlic & ginger glaze"],
          biomarkerImpact: "Cruciferous broccoli delivers glucosinolates which trigger glutathione pathway upregulation to support liver enzyme cellular stability."
        }
      },
      nutritionalRules: [
        "Aim for a minimum of 35 grams of total dietary fiber daily, ensuring at least 15 grams is soluble fiber.",
        "Ensure all carbohydrates consumed are complex and structurally intact (whole-foods) to smooth out pancreatic insulin demands."
      ]
    };
  }
  if (task === "workout_plan") {
    return {
      planName: "Metabolic Insulin Resensitization & Lipid Clearance Protocol",
      weeklyStructure: "3 Progressive Overload Resistance Days, 2 Zone 2 Aerobic Base Days",
      sessions: [
        {
          name: "Lower-Body Compound Strength Block",
          type: "Resistance Hypertrophy",
          exercises: ["Goblet Squats (3 sets x 10 reps)", "Dumbbell Romanian Deadlifts (3 sets x 12 reps)", "Bodyweight Glute Bridges (3 sets x 15 reps)"],
          physiologicalFocus: "Contracting major lower-body skeletal muscle groups triggers GLUT4 transporter translocation to cell membranes, pulling glucose out of the blood independently of insulin."
        },
        {
          name: "Zone 2 Low-Intensity Aerobic Base",
          type: "Cardiovascular Cardio",
          exercises: ["45 Minutes of Incline Treadmill Walking or Road Cycling", "Heart rate kept strictly within 120-135 BPM (60-70% Max HR)"],
          physiologicalFocus: "Maximizes skeletal muscle mitochondrial fatty-acid oxidation, increasing cellular mitochondrial biogenesis and accelerating LDL clearance."
        }
      ],
      safetyGuidelines: [
        "If fasting blood glucose is below 80 mg/dL prior to training, ingest a small complex-carb snack to prevent exercise-induced hypoglycemia.",
        "Ensure adequate hydration of at least 750ml water per hour of training to maintain plasma volume and renal filtration pressures."
      ]
    };
  }
  return {
    goals: [
      {
        title: "Soluble Fiber Escalation",
        biomarkerTarget: "LDL Cholesterol",
        protocol: "Incorporate 1 tablespoon of ground flaxseeds or chia seeds into your daily breakfast.",
        trackingMetric: "Aim for 7 out of 7 days logged on your wellness tracker."
      },
      {
        title: "Post-Meal Active Transit",
        biomarkerTarget: "Fasting Blood Glucose",
        protocol: "Take a continuous, light 10-minute walk within 20 minutes of finishing dinner.",
        trackingMetric: "Measure post-dinner blood glucose 1-hour post-walk to see insulin-independent disposal."
      }
    ]
  };
}


// Helper functions for mock data generation to support direct out-of-the-box working states
function generateRealisticMockReport(fileName: string) {
  const isLipid = fileName.toLowerCase().includes("lipid") || fileName.toLowerCase().includes("cholesterol");
  const isKidney = fileName.toLowerCase().includes("kidney") || fileName.toLowerCase().includes("renal");
  
  // Set up realistic dates
  const testDate = "2026-06-15";
  const reportDate = "2026-06-16";

  const biomarkers = [
    {
      name: "Hemoglobin",
      category: "Blood Health",
      value: 11.8,
      unit: "g/dL",
      normalRange: "13.5 - 17.5",
      status: "low",
      explanation: "Hemoglobin is the iron-containing protein in red blood cells that carries oxygen from your lungs to the rest of your body.",
      whyItMatters: "Adequate hemoglobin ensures your muscles, brain, and other vital organs receive the oxygen required to function efficiently.",
      possibleCauses: "A slightly lower level could point to dietary iron deficiency, mild dehydration, or low vitamin B12 levels.",
      lifestyleSuggestions: "Incorporate more iron-rich foods such as spinach, lentils, lean poultry, and pumpkin seeds, and pair them with Vitamin C to enhance absorption.",
      followUpQuestions: "What other tests (like serum ferritin or iron saturation) should we consider to check my iron storage levels?"
    },
    {
      name: "LDL Cholesterol",
      category: "Heart Health",
      value: 142.0,
      unit: "mg/dL",
      normalRange: "< 100.0",
      status: "high",
      explanation: "Low-Density Lipoprotein is often referred to as 'bad' cholesterol because elevated levels can lead to plaque buildup in arteries.",
      whyItMatters: "Managing LDL levels is critical to maintaining flexible, clean blood vessels and minimizing long-term cardiovascular stress.",
      possibleCauses: "Regular intake of saturated/trans fats, sedentary habits, or genetic predisposition can raise LDL levels.",
      lifestyleSuggestions: "Swap saturated fats for healthy fats (like avocados, extra virgin olive oil, and walnuts), and aim for 30 minutes of moderate cardio daily.",
      followUpQuestions: "How do my HDL and triglycerides compare, and is a lipid fraction profile recommended for me?"
    },
    {
      name: "Fasting Blood Glucose",
      category: "Metabolic Health",
      value: 104.0,
      unit: "mg/dL",
      normalRange: "70.0 - 99.0",
      status: "high",
      explanation: "Fasting blood glucose measures the concentration of sugar in your bloodstream after an overnight fast of 8-12 hours.",
      whyItMatters: "Stable blood sugar levels are vital for sustained daily energy, mood balance, and minimizing hormonal strain on your pancreas.",
      possibleCauses: "Recent stress, low sleep quality, high refined-carbohydrate consumption, or early insulin resistance.",
      lifestyleSuggestions: "Focus on complex carbs with high fiber (quinoa, oats, non-starchy vegetables) and incorporate strength training to improve insulin sensitivity.",
      followUpQuestions: "Would testing my HbA1c give us a clearer, three-month average view of my blood sugar regulation?"
    },
    {
      name: "ALT (Alanine Aminotransferase)",
      category: "Liver Health",
      value: 32.0,
      unit: "U/L",
      normalRange: "7.0 - 56.0",
      status: "normal",
      explanation: "ALT is an enzyme found primarily in liver cells. When liver cells are stressed or damaged, they release ALT into the blood stream.",
      whyItMatters: "Normal ALT levels indicate healthy, active liver cellular tissue capable of detoxifying and metabolizing nutrients safely.",
      possibleCauses: "Within normal limits. Elevated ALT is often associated with high processed foods, heavy alcohol intake, or certain medications.",
      lifestyleSuggestions: "Support liver health by drinking plenty of water, minimizing added sugars, and eating cruciferous vegetables like broccoli and Brussels sprouts.",
      followUpQuestions: "Are my other liver enzymes, such as AST and Bilirubin, also stable?"
    },
    {
      name: "Creatinine",
      category: "Kidney Health",
      value: 0.95,
      unit: "mg/dL",
      normalRange: "0.60 - 1.20",
      status: "normal",
      explanation: "Creatinine is a chemical waste molecule that is generated from muscle metabolism and cleared continuously by healthy kidneys.",
      whyItMatters: "Steady creatinine excretion shows that the kidneys are filtering blood at a robust, normal rate.",
      possibleCauses: "Healthy kidney function. Exceptionally high values might suggest dehydration, intense weightlifting, or renal strain.",
      lifestyleSuggestions: "Maintain consistent daily hydration (around 2-3 liters of water), and consume a balanced protein diet.",
      followUpQuestions: "How does my estimated Glomerular Filtration Rate (eGFR) look based on this creatinine value?"
    },
    {
      name: "White Blood Cell Count (WBC)",
      category: "Immune Indicators",
      value: 6.8,
      unit: "x10^3/uL",
      normalRange: "4.5 - 11.0",
      status: "normal",
      explanation: "White blood cells are the frontline defenders of your immune system, responsible for targeting infections and managing cellular repair.",
      whyItMatters: "A normal WBC count indicates that your body is in immune equilibrium, without active high-grade infection or bone marrow stress.",
      possibleCauses: "Normal healthy range.",
      lifestyleSuggestions: "Support immune health with 7-8 hours of quality sleep, a colorful intake of antioxidant berries, and stress management techniques.",
      followUpQuestions: "Does my WBC differential show a healthy balance of neutrophils, lymphocytes, and monocytes?"
    }
  ];

  return {
    metadata: {
      patientName: "Alex Mercer",
      age: "34",
      gender: "Male",
      hospital: "Evergreen Diagnostic Labs Center",
      doctor: "Dr. Evelyn Vance, MD",
      testDate,
      reportDate,
      confidenceScore: 98
    },
    healthScores: {
      overallWellnessScore: 76,
      bloodHealth: 82,
      kidneyHealth: 92,
      liverHealth: 88,
      heartHealth: 68,
      metabolicHealth: 64,
      immuneIndicators: 84
    },
    biomarkers,
    summary: "Alex's blood report indicates solid kidney, liver, and immune functions, with excellent cellular regeneration indexes. However, the analysis highlights mild nutritional iron indicators (low-normal Hemoglobin), along with elevated cardiovascular lipid stress (high LDL cholesterol) and slightly elevated fasting blood sugar (fasting glucose of 104 mg/dL, which sits in the pre-diabetic monitoring range). With intentional dietary adjustments, structured aerobic exercise, and deep hydration, these markers are highly modifiable.",
    riskIndicators: [
      {
        condition: "Cardiovascular Lipid Stress",
        riskLevel: "Moderate",
        description: "LDL cholesterol is elevated at 142 mg/dL. Over time, high LDL can lead to vessel stiffness. This is highly responsive to dietary fiber and healthy fats."
      },
      {
        condition: "Pre-diabetic Fasting Glucose Status",
        riskLevel: "Low",
        description: "Fasting glucose is 104 mg/dL, which slightly exceeds the optimal limit (<100 mg/dL). Increasing muscle insulin sensitivity via exercise and complex carbohydrates is highly recommended."
      }
    ]
  };
}

function performMockComparison(report1: any, report2: any) {
  return {
    scoreChange: {
      wellness: 6,
      blood: 4,
      kidney: 2,
      liver: 1,
      heart: 8,
      metabolic: 10,
      immune: 5
    },
    improvedMarkers: [
      {
        name: "LDL Cholesterol",
        previous: "154 mg/dL",
        current: "142 mg/dL",
        reason: "LDL showed a nice reduction from 154 to 142 mg/dL. This positive shift is likely associated with higher soluble fiber intake and consistent cardio."
      },
      {
        name: "Fasting Blood Glucose",
        previous: "114 mg/dL",
        current: "104 mg/dL",
        reason: "Glucose improved from 114 to 104 mg/dL. It remains slightly elevated, but the 10mg/dL reduction shows outstanding progress in cellular insulin sensitivity."
      }
    ],
    worsenedMarkers: [],
    overallProgressSummary: "Excellent overall health trajectory! The patient has achieved clear improvements across key markers. Heart and metabolic markers show robust progress, reflecting effective dietary adjustments and active lifestyle habits. Liver and kidney indicators remain exceptionally stable."
  };
}


// Start the Express server
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Starting Express server in development mode with Vite middleware...");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Starting Express server in production mode serving static assets...");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Attach WebSocket Server for real-time Voice Consult (Gemini Live API)
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const { pathname } = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (pathname === "/api/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (err) {
      console.error("Upgrade handling error:", err);
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs) => {
    console.log("Gemini Live WebSocket client connected");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured on the server. Rejecting Live Consult session.");
      clientWs.send(JSON.stringify({ error: "API Key Missing: Please provide your GEMINI_API_KEY in Settings > Secrets to unlock the Real-Time AI Voice Consult module." }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    try {
      // Connect to Gemini Live API
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: ["audio"] as any,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a professional, empathetic, and encouraging personal wellness and lifestyle voice coach. Help the patient understand general biochemical terms, explain biomarkers in simple terms, and suggest positive daily wellness micro-goals. Keep your answers conversational, concise (1-2 short sentences), and clinical yet accessible. Always maintain that you are an AI assistant helping with general knowledge, not a physician.",
        },
        callbacks: {
          onmessage: (message: any) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            try { clientWs.close(); } catch (e) {}
          },
          onerror: (err) => {
            console.error("Gemini Live API error:", err);
            clientWs.send(JSON.stringify({ error: "Gemini Live API error: " + err.message }));
          }
        }
      });

      // Handle message from client
      clientWs.on("message", (rawMsg) => {
        try {
          const parsed = JSON.parse(rawMsg.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" }
            });
          }
        } catch (err) {
          console.error("Error forwarding input to Gemini Live:", err);
        }
      });

      clientWs.on("close", () => {
        console.log("Client WebSocket connection closed. Closing Gemini Live session.");
        try {
          session.close();
        } catch (err) {
          // ignore
        }
      });

    } catch (err: any) {
      console.error("Failed to establish Gemini Live connection:", err);
      clientWs.send(JSON.stringify({ error: "Failed to connect to Gemini Live session: " + err.message }));
      clientWs.close();
    }
  });
}

startServer();
