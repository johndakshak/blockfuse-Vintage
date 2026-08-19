import { ORDERS, orderStatusBadge, payStatusBadge } from "../adminData";
import type { SectionId } from "../Sidebar";

// Shared sub-components
export function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center text-[0.62rem] font-medium tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

export function EditBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-all text-muted hover:text-charcoal">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

export function DelBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-rust transition-all text-muted hover:text-rust">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      </svg>
    </button>
  );
}

export function ViewBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-all text-muted hover:text-charcoal">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

// Stats
const STATS = [
  { label: "Total Revenue", val: "₦4.2M", sub: "+18.4% this month", up: true,  color: "gold",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { label: "Total Orders",  val: "284",   sub: "+12 new today",     up: true,  color: "green", icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth={1.8}><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { label: "Customers",     val: "1,480", sub: "+34 this week",     up: true,  color: "blue",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a82b8" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { label: "Products",      val: "48",    sub: "3 low stock",       up: false, color: "rust",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#b05c3a" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
];

const colorMap: Record<string, { bar: string; icon: string }> = {
  gold:  { bar: "from-[#a8893e] to-[#c8a96e]", icon: "bg-[rgba(200,169,110,0.1)]" },
  green: { bar: "from-[#3a8a5c] to-[#4a9068]", icon: "bg-[rgba(74,144,104,0.1)]"  },
  blue:  { bar: "from-[#3a7ab0] to-[#4a82b8]", icon: "bg-[rgba(74,130,184,0.1)]"  },
  rust:  { bar: "from-[#8a3a1e] to-[#b05c3a]", icon: "bg-[rgba(176,92,58,0.1)]"   },
};

const CHART_HEIGHTS = [45, 62, 50, 78, 58, 92, 70];
const CHART_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const CATEGORIES = [
  { name: "Jackets",      amt: "₦1.2M", pct: 82 },
  { name: "Dresses",      amt: "₦890K", pct: 66 },
  { name: "Accessories",  amt: "₦640K", pct: 48 },
  { name: "Trousers",     amt: "₦420K", pct: 32 },
  { name: "Tops",         amt: "₦290K", pct: 20 },
];

type Props = { onViewAllOrders: () => void };

export default function DashboardSection({ onViewAllOrders }: Props) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Dashboard</h2>
          <p className="text-[0.75rem] text-muted mt-0.5">Monday, March 9, 2026</p>
        </div>
        <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent">
          Download Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {STATS.map((s) => {
          const c = colorMap[s.color];
          return (
            <div key={s.label} className="bg-white border border-charcoal/[0.09] rounded-xl p-5 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(26,26,24,0.07)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-gradient-to-r ${c.bar}`} />
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-[9px] flex items-center justify-center ${c.icon}`}>
                {s.icon}
              </div>
              <p className="text-[0.67rem] tracking-[0.18em] uppercase text-warmgray mb-2">{s.label}</p>
              <p className="font-cormorant text-[1.9rem] font-semibold text-charcoal leading-none mb-1">{s.val}</p>
              <p className={`text-[0.73rem] flex items-center gap-1 ${s.up ? "text-[#4a9068]" : "text-[#b05c3a]"}`}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  {s.up ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
                </svg>
                {s.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">
        {/* Revenue chart */}
        <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
            <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Revenue Overview</span>
            <select className="font-barlow text-[0.72rem] text-muted border border-charcoal/[0.09] rounded-md px-2 py-1 bg-white outline-none">
              <option>Last 7 days</option><option>Last 30 days</option><option>This year</option>
            </select>
          </div>
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-end gap-1.5 h-[140px] pb-2 border-b border-charcoal/[0.09]">
              {CHART_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-b from-accent to-[#a8893e] opacity-70 hover:opacity-100 hover:scale-y-[1.03] transition-all duration-200 cursor-pointer origin-bottom"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex gap-1.5 pt-1.5">
              {CHART_LABELS.map((l) => (
                <span key={l} className="flex-1 text-center text-[0.62rem] text-warmgray tracking-[0.06em]">{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal/[0.09]">
            <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Top Categories</span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {CATEGORIES.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[0.82rem] text-charcoal">{c.name}</span>
                  <span className="text-[0.75rem] text-muted">{c.amt}</span>
                </div>
                <div className="h-[5px] bg-[#f4f2ee] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#a8893e] to-accent rounded-full"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Recent Orders</span>
          <button
            onClick={onViewAllOrders}
            className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-3 py-1.5 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Order ID","Customer","Amount","Status","Date"].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                  <td className={tdClass}><span className="font-medium" style={{ color: "#a8893e" }}>{o.id}</span></td>
                  <td className={tdClass}>{o.name}</td>
                  <td className={`${tdClass} font-medium`}>{o.amt}</td>
                  <td className={tdClass}><Badge label={o.status} className={orderStatusBadge[o.status]} /></td>
                  <td className={`${tdClass} text-muted`}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
