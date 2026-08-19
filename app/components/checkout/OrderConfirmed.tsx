import Link from "next/link";

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");

export type ConfirmData = {
  orderId: string;
  total: number;
  payMethod: string;
  shipLabel: string;
  arrivalDate: string;
};

type Props = {
  data: ConfirmData;
};

export default function OrderConfirmed({ data }: Props) {
  return (
    <div className="fixed inset-0 bg-cream/97 z-[800] flex items-center justify-center p-6">
      <div
        className="bg-white border border-charcoal/10 rounded-2xl p-10 max-w-[460px] w-full text-center shadow-[0_20px_60px_rgba(26,26,24,0.1)]"
        style={{ animation: "popIn 0.5s cubic-bezier(.16,1,.3,1) both" }}
      >
        {/* Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-[rgba(74,144,104,0.1)] border-2 border-[rgba(74,144,104,0.3)] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth={2.2}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="font-cormorant text-[2rem] font-semibold text-charcoal mb-1">Order Confirmed!</h2>
        <p className="font-bebas text-[0.95rem] tracking-[0.22em] mb-3" style={{ color: "#a8893e" }}>
          {data.orderId}
        </p>
        <p className="text-[0.83rem] text-muted leading-[1.7] mb-6">
          Thank you for shopping with Blockfuse Vintage. A confirmation email has been sent to you with your order details and tracking information.
        </p>

        {/* Details */}
        <div className="bg-cream rounded-xl p-5 mb-6 flex flex-col gap-2 text-left">
          {[
            { key: "Total",      val: fmt(data.total) },
            { key: "Payment",    val: data.payMethod  },
            { key: "Delivery",   val: data.shipLabel  },
            { key: "Est. Arrival", val: data.arrivalDate },
          ].map(({ key, val }) => (
            <div key={key} className="flex justify-between text-[0.82rem]">
              <span className="text-muted">{key}</span>
              <span className="text-charcoal font-medium">{val}</span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="block w-full bg-charcoal text-cream font-barlow font-semibold text-[0.75rem] tracking-[0.2em] uppercase py-4 rounded-xl transition-all duration-200 hover:bg-charcoal/90 hover:-translate-y-0.5"
        >
          Back to Store
        </Link>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
