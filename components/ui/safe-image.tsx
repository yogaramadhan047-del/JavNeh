"use client";

import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string;
  type?: "thumbnail" | "banner" | "poster" | "backdrop" | "none";
}

export function SafeImage({ src, alt, className, sizes, ...props }: SafeImageProps) {
  if (!src) {
    return <div className={className} />;
  }

  // Provide high performance responsive sizes default when fill is true and sizes is not explicitly passed
  const responsiveSizes =
    sizes ||
    (props.fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      : undefined);

  return (
    <Image
      {...props}
      src={src}
      alt={alt || "Image"}
      className={className}
      sizes={responsiveSizes}
      referrerPolicy="no-referrer"
    />
  );
}
