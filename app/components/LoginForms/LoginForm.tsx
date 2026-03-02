import { Form } from "react-router";
import type { LoginFormProps } from "./types";

export const LoginForm = (props: LoginFormProps) => {
  const { actionData, isSubmitting, setView, t } = props;

  // Convention: extract long Tailwind strings into variables
  const inputClasses =
    "w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30";
  const buttonClasses =
    "w-full mt-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3.5 px-4 rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0";

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-3xl font-bold text-white-1 mb-2">
        {t("login.signIn")}
      </h1>
      <p className="text-light-gray-70 mb-8">{t("login.subtitle")}</p>

      <Form method="post" className="flex flex-col gap-6">
        {actionData?.error && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm text-center font-medium">
            {t(`login.errors.${actionData.error}`)}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide"
            htmlFor="username"
          >
            {t("login.username")}
          </label>
          <input
            type="text"
            name="username"
            id="username"
            required
            className={inputClasses}
            placeholder="jdoe"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label
              className="text-sm font-semibold text-light-gray tracking-wide"
              htmlFor="password"
            >
              {t("login.password")}
            </label>
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-xs text-primary hover:text-primary/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              {t("login.forgotPassword")}
            </button>
          </div>
          <input
            type="password"
            name="password"
            id="password"
            required
            className={inputClasses}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
              <span>{t("login.loginButtonLoading")}</span>
            </>
          ) : (
            <span>{t("login.loginButton")}</span>
          )}
        </button>

        <p className="text-center text-sm text-light-gray-70 mt-4">
          {t("login.noAccount")}{" "}
          <button
            type="button"
            onClick={() => setView("register")}
            className="text-primary hover:text-primary/70 font-medium tracking-wide bg-transparent border-none p-0 cursor-pointer"
          >
            {t("login.registerNow")}
          </button>
        </p>
      </Form>
    </div>
  );
};
