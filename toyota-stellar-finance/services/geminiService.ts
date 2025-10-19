import { GoogleGenAI, Type } from "@google/genai";
import { ApiResponse, PaymentPlan, SuggestedModel, UserInput } from "../types";

// FIX: Initialize GoogleGenAI with API Key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const paymentPlanItemSchema = {
  type: Type.OBJECT,
  properties: {
    planType: { type: Type.STRING, description: "Type of plan, either 'Finance' or 'Lease'." },
    monthlyPayment: { type: Type.NUMBER, description: "Estimated monthly payment, rounded to the nearest dollar." },
    term: { type: Type.NUMBER, description: "The length of the plan in months (must match user input)." },
    apr: { type: Type.NUMBER, description: "Estimated Annual Percentage Rate based on user's credit score." },
    costBreakdown: {
      type: Type.ARRAY,
      description: "A breakdown of the costs involved.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the cost item (e.g., 'MSRP', 'Down Payment', 'Taxes & Fees', 'Total Amount')." },
          value: { type: Type.NUMBER, description: "Value of the cost item." }
        },
        required: ["name", "value"]
      }
    },
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key benefits (pros) of this payment plan." },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key drawbacks (cons) of this payment plan." }
  },
  required: ["planType", "monthlyPayment", "term", "apr", "costBreakdown", "pros", "cons"]
};

const mainSchema = {
    type: Type.OBJECT,
    properties: {
      suggestedModels: {
        type: Type.ARRAY,
        description: "A list of 3 suggested Toyota models for the user.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The name of the Toyota model (e.g., 'Toyota Camry')." },
            estimatedMsrp: { type: Type.NUMBER, description: "Estimated Manufacturer's Suggested Retail Price." },
            reasoning: { type: Type.STRING, description: "A paragraph explaining why this model is a good fit for the user's lifestyle and budget." },
            paymentPlans: {
              type: Type.ARRAY,
              description: "A list of two payment plan options: one 'Finance' and one 'Lease'.",
              items: paymentPlanItemSchema,
            }
          },
          required: ["name", "estimatedMsrp", "reasoning", "paymentPlans"]
        }
      },
      financialTips: {
        type: Type.ARRAY,
        description: "A list of 3-5 actionable, personalized financial tips for the user.",
        items: { type: Type.STRING }
      }
    },
    required: ["suggestedModels", "financialTips"]
  };

const financialFormulasPrompt = (term: number) => `
  **CRITICAL:** For each plan, provide a detailed and accurate cost breakdown. Use the following financial formulas for all calculations to ensure accuracy.

  - **For the 'Finance' plan**, follow these calculation steps precisely:
    1.  **Principal (P)**: Calculate as \`P = Vehicle Price (MSRP) - Down Payment\`.
    2.  **Monthly Interest Rate (r)**: Calculate as \`r = (APR / 100) / 12\`.
    3.  **Term in Months (t)**: Use the user's provided term (${term}).
    4.  **Monthly Payment (M)**: Use the standard loan amortization formula: \`M = P * [r * (1 + r)^t] / [(1 + r)^t - 1]\`. The 'monthlyPayment' field in the response should be this value, rounded to the nearest dollar.
    5.  **Total Monthly Payments**: Calculate as \`M * t\`.
    6.  **Total Interest Paid**: Calculate as \`Total Monthly Payments - P\`.
    7.  **Total Cost**: Calculate as \`Total Monthly Payments + Down Payment\`.

  - The \`costBreakdown\` array for the 'Finance' plan MUST include these items in this exact order:
    1.  'Vehicle Price (MSRP)': The estimated MSRP.
    2.  'Principal Loan Amount': The value calculated in step 1 (P).
    3.  'Total Interest Paid': The value calculated in step 6.
    4.  'Down Payment': The user's provided down payment (positive number).
    5.  'Total Monthly Payments': The value calculated in step 5.
    6.  'Total Cost': The value calculated in step 7.

  - **For the 'Lease' plan**, the breakdown MUST include these items in this exact order:
    1.  'Vehicle Price (MSRP)': The estimated MSRP of the vehicle.
    2.  'Est. Disposition Fee': Include a typical estimated disposition fee (e.g., $350).
    3.  'Due at Signing': The user's provided down payment (also known as capital cost reduction).
    4.  'Total Monthly Payments': Calculated as (monthly payment * term).
    5.  'Total Lease Cost': The final item, calculated as the sum of 'Due at Signing' and 'Total Monthly Payments'. This represents the total cost to lease the vehicle for the term.
`;


