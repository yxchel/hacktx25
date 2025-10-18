
import React, { useState } from 'react';
import FinanceFinder from './components/FinanceFinder';
import ResultsDisplay from './components/ResultsDisplay';
import Chatbot from './components/Chatbot';
import { UserInput, ApiResponse } from './types';
import { generateFinancePlan } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    try {
      const response = await generateFinancePlan(data);
      setApiResponse(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="mt-16 space-y-12 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-slate-700 rounded-md w-1/3 mx-auto"></div>
        <div className="h-4 bg-slate-700 rounded-md w-1/2 mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-2xl p-4 space-y-4">
            <div className="h-40 bg-slate-700 rounded-lg"></div>
            <div className="h-6 bg-slate-700 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded-md w-1/2"></div>
            <div className="h-10 bg-slate-700 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-200 starry-bg">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-5xl py-12 sm:py-24">
          <header className="text-center mb-12">
            <img src="https://www.freepnglogos.com/uploads/toyota-logo-png/toyota-logo-photo-14.png" alt="Toyota Logo" className="h-16 mx-auto mb-4 invert brightness-0" />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 bg-clip-text text-transparent">
              Stellar Finance
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Your intelligent co-pilot for navigating Toyota financing and leasing.
            </p>
          </header>
          
          <main>
            <FinanceFinder onSubmit={handleFormSubmit} isLoading={isLoading} />
            
            {isLoading && <LoadingSkeleton />}

            {error && (
              <div className="mt-12 text-center bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                <p className="font-bold">Error from the Cosmos</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {apiResponse && <ResultsDisplay data={apiResponse} />}
          </main>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
