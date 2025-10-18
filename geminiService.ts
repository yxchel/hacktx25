
import { GoogleGenAI, Type } from '@google/genai';
import { UserInput, ApiResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    suggestedModels: {
      type: Type.ARRAY,
      description: 'A list of 2-3 suggested Toyota models.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'The name of the vehicle model.' },
          estimatedMsrp: { type: Type.NUMBER, description: 'A plausible estimated MSRP for the vehicle.' },
          reasoning: { type: Type.STRING, description: 'A brief explanation of why this model fits the user\'s lifestyle and budget.' },
          imageUrl: { type: Type.STRING, description: 'A placeholder image URL from picsum.photos, e.g., https://picsum.photos/400/300.' },
        },
        required: ['name', 'estimatedMsrp', 'reasoning', 'imageUrl'],
      },
    },
    paymentPlans: {
      type: Type.ARRAY,
      description: 'A list containing one finance and one lease plan for the top suggested vehicle.',
      items: {
        type: Type.OBJECT,
        properties: {
          planType: { type: Type.STRING, description: "Either 'Finance' or 'Lease'." },
          vehicleName: { type: Type.STRING, description: "The name of the vehicle this plan is for." },
          monthlyPayment: { type: Type.NUMBER, description: 'The calculated estimated monthly payment.' },
          term: { type: Type.INTEGER, description: 'The length of the plan in months.' },
          apr: { type: Type.NUMBER, description: 'Estimated Annual Percentage Rate (APR). For leases, this might be represented as a money factor equivalent or a promotional rate.' },
          totalCost: { type: Type.NUMBER, description: 'Estimated total cost over the full term of the plan.' },
          pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of pros for this plan, tailored to the user.' },
          cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of cons for this plan, tailored to the user.' },
        },
        required: ['planType', 'vehicleName', 'monthlyPayment', 'term', 'apr', 'totalCost', 'pros', 'cons'],
      },
    },
    financialTips: {
      type: Type.ARRAY,
      description: 'A list of 3 concise, actionable financial tips.',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['suggestedModels', 'paymentPlans', 'financialTips'],
};

export const generateFinancePlan = async (userInput: UserInput): Promise<ApiResponse> => {
  const prompt = `
You are "Stellar Finance Advisor", an expert AI for Toyota. Your goal is to provide personalized, clear, and helpful vehicle financing and leasing advice with a cool, slightly cosmic theme.

Given the user's financial profile and preferences, provide a JSON response. Do not include any markdown formatting or the \`\`\`json wrapper.

User Profile:
- Monthly Income: $${userInput.monthlyIncome}
- Credit Score: ${userInput.creditScore}
- Down Payment: $${userInput.downPayment}
- Preferred Term (months): ${userInput.term}
- Lifestyle: ${userInput.lifestyle}

Your task is to:
1.  Suggest 2-3 Toyota models that fit the user's budget and lifestyle. For each model, provide a name, a plausible estimated MSRP, a reason it fits, and a placeholder image URL from picsum.photos (e.g., https://picsum.photos/400/300).
2.  For the *first* suggested vehicle, create two distinct payment plan simulations: one for financing and one for leasing. Calculate realistic monthly payments based on the provided data. Assume a sample interest rate (APR) appropriate for the credit score (e.g., Excellent: 4-6%, Good: 6-8%, Fair: 8-12%, Poor: 12-18%). For pros and cons, be specific to the user's situation.
3.  Offer 3 concise, actionable financial tips to help the user make a better decision or improve their financial standing for a car purchase.

Respond ONLY with a valid JSON object matching the provided schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData as ApiResponse;
  } catch (error) {
    console.error("Error generating finance plan:", error);
    throw new Error("Failed to get financing options from AI. Please try again.");
  }
};
