import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** Square brand mark (S icon) */
export function Logo({ size = 48, className, priority }: LogoProps) {
  return (
    <Image
      src="/icons/logo.png"
      alt="SportMate"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

/** App icon for favicons / PWA references */
export function AppIcon({ size = 48, className }: LogoProps) {
  return (
    <Image
      src="/icons/icon.png"
      alt="SportMate"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
