import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** Square app icon (green) */
export function Logo({ size = 48, className, priority }: LogoProps) {
  return (
    <Image
      src="/icons/logo-icon.svg"
      alt="SportMate"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

/** Full wordmark with Batumi subtitle */
export function LogoHorizontal({
  className,
  priority,
  width = 280,
  height = 81,
}: {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/icons/logo-horizontal.svg"
      alt="SportMate Batumi"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto max-w-[min(100%,280px)] object-contain", className)}
    />
  );
}

/** S mark without background — dark UI */
export function LogoMono({ size = 48, className }: LogoProps) {
  return (
    <Image
      src="/icons/logo-mono.svg"
      alt="SportMate"
      width={size}
      height={Math.round(size * 0.62)}
      className={cn("object-contain", className)}
    />
  );
}

/** PWA / favicon raster */
export function AppIcon({ size = 48, className }: LogoProps) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt="SportMate"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
