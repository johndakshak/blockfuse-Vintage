export type ShippingData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
};

const STATES = [
  "Abia","Abuja (FCT)","Akwa Ibom","Anambra","Bauchi","Benue",
  "Cross River","Delta","Edo","Enugu","Imo","Kaduna","Kano",
  "Lagos","Ogun","Ondo","Osun","Oyo","Rivers",
];

const COUNTRIES = ["Nigeria","Ghana","Kenya","South Africa","United Kingdom","United States"];

const inputClass =
  "w-full bg-cream border border-charcoal/10 rounded-lg px-4 py-3 font-barlow text-sm text-charcoal placeholder-warmgray outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,169,110,0.12)] transition-all duration-200";

const labelClass = "block text-[0.64rem] font-barlow tracking-[0.18em] uppercase text-warmgray mb-1.5";

type Props = {
  data: ShippingData;
  onChange: (data: ShippingData) => void;
};

export default function ShippingForm({ data, onChange }: Props) {
  const set = (field: keyof ShippingData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden mb-5">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-charcoal/10">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Shipping Details</span>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" placeholder="Margaret" autoComplete="given-name"
              value={data.firstName} onChange={set("firstName")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" placeholder="Holloway" autoComplete="family-name"
              value={data.lastName} onChange={set("lastName")} className={inputClass} />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" placeholder="margaret@example.com" autoComplete="email"
              value={data.email} onChange={set("email")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" placeholder="+234 800 000 0000" autoComplete="tel"
              value={data.phone} onChange={set("phone")} className={inputClass} />
          </div>
        </div>

        {/* Street */}
        <div>
          <label className={labelClass}>Street Address</label>
          <input type="text" placeholder="12 Akin Adesola Street, VI" autoComplete="street-address"
            value={data.street} onChange={set("street")} className={inputClass} />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input type="text" placeholder="Lagos" autoComplete="address-level2"
              value={data.city} onChange={set("city")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select value={data.state} onChange={set("state")} className={`${inputClass} cursor-pointer`}>
              <option value="">Select state…</option>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Postal & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Postal Code</label>
            <input type="text" placeholder="100001" autoComplete="postal-code"
              value={data.postalCode} onChange={set("postalCode")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <select value={data.country} onChange={set("country")} className={`${inputClass} cursor-pointer`}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>
            Delivery Notes{" "}
            <span className="normal-case tracking-normal text-[0.7rem] text-warmgray">(optional)</span>
          </label>
          <input type="text" placeholder="Gate code, landmark, special instructions…"
            value={data.notes} onChange={set("notes")} className={inputClass} />
        </div>
      </div>
    </div>
  );
}
