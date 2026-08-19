import { CUSTOMERS, customerStatusBadge } from "../adminData";
import { Badge, ViewBtn, DelBtn } from "./DashboardSection";

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

export default function CustomersSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Customers</h2>
        <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg bg-charcoal text-cream hover:bg-[#2c2c2a] transition-colors cursor-pointer border-none">
          + Add Customer
        </button>
      </div>

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">All Customers</span>
          <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-3 py-1.5 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent">
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Customer","Email","Phone","Orders","Total Spent","Status","Joined","Actions"].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((u) => {
                const initials = u.name.split(" ").map((n) => n[0]).join("");
                return (
                  <tr key={u.name} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-[0.68rem] font-semibold flex-shrink-0" style={{ color: "#a8893e" }}>
                          {initials}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className={`${tdClass} text-muted`}>{u.email}</td>
                    <td className={`${tdClass} text-muted`}>{u.phone}</td>
                    <td className={tdClass}>{u.orders}</td>
                    <td className={`${tdClass} font-medium`}>{u.spent}</td>
                    <td className={tdClass}><Badge label={u.status} className={customerStatusBadge[u.status]} /></td>
                    <td className={`${tdClass} text-warmgray`}>{u.joined}</td>
                    <td className={tdClass}>
                      <div className="flex gap-1.5"><ViewBtn /><DelBtn /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
