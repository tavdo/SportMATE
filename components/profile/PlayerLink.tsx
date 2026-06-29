import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlayerLinkProps {
  id: string;
  nickname: string;
  className?: string;
}

export function PlayerLink({ id, nickname, className }: PlayerLinkProps) {
  return (
    <Link
      href={`/players/${id}`}
      className={cn("font-medium hover:underline", className)}
    >
      {nickname}
    </Link>
  );
}
