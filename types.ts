
export enum CreditScoreRange {
  POOR = 'Poor (<630)',
  FAIR = 'Fair (630-689)',
  GOOD = 'Good (690-719)',
  EXCELLENT = 'Excellent (720+)',
}

export enum Lifestyle {
  COMMUTER = 'Daily Commuter',
  FAMILY = 'Family Adventures',
  OFFROAD = 'Off-road & Hauling',
  ECO_FRIENDLY = 'Eco-Conscious',
  PERFORMANCE = 'Performance Enthusiast',
}

export type UserInput = {
  monthlyIncome: number;
  creditScore: CreditScoreRange;
  downPayment: number;
  term: number;
  lifestyle: Lifestyle;
};

export interface SuggestedModel {
  name: string;
  estimatedMsrp: number;
  reasoning: string;
  imageUrl: string;
}

export interface PaymentPlan {
  planType: 'Finance' | 'Lease';
  vehicleName: string;
  monthlyPayment: number;
  term: number;
  apr: number;
  totalCost: number;
  pros: string[];
  cons: string[];
}

export interface ApiResponse {
  suggestedModels: SuggestedModel[];
  paymentPlans: PaymentPlan[];
  financialTips: string[];
}
