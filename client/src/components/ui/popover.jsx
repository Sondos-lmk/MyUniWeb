import * as React from "react";
import { cn } from "../../lib/utils";

const Popover = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child?.type === PopoverTrigger) {
          return React.cloneElement(child, { isOpen, setIsOpen: handleOpenChange });
        }
        if (child?.type === PopoverContent) {
          return isOpen ? React.cloneElement(child, { onClose: () => handleOpenChange(false) }) : null;
        }
        return child;
      })}
    </div>
  );
};

const PopoverTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, asChild, ...props }, ref) => {
  const handleClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      ref,
    });
  }
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ className, align = "start", onClose, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-96 rounded-md border bg-white p-0 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };

