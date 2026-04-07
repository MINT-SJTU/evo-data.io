'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Download, AlertTriangle, Database } from 'lucide-react';
import datasetsJson from '@/data/datasets.json';
import DatasetCard from '@/components/DatasetCard';
import { useLang } from '@/lib/LangContext';
import { detailT } from '@/lib/i18n';

type Dataset = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    tasks: number;
    trajectories: string;
    size: string;
    format: string;
    license?: string;
    robot?: string;
};

type Props = { dataset: Dataset };

const tagColorMap: Record<string, string> = {
    manipulation: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    navigation:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    locomotion:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dexterous:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sim2real:     'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    humanoid:     'bg-rose-500/10 text-rose-400 border-rose-500/20',
    multimodal:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
    real:         'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export default function DatasetDetailClient({ dataset }: Props) {
    const { lang } = useLang();
    const t = detailT[lang];

    const relatedDatasets = datasetsJson
        .filter((d) => d.id !== dataset.id && d.tags.some((tag) => dataset.tags.includes(tag)))
        .slice(0, 3);

    const infoRows = [
        { label: t.labels.Size,          value: dataset.size },
        { label: t.labels.Tasks,         value: dataset.tasks.toString() },
        { label: t.labels.Trajectories,  value: dataset.trajectories },
        { label: t.labels.Format,        value: dataset.format },
        { label: t.labels.Robot,         value: dataset.robot ?? 'Various' },
        { label: t.labels.License,       value: dataset.license ?? 'Apache-2.0' },
    ];

    return (
        <div className="pt-16 bg-[#0B0F19] min-h-screen">
            <div className="px-6 md:px-12 lg:px-20 py-10 max-w-6xl mx-auto">
                {/* Back */}
                <Link href="/datasets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {dataset.tags.map((tag) => (
                                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tagColorMap[tag] ?? 'bg-slate-700/20 text-slate-400 border-slate-600/30'}`}>{tag}</span>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{dataset.name}</h1>
                            <p className="text-slate-400 leading-relaxed text-base mb-8">{dataset.description}</p>

                            <h2 className="text-xl font-bold text-slate-100 mb-4">{t.about}</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">{dataset.description}</p>

                            {/* Download placeholder */}
                            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-300 mb-1">{t.warningTitle}</p>
                                    <p className="text-xs text-amber-400/60">{t.warningDesc}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 mb-5">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4">
                                    <Database className="w-4 h-4 text-indigo-400" />
                                    {t.infoTitle}
                                </h3>
                                <dl className="space-y-3">
                                    {infoRows.map(({ label, value }) => (
                                        <div key={label} className="flex items-start justify-between text-sm gap-3">
                                            <dt className="text-slate-500 shrink-0">{label}</dt>
                                            <dd className="text-slate-300 font-medium text-right font-mono text-xs">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors">
                                <Download className="w-4 h-4" />
                                {t.downloadBtn}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Related */}
                {relatedDatasets.length > 0 && (
                    <div className="mt-16 border-t border-slate-800/40 pt-12">
                        <h2 className="text-xl font-bold text-slate-100 mb-6">{t.relatedTitle}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedDatasets.map((d, i) => (
                                <DatasetCard key={d.id} dataset={d} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
