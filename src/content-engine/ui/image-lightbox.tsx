"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ImageLightbox({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    setZoomed(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-muted"
        aria-label={`Zoom in on ${title}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 384px) 100vw, 384px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Zoom
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          </button>

          <p className="absolute left-4 top-4 max-w-[70%] text-sm text-white/80">
            {title} ·{" "}
            <span className="text-white/50">
              click image to {zoomed ? "fit" : "zoom in further"}
            </span>
          </p>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
            className={
              zoomed
                ? "max-h-full max-w-full cursor-zoom-out overflow-auto"
                : "flex max-h-full max-w-full cursor-zoom-in items-center justify-center"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={
                zoomed
                  ? "w-auto max-w-none" // native size, scrollable — for reading fine detail
                  : "max-h-[85vh] w-auto object-contain" // fit to screen
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
