'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get('reason');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Trigger shake animation on mount
    setShake(true);
    const timer = setTimeout(() => setShake(false), 820);
    return () => clearTimeout(timer);
  }, []);

  let errorMessage = "Unfortunately, your payment could not be processed at this time.";
  if (reason === 'not_found') {
    errorMessage = "We couldn't find the associated payment record.";
  } else if (reason === 'error') {
    errorMessage = "An unexpected error occurred while verifying your payment.";
  } else if (reason === 'missing_txn') {
    errorMessage = "Missing transaction ID from the gateway response.";
  }

  return (
    <div className="relative z-10 w-full max-w-lg">
      {/* Glassmorphism Card */}
      <div className="backdrop-blur-2xl bg-white/95 shadow-[0_20px_50px_rgba(225,_29,_72,_0.3)] rounded-3xl p-10 text-center border border-white/20 transform transition-all hover:scale-[1.01] duration-500">
        
        {/* Shaking Icon Container */}
        <div className={`mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-tr from-rose-100 to-red-50 mb-8 shadow-inner border-[6px] border-white ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center justify-center h-20 w-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-full shadow-[0_10px_20px_rgba(225,_29,_72,_0.4)]">
            <svg className="h-10 w-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-700 mb-4 tracking-tight drop-shadow-sm">
          Payment Failed
        </h2>
        <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium px-2">
          {errorMessage} <br className="hidden sm:block" /> Please try again or contact support if the issue persists.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/packages"
            className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl hover:from-rose-600 hover:to-red-700 shadow-[0_10px_20px_rgba(225,_29,_72,_0.2)] hover:shadow-[0_10px_20px_rgba(225,_29,_72,_0.4)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
          </Link>
          <Link 
            href="/dashboard"
            className="group block w-full py-4 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold transition-colors border border-gray-200"
          >
            <span className="flex items-center justify-center gap-2">
              Go to Dashboard
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(3deg); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-zinc-900 p-4">
        {/* Decorative dark mode shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full mix-blend-overlay blur-[100px] animate-pulse duration-1000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-500/10 rounded-full mix-blend-overlay blur-[80px] animate-pulse duration-1000" style={{ animationDelay: '1s' }}></div>

        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <FailedContent />
        </Suspense>
      </div>
    </>
  );
}
