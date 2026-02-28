import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => {
    return twMerge(clsx(inputs));
};

const LANGUAGES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' }
];

export const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="fixed top-6 right-6 lg:right-8 z-[100]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Cambiar idioma / Change language"
                className="p-3 rounded-full bg-surface-dark border border-white/10 text-light-gray-70 hover:text-white-1 hover:bg-white/10 hover:border-white/20 transition-all shadow-xl cursor-pointer flex items-center justify-center"
            >
                <Globe size={22} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface-dark border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5",
                                i18n.language === lang.code ? "text-primary font-bold bg-white/5" : "text-light-gray-70"
                            )}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
