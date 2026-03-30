import React from "react";

function getToastStyles(type) {
  if (type === "success") {
    return {
      bar: "bg-emerald-400",
      iconWrap: "bg-emerald-400/20 text-emerald-300",
      title: "Success",
      icon: "✓",
    };
  }

  if (type === "error") {
    return {
      bar: "bg-red-400",
      iconWrap: "bg-red-400/20 text-red-300",
      title: "Error",
      icon: "✕",
    };
  }

  if (type === "warning") {
    return {
      bar: "bg-yellow-300",
      iconWrap: "bg-yellow-300/20 text-yellow-200",
      title: "Warning",
      icon: "!",
    };
  }

  return {
    bar: "bg-sky-400",
    iconWrap: "bg-sky-400/20 text-sky-300",
    title: "Info",
    icon: "i",
  };
}

export default function GlobalMessage({ type = "info", message, onClose }) {
  if (!message) {
    return null;
  }

  const styles = getToastStyles(type);

  return (
    <>
      <style>{`
        @keyframes discordToastIn {
          0% {
            opacity: 0;
            transform: translateY(-18px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes discordToastGlow {
          0%, 100% {
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
          }
          50% {
            box-shadow: 0 22px 55px rgba(0, 0, 0, 0.6);
          }
        }

        .discord-toast-enter {
          animation:
            discordToastIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
            discordToastGlow 2.4s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-x-0 top-5 z-[300] flex justify-center px-4">
        <div className="pointer-events-auto discord-toast-enter w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#1e1f22] text-white shadow-2xl">
          <div className={`h-1.5 w-full ${styles.bar}`} />

          <div className="flex items-start gap-4 px-5 py-4">
            <div
              className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${styles.iconWrap}`}
            >
              {styles.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                {styles.title}
              </div>

              <div className="mt-1 text-lg font-semibold leading-7 text-white">
                {message}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}