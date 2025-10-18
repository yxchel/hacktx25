
import React, { useState } from 'react';
import { UserInput, CreditScoreRange, Lifestyle } from '../types';
import { CREDIT_SCORE_OPTIONS, LIFESTYLE_OPTIONS, TERM_OPTIONS } from '../constants';
import { CarIcon, DollarSignIcon, PercentIcon, SparklesIcon } from './icons';

interface FinanceFinderProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const FinanceFinder: React.FC<FinanceFinderProps> = ({ onSubmit, isLoading }) => {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [creditScore, setCreditScore] = useState<CreditScoreRange>(CreditScoreRange.GOOD);
  const [downPayment, setDownPayment] = useState(5000);
  const [term, setTerm] = useState(60);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(Lifestyle.COMMUTER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      monthlyIncome,
      creditScore,
      downPayment,
      term,
      lifestyle,
    });
  };

  const Slider = ({ id, label, value, min, max, step, onChange, format, icon }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; format: (val: number) => string; icon: React.ReactNode }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center text-sm font-medium text-slate-300">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      <div className="flex items-center space-x-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          disabled={isLoading}
        />
        <span className="text-indigo-300 font-semibold w-28 text-right">{format(value)}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/20">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Chart Your Financial Course</h2>
        <p className="text-center text-slate-400 -mt-6 mb-8">Tell us about yourself to discover your personalized Toyota options.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Slider
            id="monthly-income"
            label="Monthly Income"
            value={monthlyIncome}
            min={1000}
            max={20000}
            step={250}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            format={(val) => `$${val.toLocaleString()}`}
            icon={<DollarSignIcon className="w-5 h-5 text-indigo-400" />}
          />
          <Slider
            id="down-payment"
            label="Down Payment"
            value={downPayment}
            min={0}
            max={50000}
            step={500}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            format={(val) => `$${val.toLocaleString()}`}
            icon={<DollarSignIcon className="w-5 h-5 text-indigo-400" />}
          />
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <PercentIcon className="w-5 h-5 text-indigo-400" />
            <span className="ml-2">Credit Score</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CREDIT_SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setCreditScore(score)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
                  creditScore === score ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <CarIcon className="w-5 h-5 text-indigo-400" />
            <span className="ml-2">Primary Lifestyle</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {LIFESTYLE_OPTIONS.map((style) => (
               <button
                key={style}
                type="button"
                onClick={() => setLifestyle(style)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
                  lifestyle === style ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        
        <div>
           <label className="text-sm font-medium text-slate-300 mb-2 block">Loan/Lease Term (Months)</label>
            <div className="flex items-center justify-center space-x-2 bg-slate-700 p-1 rounded-lg">
                {TERM_OPTIONS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTerm(t)}
                        disabled={isLoading}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                            term === t ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing the Cosmos...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Find My Options
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FinanceFinder;
