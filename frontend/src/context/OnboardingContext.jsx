import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../utils/api";

const OnboardingProgressContext = createContext(null);

export const OnboardingProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestInFlightRef = useRef(false);

  const fetchProgress = useCallback(async () => {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/onboarding/progress");
      setProgress(response.data?.data ?? null);
    } catch (err) {
      console.error("Failed to load onboarding progress", err);
      setError("Unable to load onboarding progress");
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const refresh = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  return (
    <OnboardingProgressContext.Provider value={{ progress, loading, error, refresh }}>
      {children}
    </OnboardingProgressContext.Provider>
  );
};

export const useOnboardingProgress = () => {
  const context = useContext(OnboardingProgressContext);
  if (!context) {
    throw new Error("useOnboardingProgress must be used within an OnboardingProgressProvider");
  }
  return context;
};
