import { useState } from "react";
import { redirect, useActionData, useNavigation } from "react-router";

import { login, signup, requestPasswordReset } from "~/services/api/auth/index.server";

import { AuthBranding } from "~/components/LoginForms/AuthBranding";
import { AuthFormManager } from "~/components/LoginForms/AuthFormManager";

import { useTranslation } from "react-i18next";

export const meta = () => {
  return [
    { title: "Panopticon" },
    {
      name: "description",
      content: "Adverse Human Behaviour Analysis Platform",
    },
  ];
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "signup") {
    const email = formData.get("reg-email");
    if (!email || typeof email !== "string") return { error: "emailRequired" };

    try {
      await signup({ email });
      return { signupSuccess: true };
    } catch (err) {
      return { error: "signupFailed" };
    }
  }

  if (intent === "forgot_password") {
    const email = formData.get("reset-email");
    if (!email || typeof email !== "string") return { error: "emailRequired" };

    try {
      await requestPasswordReset(email);
      return { resetSuccess: true };
    } catch (err) {
      return { error: "resetFailed" };
    }
  }

  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || typeof username !== "string") return { error: "usernameRequired" };

  try {
    const { headers } = await login({ username, password: password as string });
    return redirect("/", {
      headers: {
        "Set-Cookie": headers["Set-Cookie"],
      },
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

  const description = t("login.description");

  return (
    <div className="min-h-screen flex text-light-gray font-sans bg-background-dark relative">
      <AuthBranding description={description} />
      <AuthFormManager
        view={view}
        setView={setView}
        actionData={actionData}
        isSubmitting={isSubmitting}
        description={description}
      />
    </div>
  );
};

export default Login;
