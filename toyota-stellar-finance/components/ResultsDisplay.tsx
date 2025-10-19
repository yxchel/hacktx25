import React, { useState } from 'react';
import { ApiResponse, SuggestedModel, PaymentPlan, CostBreakdownItem } from '../types';
import { CheckCircleIcon, DollarSignIcon, SparklesIcon, XCircleIcon } from './icons';
import { TERM_OPTIONS } from '../constants';

interface ResultsDisplayProps {
  data: ApiResponse;
  selectedVehicle: SuggestedModel;
  onVehicleSelect: (vehicle: SuggestedModel) => void;
  term: number;
  onTermChange: (newTerm: number) => void;
  isRecalculating: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const PlanDetail: React.FC<{ plan: PaymentPlan, isLoading: boolean }> = ({ plan, isLoading }) => {
    // Define which items contribute to the total cost to color them
    const totalCostComponents = [
        'Down Payment', 
        'Total Monthly Payments', 
        'Total Cost',
        'Due at Signing',
        'Total Lease Cost'
    ];

    // Define the exact order for display to group items logically
    const financeOrder = ['Vehicle Price (MSRP)', 'Principal Loan Amount', 'Total Interest Paid', 'Down Payment', 'Total Monthly Payments', 'Total Cost'];
    const leaseOrder = ['Vehicle Price (MSRP)', 'Est. Disposition Fee', 'Due at Signing', 'Total Monthly Payments', 'Total Lease Cost'];
    const displayOrder = plan.planType === 'Finance' ? financeOrder : leaseOrder;
    
    const sortedBreakdown = [...plan.costBreakdown].sort((a, b) => {
        return displayOrder.indexOf(a.name) - displayOrder.indexOf(b.name);
    });

    return (
        <div 
            className="bg-slate-800/50 p-6 rounded-lg animate-fade-in h-full flex flex-col relative"
        >
            {isLoading && (
                <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-white font-semibold">Recalculating...</span>
                </div>
            )}
            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-20' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
                    <div>
                        <p className="text-sm text-slate-400">Monthly Payment</p>
                        <p className="text-3xl font-bold text-indigo-400">{formatCurrency(plan.monthlyPayment)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Term</p>
                        <p className="text-3xl font-bold text-white">{plan.term} <span className="text-lg font-normal">months</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Est. APR</p>
                        <p className="text-3xl font-bold text-white">{plan.apr.toFixed(2)}%</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3 text-green-400">Pros</h4>
                        <ul className="space-y-2">
                            {plan.pros.map((pro, i) => (
                            <li key={i} className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">{pro}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg mb-3 text-red-400">Cons</h4>
                        <ul className="space-y-2">
                            {plan.cons.map((con, i) => (
                            <li key={i} className="flex items-start">
                                <XCircleIcon className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">{con}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="mt-6 border-t border-slate-700 pt-6 flex-grow flex flex-col">
                    <h4 className="font-semibold text-lg mb-3 text-slate-200">Cost Breakdown</h4>
                    <ul className="space-y-2 text-sm flex-grow">
                        {sortedBreakdown.map((item: CostBreakdownItem, i) => {
                            const isTotalComponent = totalCostComponents.includes(item.name);
                            const isFinalTotal = item.name === 'Total Cost' || item.name === 'Total Lease Cost';
                            
                            let liClasses = 'flex justify-between items-center py-1';
                            let valueClasses = 'font-mono font-semibold';

                            if (isFinalTotal) {
                                liClasses += ' text-white font-bold pt-2 border-t border-slate-700 mt-2';
                                valueClasses += ' text-white text-base';
                            } else if (isTotalComponent) {
                                liClasses += ' text-indigo-300';
                                valueClasses += ' text-indigo-300';
                            } else {
                                liClasses += ' text-slate-300';
                                valueClasses += ' text-white';
                            }

                            return (
                            <li key={i} className={liClasses}>
                                <span>{item.name}</span>
                                <span className={valueClasses}>{formatCurrency(item.value)}</span>
                            </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, selectedVehicle, onVehicleSelect, term, onTermChange, isRecalculating }) => {
  const financePlan = selectedVehicle.paymentPlans.find(p => p.planType === 'Finance');
  const leasePlan = selectedVehicle.paymentPlans.find(p => p.planType === 'Lease');

  // To re-trigger animation on vehicle change
  const [vehicleKey, setVehicleKey] = useState(selectedVehicle.name);
  React.useEffect(() => {
    setVehicleKey(selectedVehicle.name);
  }, [selectedVehicle]);


  return (
    <div className="mt-16 space-y-12 animate-fade-in-up">
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Personalized Options</h2>
        <p className="mt-4 text-lg leading-8 text-slate-400">
          Based on your profile, here are three stellar Toyota models for you to consider.
        </p>
      </div>
      
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl space-y-4">
        <div className="flex flex-wrap justify-center gap-2 bg-slate-800/50 p-2 rounded-xl">
          {data.suggestedModels.map((vehicle) => (
            <button
              key={vehicle.name}
              onClick={() => onVehicleSelect(vehicle)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
                selectedVehicle.name === vehicle.name ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
              }`}
            >
              {vehicle.name}
            </button>
          ))}
        </div>
        
        <div>
           <label className="text-sm font-medium text-slate-300 mb-2 block text-center">Adjust Loan/Lease Term (Months)</label>
            <div className="flex items-center justify-center space-x-2 bg-slate-700/50 p-1 rounded-lg max-w-sm mx-auto">
                {TERM_OPTIONS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => onTermChange(t)}
                        disabled={isRecalculating}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed ${
                            term === t ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600 disabled:hover:bg-transparent'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
      </div>


      <div 
          key={vehicleKey}
          className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/20 animate-fade-in-up"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white">{selectedVehicle.name}</h3>
          <p className="text-indigo-300 font-semibold">Est. MSRP: {formatCurrency(selectedVehicle.estimatedMsrp)}</p>
        </div>
        <p className="text-center text-slate-300 max-w-3xl mx-auto mb-8">{selectedVehicle.reasoning}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {financePlan && (
              <div>
                <h4 className="text-2xl font-semibold text-center text-white mb-4">Finance Plan</h4>
                <PlanDetail plan={financePlan} isLoading={isRecalculating} />
              </div>
            )}
            {leasePlan && (
              <div>
                <h4 className="text-2xl font-semibold text-center text-white mb-4">Lease Plan</h4>
                <PlanDetail plan={leasePlan} isLoading={isRecalculating} />
              </div>
            )}
        </div>

      </div>

      <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl">
        <h3 className="text-2xl font-bold text-center text-white mb-6 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-indigo-400"/>
            Your Financial Co-Pilot Tips
        </h3>
        <ul className="space-y-4 max-w-3xl mx-auto">
          {data.financialTips.map((tip, i) => (
            <li key={i} className="flex items-start p-4 bg-slate-800/50 rounded-lg">
                <DollarSignIcon className="w-5 h-5 text-indigo-400 mr-3 mt-1 flex-shrink-0"/>
                <span className="text-slate-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;