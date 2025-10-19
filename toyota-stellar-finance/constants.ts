
import { CreditScoreRange, Lifestyle } from './types';

export const CREDIT_SCORE_OPTIONS: CreditScoreRange[] = [
  CreditScoreRange.POOR,
  CreditScoreRange.FAIR,
  CreditScoreRange.GOOD,
  CreditScoreRange.EXCELLENT,
];

export const LIFESTYLE_OPTIONS: Lifestyle[] = [
  Lifestyle.COMMUTER,
  Lifestyle.FAMILY,
  Lifestyle.OFFROAD,
  Lifestyle.ECO_FRIENDLY,
  Lifestyle.PERFORMANCE,
];

export const TERM_OPTIONS: number[] = [36, 48, 60, 72];
