import React from "react";

export const LoadingSpinner = ({ message, fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-outline-variant border-t-primary animate-spin" />
      {message && <p className="text-sm text-on-surface-variant">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full" role="status" aria-live="polite">
        {content}
      </div>
    );
  }

  return content;
};
