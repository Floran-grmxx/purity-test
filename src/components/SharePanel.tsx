import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "./Button";

interface SharePanelProps {
  url: string;
  /** message sent along with the link by the native share sheet */
  text: string;
  onClose: () => void;
}

/** Bottom sheet offering the result as a QR code, a copyable link or a native share. */
export function SharePanel({ url, text, onClose }: SharePanelProps) {
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canShareNatively = typeof navigator.share === "function";

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setQrSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the link stays visible and selectable below
    }
  }

  async function shareNatively() {
    try {
      await navigator.share({ title: "Purity Test", text, url });
    } catch {
      // user cancelled the share sheet — ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Partager mon résultat"
        className="w-full max-w-md animate-pop-in rounded-t-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Partager mon résultat</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-2xl leading-none text-[var(--color-muted)]"
          >
            ×
          </button>
        </div>

        <div className="mx-auto w-56 rounded-2xl bg-white p-3">
          {qrSvg ? (
            <div
              className="aspect-square [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="aspect-square" />
          )}
        </div>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Fais scanner ce QR code pour montrer ton résultat
        </p>

        <input
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="mt-5 w-full truncate rounded-xl border border-[var(--color-line)] bg-transparent px-3 py-2 text-sm text-[var(--color-muted)]"
        />

        <div className="mt-4 space-y-3">
          <Button onClick={copyLink} full>
            {copied ? "Lien copié ✓" : "Copier le lien"}
          </Button>
          {canShareNatively && (
            <Button variant="outline" onClick={shareNatively} full>
              Envoyer…
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
