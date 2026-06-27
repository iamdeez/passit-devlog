import React from "react";

const SystemInfoMessage = ({ message }) => (
  <div className="flex items-center gap-3 my-5 px-2">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium whitespace-nowrap px-1">
      {message.content}
    </span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

export default SystemInfoMessage;
