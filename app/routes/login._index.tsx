import { Form, redirect, useActionData, useNavigation } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { login } from "~/services/api/auth/index.server";

export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || typeof email !== "string") {
        return { error: "Email is required" };
    }

    try {
        const { headers } = await login({ email, password: password as string });
        return redirect("/", {
            headers: {
                "Set-Cookie": headers["Set-Cookie"]
            }
        });
    } catch (err) {
        return { error: "Login failed, please try again." };
    }
};

const Login = () => {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [view, setView] = useState<"login" | "forgot" | "register">("login");
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
    };

    return (
        <div className="min-h-screen flex text-light-gray font-sans bg-background-dark relative">
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                title="Cambiar idioma / Change language"
                className="absolute top-6 right-6 lg:right-8 p-3 rounded-full bg-surface-dark border border-white/10 text-light-gray-70 hover:text-white-1 hover:bg-white/10 hover:border-white/20 transition-all z-[100] shadow-xl cursor-pointer"
            >
                <Globe size={22} />
            </button>
            {/* Left side - Branding/Image (Inspiration from typical 2-column auth layouts seen in modern portals) */}
            <div className="hidden lg:flex w-1/2 bg-background-dark flex-col justify-center items-center relative overflow-hidden border-r border-white/5">
                {/* Decorative background gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />

                <div className="z-10 flex flex-col items-center w-full px-8 relative">
                    <div className="flex items-center justify-center relative mb-12 w-full max-w-lg">
                        {/* PANOPTICON background text constrained to the left container */}
                        <h1 className="text-[7rem] lg:text-[9rem] font-black text-primary tracking-[0.2em] lg:tracking-[0.3em] absolute w-full text-center opacity-10 whitespace-nowrap select-none overflow-hidden max-w-full">PANOPTICON</h1>
                        <img src="/panopticon-logo-no-text.png" alt="Panopticon Logo" className="w-64 h-auto drop-shadow-2xl z-10 relative" />
                    </div>
                    <h2 className="text-3xl font-bold text-white-1 mb-4 text-center px-4 leading-tight">
                        Plataforma de análisis <br /> de comportamientos humanos adversos
                    </h2>
                    <p className="text-light-gray-70 text-center max-w-md px-8 mt-2">
                        Ecosistema avanzado para la detección temprana, investigación y diagnóstico de patrones de comportamiento.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-surface-dark/90 backdrop-blur-xl p-10 rounded-2xl border border-white/5 shadow-2xl transition-all duration-300">

                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <div className="flex items-center justify-center relative mb-6 w-full max-w-xs">
                            <h1 className="text-5xl font-black text-primary tracking-[0.2em] absolute w-full text-center opacity-20 pl-4 whitespace-nowrap">PANOPTICON</h1>
                            <img src="/panopticon-logo-no-text.png" alt="Panopticon Logo" className="w-32 h-auto z-10 drop-shadow-2xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white-1 text-center">Portal de Investigación</h2>
                    </div>

                    {view === "login" ? (
                        <>
                            <h1 className="text-3xl font-bold text-white-1 mb-2">Iniciar Sesión</h1>
                            <p className="text-light-gray-70 mb-8">
                                Ingrese sus credenciales
                            </p>

                            <Form method="post" className="flex flex-col gap-6">
                                {actionData?.error && (
                                    <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm text-center font-medium">
                                        {actionData.error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="username">
                                        Usuario
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        required
                                        className="w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30"
                                        placeholder="usuario_01"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="email">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        className="w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30"
                                        placeholder="usuario@investigacion.org"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="password">
                                            Contraseña
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setView("forgot")}
                                            className="text-xs text-primary hover:text-primary/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            ¿Olvidó su contraseña?
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        required
                                        className="w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3.5 px-4 rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
                                            <span>Verificando...</span>
                                        </>
                                    ) : (
                                        <span>Acceder al Portal</span>
                                    )}
                                </button>

                                <p className="text-center text-sm text-light-gray-70 mt-4">
                                    ¿No tiene una cuenta? <button type="button" onClick={() => setView("register")} className="text-primary hover:text-primary/70 font-medium tracking-wide bg-transparent border-none p-0 cursor-pointer">Regístrese ahora</button>
                                </p>
                            </Form>
                        </>
                    ) : view === "forgot" ? (
                        <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <h1 className="text-3xl font-bold text-white-1 mb-2">Recuperar Contraseña</h1>
                            <p className="text-light-gray-70 mb-8">
                                Ingrese su correo electrónico para recibir un enlace de recuperación.
                            </p>
                            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); setView("login"); }}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="reset-email">
                                        Correo Electrónico
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
                                        Enviar Enlace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView("login")}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white-1 font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        Volver al inicio
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <h1 className="text-3xl font-bold text-white-1 mb-2">Crear Cuenta</h1>
                            <p className="text-light-gray-70 mb-8">
                                Complete el formulario para solicitar acceso
                            </p>
                            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); setView("login"); }}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="reg-name">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        name="reg-name"
                                        id="reg-name"
                                        required
                                        className="w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30"
                                        placeholder="Dra. Jane Doe"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="reg-email">
                                        Correo Electrónico Institucional
                                    </label>
                                    <input
                                        type="email"
                                        name="reg-email"
                                        id="reg-email"
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
                                        Solicitar Registro
                                    </button>
                                    <p className="text-center text-sm text-light-gray-70 mt-2">
                                        ¿Ya tiene una cuenta? <button type="button" onClick={() => setView("login")} className="text-primary hover:text-primary/70 font-medium tracking-wide bg-transparent border-none p-0 cursor-pointer">Inicie sesión aquí</button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
