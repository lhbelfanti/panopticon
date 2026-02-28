import { Form, redirect, useActionData, useNavigation } from "react-router";
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

    return (
        <div className="min-h-screen flex text-light-gray font-sans bg-background-dark">
            {/* Left side - Branding/Image (Inspiration from typical 2-column auth layouts seen in modern portals) */}
            <div className="hidden lg:flex w-1/2 bg-background-dark flex-col justify-center items-center relative overflow-hidden border-r border-white/5">
                {/* Decorative background gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />

                <div className="z-10 flex flex-col items-center">
                    <img src="/panopticon-logo.png" alt="Panopticon Logo" className="w-48 h-auto mb-8 drop-shadow-2xl" />
                    <h2 className="text-3xl font-bold text-white-1 mb-4 text-center">Portal Académico Seguro</h2>
                    <p className="text-light-gray-70 text-center max-w-md">
                        Acceda a su ecosistema de gestión académica y análisis estadístico.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-surface-dark/90 backdrop-blur-xl p-10 rounded-2xl border border-white/5 shadow-2xl">

                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <img src="/panopticon-logo.png" alt="Panopticon Logo" className="w-32 h-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white-1">Portal Académico Seguro</h2>
                    </div>

                    <h1 className="text-3xl font-bold text-white-1 mb-2">Iniciar Sesión</h1>
                    <p className="text-light-gray-70 mb-8">
                        Ingrese sus credenciales para continuar
                    </p>

                    <Form method="post" className="flex flex-col gap-6">
                        {actionData?.error && (
                            <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm text-center font-medium">
                                {actionData.error}
                            </div>
                        )}

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
                                placeholder="usuario@institucion.edu"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="password">
                                    Contraseña
                                </label>
                                <a href="#" className="text-xs text-primary hover:text-primary/70 transition-colors">
                                    ¿Olvidó su contraseña?
                                </a>
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
                            ¿No tiene una cuenta institucional? <a href="#" className="text-primary hover:text-primary/70 font-medium tracking-wide">Regístrese ahora</a>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
