/**
 * Configurable Direct UPI Payment Settings.
 *
 * Reads values from environment variables:
 * - VITE_UPI_ID: Your custom UPI VPA (default: krishti25hr@oksbi)
 * - VITE_UPI_PAYEE_NAME: Display name of the receiver (default: "Big Bro (May Tera)")
 * - VITE_UPI_QR_IMAGE: Custom URL or local public path to your custom QR code image
 */

export const UPI_CONFIG = {
  // Your UPI VPA ID (Virtual Payment Address)
  upiId: import.meta.env.VITE_UPI_ID || 'krishti25hr@oksbi',

  // Payee Name displayed on UPI apps
  payeeName: import.meta.env.VITE_UPI_PAYEE_NAME || 'Big Bro (May Tera)',

  // Transaction note / description passed to the UPI intent
  transactionNote: 'Support for 13 Palliative Care Students',

  // Custom QR Code Image Path or URL. If empty/not provided, dynamic QR is generated
  customQrImageUrl: import.meta.env.VITE_UPI_QR_IMAGE || '',

  // Quick preset donation/support amounts in INR
  presetAmounts: [500, 1000, 2500, 5000, 10000]
};

/**
 * Builds standard UPI Intent URI according to exact structure:
 * upi://pay?pa=krishti25hr@oksbi&pn=Big%20Bro%20(May%20Tera)&am=AMOUNT&cu=INR&tn=Support%20for%2013%20Palliative%20Care%20Students
 */
export function buildUpiIntentUrl(amount: number | string, note?: string): string {
  const upiId = UPI_CONFIG.upiId || 'krishti25hr@oksbi';
  const payeeName = encodeURIComponent(UPI_CONFIG.payeeName || 'Big Bro (May Tera)');
  const am = Number(amount || 0);
  const noteEncoded = encodeURIComponent(note || UPI_CONFIG.transactionNote);

  return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${am}&cu=INR&tn=${noteEncoded}`;
}
