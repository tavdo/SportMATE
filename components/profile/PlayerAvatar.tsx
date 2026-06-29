import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  id?: string;
  nickname: string;
  avatarColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  linkable?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-3xl",
};

export function PlayerAvatar({
  id,
  nickname,
  avatarColor,
  size = "md",
  className,
  linkable = false,
}: PlayerAvatarProps) {
  const avatar = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        linkable && id && "transition-opacity hover:opacity-80",
        className
      )}
      style={{ backgroundColor: avatarColor }}
    >
      {nickname.charAt(0).toUpperCase()}
    </div>
  );

  if (linkable && id) {
    return (
      <Link href={`/players/${id}`} className="shrink-0">
        {avatar}
      </Link>
    );
  }

  return avatar;
}
