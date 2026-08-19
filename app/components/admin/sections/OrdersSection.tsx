import { ORDERS, orderStatusBadge, payStatusBadge } from "../adminData";
import { Badge, ViewBtn, EditBtn } from "./DashboardSection";

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

export default function OrdersSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Orders</h2>
        <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent">
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">All Orders</span>
          <select className="font-barlow text-[0.72rem] text-muted border border-charcoal/[0.09] rounded-md px-2 py-1 bg-white outline-none">
            <option>All Statuses</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Order ID","Customer","Items","Amount","Payment","Status","Date","Actions"].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                  <td className={tdClass}><span className="font-medium" style={{ color: "#a8893e" }}>{o.id}</span></td>
                  <td className={tdClass}>{o.name}</td>
                  <td className={tdClass}>{o.items}</td>
                  <td className={`${tdClass} font-medium`}>{o.amt}</td>
                  <td className={tdClass}><Badge label={o.pay} className={payStatusBadge[o.pay]} /></td>
                  <td className={tdClass}><Badge label={o.status} className={orderStatusBadge[o.status]} /></td>
                  <td className={`${tdClass} text-muted`}>{o.date}</td>
                  <td className={tdClass}>
                    <div className="flex gap-1.5"><ViewBtn /><EditBtn /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
