'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import datasetsJson from '@/data/datasets.json';
import DatasetCard from '@/components/DatasetCard';
import { useLang } from '@/lib/LangContext';
import { datasetsT } from '@/lib/i18n';

export default function DatasetsPage() {
    const { lang } = useLang();
    const t = datasetsT[lang];

    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return datasetsJson.filter((d) => {
            const matchSearch = !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
            const matchTag = !activeTag || d.tags.includes(activeTag);
            return matchSearch && matchTag;
        });
    }, [search, activeTag]);

    // Tags must match values in datasets.json exactly (case-sensitive)
    const allRawTags = ['Manipulation', 'Navigation', 'Locomotion', 'Dexterous', 'Humanoid', 'Assembly', 'Mobile', 'RL', 'Real-World'];

    return (
        <div className="pt-16 bg-[#0B0F19] min-h-screen">
            {/* Header */}
            <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-24 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            {t.badge}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                            {t.title1}<span className="gradient-text">{t.titleHighlight}</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{t.desc}</p>
                    </motion.div>
                </div>
            </section>

            {/* Filter */}
            <section className="sticky top-16 z-30 bg-[#0B0F19]/95 backdrop-blur-sm border-b border-slate-800/40 px-6 md:px-12 lg:px-20 py-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                        <button
                            onClick={() => setActiveTag('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${!activeTag ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:text-slate-300'}`}
                        >
                            {t.allLabel}
                        </button>
                        {allRawTags.map((rawTag, i) => {
                            const label = t.tags[i] ?? rawTag;
                            return (
                                <button
                                    key={rawTag}
                                    onClick={() => setActiveTag(rawTag === activeTag ? '' : rawTag)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${activeTag === rawTag ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="px-6 md:px-12 lg:px-20 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-sm text-slate-500">
                            {filtered.length} {t.found}
                        </p>
                    </div>
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((dataset, i) => (
                                <DatasetCard key={dataset.id} dataset={dataset} index={i} />
                            ))}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                            <p className="text-4xl mb-4">🔍</p>
                            <p className="text-slate-500">{t.noResults}</p>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
