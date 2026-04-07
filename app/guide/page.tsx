'use client';

import { motion } from 'framer-motion';
import { Terminal, BookOpen, Download, Layers } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { guideT } from '@/lib/i18n';

const featureIcons = [Terminal, BookOpen, Download, Layers];

const codeSnippet = `import evo_data as ed

# Load a dataset by ID
dataset = ed.load("franka-pick-place-v1")

# Stream trajectories
for traj in dataset.iter_trajectories():
    obs   = traj["observation"]   # dict of sensor data
    act   = traj["action"]        # joint commands
    reward = traj["reward"]
    print(obs.keys(), act.shape)`;

export default function GuidePage() {
    const { lang } = useLang();
    const t = guideT[lang];

    return (
        <div className="pt-16 bg-[#0B0F19] min-h-screen">
            {/* Header */}
            <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[180px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            {t.badge}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.title}</h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{t.desc}</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Start */}
            <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-slate-800/40">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <h2 className="text-2xl font-black text-white mb-6">{t.quickStartTitle}</h2>

                        <div className="mb-6">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.installLabel}</p>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700/40 font-mono text-sm">
                                <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                                <code className="text-emerald-400">pip install evo-data</code>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t.exampleLabel}</p>
                            <div className="rounded-2xl overflow-hidden border border-slate-700/40">
                                <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/40 flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                                    <span className="ml-2 text-xs text-slate-500 font-mono">example.py</span>
                                </div>
                                <pre className="p-5 bg-slate-900/80 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
                                    <code>{codeSnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-slate-800/40">
                <div className="max-w-4xl mx-auto">
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-2xl font-black text-white mb-8">
                        {t.featuresTitle}
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {t.features.map((f, i) => {
                            const Icon = featureIcons[i];
                            return (
                                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                                        <Icon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-100 mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* WIP Notice */}
            <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-slate-800/40">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-center">
                        <p className="text-3xl mb-4">🚧</p>
                        <h3 className="text-lg font-bold text-slate-200 mb-2">{t.wipTitle}</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{t.wipDesc}</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
