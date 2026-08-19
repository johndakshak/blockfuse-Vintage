export type DeliveryOption = {
  id: string;
  name: string;
  desc: string;
  cost: number;
  days: number;
};

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "standard", name: "Standard Delivery", desc: "3 – 5 business days · Lagos & environs", cost: 2500, days: 5 },
  { id: "express",  name: "Express Delivery",  desc: "Next business day · Lagos only",         cost: 6000, days: 1 },
  { id: "pickup",   name: "Store Pickup",       desc: "Ready in 24 hours · 14 Bode Thomas St, Lagos", cost: 0, days: 1 },
];

type Props = {
  selected: string;
  onChange: (id: string) => void;
};

export default function DeliveryMethod({ selected, onChange }: Props) {
  return (
    <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden mb-5">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-charcoal/10">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}>
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Delivery Method</span>
      </div>

      {/* Options */}
      <div className="p-6 flex flex-col gap-3">
        {DELIVERY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <label
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex items-center gap-4 border-[1.5px] rounded-xl px-5 py-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent/[0.06]"
                  : "border-charcoal/10 hover:border-accent/40"
              }`}
            >
              <input
                type="radio"
                name="delivery"
                readOnly
                checked={isSelected}
                className="accent-accent flex-shrink-0"
              />
              <div className="flex-1">
                <div className="text-sm text-charcoal">{opt.name}</div>
                <div className="text-[0.72rem] text-muted mt-0.5">{opt.desc}</div>
              </div>
              <span
                className={`font-cormorant text-[1.05rem] font-semibold whitespace-nowrap ${
                  opt.cost === 0 ? "text-accent-dark" : "text-charcoal"
                }`}
                style={{ color: opt.cost === 0 ? "#a8893e" : undefined }}
              >
                {opt.cost === 0 ? "Free" : `₦${opt.cost.toLocaleString("en-NG")}`}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
