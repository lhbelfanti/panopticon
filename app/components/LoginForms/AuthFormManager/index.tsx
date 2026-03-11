import React from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "~/components/Logo";
import { LoginForm } from "~/components/LoginForms/LoginForm";
import { ForgotPasswordForm } from "~/components/LoginForms/ForgotPasswordForm";
import { RegisterForm } from "~/components/LoginForms/RegisterForm";
import type { AuthFormManagerProps } from "./types";

export const AuthFormManager = (props: AuthFormManagerProps) => {
    const { view, setView, actionData, isSubmitting, description } = props;
    const { t } = useTranslation();

    return (
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md bg-surface-dark/90 backdrop-blur-xl p-10 rounded-2xl border border-white/5 shadow-2xl transition-all duration-300">
                <div className="flex flex-col items-center mb-8 lg:hidden">
                    <Logo
                        className="max-w-xs mb-6"
                        logoClassName="w-32"
                        backgroundClassName="text-5xl opacity-20 top-1/2 -translate-y-1/2"
                        textClassName="text-lg tracking-[0.2em] mt-3"
                        showFrontText={true}
                    />
                    <h2 className="text-xl font-bold text-white-1 text-center">
                        {description}
                    </h2>
                </div>

                {view === "login" ? (
                    <LoginForm
                        actionData={actionData}
                        isSubmitting={isSubmitting}
                        setView={setView}
                        t={t}
                    />
                ) : view === "forgot" ? (
                    <ForgotPasswordForm
                        actionData={actionData as any}
                        isSubmitting={isSubmitting}
                        setView={setView}
                        t={t}
                    />
                ) : (
                    <RegisterForm
                        actionData={actionData as any}
                        isSubmitting={isSubmitting}
                        setView={setView}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};
