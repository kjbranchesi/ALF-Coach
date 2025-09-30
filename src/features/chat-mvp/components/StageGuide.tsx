import React from 'react';

export function StageGuide({ what, why, tip }: { what: string; why: string; tip: string }) {
  return (
    <div className="mb-3 p-3 rounded-xl border bg-white text-sm text-gray-700">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-[11px] uppercase text-gray-500">What</div>
          <div>{what}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-gray-500">Why</div>
          <div>{why}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-gray-500">Tip</div>
          <div>{tip}</div>
        </div>
      </div>
    </div>
  );
}

