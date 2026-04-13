'use client';

/**
 * DatasetVisualizer
 * Pure-frontend LeRobot dataset preview (v2 + v3 format support):
 *  1. Fetch meta/info.json  → features / fps / chunk_size / path templates / codebase_version
 *  2. v2: direct episode path; v3: lookup chunk/file via meta/episodes parquet + filter by range
 *  3. Load task instruction: v2 from tasks.jsonl, v3 from meta/episodes parquet tasks column
 *  4. Parse data parquet via hyparquet (asyncBufferFromUrl + parquetReadObjects)
 *  5. Stream video directly from HF CDN
 *  6. Interactive multi-series Recharts grouped by semantic dimension type
 */

import { useCallback, useEffect, useRef, useState, memo, forwardRef } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    asyncBufferFromUrl,
    parquetReadObjects,
} from 'hyparquet';
import {
    ChevronLeft,
    ChevronRight,
    Film,
    Loader2,
    AlertCircle,
    Activity,
    Eye,
    EyeOff,
    BookOpen,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureInfo {
    dtype: string;
    shape: number[];
    names?: { motors?: string[] } | string[] | null;
}

interface HFInfo {
    fps: number;
    chunks_size: number;
    total_episodes: number;
    codebase_version?: string;
    data_path: string;
    video_path: string;
    features: Record<string, FeatureInfo>;
}

interface EpisodeRow {
    timestamp: number;
    frame_index: number;
    [key: string]: number;
}

interface Props {
    hfId: string;
    totalEpisodes?: number;
}

interface ChartGroup {
    label: string;
    seriesKeys: string[];
    labels: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hfResolve(hfId: string, path: string) {
    return `https://huggingface.co/datasets/${hfId}/resolve/main/${path}`;
}

/** Python-style format string: "chunk-{episode_chunk:03d}" → "chunk-000" */
function formatPath(template: string, vars: Record<string, number | string>) {
    return template.replace(/\{(\w+)(?::0?(\d+)d)?\}/g, (_, key, width) => {
        const val = vars[key];
        if (val === undefined) return _;
        return width ? String(val).padStart(parseInt(width), '0') : String(val);
    });
}

function getAxisNames(feature: FeatureInfo): string[] {
    const n = feature.names;
    if (!n) return Array.from({ length: feature.shape[0] }, (_, i) => `dim_${i}`);
    if (Array.isArray(n)) return n;
    if (n.motors) return n.motors;
    return Array.from({ length: feature.shape[0] }, (_, i) => `dim_${i}`);
}

/**
 * Group dimension names into semantic buckets for separate chart panels.
 * Returns array of [groupLabel, indices[]] in display order.
 */
function groupDimsByType(names: string[]): Array<{ label: string; indices: number[] }> {
    const buckets: Record<string, number[]> = {};
    const order: string[] = [];

    const push = (label: string, idx: number) => {
        if (!buckets[label]) { buckets[label] = []; order.push(label); }
        buckets[label].push(idx);
    };

    names.forEach((name, idx) => {
        const n = name.toLowerCase();
        if (n.includes('gripper')) {
            // Split gripper by arm side for dual-arm datasets
            if (n.startsWith('left')) push('Left Gripper', idx);
            else if (n.startsWith('right')) push('Right Gripper', idx);
            else push('Gripper', idx);
        } else if (n === 'x' || n === 'y' || n === 'z') {
            push('Position (xyz)', idx);
        } else if (n === 'roll' || n === 'pitch' || n === 'yaw') {
            push('Rotation (rpy)', idx);
        } else if (n === 'pad') {
            push('Misc', idx);
        } else {
            // Joint names — split left / right arm for dual-arm datasets
            if (n.startsWith('left')) push('Left Joints', idx);
            else if (n.startsWith('right')) push('Right Joints', idx);
            else push('Joints', idx);
        }
    });

    return order.map((label) => ({ label, indices: buckets[label] }));
}

const COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
];

// ─── Module-level parquet cache (persists across episode navigation) ──────────
// Key: URL string → Promise<rows[]> — storing the Promise avoids duplicate in-flight fetches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parquetCache = new Map<string, Promise<any[]>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cachedParquet(url: string): Promise<any[]> {
    if (!parquetCache.has(url)) {
        const p = asyncBufferFromUrl({ url }).then((buf) => parquetReadObjects({ file: buf }));
        parquetCache.set(url, p);
    }
    return parquetCache.get(url)!;
}

