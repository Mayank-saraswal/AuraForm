"use client";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import {
  RiDownloadLine, RiClipboardLine, RiTwitterLine, RiWhatsappLine,
} from "react-icons/ri";
import { getFormShareUrl } from "~/lib/utils";

interface Props {
  open:    boolean;
  onClose: () => void;
  slug:    string;
  title:   string;
}

export function QRShareModal({ open, onClose, slug, title }: Props) {
  const qrRef  = useRef<SVGSVGElement>(null);
  const shareUrl = getFormShareUrl(slug);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  }

  function downloadQr() {
    if (!qrRef.current) return;
    const svg       = qrRef.current;
    const svgData   = new XMLSerializer().serializeToString(svg);
    const canvas    = document.createElement("canvas");
    const size      = 400;
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d")!;
    const img       = new Image();
    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a    = document.createElement("a");
      a.download = `${slug}-qr.png`;
      a.href     = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Fill out my form: ${title}`)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your form</DialogTitle>
        </DialogHeader>

        {/* QR code */}
        <div className="flex justify-center rounded-xl border bg-white p-6">
          <QRCodeSVG
            ref={qrRef}
            value={shareUrl}
            size={200}
            fgColor="#111111"
            bgColor="#FFFFFF"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Link copy */}
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
            <RiClipboardLine className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadQr}>
            <RiDownloadLine className="h-3.5 w-3.5" />
            Download QR
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <a href={twitterUrl} target="_blank" rel="noreferrer">
              <RiTwitterLine className="h-3.5 w-3.5" />
              Twitter
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <RiWhatsappLine className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
