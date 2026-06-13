import Link from 'next/link';

export default function PaymentSuccessPage() {
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
          <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(230,8,112,0.15)] rounded-3xl p-10 text-center border border-white/60 transform transition-all hover:scale-[1.01] duration-500">
            
            {/* Animated Brand Theme Icon Container */}
            <div className="relative mx-auto flex items-center justify-center h-28 w-28 mb-8 animate-float">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}></div>
              <div 
                className="relative z-10 flex items-center justify-center h-full w-full rounded-full shadow-inner border-[6px] border-white shadow-[0_10px_20px_rgba(230,8,112,0.3)]"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                <svg className="h-12 w-12 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Confetti-like stars around the checkmark */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text mb-4 tracking-tight" style={{ backgroundImage: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}>
              Payment Successful!
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
              Thank you for your purchase! Your enrollment is confirmed and you are ready to start learning.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 rounded-2xl hover:opacity-90 shadow-lg shadow-rose-500/25 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
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
