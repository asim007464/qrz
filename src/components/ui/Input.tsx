import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm",
          "placeholder:text-gray-400 focus:border-ham-accent focus:outline-none focus:ring-2 focus:ring-ham-accent/20",
          className
        )}
        {...props}
      />
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm resize-none",
          "placeholder:text-gray-400 focus:border-ham-accent focus:outline-none focus:ring-2 focus:ring-ham-accent/20",
          className
        )}
        {...props}
      />
    </div>
  );
}
