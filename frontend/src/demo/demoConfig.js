export const isDemoMode = () =>
  process.env.REACT_APP_DEMO_MODE === "true" || process.env.REACT_APP_API_MODE === "mock";

