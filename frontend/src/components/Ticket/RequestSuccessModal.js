import React from "react";
import { Modal } from "../common";

const RequestSuccessModal = ({ open, onClose, onConfirmReload }) => {
  return (
    <Modal isOpen={open} onClose={onClose} title="양도 요청 완료" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="text-sm text-on-surface">티켓 판매자에게 양도 요청이 성공적으로 전달되었습니다.</p>
            <p className="text-sm text-on-surface-variant mt-1">판매자가 요청을 수락하면 거래가 진행됩니다.</p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={onConfirmReload} className="btn-primary btn-sm">확인</button>
        </div>
      </div>
    </Modal>
  );
};

export default RequestSuccessModal;
