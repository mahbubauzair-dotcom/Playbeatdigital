import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, RotateCcw } from 'lucide-react';
import QRCode from 'qrcode';
import {
  QrErrorCorrection,
  QrInputState,
  QrMode,
  WifiEncryption,
  buildQrPayload,
  checkQrContrast,
} from '../lib/qrPayload';

export const QrCodeGeneratorTool: React.FC = () => {
  const [state, setState] = useState<QrInputState>({
    mode: 'url',
    url: 'https://playbeatdigital.store',
    text: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    wifiHidden: false,
    phone: '',
    emailAddress: '',
    emailSubject: '',
    emailBody: '',
  });

  const [sizePx, setSizePx] = useState(320);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('M');
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [genError, setGenError] = useState<string | null>(null);

  const payloadResult = useMemo(() => buildQrPayload(state), [state]);
  const contrastCheck = useMemo(
    () => checkQrContrast(fgColor, bgColor),
    [fgColor, bgColor]
  );

  useEffect(() => {
    let active = true;
    if (!payloadResult.valid) {
      setPngDataUrl('');
      setSvgString('');
      setGenError(null);
      return;
    }

    const generate = async () => {
      try {
        const opts = {
          errorCorrectionLevel: errorCorrection,
          margin: 4, // Visible quiet zone
          width: Math.max(128, Math.min(1024, sizePx)),
          color: {
            dark: fgColor,
            light: bgColor,
          },
        };

        const [dataUrl, svg] = await Promise.all([
          QRCode.toDataURL(payloadResult.payload, opts),
          QRCode.toString(payloadResult.payload, { ...opts, type: 'svg' }),
        ]);

        if (active) {
          setPngDataUrl(dataUrl);
          setSvgString(svg);
          setGenError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setGenError(
            err instanceof Error ? err.message : 'Could not generate QR code for this input.'
          );
        }
      }
    };

    generate();
    return () => {
      active = false;
    };
  }, [payloadResult, sizePx, errorCorrection, fgColor, bgColor]);

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `playbeat-qrcode-${state.mode}.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playbeat-qrcode-${state.mode}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setState({
      mode: 'url',
      url: 'https://playbeatdigital.store',
      text: '',
      wifiSsid: '',
      wifiPassword: '',
      wifiEncryption: 'WPA',
      wifiHidden: false,
      phone: '',
      emailAddress: '',
      emailSubject: '',
      emailBody: '',
    });
    setSizePx(320);
    setErrorCorrection('M');
    setFgColor('#0F172A');
    setBgColor('#FFFFFF');
  };

  const modes: { id: QrMode; label: string }[] = [
    { id: 'url', label: 'URL' },
    { id: 'text', label: 'Text' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setState((prev) => ({ ...prev, mode: m.id }))}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              state.mode === m.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mode Inputs & Settings */}
        <div className="lg:col-span-7 space-y-4">
          {state.mode === 'url' && (
            <div>
              <label
                htmlFor="qr-url-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Website URL
              </label>
              <input
                id="qr-url-input"
                type="url"
                value={state.url}
                onChange={(e) => setState((s) => ({ ...s, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          )}

          {state.mode === 'text' && (
            <div>
              <label
                htmlFor="qr-text-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Plain Text Content
              </label>
              <textarea
                id="qr-text-input"
                rows={4}
                value={state.text}
                onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))}
                placeholder="Enter text, roll number, or note to encode..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          )}

          {state.mode === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="qr-wifi-ssid"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Network Name (SSID)
                </label>
                <input
                  id="qr-wifi-ssid"
                  type="text"
                  value={state.wifiSsid}
                  onChange={(e) => setState((s) => ({ ...s, wifiSsid: e.target.value }))}
                  placeholder="Home_WiFi_5G"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="qr-wifi-enc"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Security Type
                  </label>
                  <select
                    id="qr-wifi-enc"
                    value={state.wifiEncryption}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        wifiEncryption: e.target.value as WifiEncryption,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>

                {state.wifiEncryption !== 'nopass' && (
                  <div>
                    <label
                      htmlFor="qr-wifi-pass"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      WiFi Password
                    </label>
                    <input
                      id="qr-wifi-pass"
                      type="text"
                      value={state.wifiPassword}
                      onChange={(e) =>
                        setState((s) => ({ ...s, wifiPassword: e.target.value }))
                      }
                      placeholder="Enter WiFi password"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.wifiHidden}
                  onChange={(e) =>
                    setState((s) => ({ ...s, wifiHidden: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span>Hidden network</span>
              </label>
            </div>
          )}

          {state.mode === 'phone' && (
            <div>
              <label
                htmlFor="qr-phone-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="qr-phone-input"
                type="tel"
                value={state.phone}
                onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
                placeholder="+923001234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {state.mode === 'email' && (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="qr-email-addr"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Recipient Email Address
                </label>
                <input
                  id="qr-email-addr"
                  type="email"
                  value={state.emailAddress}
                  onChange={(e) =>
                    setState((s) => ({ ...s, emailAddress: e.target.value }))
                  }
                  placeholder="admissions@example.edu"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="qr-email-subj"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Subject (Optional)
                </label>
                <input
                  id="qr-email-subj"
                  type="text"
                  value={state.emailSubject}
                  onChange={(e) =>
                    setState((s) => ({ ...s, emailSubject: e.target.value }))
                  }
                  placeholder="Application Inquiry"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="qr-email-body"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Message Body (Optional)
                </label>
                <textarea
                  id="qr-email-body"
                  rows={2}
                  value={state.emailBody}
                  onChange={(e) =>
                    setState((s) => ({ ...s, emailBody: e.target.value }))
                  }
                  placeholder="Hello..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Appearance & Error Correction Settings */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="qr-size-select"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Size (px)
              </label>
              <select
                id="qr-size-select"
                value={sizePx}
                onChange={(e) => setSizePx(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
              >
                <option value={200}>200 × 200 px</option>
                <option value={320}>320 × 320 px</option>
                <option value={512}>512 × 512 px</option>
                <option value={800}>800 × 800 px</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="qr-ecc-select"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Error Correction
              </label>
              <select
                id="qr-ecc-select"
                value={errorCorrection}
                onChange={(e) =>
                  setErrorCorrection(e.target.value as QrErrorCorrection)
                }
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="qr-fg-color"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Foreground
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="qr-fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
                  {fgColor}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="qr-bg-color"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Background
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="qr-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>

          {/* Low-Contrast Warning */}
          {contrastCheck.warningMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-semibold">Scannability Contrast Warning</div>
                <p className="mt-0.5 leading-relaxed">{contrastCheck.warningMessage}</p>
              </div>
            </div>
          )}

          {/* Static QR Code Explanation */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Static QR Code:</strong>{' '}
            Your data is encoded directly into the QR image with a visible 4-module quiet zone. There is no hosted tracking service, no redirect URL, and no expiration. Once printed, the destination cannot be edited without generating a new QR code.
          </div>
        </div>

        {/* Right Column: Live QR Preview & Downloads */}
        <div className="lg:col-span-5 flex flex-col items-center p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          {!payloadResult.valid ? (
            <div className="py-12 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {payloadResult.error}
            </div>
          ) : genError ? (
            <div className="py-12 px-4 text-center text-xs text-red-600 dark:text-red-400">
              {genError}
            </div>
          ) : pngDataUrl ? (
            <>
              <div className="p-3 rounded-xl bg-white shadow-xs border border-slate-200">
                <img
                  src={pngDataUrl}
                  alt="Generated static QR code preview with quiet zone"
                  width={220}
                  height={220}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Output: {sizePx} × {sizePx} px · Quiet Zone Included
              </div>

              <div className="mt-4 w-full grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download SVG</span>
                </button>
              </div>
            </>
          ) : null}

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset QR Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
