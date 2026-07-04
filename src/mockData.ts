/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthReport, UserProfile, AppSettings } from "./types";

export const MOCK_PROFILE: UserProfile = {
  name: "Alex Mercer",
  email: "alex.mercer@healthlab.io",
  age: "34",
  gender: "Male",
  height: "178 cm",
  weight: "81 kg",
  bloodGroup: "O Positive (O+)",
  emergencyContact: "Sarah Mercer (+1 555-019-2834)",
  medicalConditions: "Mild seasonal asthma, border-line cholesterol tracking",
  allergies: "Penicillin, tree nuts",
  currentMedications: "Multivitamin daily, occasionally Albuterol inhaler PRN",
  lifestyle: "Sub-urban active lifestyle, runs twice a week, desk job with 7 hours sitting, moderate hydration, light caffeine user.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
};

export const MOCK_SETTINGS: AppSettings = {
  theme: "light",
  language: "English",
  emailNotifications: true,
  smsNotifications: false,
  weeklyReports: true,
  privacyMode: true
};

export const MOCK_REPORTS: HealthReport[] = [
  {
    id: "rep_01",
    fileName: "lipid_panel_jan2026.pdf",
    fileSize: "1.4 MB",
    uploadDate: "2026-01-10",
    status: "success",
    analysis: {
      metadata: {
        patientName: "Alex Mercer",
        age: "34",
        gender: "Male",
        hospital: "City Health General Diagnostics",
        doctor: "Dr. Evelyn Vance, MD",
        testDate: "2026-01-09",
        reportDate: "2026-01-10",
        confidenceScore: 97
      },
      healthScores: {
        overallWellnessScore: 70,
        bloodHealth: 78,
        kidneyHealth: 90,
        liverHealth: 86,
        heartHealth: 60,
        metabolicHealth: 54,
        immuneIndicators: 79
      },
      biomarkers: [
        {
          name: "LDL Cholesterol",
          category: "Heart Health",
          value: 154.0,
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
          name: "Triglycerides",
          category: "Heart Health",
          value: 195.0,
          unit: "mg/dL",
          normalRange: "< 150.0",
          status: "high",
          explanation: "Triglycerides are a type of fat (lipid) found in your blood. When you eat, your body converts any calories it doesn't need to use right away into triglycerides.",
          whyItMatters: "High triglycerides may contribute to hardening of the arteries or thickening of the artery walls, increasing heart stress.",
          possibleCauses: "Excess simple sugars, alcohol, high-calorie intake, or lack of physical movement.",
          lifestyleSuggestions: "Limit refined sugars, sweets, and alcohol. Incorporate foods high in Omega-3 fatty acids like salmon or flaxseeds.",
          followUpQuestions: "Should we check my insulin levels alongside triglycerides to assess metabolic rate?"
        },
        {
          name: "Fasting Blood Glucose",
          category: "Metabolic Health",
          value: 114.0,
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
          name: "Hemoglobin",
          category: "Blood Health",
          value: 11.4,
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
          name: "ALT (Alanine Aminotransferase)",
          category: "Liver Health",
          value: 30.0,
          unit: "U/L",
          normalRange: "7.0 - 56.0",
          status: "normal",
          explanation: "ALT is an enzyme found primarily in liver cells. When liver cells are stressed or damaged, they release ALT into the blood stream.",
          whyItMatters: "Normal ALT levels indicate healthy, active liver cellular tissue capable of detoxifying and metabolizing nutrients safely.",
          possibleCauses: "Within normal limits.",
          lifestyleSuggestions: "Support liver health by drinking plenty of water, minimizing added sugars, and eating cruciferous vegetables.",
          followUpQuestions: "Are my other liver enzymes stable?"
        },
        {
          name: "Creatinine",
          category: "Kidney Health",
          value: 0.98,
          unit: "mg/dL",
          normalRange: "0.60 - 1.20",
          status: "normal",
          explanation: "Creatinine is a chemical waste molecule that is generated from muscle metabolism and cleared continuously by healthy kidneys.",
          whyItMatters: "Steady creatinine excretion shows that the kidneys are filtering blood at a robust, normal rate.",
          possibleCauses: "Healthy kidney function.",
          lifestyleSuggestions: "Maintain consistent daily hydration (around 2-3 liters of water).",
          followUpQuestions: "How does my estimated Glomerular Filtration Rate (eGFR) look?"
        }
      ],
      summary: "Alex's earlier report from January showed significant metabolic and cardiovascular indicators. His LDL cholesterol and triglycerides were elevated, accompanied by fasting glucose in the pre-diabetic monitoring range (114 mg/dL). Hemoglobin was also slightly low at 11.4 g/dL. This suggested the need for focused fiber intake, increased hydration, and more structured cardiovascular workouts.",
      riskIndicators: [
        {
          condition: "Cardiovascular Lipid Stress",
          riskLevel: "High",
          description: "Elevated LDL (154 mg/dL) and Triglycerides (195 mg/dL) put elevated long-term stress on heart pathways."
        },
        {
          condition: "Pre-diabetic Metabolic Status",
          riskLevel: "Moderate",
          description: "Fasting glucose at 114 mg/dL indicates glucose regulation requires active attention."
        }
      ]
    }
  },
  {
    id: "rep_02",
    fileName: "comprehensive_blood_jun2026.pdf",
    fileSize: "1.8 MB",
    uploadDate: "2026-06-16",
    status: "success",
    analysis: {
      metadata: {
        patientName: "Alex Mercer",
        age: "34",
        gender: "Male",
        hospital: "Evergreen Diagnostic Labs Center",
        doctor: "Dr. Evelyn Vance, MD",
        testDate: "2026-06-15",
        reportDate: "2026-06-16",
        confidenceScore: 99
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
      biomarkers: [
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
          name: "Triglycerides",
          category: "Heart Health",
          value: 165.0,
          unit: "mg/dL",
          normalRange: "< 150.0",
          status: "high",
          explanation: "Triglycerides are blood lipids. Elevated levels are frequently driven by refined sugars and low high-density cholesterol ratio.",
          whyItMatters: "Lowering triglycerides from previous high levels shows strong metabolic recovery and vascular elasticity improvement.",
          possibleCauses: "Still slightly high due to starch intake, but showing outstanding reduction from 195 mg/dL.",
          lifestyleSuggestions: "Continue restricting refined grain items and fast carbs, while keeping up aerobic routine.",
          followUpQuestions: "How is my Triglyceride to HDL ratio?"
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
      ],
      summary: "Alex's blood report indicates solid kidney, liver, and immune functions, with excellent cellular regeneration indexes. However, the analysis highlights mild nutritional iron indicators (low-normal Hemoglobin), along with elevated cardiovascular lipid stress (high LDL cholesterol) and slightly elevated fasting blood sugar (fasting glucose of 104 mg/dL, which sits in the pre-diabetic monitoring range). Compared to January, both LDL (-12 mg/dL) and Fasting Glucose (-10 mg/dL) have improved significantly.",
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
    }
  }
];
