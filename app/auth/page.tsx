'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Phone, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { getCaptcha, login, sendSms } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type Step = 'phone' | 'sms';

export default function LoginPage() {
    const router = useRouter();
    const { login: authLogin, user } = useAuth();

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [captchaId, setCaptchaId] = useState('');
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 已登录则跳转
    useEffect(() => {
        if (user) router.replace('/');
    }, [user, router]);

    // 获取图形验证码
    const fetchCaptcha = async () => {
        try {
            const res = await getCaptcha();
            setCaptchaId(res.captcha_id);
            setCaptchaImg(res.image_base64);
            setCaptchaText('');
        } catch {
            setError('获取验证码失败，请重试');
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    // 倒计时
    const startCountdown = () => {
        setCountdown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    };

    // 发送短信
    const handleSendSms = async () => {
        setError('');
        if (!agreed) {
            setError('请先阅读并同意用户协议与隐私政策');
            return;
        }
        if (!phone || phone.length !== 11) {
            setError('请输入正确的手机号');
            return;
        }
        if (!captchaText) {
            setError('请输入图形验证码');
            return;
        }
        setLoading(true);
        try {
            await sendSms(phone, captchaId, captchaText, 'login');
            setStep('sms');
            startCountdown();
        } catch (e: unknown) {
            setError((e as Error).message || '发送失败');
            fetchCaptcha();
        } finally {
            setLoading(false);
        }
    };

    // 登录
    const handleLogin = async () => {
        setError('');
        if (!smsCode || smsCode.length !== 6) {
            setError('请输入6位短信验证码');
            return;
        }
        setLoading(true);
        try {
            const tokens = await login(phone, smsCode);
            await authLogin(tokens.access_token, tokens.refresh_token);
            router.replace('/');
        } catch (e: unknown) {
            setError((e as Error).message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-16">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
                <div className="flex items-center gap-2 mb-8">
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    <h1 className="text-xl font-bold text-slate-800">
                        {step === 'phone' ? '登录 / 注册' : '输入验证码'}
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {step === 'phone' ? (
                    <div className="space-y-4">
                        {/* 手机号 */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">手机号</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    maxLength={11}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    placeholder="请输入11位手机号"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* 图形验证码 */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">图形验证码</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={captchaText}
                                    onChange={(e) => setCaptchaText(e.target.value.toUpperCase())}
                                    placeholder="4位验证码"
                                    className="flex-1 px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-slate-50 font-mono tracking-widest"
                                />
                                <div className="flex items-center gap-2">
                                    {captchaImg && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={captchaImg}
                                            alt="验证码"
                                            className="h-10 rounded-lg border border-slate-200 cursor-pointer"
                                            onClick={fetchCaptcha}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={fetchCaptcha}
                                        className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400"
                                        title="刷新验证码"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSendSms}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            获取短信验证码
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">
                            已向 <span className="font-semibold text-slate-700">{phone.slice(0, 3)}****{phone.slice(7)}</span> 发送验证码
                        </p>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">短信验证码</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={smsCode}
                                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="请输入6位验证码"
                                className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-slate-50 font-mono tracking-widest"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                登录 / 注册
                            </button>
                            {countdown > 0 ? (
                                <span className="px-4 py-3 text-sm text-slate-400 border border-slate-200 rounded-xl">
                                    {countdown}s
                                </span>
                            ) : (
                                <button
                                    onClick={() => { setStep('phone'); fetchCaptcha(); }}
                                    className="px-4 py-3 text-sm text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition"
                                >
                                    重新获取
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
                    新用户手机号登录将自动注册账号。
                </p>

                {/* 用户协议勾选 */}
                <div className="mt-4 flex items-start gap-2">
                    <input
                        id="agree"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="agree" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                        我已阅读并同意{' '}
                        <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            《用户协议与隐私政策》
                        </button>
                    </label>
                </div>
            </motion.div>

            {/* 用户协议弹窗 */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h2 className="text-base font-bold text-slate-800">Evo-Data 用户协议与隐私政策</h2>
                                <button onClick={() => setShowTerms(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="overflow-y-auto px-6 py-4 text-xs text-slate-600 leading-relaxed space-y-4">
                                <TermsContent />
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100">
                                <button
                                    onClick={() => { setAgreed(true); setShowTerms(false); }}
                                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                                >
                                    我已阅读并同意
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── 协议内容组件 ──────────────────────────────────────────────────────────────

function TermsContent() {
    return (
        <>
            <p className="text-slate-400">更新日期：2026年4月23日 &nbsp;|&nbsp; 生效日期：2026年4月23日</p>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">一、总则</h3>
                <p>Evo-Data 平台（以下简称"本平台"）由上海物智进化科技有限公司（Evomind-tech，以下简称"我们"）开发和运营。本协议适用于您使用本平台的全部服务。请您在注册或使用本平台前仔细阅读本协议，使用本平台即表示您已充分理解并同意本协议的全部条款。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">二、账号注册与安全</h3>
                <p>1. 您需要提供真实有效的手机号码进行注册，并对账号安全负责。</p>
                <p>2. 您不得将账号转让、出售或授权他人使用。</p>
                <p>3. 若发现账号被盗用或存在安全风险，请立即联系我们。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">三、数据上传与使用规范</h3>
                <p>1. 您上传的机器人操作数据集须为您合法拥有或经授权的数据，不得包含侵犯第三方权益的内容。</p>
                <p>2. 上传数据须符合 LeRobot 格式规范，不得上传恶意代码、病毒或其他有害内容。</p>
                <p>3. 您上传的公开数据集默认遵循您选择的开源许可证，我们不对数据内容的准确性作担保。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">四、隐私政策</h3>
                <p>1. <strong>收集的信息</strong>：手机号码（用于身份验证）、上传的数据集文件及元信息、操作日志。</p>
                <p>2. <strong>使用目的</strong>：提供平台服务、保障账号安全、改善用户体验。</p>
                <p>3. <strong>数据存储</strong>：您的数据存储在阿里云（中国大陆）的服务器上，我们采取合理的技术措施保护数据安全。</p>
                <p>4. <strong>数据共享</strong>：我们不会将您的个人信息出售给第三方。在法律要求或保护我们合法权益时，我们可能依法披露相关信息。</p>
                <p>5. <strong>数据删除</strong>：您可联系我们申请删除您的账号及相关数据。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">五、免责声明</h3>
                <p>1. 本平台提供的数据集及相关内容由用户上传，我们不对其准确性、完整性或适用性作任何保证。</p>
                <p>2. 因不可抗力、第三方服务故障等导致的服务中断，我们不承担相应责任。</p>
                <p>3. 您因使用平台数据而产生的任何后果，由您自行承担。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">六、协议变更</h3>
                <p>我们保留随时修改本协议的权利。重大变更将通过平台公告或短信通知。继续使用本平台即视为接受修改后的协议。</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-700 mb-1">七、联系我们</h3>
                <p>上海物智进化科技有限公司（Evomind-tech）</p>
                <p>如有任何问题，请联系：contact@evomind-tech.com</p>
            </section>
        </>
    );
}
