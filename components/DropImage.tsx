"use client";
import { useEffect, useRef, useState } from "react";

/** Product photograph on its tone backdrop. Falls back to a typographic plate if the image can't load. */
export function DropImage({
  src, alt, tone, className = "", muted = false, eager = false,
}: { src: string; alt: string; tone: string; className?: string; muted?: boolean; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image may finish (or fail) before React hydrates and attaches handlers.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) {
      if (img.naturalWidth === 0) setFailed(true);
      else setLoaded(true);
    }
  }, []);

  return (
    <div className={`@container relative overflow-hidden ${className}`} style={{ background: tone }}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          } ${muted ? "grayscale" : ""} ${muted && loaded ? "opacity-80" : ""}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4">
          <span className="text-center font-serif text-[0px] italic text-ink/40 @[160px]:text-2xl @[400px]:text-4xl">{alt}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
    </div>
  );
}
