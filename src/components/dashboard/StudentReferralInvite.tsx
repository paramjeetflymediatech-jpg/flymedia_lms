'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReferredFriend {
  id: string;
  friendName: string;
  joinedAt: string | Date;
  rewardStatus?: string;
}

interface StudentReferralInviteProps {
  referralCode: string;
  friendsReferred: number;
  freeDemosLeft: number;
  freeDemosUsed: number;
  referredFriends?: ReferredFriend[];
  compact?: boolean;
}

export default function StudentReferralInvite({
  referralCode,
  friendsReferred,
  freeDemosLeft,
  freeDemosUsed,
  referredFriends = [],
  compact = false,
}: StudentReferralInviteProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://course.flymediatech.com');
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        setCanShare(true);
      }
    }
  }, []);

  const inviteLink = `${baseUrl}/register?ref=${referralCode}`;
  const shareMessage = `Hey! 🚀 I'm learning top technical skills on Flymedia LMS.\n\nUse my exclusive invite link to join:\n${inviteLink}\n\nWhen you sign up with my code "${referralCode}", we BOTH unlock a 1-on-1 ₹99 Live Demo Class with senior mentors for FREE! 🎉`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = inviteLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Flymedia LMS & Get Free ₹99 Demo Class',
          text: shareMessage,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/20 to-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-rose-300 text-xs font-extrabold tracking-wide">
              <span>⚡ REFERRAL REWARDS CHAIN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Share Your Invite Link With Friends
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Send your unique invite link to friends. When they click and register, your referral code is auto-applied and you <strong className="text-white">both unlock a 1-on-1 ₹99 Live Demo Class with senior mentors for FREE!</strong>
            </p>
          </div>

          {/* Referral Stats Summary Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:px-4 sm:py-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-orange-400">{friendsReferred}</p>
              <p className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider mt-0.5">Friends Joined</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:px-4 sm:py-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{freeDemosLeft}</p>
              <p className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider mt-0.5">Demos Left</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:px-4 sm:py-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-blue-400">{freeDemosUsed}</p>
              <p className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider mt-0.5">Demos Used</p>
            </div>
          </div>
        </div>

        {/* Invite Link & Code Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Full Invite Link Box */}
          <div className="lg:col-span-8 bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Student Invite Link
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Code Auto-Applied on Click
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/70 border border-slate-700/80 rounded-xl p-1.5 pl-3.5 focus-within:border-rose-500 transition-colors">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-transparent text-sm font-mono text-slate-200 outline-none select-all truncate py-1.5"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  copiedLink
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span>Link Copied! ✨</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span>Copy Invite Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="lg:col-span-4 bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Referral Code
              </span>
              <span className="text-[11px] font-semibold text-orange-400">
                Single Code
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-950/70 border border-slate-700/80 rounded-xl p-1.5 pl-3.5">
              <span className="font-mono text-base font-black tracking-wider text-orange-400">
                {referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  copiedCode
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {copiedCode ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Share Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.531 1.731.796 2.781.796 3.183 0 5.769-2.586 5.769-5.766.001-3.182-2.585-5.78-5.769-5.78zm7.39 5.765c0 4.077-3.313 7.39-7.39 7.39-1.288 0-2.492-.331-3.541-.912l-5.143 1.349 1.371-5.019c-.663-1.09-1.077-2.368-1.077-3.808 0-4.077 3.313-7.39 7.39-7.39 4.078 0 7.39 3.313 7.39 7.39z" />
              </svg>
              <span>Share on WhatsApp</span>
            </button>

            {/* Native Share Button */}
            {canShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span>Share Link</span>
              </button>
            )}

            {!compact && (
              <Link
                href="/dashboard/referrals"
                className="text-xs text-slate-300 hover:text-white underline underline-offset-4 font-semibold px-2"
              >
                View Full Referral Chain →
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#callback"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Book Demo with Free Credit ({freeDemosLeft} left)</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 3 Step Visual Explainer */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 font-black text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="text-xs font-bold text-white">Send Your Invite Link</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Share with classmates, colleagues, or WhatsApp groups.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="text-xs font-bold text-white">Friend Registers</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Your code is automatically filled. They create their account.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="text-xs font-bold text-white">Both Get ₹99 Demo Free</p>
              <p className="text-[11px] text-slate-300 mt-0.5">You unlock 1 demo class pass to learn 1-on-1 with industry mentors!</p>
            </div>
          </div>
        </div>

        {/* Referred Friends Activity List (if any) */}
        {referredFriends.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Your Referral Chain ({referredFriends.length} Joined)
              </h4>
              <span className="text-[11px] text-emerald-400 font-bold">
                +{referredFriends.length} Demo Credits Earned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {referredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {friend.friendName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{friend.friendName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(friend.joinedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    +1 Demo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
