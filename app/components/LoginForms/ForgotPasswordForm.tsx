import type { ForgotPasswordFormProps } from "./types";

export const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
  const { setView, t } = props;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-3xl font-bold text-white-1 mb-2">
        {t("login.recoverPassword.title")}
      </h1>
      <p className="text-light-gray-70 mb-8">
        {t("login.recoverPassword.subtitle")}
      </p>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setView("login");
        }}
      >
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide"
            htmlFor="reset-email"
          >
            {t("login.email")}
          </label>
          <input
            type="email"
            name="reset-email"
            id="reset-email"
            required
            className="w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30"
            placeholder="usuario@investigacion.org"
          />
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3.5 px-4 rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {t("login.recoverPassword.sendLink")}
          </button>
          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full bg-white/5 hover:bg-white/10 text-white-1 font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {t("login.recoverPassword.backToLogin")}
          </button>
        </div>
      </form>
    </div>
  );
};
