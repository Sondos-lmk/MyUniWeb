import * as React from "react";
import { cn } from "../../lib/utils";

const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (newValue) => {
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child?.type === SelectTrigger) {
          return React.cloneElement(child, { isOpen, setIsOpen, value });
        }
        if (child?.type === SelectContent) {
          return isOpen ? React.cloneElement(child, { onSelect: handleSelect }) : null;
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, value, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, children }) => {
  return <span className={cn(children ? "text-slate-900" : "text-slate-500")}>{children || placeholder}</span>;
};
SelectValue.displayName = "SelectValue";

const SelectContent = ({ children, onSelect }) => {
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (child?.type === SelectItem) {
          return React.cloneElement(child, { onSelect });
        }
        return child;
      })}
    </div>
  );
};
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={() => onSelect?.(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
