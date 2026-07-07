import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ham-accent/50 disabled:opacity-50",
        {
          "bg-ham-purple text-white hover:bg-ham-purple-light": variant === "primary",
          "bg-ham-accent text-white hover:bg-violet-600": variant === "secondary",
          "border-2 border-ham-purple text-ham-purple hover:bg-ham-purple/5": variant === "outline",
          "text-gray-600 hover:bg-gray-100": variant === "ghost",
          "bg-red-500 text-white hover:bg-red-600": variant === "danger",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-5 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base w-full": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
