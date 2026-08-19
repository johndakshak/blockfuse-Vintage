import { fmt } from "./cartTypes";

type Suggestion = {
  name: string;
  price: number;
};

export const SUGGESTIONS: Suggestion[] = [
  { name: "Tweed Blazer",        price: 42000 },
  { name: "Wide Leg Trousers",   price: 18000 },
  { name: "Leather Belt",        price: 9500  },
  { name: "Vintage Silk Blouse", price: 16500 },
];

type Props = {
  onAdd: (name: string, price: number) => void;
};

export default function Suggestions({ onAdd }: Props) {
  return (
    <div className="mt-10">
      <p className="text-[0.68rem] tracking-[0.2em] uppercase text-warmgray mb-5">You May Also Like</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUGGESTIONS.map((s) => (
          <div
            key={s.name}
            className="bg-white border border-charcoal/10 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_6px_20px_rgba(26,26,24,0.1)] hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Image placeholder */}
            <div className="h-[140px] bg-parchment flex items-center justify-center">
              <span className="text-[0.58rem] tracking-[0.1em] uppercase text-warmgray">Photo</span>
            </div>
            <div className="p-3">
              <div className="text-[0.8rem] text-charcoal mb-1 truncate">{s.name}</div>
              <div className="font-cormorant text-[0.95rem] font-semibold text-charcoal">{fmt(s.price)}</div>
              <button
                onClick={() => onAdd(s.name, s.price)}
                className="w-full mt-2 border border-charcoal/10 rounded-md py-1.5 font-barlow text-[0.65rem] tracking-[0.1em] uppercase text-muted hover:border-accent hover:text-accent-dark transition-all duration-200 bg-transparent cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                + Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
