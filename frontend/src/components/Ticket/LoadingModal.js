import React from "react";

const LoadingModal = ({ open }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-sm font-medium">양도 요청을 처리 중입니다... 잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default LoadingModal;
