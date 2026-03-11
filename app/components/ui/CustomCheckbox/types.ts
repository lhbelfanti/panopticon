import React from "react";

export interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    icon?: React.ReactNode;
    notAvailableText?: string;
    wrapperClassName?: string;
    labelClassName?: string;
}
