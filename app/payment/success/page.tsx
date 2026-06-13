import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
      
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-4">
        {/* Decorative background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-20 rounded-full mix-blend-overlay blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white opacity-30 rounded-full mix-blend-overlay blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/95 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] rounded-3xl p-10 text-center border border-white/40 transform transition-all hover:scale-[1.02] duration-500">
            
            {/* Animated Icon Container */}
            <div className="relative mx-auto flex items-center justify-center h-28 w-28 mb-8">
              <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-60"></div>
              <div className="relative z-10 flex items-center justify-center h-full w-full bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full shadow-inner border-4 border-white">
                <svg className="h-14 w-14 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4 tracking-tight drop-shadow-sm">
              Payment Successful!
            </h2>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium">
              Thank you for your purchase. Your enrollment is confirmed and your journey begins now. Get ready to dive in!
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl hover:from-emerald-600 hover:to-teal-600 shadow-[0_10px_20px_rgba(16,_185,_129,_0.3)] hover:shadow-[0_10px_20px_rgba(16,_185,_129,_0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Go to My Dashboard
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
