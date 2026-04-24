import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo = ({ size = 40, className }: LogoProps) => (
  <div
    className={cn("relative flex shrink-0 items-center justify-center", className)}
    style={{ width: size, height: size }}
  >
    <img
      src="/logomark-worka.svg"
      alt="Worka"
      width={size}
      height={size}
      className="h-full w-full object-contain select-none"
      draggable={false}
    />
  </div>
);

export default Logo;
