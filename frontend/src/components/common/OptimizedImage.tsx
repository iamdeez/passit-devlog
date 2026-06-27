import React, { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  priority?: boolean;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = "100%",
  height = "auto",
  objectFit = "cover",
  loading = "lazy",
  priority = false,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-surface-container animate-pulse" aria-label="이미지 로딩 중" />
      )}

      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : loading}
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          className="w-full h-full transition-opacity duration-300"
          style={{ objectFit, opacity: isLoading ? 0 : 1 }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant text-sm"
          role="img"
          aria-label={`${alt} - 이미지 로드 실패`}
        >
          이미지를 불러올 수 없습니다
        </div>
      )}
    </div>
  );
};
