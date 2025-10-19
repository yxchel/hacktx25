
import React, { useState } from 'react';
import FinanceFinder from './components/FinanceFinder';
import ResultsDisplay from './components/ResultsDisplay';
import Chatbot from './components/Chatbot';
import { UserInput, ApiResponse, SuggestedModel } from './types';
import { generateFinancePlan, recalculatePlans } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<SuggestedModel | null>(null);
  const [currentUserInput, setCurrentUserInput] = useState<UserInput | null>(null);
  const [term, setTerm] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setSelectedVehicle(null);
    setCurrentUserInput(data);
    setTerm(data.term);
    try {
      const response = await generateFinancePlan(data);
      setApiResponse(response);
      if (response.suggestedModels && response.suggestedModels.length > 0) {
        setSelectedVehicle(response.suggestedModels[0]);
      }
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

  const handleTermChange = async (newTerm: number) => {
    if (!currentUserInput || !selectedVehicle || !apiResponse) return;

    setTerm(newTerm);
    setIsRecalculating(true);
    setError(null);

    const updatedUserInput = { ...currentUserInput, term: newTerm };
    setCurrentUserInput(updatedUserInput);

    try {
      const newPlans = await recalculatePlans(selectedVehicle, updatedUserInput);

      const newSelectedVehicleState = {
        ...selectedVehicle,
        paymentPlans: newPlans,
      };

      const newSuggestedModels = apiResponse.suggestedModels.map(model =>
        model.name === selectedVehicle.name
          ? newSelectedVehicleState
          : model
      );

      const newApiResponse = {
        ...apiResponse,
        suggestedModels: newSuggestedModels,
      };

      setApiResponse(newApiResponse);
      setSelectedVehicle(newSelectedVehicleState);

    } catch (err: unknown) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during recalculation.");
      }
    } finally {
      setIsRecalculating(false);
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
          <div key={i} className="bg-slate-800 rounded-2xl p-6 space-y-3">
            <div className="h-6 bg-slate-700 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded-md w-1/2"></div>
            <div className="h-12 bg-slate-700 rounded-md"></div>
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

            {apiResponse && selectedVehicle && (
              <ResultsDisplay 
                data={apiResponse} 
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
                term={term}
                onTermChange={handleTermChange}
                isRecalculating={isRecalculating}
              />
            )}
          </main>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
