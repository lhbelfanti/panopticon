import { Form } from "react-router";
import type { ConfirmationModalProps } from "./types";

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {
    isOpen,
    onClose,
    icon,
    title,
    description,
    cancelText,
    confirmText,
    confirmAction,
    confirmMethod = "post",
    hiddenInputs = {},
    isDestructive = true,
  } = props;

  if (!isOpen) return null;

  const iconBgColor = isDestructive
    ? "bg-bittersweet-shimmer/10 text-bittersweet-shimmer"
    : "bg-primary/10 text-primary";
  const btnColor = isDestructive
    ? "bg-bittersweet-shimmer hover:bg-bittersweet-shimmer/80 shadow-bittersweet-shimmer/20"
    : "bg-primary hover:bg-primary/90 text-background-dark shadow-primary/20";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
      <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl p-6 lg:p-8 w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 py-2 px-2 ${iconBgColor}`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white-1 mb-2 text-center">
          {title}
        </h3>
        <p className="text-sm text-light-gray-70 text-center mb-8">
          {description}
        </p>
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg font-semibold cursor-pointer text-light-gray hover:text-white-1 bg-white/5 hover:bg-white/10 transition-colors duration-150"
          >
            {cancelText}
          </button>
          <Form
            action={confirmAction}
            method={confirmMethod}
            className="flex-1 flex"
          >
            {Object.entries(hiddenInputs).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <button
              type="submit"
              className={`flex-1 flex justify-center items-center py-2.5 px-4 rounded-lg cursor-pointer font-semibold text-white-1 transition-colors duration-150 shadow-lg ${btnColor}`}
            >
              {confirmText}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
