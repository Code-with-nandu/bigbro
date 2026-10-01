import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UpiQrCodeDisplayProps {
  value: string;
  size?: number;
  customImageUrl?: string;
  upiId: string;
  amount: number | string;
}

/**
 * Pure SVG QR Code renderer for UPI payments using `qrcode.react` (`QRCodeSVG`).
 * - Generates clean, zero-dependency, non-network vector SVG directly in the React DOM.
 * - Minimum size 300 × 300 pixels.
 * - Crisp white background, dark modules, quiet zone (includeMargin: true).
 * - Reactively re-renders immediately whenever the amount or UPI string changes.
 * - Under NO circumstances renders an <img> tag for the dynamic QR code.
 */
export default function UpiQrCodeDisplay({
  value,
  size = 300,
  upiId,
  amount
}: UpiQrCodeDisplayProps) {
  // Enforce 300px size
  const displaySize = Math.max(300, size);

  // Directly render the QR code using QRCodeSVG
  return (
    <div className="p-4 bg-white rounded-3xl shadow-2xl border-2 border-amber-400/40 inline-flex flex-col items-center select-none">
      <div
        className="flex items-center justify-center bg-white rounded-2xl overflow-hidden"
        style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
      >
        <QRCodeSVG
          value={value}
          size={displaySize}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          includeMargin={true}
          className="block"
        />
      </div>

      {/* Payee app badge indicator */}
      <div className="mt-3 text-center">
        <span className="text-[11px] uppercase font-extrabold tracking-wider text-neutral-800 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
          <span>Google Pay</span> · <span>PhonePe</span> · <span>Paytm</span> · <span>BHIM</span>
        </span>
      </div>
    </div>
  );
}
