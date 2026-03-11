export interface ForgotPasswordFormProps {
  actionData: any;
  isSubmitting: boolean;
  setView: (view: "login" | "forgot" | "register") => void;
  t: (key: string) => string;
}
