import Link from 'next/link';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ demo?: string; transactionId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isDemo = resolvedParams.demo === 'true';

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
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
      
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 p-4">
        {/* Brand Theme Decorative Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-blob" style={{ background: '#E60870' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000" style={{ background: '#F8750E' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-blob" style={{ background: '#E63747' }}></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Glassmorphism Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(230,8,112,0.15)] rounded-3xl p-8 sm:p-10 text-center border border-white/60 transform transition-all hover:scale-[1.01] duration-500">
            
            {/* Animated Brand Theme Icon Container */}
            <div className="relative mx-auto flex items-center justify-center h-28 w-28 mb-8 animate-float">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}></div>
              <div 
                className="relative z-10 flex items-center justify-center h-full w-full rounded-full shadow-inner border-[6px] border-white shadow-[0_10px_20px_rgba(230,8,112,0.3)]"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                <svg className="h-12 w-12 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
              <span>{isDemo ? '⚡ ₹99 Demo Payment Confirmed' : '✓ Verified Payment'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text mb-4 tracking-tight" style={{ backgroundImage: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}>
              {isDemo ? 'Demo Class Booked!' : 'Payment Successful!'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed font-medium">
              {isDemo
                ? 'Thank you! Your 1-on-1 demo slot has been secured with PhonePe. Your senior mentor has been assigned and will connect within 15 minutes to confirm your timing.'
                : 'Thank you for your purchase! Your enrollment is confirmed and you are ready to start learning.'}
            </p>
            
            {isDemo && (
              <div className="mb-8 p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-left space-y-2 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-emerald-600 font-black text-sm">₹99.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tuition Benefit:</span>
                  <span className="text-rose-600 font-extrabold">100% Credited on Admission</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Counselor Hotline:</span>
                  <a href="tel:+919779324178" className="text-slate-900 underline font-black">+91-97793-24178</a>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Link 
                href={isDemo ? '/' : '/dashboard'}
                className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-base sm:text-lg font-bold text-white transition-all duration-300 rounded-2xl hover:opacity-90 shadow-lg shadow-rose-500/25 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {isDemo ? 'Return to Home' : 'Go to My Dashboard'}
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
