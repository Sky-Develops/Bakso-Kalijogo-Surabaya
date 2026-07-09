import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 50vw, 240px",
  priority = false,
}: ProductImageProps) {
  const imageSrc =
    src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"))
      ? src
      : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-100 dark:bg-neutral-800",
        className
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-contain object-center", imageClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-400">
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
