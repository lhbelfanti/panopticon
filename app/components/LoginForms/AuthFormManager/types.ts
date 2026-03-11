export type AuthView = "login" | "forgot" | "register";

export interface AuthFormManagerProps {
    view: AuthView;
    setView: (view: AuthView) => void;
    actionData: any;
    isSubmitting: boolean;
    description: string;
}
