"use client";

import { type ReactNode } from "react";

interface PrintWrapperProps {
  children: ReactNode;
  paperSize?: "thermal" | "a4";
}

export function PrintWrapper({ children, paperSize = "a4" }: PrintWrapperProps) {
  const maxWidth = paperSize === "thermal" ? "max-w-[80mm]" : "max-w-[210mm]";

  return (
    <div className={`${maxWidth} mx-auto`}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: ${paperSize === "thermal" ? "0" : "20mm"};
            size: ${paperSize === "thermal" ? "80mm auto" : "A4"};
          }
        }
      `}</style>
      <div className="print-area">
        {children}
      </div>
      <div className="mt-4 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Cetak / Print
        </button>
      </div>
    </div>
  );
}