// ─── ClippedVideo ─────────────────────────────────────────────────────────────
// Unified video player for both v2 and v3 using native <video> element for
// GPU-accelerated rendering (no canvas overhead).
//   • v3 (hasClip): plays within [startSec, endSec] then fires onEnded.
//   • v2 (no clip): plays full video then fires onEnded.
//   • Controlled externally: isPlaying / onRestart props.
//   • onReady: called once first seek completes (for multi-video sync gate).

interface ClippedVideoProps {
    src: string;
    /** Start time in seconds within the file. undefined = play from beginning. */
    startSec?: number;
    /** End time in seconds within the file. undefined = play to end. */
    endSec?: number;
    label?: string;
    /** Called once the video is seeked to start and ready to play */
    onReady?: () => void;
    /** External play/pause control */
    isPlaying: boolean;
    /** Called when video naturally reaches the end */
    onEnded?: () => void;
    /** Called every timeupdate with elapsed seconds within clip (0-based) */
    onProgress?: (elapsedSec: number) => void;
    /** Imperative restart trigger: increment to restart */
    restartSignal?: number;
}

const ClippedVideo = forwardRef<HTMLVideoElement, ClippedVideoProps>(function ClippedVideo({
    src, startSec, endSec, label, onReady, isPlaying, onEnded, onProgress, restartSignal = 0,
}, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    // Merge external ref with internal ref
    const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    }, [ref]);
    const onReadyRef = useRef(onReady);
    useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    const onEndedRef = useRef(onEnded);
    useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
    const onProgressRef = useRef(onProgress);
    useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

    const hasClip = startSec !== undefined && endSec !== undefined;
    const clipStart = hasClip ? startSec! : 0;
    const clipEnd = endSec;
    const clipDuration = hasClip ? endSec! - startSec! : null;

    // ── Load / reload on src change ───────────────────────────────────────
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.pause();
        vid.src = src;
        vid.load();
        const onMeta = () => { vid.currentTime = clipStart; };
        const onSeeked = () => { onReadyRef.current?.(); };
        vid.addEventListener('loadedmetadata', onMeta);
        vid.addEventListener('seeked', onSeeked);
        return () => {
            vid.removeEventListener('loadedmetadata', onMeta);
            vid.removeEventListener('seeked', onSeeked);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    // ── Clip-end detection & progress reporting ───────────────────────────
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        const onTimeUpdate = () => {
            // v3: stop at clipEnd
            if (hasClip && clipEnd !== undefined && vid.currentTime >= clipEnd) {
                vid.pause();
                vid.currentTime = clipEnd;
                onEndedRef.current?.();
            }
            // Report progress
            const elapsed = Math.max(0, vid.currentTime - clipStart);
            onProgressRef.current?.(elapsed);
        };
        const onNativeEnded = () => { onEndedRef.current?.(); };
        vid.addEventListener('timeupdate', onTimeUpdate);
        vid.addEventListener('ended', onNativeEnded);
        return () => {
            vid.removeEventListener('timeupdate', onTimeUpdate);
            vid.removeEventListener('ended', onNativeEnded);
        };
    }, [hasClip, clipEnd, clipStart]);

    // ── External play/pause ───────────────────────────────────────────────
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (isPlaying) { vid.play().catch(() => { }); }
        else { vid.pause(); }
    }, [isPlaying]);

    // ── Restart signal ────────────────────────────────────────────────────
    const prevRestartRef = useRef(restartSignal);
    useEffect(() => {
        if (restartSignal !== prevRestartRef.current) {
            prevRestartRef.current = restartSignal;
            const vid = videoRef.current;
            if (!vid) return;
            vid.currentTime = clipStart;
            vid.play().catch(() => { });
        }
    }, [restartSignal, clipStart]);

    return (
        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
            {label && (
                <div className="px-2 py-1.5 bg-slate-800 border-b border-slate-700">
                    <span className="text-xs font-mono text-slate-400 truncate block">{label}</span>
                </div>
            )}
            <video
                ref={setVideoRef}
                muted
                playsInline
                preload="auto"
                className="w-full block bg-black"
                style={{ aspectRatio: '16/9', objectFit: 'contain' }}
            />
        </div>
    );
});

