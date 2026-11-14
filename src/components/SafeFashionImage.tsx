import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { IMAGE_ASSETS } from "../lib/imageAssets.ts";
import type { ImageKey } from "../types/fashion.ts";

interface SafeFashionImageProps {
  imageKey: ImageKey;
  alt: string;
  className?: string;
}

export function SafeFashionImage({
  imageKey,
  alt,
  className = "w-full h-full object-cover",
}: SafeFashionImageProps) {
  const [failed, setFailed] = useState(false);
  const src = IMAGE_ASSETS[imageKey];

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF3F5] via-[#F7E8EE] to-[#FDFBFA] text-[#6C5D63] p-4 text-center"
      >
        <ShoppingBag className="w-6 h-6 text-[#B83B67]/60 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#1D1518] line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
