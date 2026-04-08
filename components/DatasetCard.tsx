'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Layers, BarChart3 } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { datasetCardT } from '@/lib/i18n';

const tagColorMap: Record<string, string> = {
    Manipulation: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Navigation: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Locomotion: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Dexterous: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Humanoid: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Assembly: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Mobile: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    RL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Real-World': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const coverGradients = [
    'from-indigo-700/20 via-purple-700/10 to-slate-800/0',
    'from-emerald-700/20 via-teal-700/10 to-slate-800/0',
    'from-rose-700/20 via-orange-700/10 to-slate-800/0',
    'from-amber-700/20 via-yellow-700/10 to-slate-800/0',
    'from-cyan-700/20 via-sky-700/10 to-slate-800/0',
    'from-purple-700/20 via-pink-700/10 to-slate-800/0',
];

type Dataset = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    tasks: number;
    trajectories: string;
    size: string;
    format: string;
};

type Props = { dataset: Dataset; index: number };

export default function DatasetCard({ dataset, index }: Props) {
    const { lang } = useLang();
    const t = datasetCardT[lang];
    const gradient = coverGradients[index % coverGradients.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
            className="group rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
        >
            {/* Cover */}
            <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        <polyline points="0,35 15,20 30,28 45,10 60,22 75,5 100,18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white" />
                    </svg>
                </div>
                <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
                    {dataset.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tagColorMap[tag] ?? 'bg-slate-700/20 text-slate-400 border-slate-600/30'}`}>{tag}</span>
                    ))}
                </div>
                <div className="absolute bottom-3 right-4 text-xs text-slate-500 font-mono">{dataset.size}</div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-100 mb-2 text-base leading-snug">{dataset.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">{dataset.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Layers className="w-3.5 h-3.5 text-slate-600" />
                        <span className="font-medium text-slate-300">{dataset.tasks}</span>
                        <span>{t.tasks}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                        <span className="font-medium text-slate-300">{dataset.trajectories}</span>
                        <span>{t.trajectories}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <span className="text-xs font-mono text-slate-600 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded">{dataset.format}</span>
                    <Link href={`/datasets/${dataset.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        {t.details}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