// ─── VideoControls ────────────────────────────────────────────────────────────
// Shared control bar for a group of ClippedVideo instances.

interface VideoControlsProps {
    isPlaying: boolean;
    ended: boolean;
    progress: number;        // 0–1
    currentSec: number;
    totalSec: number | null;
    onPlayPause: () => void;
    onRestart: () => void;
    onSeek: (frac: number) => void;
}

function VideoControls({ isPlaying, ended, progress, currentSec, totalSec, onPlayPause, onRestart, onSeek }: VideoControlsProps) {
    return (
        <div className="px-3 py-2 bg-slate-800 rounded-b-xl flex items-center gap-2 mt-0">
            {/* Restart */}
            <button onClick={onRestart} className="shrink-0 text-slate-400 hover:text-white transition-colors" title="从头播放">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M7.712 3.712a.75.75 0 0 1 .788.712V9.25l5.638-3.965A.75.75 0 0 1 15.25 6v8a.75.75 0 0 1-1.112.656L8.5 10.749v4.539a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .712-.576ZM4.75 4a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 4.75 4Z" />
                </svg>
            </button>
            {/* Play / Pause */}
            <button onClick={onPlayPause} className="shrink-0 text-slate-400 hover:text-white transition-colors" title={isPlaying ? '暂停' : ended ? '重新播放' : '播放'}>
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                    </svg>
                )}
            </button>
            {/* Current time */}
            <span className="text-xs font-mono text-slate-400 shrink-0 w-10">{currentSec.toFixed(1)}s</span>
            {/* Progress bar */}
            <div
                className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                }}
            >
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progress * 100}%`, transition: 'none' }} />
            </div>
            {/* Total time */}
            <span className="text-xs font-mono text-slate-400 shrink-0 w-10 text-right">
                {totalSec !== null ? `${totalSec.toFixed(1)}s` : '--'}
            </span>
        </div>
    );
}


interface ChartPanelProps {
    title: string;
    data: EpisodeRow[];
    seriesKeys: string[];
    labels: string[];
    colorOffset?: number;
    syncId?: string;
    /** Current playback frame to show as a reference line */
    playFrame?: number | null;
}

const ChartPanel = memo(function ChartPanel({
    title, data, seriesKeys, labels, colorOffset = 0, syncId, playFrame,
}: ChartPanelProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
            <ResponsiveContainer width="100%" height={190}>
                <LineChart
                    data={data}
                    syncId={syncId}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="frame_index"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                        width={46}
                        tickFormatter={(v: number) => v.toFixed(2)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#f1f5f9',
                            padding: '8px 12px',
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                        labelFormatter={(v) => `frame ${v}`}
                        formatter={(value) => {
                            const n = typeof value === 'number' ? value : Number(value);
                            return [isNaN(n) ? String(value) : n.toFixed(5)];
                        }}
                        position={{ y: 0 }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 3' }}
                    />
                    <Legend
                        iconType="plainline"
                        iconSize={12}
                        wrapperStyle={{ fontSize: '10px', paddingTop: 8 }}
                    />
                    {playFrame != null && (
                        <ReferenceLine
                            x={playFrame}
                            stroke="#f97316"
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            strokeOpacity={0.85}
                            ifOverflow="hidden"
                        />
                    )}
                    {seriesKeys.map((k, i) => (
                        <Line
                            key={k}
                            type="monotone"
                            dataKey={k}
                            name={labels[i]}
                            stroke={COLORS[(i + colorOffset) % COLORS.length]}
                            dot={false}
                            strokeWidth={1.5}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DatasetVisualizer({ hfId, totalEpisodes }: Props) {
    const [open, setOpen] = useState(false);

    const [info, setInfo] = useState<HFInfo | null>(null);
    const [episodeIdx, setEpisodeIdx] = useState(0);
    const [inputVal, setInputVal] = useState('0');
    const [rows, setRows] = useState<EpisodeRow[]>([]);
    const [videoKeys, setVideoKeys] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    // v3 only: time range (seconds) within the shared mp4 that belongs to this episode
    const [videoClip, setVideoClip] = useState<{ startSec: number; endSec: number } | null>(null);
    const [taskInstruction, setTaskInstruction] = useState<string | null>(null);

    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataError, setDataError] = useState<string | null>(null);

    // Multi-video sync: wait for all videos to be ready before starting playback
    const [videosReady, setVideosReady] = useState(0);
    const allVideosReady = videoUrls.length > 0 && videosReady >= videoUrls.length;

    // ── Shared video playback state (controls all videos in sync) ────────
    const [vidPlaying, setVidPlaying] = useState(false);
    const [vidEnded, setVidEnded] = useState(false);
    const [restartSignal, setRestartSignal] = useState(0);

    // Progress state driven by first video's onProgress
    const [vidProgress, setVidProgress] = useState(0);       // 0–1
    const [vidCurrentSec, setVidCurrentSec] = useState(0);
    const [vidTotalSec, setVidTotalSec] = useState<number | null>(null);

    // Chart frame indicator (driven by video progress)
    const [playingFrame, setPlayingFrame] = useState<number | null>(null);

    // Ref to first video element for seek-on-progress-bar-click
    const firstVideoRef = useRef<HTMLVideoElement | null>(null);

    // When all videos become ready, auto-start
    const prevAllReadyRef = useRef(false);
    useEffect(() => {
        if (allVideosReady && !prevAllReadyRef.current) {
            prevAllReadyRef.current = true;
            setVidPlaying(true);
            setVidEnded(false);
        }
    }, [allVideosReady]);

    // Reset on episode change
    useEffect(() => {
        prevAllReadyRef.current = false;
        setVidPlaying(false);
        setVidEnded(false);
        setVidProgress(0);
        setVidCurrentSec(0);
        setVidTotalSec(null);
    }, [videoUrls]);

    // Shared controls handlers
    const handleVidPlayPause = useCallback(() => {
        if (vidEnded) {
            setVidEnded(false);
            setRestartSignal((s) => s + 1);
            setVidPlaying(true);
        } else {
            setVidPlaying((p) => !p);
        }
    }, [vidEnded]);

    const handleVidRestart = useCallback(() => {
        setVidEnded(false);
        setRestartSignal((s) => s + 1);
        setVidPlaying(true);
    }, []);

    const handleVidSeek = useCallback((frac: number) => {
        const vid = firstVideoRef.current;
        if (!vid) return;
        const clipStart = videoClip?.startSec ?? 0;
        const dur = videoClip
            ? videoClip.endSec - videoClip.startSec
            : (isFinite(vid.duration) ? vid.duration : 0);
        vid.currentTime = clipStart + frac * dur;
        if (vidEnded) { setVidEnded(false); setVidPlaying(true); }
    }, [videoClip, vidEnded]);

    // Progress callback from first video
    const handleVideoProgress = useCallback((elapsedSec: number) => {
        const vid = firstVideoRef.current;
        const dur = videoClip
            ? videoClip.endSec - videoClip.startSec
            : vid && isFinite(vid.duration) ? vid.duration : null;
        setVidCurrentSec(elapsedSec);
        if (dur && dur > 0) setVidProgress(elapsedSec / dur);
        if (dur) setVidTotalSec(dur);

        // Also update chart frame indicator
        if (!info) return;
        if (videoClip && rows.length > 0) {
            const firstFrame = rows[0].frame_index;
            setPlayingFrame(firstFrame + Math.round(elapsedSec * info.fps));
        } else {
            setPlayingFrame(Math.round(elapsedSec * info.fps));
        }
    }, [info, videoClip, rows]);

    // ── Load info.json once when panel opens ──────────────────────────────
    useEffect(() => {
        if (!open || info) return;
        setLoadingInfo(true);
        setError(null);
        fetch(hfResolve(hfId, 'meta/info.json'))
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<HFInfo>;
            })
            .then((data) => {
                const cams = Object.entries(data.features)
                    .filter(([, v]) => v.dtype === 'video')
                    .map(([k]) => k);
                setVideoKeys(cams);
                setInfo(data);
            })
            .catch((e: Error) => setError(`Failed to load metadata: ${e.message}`))
            .finally(() => setLoadingInfo(false));
    }, [open, hfId, info]);

    // ── Load episode (parquet + videos) ───────────────────────────────────
    const loadEpisode = useCallback(
        async (idx: number, hfInfo: HFInfo, camKeys: string[]) => {
            setLoadingData(true);
            setDataError(null);
            setRows([]);
            setVideoUrls([]);
            setVideoClip(null);
            setTaskInstruction(null);

            const isV3 = (hfInfo.codebase_version ?? 'v2.0').startsWith('v3');

            try {
                if (isV3) {
                    // ── v3: look up chunk/file via meta/episodes parquet ──────────
                    const epChunk = Math.floor(idx / hfInfo.chunks_size);
                    const epMetaUrl = hfResolve(
                        hfId,
                        `meta/episodes/chunk-${String(epChunk).padStart(3, '0')}/file-000.parquet`
                    );

                    // cachedParquet deduplicates in-flight requests and caches results
                    const epRows = await cachedParquet(epMetaUrl);

                    // Find the row for this episode
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const epRow = epRows.find((r: any) => Number(r['episode_index']) === idx) as Record<string, unknown> | undefined;
                    if (!epRow) throw new Error(`Episode ${idx} not found in metadata`);

                    // Extract task instruction from tasks column (array of strings)
                    const tasksCol = epRow['tasks'];
                    if (Array.isArray(tasksCol) && tasksCol.length > 0) {
                        setTaskInstruction(String(tasksCol[0]));
                    }

                    const dataChunk = Number(epRow['data/chunk_index'] ?? 0);
                    const dataFile = Number(epRow['data/file_index'] ?? 0);
                    const fromIdx = Number(epRow['dataset_from_index'] ?? 0);
                    const toIdx = Number(epRow['dataset_to_index'] ?? -1);

                    // Load data parquet first (cached — shared files only fetched once)
                    // so we can compute the clip window before setting videoUrls.
                    const dataUrl = hfResolve(hfId, formatPath(hfInfo.data_path, {
                        chunk_index: dataChunk,
                        file_index: dataFile,
                    }));
                    const rawRows = await cachedParquet(dataUrl);

                    // Filter rows belonging to this episode
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const filtered: any[] = toIdx >= 0
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ? rawRows.filter((r: any) => {
                            const gi = Number(r['index'] ?? -1);
                            return gi >= fromIdx && gi < toIdx;
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        : rawRows.filter((r: any) => Number(r['episode_index']) === idx);

                    // Compute video clip window before setting videoUrls so that
                    // ClippedVideo mounts with the correct fragment URI from the start
                    // and never needs to be remounted/reloaded.
                    let clip: { startSec: number; endSec: number } | null = null;
                    if (filtered.length > 0) {
                        const fileOffset = rawRows.indexOf(filtered[0]);
                        if (fileOffset >= 0) {
                            clip = {
                                startSec: fileOffset / hfInfo.fps,
                                endSec: (fileOffset + filtered.length) / hfInfo.fps,
                            };
                        }
                    }

                    // Build video URLs and set clip simultaneously so ClippedVideo
                    // gets the final fragment URI on first mount — no remount needed.
                    const urls = camKeys.map((vk) =>
                        hfResolve(
                            hfId,
                            formatPath(hfInfo.video_path, {
                                video_key: vk,
                                chunk_index: dataChunk,
                                file_index: dataFile,
                            })
                        )
                    );
                    setVideoClip(clip);
                    setVideoUrls(urls);

                    setRows(parseRows(filtered, hfInfo, 0));

                } else {
                    // ── v2: direct path calculation ──────────────────────────────
                    const chunk = Math.floor(idx / hfInfo.chunks_size);
                    const vars = { episode_chunk: chunk, episode_index: idx };

                    setVideoUrls(
                        camKeys.map((vk) =>
                            hfResolve(hfId, formatPath(hfInfo.video_path, { ...vars, video_key: vk }))
                        )
                    );

                    const parquetUrl = hfResolve(hfId, formatPath(hfInfo.data_path, vars));
                    const rawRows = await cachedParquet(parquetUrl);

                    // Load task from tasks.jsonl using task_index from first row
                    // task_index may come back as BigInt from hyparquet — normalise with Number()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const taskIdxRaw = rawRows.length > 0 ? (rawRows[0] as any)['task_index'] : undefined;
                    const taskIdx = taskIdxRaw !== undefined && taskIdxRaw !== null
                        ? Number(taskIdxRaw) : -1;
                    if (taskIdx >= 0) {
                        try {
                            const resp = await fetch(hfResolve(hfId, 'meta/tasks.jsonl'));
                            if (resp.ok) {
                                const text = await resp.text();
                                const lines = text.trim().split('\n');
                                for (const line of lines) {
                                    try {
                                        const obj = JSON.parse(line) as { task_index: number; task: string };
                                        if (Number(obj.task_index) === taskIdx) {
                                            setTaskInstruction(obj.task ?? '');
                                            break;
                                        }
                                    } catch { /* skip bad lines */ }
                                }
                            }
                        } catch { /* task loading is non-critical */ }
                    }

                    setRows(parseRows(rawRows, hfInfo, 0));
                }
            } catch (e: unknown) {
                setDataError(`Could not load episode data: ${(e as Error).message}`);
            } finally {
                setLoadingData(false);
            }
        },
        [hfId]
    );

    useEffect(() => {
        if (open && info) loadEpisode(episodeIdx, info, videoKeys);
    }, [open, info, episodeIdx, videoKeys, loadEpisode]);

    // Reset video-ready counter whenever the url set changes
    useEffect(() => { setVideosReady(0); }, [videoUrls]);

    // Keep videoRefs array removed — video seek is intentionally not implemented

    // ── Navigation ────────────────────────────────────────────────────────
    const maxEp = (info?.total_episodes ?? totalEpisodes ?? 1) - 1;

    const goTo = (idx: number) => {
        const v = Math.max(0, Math.min(idx, maxEp));
        setEpisodeIdx(v);
        setInputVal(String(v));
    };

    // ── Build grouped series for a given feature prefix ───────────────────
    const buildGroupedSeries = (prefix: string): ChartGroup[] => {
        if (!rows.length || !info) return [];

        const feat = info.features[prefix];
        if (!feat) return [];

        const allNames = getAxisNames(feat);
        const groups = groupDimsByType(allNames);

        return groups.map(({ label, indices }) => ({
            label,
            seriesKeys: indices.map((i) => `${prefix}__${allNames[i] ?? i}`),
            labels: indices.map((i) => allNames[i] ?? String(i)),
        })).filter((g) => g.seriesKeys.some((k) => rows[0]?.[k] !== undefined));
    };

    const actionGroups = buildGroupedSeries('action');
    const stateGroups = buildGroupedSeries('observation.state');

    const scalarKeys = info
        ? Object.entries(info.features)
            .filter(
                ([k, v]) =>
                    v.dtype !== 'video' &&
                    v.shape[0] === 1 &&
                    !['timestamp', 'frame_index', 'episode_index', 'index', 'task_index'].includes(k) &&
                    rows[0]?.[k] !== undefined
            )
            .map(([k]) => k)
        : [];

    const hasCharts = actionGroups.length > 0 || stateGroups.length > 0 || scalarKeys.length > 0;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div>
            {/* Toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${open
                    ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
            >
                {open ? (
                    <><EyeOff className="w-4 h-4" />Hide Preview</>
                ) : (
                    <><Eye className="w-4 h-4" />Show Preview</>
                )}
            </button>

            {/* Preview panel */}
            {open && (
                <div className="mt-6 space-y-6">
                    {/* Loading info */}
                    {loadingInfo && (
                        <div className="flex items-center gap-3 py-8 justify-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Loading dataset metadata…</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 py-5 text-rose-500 bg-rose-50 rounded-xl px-5 border border-rose-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {info && (
                        <>
                            {/* Episode selector */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-semibold text-slate-600">Episode</span>
                                <button
                                    onClick={() => goTo(episodeIdx - 1)}
                                    disabled={episodeIdx === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        max={maxEp}
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                        onBlur={() => goTo(parseInt(inputVal) || 0)}
                                        onKeyDown={(e) => e.key === 'Enter' && goTo(parseInt(inputVal) || 0)}
                                        className="w-20 text-center text-sm font-mono border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400"
                                    />
                                    <span className="text-xs text-slate-400">/ {maxEp}</span>
                                </div>
                                <button
                                    onClick={() => goTo(episodeIdx + 1)}
                                    disabled={episodeIdx >= maxEp}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {loadingData && (
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Loading episode…
                                    </span>
                                )}
                                {dataError && (
                                    <span className="flex items-center gap-1.5 text-xs text-rose-500 max-w-sm">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {dataError}
                                    </span>
                                )}
                                <span className="ml-auto text-xs text-slate-400 font-mono">
                                    {rows.length > 0 && `${rows.length} frames · `}{info.fps} fps
                                    {info.codebase_version && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                            {info.codebase_version}
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Task instruction badge */}
                            {taskInstruction !== null && (
                                <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Task</span>
                                        <p className="text-sm text-indigo-900 mt-0.5">
                                            {taskInstruction.trim()
                                                ? taskInstruction
                                                : <span className="italic text-indigo-400">No task description</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Videos */}
                            {videoUrls.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Film className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-600">Camera Views</span>
                                        {videoClip && (
                                            <span className="text-xs text-slate-400 font-mono ml-1">
                                                — {videoClip.startSec.toFixed(2)}s – {videoClip.endSec.toFixed(2)}s
                                            </span>
                                        )}
                                        {!allVideosReady && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400 ml-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                {videosReady}/{videoUrls.length} ready…
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className={`grid gap-3 ${videoUrls.length === 1
                                            ? 'grid-cols-1 max-w-lg'
                                            : videoUrls.length === 2
                                                ? 'grid-cols-2'
                                                : videoUrls.length === 3
                                                    ? 'grid-cols-3'
                                                    : 'grid-cols-2 md:grid-cols-4'
                                            }`}
                                    >
                                        {videoUrls.map((url, i) => (
                                            <ClippedVideo
                                                key={url}
                                                ref={i === 0 ? firstVideoRef : undefined}
                                                src={url}
                                                startSec={videoClip?.startSec}
                                                endSec={videoClip?.endSec}
                                                label={videoKeys[i]?.split('.').pop() ?? videoKeys[i]}
                                                onReady={() => setVideosReady((n) => n + 1)}
                                                isPlaying={vidPlaying}
                                                onEnded={i === 0 ? () => { setVidPlaying(false); setVidEnded(true); } : undefined}
                                                onProgress={i === 0 ? handleVideoProgress : undefined}
                                                restartSignal={restartSignal}
                                            />
                                        ))}
                                    </div>
                                    {/* Shared video controls below the grid */}
                                    <VideoControls
                                        isPlaying={vidPlaying}
                                        ended={vidEnded}
                                        progress={vidProgress}
                                        currentSec={vidCurrentSec}
                                        totalSec={vidTotalSec}
                                        onPlayPause={handleVidPlayPause}
                                        onRestart={handleVidRestart}
                                        onSeek={handleVidSeek}
                                    />
                                </div>
                            )}

                            {/* Charts — action (left) + observation.state (right) side by side */}
                            {hasCharts && rows.length > 0 && (() => {
                                // Assign color offsets per group label.
                                // Action and state with the SAME label share the same offset
                                // so identical dimensions get identical colors on both sides.
                                let cursor = 0;
                                const groupColorMap: Record<string, number> = {};
                                // Iterate all unique labels in display order
                                const allLabels = Array.from(new Set([
                                    ...actionGroups.map((g) => g.label),
                                    ...stateGroups.map((g) => g.label),
                                ]));
                                for (const label of allLabels) {
                                    groupColorMap[label] = cursor;
                                    // Advance cursor by the number of series in this group
                                    const ag = actionGroups.find((g) => g.label === label);
                                    const sg = stateGroups.find((g) => g.label === label);
                                    const seriesCount = Math.max(
                                        ag?.seriesKeys.length ?? 0,
                                        sg?.seriesKeys.length ?? 0
                                    );
                                    cursor += seriesCount;
                                }

                                return (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-semibold text-slate-600">
                                                Trajectory Data
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                — hover any chart to sync the frame indicator across all panels
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            {allLabels.map((label) => {
                                                const ag = actionGroups.find((g) => g.label === label);
                                                const sg = stateGroups.find((g) => g.label === label);
                                                const hasBoth = ag && sg;
                                                // Same colorOffset for action and state → identical dim → identical color
                                                const colorOffset = groupColorMap[label] ?? 0;

                                                return (
                                                    <div key={label}>
                                                        {/* Section label */}
                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                            {label}
                                                        </p>
                                                        {hasBoth ? (
                                                            <div className="grid grid-cols-2 gap-8">
                                                                <div>
                                                                    <p className="text-xs text-slate-400 mb-1.5 pl-1">Action</p>
                                                                    <ChartPanel
                                                                        title={ag.label}
                                                                        data={rows}
                                                                        seriesKeys={ag.seriesKeys}
                                                                        labels={ag.labels}
                                                                        colorOffset={colorOffset}
                                                                        syncId={hfId}
                                                                        playFrame={playingFrame}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-400 mb-1.5 pl-1">Observation State</p>
                                                                    <ChartPanel
                                                                        title={sg.label}
                                                                        data={rows}
                                                                        seriesKeys={sg.seriesKeys}
                                                                        labels={sg.labels}
                                                                        colorOffset={colorOffset}
                                                                        syncId={hfId}
                                                                        playFrame={playingFrame}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : ag ? (
                                                            <div className="grid grid-cols-2 gap-8">
                                                                <div>
                                                                    <p className="text-xs text-slate-400 mb-1.5 pl-1">Action</p>
                                                                    <ChartPanel
                                                                        title={ag.label}
                                                                        data={rows}
                                                                        seriesKeys={ag.seriesKeys}
                                                                        labels={ag.labels}
                                                                        colorOffset={colorOffset}
                                                                        syncId={hfId}
                                                                        playFrame={playingFrame}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : sg ? (
                                                            <div className="grid grid-cols-2 gap-8">
                                                                <div>
                                                                    <p className="text-xs text-slate-400 mb-1.5 pl-1">Observation State</p>
                                                                    <ChartPanel
                                                                        title={sg.label}
                                                                        data={rows}
                                                                        seriesKeys={sg.seriesKeys}
                                                                        labels={sg.labels}
                                                                        colorOffset={colorOffset}
                                                                        syncId={hfId}
                                                                        playFrame={playingFrame}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Scalars */}
                                        {scalarKeys.length > 0 && (
                                            <ChartPanel
                                                title="Scalars"
                                                data={rows}
                                                seriesKeys={scalarKeys}
                                                labels={scalarKeys}
                                                colorOffset={cursor}
                                                syncId={hfId}
                                                playFrame={playingFrame}
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Row parsing helper ───────────────────────────────────────────────────────

function parseRows(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawRows: any[],
    hfInfo: HFInfo,
    frameOffset: number
): EpisodeRow[] {
    return rawRows.map((raw, ri) => {
        const row: EpisodeRow = {
            timestamp: Number(raw['timestamp'] ?? 0),
            frame_index: Number(raw['frame_index'] ?? ri + frameOffset),
        };

        for (const [colName, feat] of Object.entries(hfInfo.features)) {
            if (feat.dtype === 'video') continue;
            const val = raw[colName];
            if (val === undefined || val === null) continue;

            if (
                typeof val === 'object' &&
                !Array.isArray(val) &&
                'buffer' in (val as object)
            ) {
                // TypedArray (Float32Array etc.) from hyparquet
                const arr = val as Float32Array;
                const names = getAxisNames(feat);
                for (let d = 0; d < arr.length; d++) {
                    row[`${colName}__${names[d] ?? d}`] = arr[d];
                }
            } else if (Array.isArray(val)) {
                const names = getAxisNames(feat);
                for (let d = 0; d < val.length; d++) {
                    row[`${colName}__${names[d] ?? d}`] = Number(val[d]);
                }
            } else if (
                colName !== 'timestamp' &&
                colName !== 'frame_index'
            ) {
                row[colName] = Number(val);
            }
        }
        return row;
    });
}
