import React from "react";
import { Modal } from "../common";

const DealAcceptModal = ({ open, onClose, onConfirmAccept }) => {
  return (
    <Modal isOpen={open} onClose={onClose} title="양도 수락 확인" size="sm">
      <div className="space-y-4">
        <div className="text-center py-2">
          <span className="material-symbols-outlined text-green-600 text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h3 className="font-display font-bold text-on-surface mb-2">양도를 수락하시겠습니까?</h3>
          <p className="text-sm text-on-surface-variant">확인 시, 구매자에게 결제 요청이 전송되며 거래가 다음 단계로 진행됩니다.</p>
          <p className="text-sm text-error mt-2">수락 후에는 취소가 어려울 수 있습니다. 신중하게 결정해 주세요.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outlined btn-sm">취소</button>
          <button onClick={onConfirmAccept} className="px-4 py-1.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-all">확인 (양도 수락)</button>
        </div>
      </div>
    </Modal>
  );
};

export default DealAcceptModal;
