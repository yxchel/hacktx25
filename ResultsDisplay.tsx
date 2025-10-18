
import React from 'react';
import { ApiResponse } from '../types';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './icons';

interface ResultsDisplayProps {
  data: ApiResponse;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {

  const SectionHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 mb-2">{title}</h2>
        {children && <p className="text-slate-400 max-w-2xl mx-auto">{children}</p>}
    </div>
  );

  return (
    <div className="space-y-16 mt-16">
      {/* Suggested Models */}
      <section id="models">
        <SectionHeader title="Your Constellation of Cars">
            Based on your profile, these Toyota models are a great match for your journey.
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.suggestedModels.map((model, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500 hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <img src={`${model.imageUrl}?random=${index}`} alt={model.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">{model.name}</h3>
                <p className="text-sm text-indigo-300 font-semibold mb-3">Est. MSRP: ${model.estimatedMsrp.toLocaleString()}</p>
                <p className="text-slate-400 text-sm">{model.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Plans */}
      <section id="plans">
        <SectionHeader title="Navigating Your Financial Cosmos">
            Here's a side-by-side look at financing vs. leasing for the {data.paymentPlans[0]?.vehicleName}.
        </SectionHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.paymentPlans.map((plan, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-1">{plan.planType}</h3>
              <p className="text-indigo-400 text-sm font-medium mb-4">{plan.vehicleName}</p>
              <div className="text-center bg-slate-900/50 rounded-lg p-4 mb-6">
                <p className="text-slate-400 text-sm">Estimated Monthly Payment</p>
                <p className="text-4xl font-bold text-white my-1">${plan.monthlyPayment.toLocaleString()}<span className="text-base font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-500">{plan.term} months at ~{plan.apr}% APR</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div>
                    <p className="text-xs text-slate-400">Total Cost</p>
                    <p className="text-lg font-semibold text-white">${plan.totalCost.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Term</p>
                    <p className="text-lg font-semibold text-white">{plan.term} months</p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <h4 className="font-semibold text-white mb-2">Pros</h4>
                  <ul className="space-y-2">
                    {plan.pros.map((pro, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-300">
                        <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" /> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Cons</h4>
                  <ul className="space-y-2">
                    {plan.cons.map((con, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-300">
                        <XCircleIcon className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" /> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Financial Tips */}
      <section id="tips">
        <SectionHeader title="Stellar Financial Advice">
            Expert tips to guide your financial journey to vehicle ownership.
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.financialTips.map((tip, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 flex items-start">
              <SparklesIcon className="w-8 h-8 text-indigo-400 mr-4 mt-1 flex-shrink-0" />
              <p className="text-slate-300 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResultsDisplay;
