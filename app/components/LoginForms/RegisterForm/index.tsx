import { useEffect, useMemo, useState } from "react";
import { Form } from "react-router";
import { Pencil, X } from "lucide-react";
import type { RegisterFormProps } from "./types";

export const RegisterForm = (props: RegisterFormProps) => {
  const { actionData, isSubmitting, setView, t } = props;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
  const [username, setUsername] = useState("");

  // Convention: extract long Tailwind strings into variables
  const inputClasses =
    "w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30";
  const buttonPrimaryClasses =
    "w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3.5 px-4 rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2";

  const suggestedUsername = useMemo(() => {
    if (!firstName || !lastName) return "";
    const cleanFirst = firstName.trim().toLowerCase();
    const cleanLast = lastName.trim().toLowerCase().replace(/\s+/g, "");
    return `${cleanFirst.charAt(0)}${cleanLast}`;
  }, [firstName, lastName]);

  useEffect(() => {
    if (!isUsernameEdited) {
      setUsername(suggestedUsername);
    }
  }, [suggestedUsername, isUsernameEdited]);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-3xl font-bold text-white-1 mb-2">
        {t("login.register.title")}
      </h1>
      <p className="text-light-gray-70 mb-8">{t("login.register.subtitle")}</p>
      <Form method="post" className="flex flex-col gap-6">
        <input type="hidden" name="intent" value="signup" />

        {actionData?.signupSuccess && (
          <div className="p-4 bg-green-900/30 border border-green-500/50 text-green-200 rounded-lg text-sm text-center font-medium">
            {t("login.register.success")}
          </div>
        )}
        {actionData?.error && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm text-center font-medium">
            {t(`login.errors.${actionData.error}`)}
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-1/2">
            <label
              className="text-sm font-semibold text-light-gray tracking-wide"
              htmlFor="reg-firstname"
            >
              {t("login.register.firstName")}
            </label>
            <input
              type="text"
              name="reg-firstname"
              id="reg-firstname"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClasses}
              placeholder="Jane"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <label
              className="text-sm font-semibold text-light-gray tracking-wide"
              htmlFor="reg-lastname"
            >
              {t("login.register.lastName")}
            </label>
            <input
              type="text"
              name="reg-lastname"
              id="reg-lastname"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClasses}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 relative">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide flex justify-between items-center"
            htmlFor="reg-username"
          >
            {t("login.register.suggestedUsername")}
            {isUsernameEdited ? (
              <button
                type="button"
                onClick={() => setIsUsernameEdited(false)}
                className="text-light-gray-70 hover:text-red-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                title="Cancel Edition"
              >
                <X size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUsernameEdited(true)}
                className="text-light-gray-70 hover:text-white-1 transition-colors bg-transparent border-none p-0 cursor-pointer"
                title="Edit Username"
              >
                <Pencil size={14} />
              </button>
            )}
          </label>
          <input
            type="text"
            name="reg-username"
            id="reg-username"
            required
            value={username}
            onChange={(e) => {
              setIsUsernameEdited(true);
              setUsername(e.target.value);
            }}
            className={`w-full border rounded-lg p-3.5 outline-none transition-all placeholder:opacity-30 ${isUsernameEdited
              ? "bg-sidebar-dark border-white/10 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent"
              : "bg-background-dark/50 border-white/5 text-light-gray-70"
              }`}
            placeholder="jdoe"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide"
            htmlFor="reg-email"
          >
            {t("login.register.email")}
          </label>
          <input
            type="email"
            name="reg-email"
            id="reg-email"
            required
            className={inputClasses}
            placeholder="jdoe@researcher.org"
          />
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <button
            type="submit"
            className={buttonPrimaryClasses}
          >
            {t("login.register.requestAccess")}
          </button>
          <p className="text-center text-sm text-light-gray-70 mt-2">
            {t("login.register.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-primary hover:text-primary/70 font-medium tracking-wide bg-transparent border-none p-0 cursor-pointer"
            >
              {t("login.register.loginHere")}
            </button>
          </p>
        </div>
      </Form>
    </div>
  );
};
