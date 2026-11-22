"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Service-image picker used by the technician "add / edit service" forms.
 *  1. uploads to ImgBB when NEXT_PUBLIC_IMGBB_API_KEY is set
 *  2. otherwise falls back to a canvas-resized base64 data URL (~max 900px)
 * so the app still works with no external account.
 */
export default function ImageUpload({ value, onChange, className }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8 MB");
      return;
    }

    setBusy(true);
    try {
      const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (key) {
        const body = new FormData();
        body.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (data?.data?.url) {
          onChange(data.data.url);
          toast.success("Image uploaded");
          return;
        }
        throw new Error(data?.error?.message || "Upload failed");
      }
      onChange(await resizeToDataURL(file, 900));
      toast.success("Image added");
    } catch (err) {
      // ImgBB hiccup - never leave the user stuck.
      try {
        onChange(await resizeToDataURL(file, 900));
        toast.success("Image added (stored locally)");
      } catch {
        toast.error(err.message || "Could not process that image");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className={cn(
          "relative flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary/50 hover:bg-muted/70",
          value && "border-solid"
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Selected service" className="size-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            {busy ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" />
            )}
            <span className="text-xs font-medium">
              {busy ? "Uploading…" : "Click to upload a photo"}
            </span>
            <span className="text-[11px]">PNG / JPG up to 8 MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/** Downscale via canvas so big photos become a manageable data URL. */
function resizeToDataURL(file, maxDim) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Not a valid image"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