export const generateFinancePlan = async (userInput: UserInput): Promise<ApiResponse> => {
  const prompt = `
    You are an expert financial advisor for Toyota. Analyze the following user's financial and lifestyle profile to recommend suitable Toyota vehicles and financing options.

    User Profile:
    - Monthly Income: $${userInput.monthlyIncome}
    - Credit Score: ${userInput.creditScore}
    - Down Payment: $${userInput.downPayment}
    - Preferred Loan/Lease Term: ${userInput.term} months
    - Primary Lifestyle: "${userInput.lifestyle}"

    Based on this profile, please provide:
    1.  Exactly three distinct and diverse Toyota model suggestions that fit the user's lifestyle and financial situation. It is critical that these suggestions are varied. For example, instead of suggesting three similar SUVs for a family, suggest a mix like an SUV, a minivan, and maybe a large sedan. The goal is to give the user a real choice between different types of vehicles. For each model:
        - Provide a realistic estimated MSRP.
        - Explain the reasoning for the recommendation.
        - Create two payment plans: one for financing and one for leasing, using the user's preferred term of ${userInput.term} months.
        - For each plan, calculate an estimated monthly payment and a realistic APR based on the user's credit score.

    2.  ${financialFormulasPrompt(userInput.term)}

    3.  A list of 3-5 actionable, personalized financial tips for the user.

    Adhere strictly to the provided JSON schema for the response. Ensure all financial calculations are reasonable and the cost breakdowns are structured exactly as specified above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mainSchema,
      },
    });

    const jsonText = response.text.trim();
    const jsonStartIndex = jsonText.indexOf('```json');
    const jsonEndIndex = jsonText.lastIndexOf('```');
    
    let parsableText = jsonText;
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      parsableText = jsonText.substring(jsonStartIndex + 7, jsonEndIndex);
    }
    
    const data: ApiResponse = JSON.parse(parsableText);
    return data;
  } catch (error) {
    console.error("Error generating finance plan:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get financial plan from Gemini: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the financial plan.");
  }
};


export const recalculatePlans = async (vehicle: SuggestedModel, userInput: UserInput): Promise<PaymentPlan[]> => {
  const prompt = `
    You are an expert financial advisor for Toyota. A user is considering a '${vehicle.name}' with an estimated MSRP of $${vehicle.estimatedMsrp}.

    Their financial profile is:
    - Monthly Income: $${userInput.monthlyIncome}
    - Credit Score: ${userInput.creditScore}
    - Down Payment: $${userInput.downPayment}

    The user wants to see new payment options for a different term length.
    **New Preferred Loan/Lease Term: ${userInput.term} months**

    Please recalculate and provide exactly two updated payment plans (one 'Finance', one 'Lease') for the '${vehicle.name}' based on this new term.

    ${financialFormulasPrompt(userInput.term)}

    Adhere strictly to the provided JSON schema for the response. The response should be an array containing exactly two payment plan objects.
  `;
  
  const schema = {
      type: Type.ARRAY,
      items: paymentPlanItemSchema
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    // It is possible the model returns markdown with json.
    const jsonStartIndex = jsonText.indexOf('```json');
    const jsonEndIndex = jsonText.lastIndexOf('```');
    
    let parsableText = jsonText;
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      parsableText = jsonText.substring(jsonStartIndex + 7, jsonEndIndex);
    }
    
    const data: PaymentPlan[] = JSON.parse(parsableText);
    return data;

  } catch (error) {
    console.error("Error recalculating plans:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to recalculate plans from Gemini: ${error.message}`);
    }
    throw new Error("An unknown error occurred while recalculating plans.");
  }
};