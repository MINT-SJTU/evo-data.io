'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'en' | 'zh';

interface LangContextType {
    lang: Lang;
    toggle: () => void;
}

const LangContext = createContext<LangContextType>({ lang: 'en', toggle: () => { } });

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('en');

    useEffect(() => {
        const stored = localStorage.getItem('lang') as Lang | null;
        if (stored === 'zh' || stored === 'en') setLang(stored);
    }, []);

    const toggle = () => {
        setLang((prev) => {
            const next = prev === 'en' ? 'zh' : 'en';
            localStorage.setItem('lang', next);
            return next;
        });
    };

    return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
    return useContext(LangContext);
}
