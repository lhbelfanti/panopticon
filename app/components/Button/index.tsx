import type { ButtonProps } from "./types";

export const Button = (props: ButtonProps) => {
  const { children, className = "", ...rest } = props;
  // We refactor the long Tailwind class string into a variable.
  // This keeps the JSX clean and prepares the style for reuse within the component.
  const buttonClasses =
    "px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 transition";

  return (
    <button className={`${buttonClasses} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
};
