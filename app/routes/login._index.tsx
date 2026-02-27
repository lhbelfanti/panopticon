import { Form, redirect, useActionData, useNavigation } from "react-router";
import { login } from "~/services/api/auth/index.server";

export async function action({ request }: { request: Request }) {
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
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen flex items-center justify-center bg-smoky-black text-light-gray p-4 font-sans relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-bittersweet-shimmer rounded-full blur-[150px] opacity-20" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-vegas-gold rounded-full blur-[150px] opacity-10" />

            <div className="w-full max-w-md bg-onyx/80 backdrop-blur-xl p-8 rounded-2xl border border-[var(--color-eerie-black-1)] shadow-2xl relative z-10">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-bittersweet-shimmer rounded-xl flex items-center justify-center font-bold text-3xl text-white-1 mb-4 shadow-lg">
                        P
                    </div>
                    <h1 className="text-3xl font-bold text-white-1">Panopticon</h1>
                    <p className="text-light-gray-70 mt-2 text-center">
                        Adverse Human Behaviour Analysis
                    </p>
                </div>

                <Form method="post" className="flex flex-col gap-5">
                    {actionData?.error && (
                        <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 rounded-lg text-sm text-center">
                            {actionData.error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-light-gray opacity-90" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="w-full bg-[var(--color-eerie-black-2)] border border-[var(--color-eerie-black-1)] rounded-lg p-3 text-white-1 focus:ring-2 focus:ring-bittersweet-shimmer focus:border-transparent outline-none transition-all placeholder:opacity-40"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-light-gray opacity-90" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="w-full bg-[var(--color-eerie-black-2)] border border-[var(--color-eerie-black-1)] rounded-lg p-3 text-white-1 focus:ring-2 focus:ring-bittersweet-shimmer focus:border-transparent outline-none transition-all placeholder:opacity-40"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-bittersweet-shimmer hover:bg-orange-crayola text-white-1 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white-1/30 border-t-white-1 rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </Form>
            </div>
        </div>
    );
}
