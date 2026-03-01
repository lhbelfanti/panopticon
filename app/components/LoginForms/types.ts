export interface LoginFormProps {
  actionData: any;
  isSubmitting: boolean;
  setView: (view: "login" | "forgot" | "register") => void;
  t: (key: string) => string;
}

export interface RegisterFormProps {
  actionData: any;
  isSubmitting: boolean;
  setView: (view: "login" | "forgot" | "register") => void;
  t: (key: string) => string;
}

export interface ForgotPasswordFormProps {
  actionData: any;
  isSubmitting: boolean;
  setView: (view: "login" | "forgot" | "register") => void;
  t: (key: string) => string;
}
