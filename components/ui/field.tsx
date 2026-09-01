import * as React from "react";
import { cn } from "@/lib/utils";

const controlStyles =
  "w-full rounded-lg bg-surface-container-low border border-outline-variant/40 px-4 py-3 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/80 transition-colors focus:border-primary focus:bg-surface-container-lowest outline-none disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="font-body text-label-md text-on-surface">
        {label}
      </label>
      {children}
      {hint && !error && <p className="font-body text-label-sm text-on-surface-variant">{hint}</p>}
      {error && (
        <p role="alert" className="font-body text-label-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlStyles, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(controlStyles, "resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlStyles, "appearance-none pe-10", className)} {...props} />
));
Select.displayName = "Select";

/** مجموعة اختيار وسوم متعددة (نباتي، الأكثر طلباً…). */
export function TagPicker({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  name: string;
}) {
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const active = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(tag)}
            className={cn(
              "px-4 py-2 rounded-full text-label-sm transition-all active:scale-95",
              active
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            {tag}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value.join(",")} />
    </div>
  );
}
