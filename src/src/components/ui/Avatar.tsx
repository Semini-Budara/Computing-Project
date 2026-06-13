import React, { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

function normalizeAvatarSrc(src: string) {
  if (!src) return undefined;
  const trimmed = src.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (trimmed.length > 100 && base64Pattern.test(trimmed)) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  return trimmed;
}

export function Avatar({ src, fallback, className, ...props }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const avatarSrc = useMemo(() => (src ? normalizeAvatarSrc(src) : undefined), [src]);

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100',
        className
      )}
      {...props}
    >
      {avatarSrc && !hasError ? (
        <img
          src={avatarSrc}
          alt="Avatar"
          onError={() => setHasError(true)}
          className="h-full w-full object-contain object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-700 bg-white">
          {fallback}
        </div>
      )}
    </div>
  );
}
