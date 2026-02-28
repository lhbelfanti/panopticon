import { Form, redirect, useActionData, useNavigation } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { login } from "~/services/api/auth/index.server";
import { Logo } from "~/components/Logo";
import { LoginForm } from "~/components/LoginForms/LoginForm";
import { ForgotPasswordForm } from "~/components/LoginForms/ForgotPasswordForm";
import { RegisterForm } from "~/components/LoginForms/RegisterForm";

export const meta = () => {
    return [
        { title: "Panopticon" },
        { name: "description", content: "Adverse Human Behaviour Analysis Platform" },
    ];
};

export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    if (!username || typeof username !== "string") {
        return { error: "usernameRequired" };
    }

    try {
        const { headers } = await login({ username, password: password as string });
        return redirect("/", {
            headers: {
                "Set-Cookie": headers["Set-Cookie"]
            }
        });
    } catch (err) {
        return { error: "loginFailed" };
    }
};

const Login = () => {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [view, setView] = useState<"login" | "forgot" | "register">("login");
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex text-light-gray font-sans bg-background-dark relative">
            {/* Left side - Branding/Image (Inspiration from typical 2-column auth layouts seen in modern portals) */}
            <div className="hidden lg:flex w-1/2 bg-background-dark flex-col justify-center items-center relative overflow-hidden border-r border-white/5">
                {/* Decorative background gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />

                <div className="z-10 flex flex-col items-center w-full px-8 relative">
                    <Logo
                        className="max-w-lg mb-20"
                        logoClassName="w-64"
                        backgroundClassName="text-[10rem] lg:text-[4.3rem] top-1/2 -translate-y-1/2"
                        textClassName="text-2xl lg:text-5xl tracking-[0.3em] mt-6"
                        showFrontText={true}
                    />
                    <h2 className="text-light-gray-80 text-2xl lg:text-3xl text-center px-30 mt-2">
                        {t('login.description')}
                    </h2>
                </div>
            </div>

            {/* Right side - Login Form */}
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
                        <h2 className="text-xl font-bold text-white-1 text-center">{t('login.description')}</h2>
                    </div>

                    {view === "login" ? (
                        <LoginForm actionData={actionData} isSubmitting={isSubmitting} setView={setView} t={t} />
                    ) : view === "forgot" ? (
                        <ForgotPasswordForm setView={setView} t={t} />
                    ) : (
                        <RegisterForm setView={setView} t={t} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
