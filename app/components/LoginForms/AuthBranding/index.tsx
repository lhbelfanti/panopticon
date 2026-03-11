import React from "react";
import { Logo } from "~/components/Logo";
import type { AuthBrandingProps } from "./types";

export const AuthBranding = (props: AuthBrandingProps) => {
    const { description } = props;

    return (
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
                    {description}
                </h2>
            </div>
        </div>
    );
};
