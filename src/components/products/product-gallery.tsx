"use client";

/* eslint-disable @next/next/no-img-element */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { ProductGalleryImage } from "@/types/product-catalog";

import styles from "./product-site.module.css";

type GalleryImage = Pick<ProductGalleryImage, "id" | "image" | "alt" | "imagePosition">;

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function selectImage(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  if (!activeImage) return null;

  return (
    <div className={styles.productGallery}>
      <figure className={styles.detailMedia}>
        <img
          key={activeImage.id}
          className={styles.galleryMainImage}
          data-reveal-image
          src={activeImage.image}
          alt={activeImage.alt}
          style={{ objectPosition: activeImage.imagePosition ?? "50% 50%" }}
          decoding="async"
        />
        {hasMultipleImages && (
          <div className={styles.galleryControls} aria-label="Product image controls">
            <button type="button" onClick={() => selectImage(activeIndex - 1)} aria-label="Previous product image">
              <ChevronLeft aria-hidden="true" />
            </button>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => selectImage(activeIndex + 1)} aria-label="Next product image">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </figure>
      {hasMultipleImages && (
        <div className={styles.galleryThumbnails} aria-label="Choose a product image">
          {images.map((image, index) => (
            <button
              className={index === activeIndex ? styles.activeThumbnail : ""}
              type="button"
              key={image.id}
              onClick={() => selectImage(index)}
              aria-label={`View product image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <img src={image.image} alt="" style={{ objectPosition: image.imagePosition ?? "50% 50%" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
