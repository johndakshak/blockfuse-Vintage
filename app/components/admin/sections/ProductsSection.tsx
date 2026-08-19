import { PRODUCTS, productStatusBadge } from "../adminData";
import { Badge, EditBtn, DelBtn } from "./DashboardSection";

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

export default function ProductsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Products</h2>
        <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg bg-charcoal text-cream hover:bg-[#2c2c2a] transition-colors cursor-pointer border-none">
          + Add Product
        </button>
      </div>

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">All Products</span>
          <div className="flex gap-2">
            <select className="font-barlow text-[0.72rem] text-muted border border-charcoal/[0.09] rounded-md px-2 py-1 bg-white outline-none">
              <option>All Categories</option><option>Jackets</option><option>Dresses</option><option>Accessories</option>
            </select>
            <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-3 py-1 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent">
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Product","Category","Price","Stock","Status","Added","Actions"].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.name} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-[38px] h-[38px] rounded-lg bg-[#f4f2ee] border border-charcoal/[0.09] flex items-center justify-center text-[0.55rem] text-warmgray flex-shrink-0">
                        IMG
                      </div>
                      {p.name}
                    </div>
                  </td>
                  <td className={`${tdClass} text-muted`}>{p.cat}</td>
                  <td className={`${tdClass} font-medium`}>{p.price}</td>
                  <td className={tdClass}>{p.stock}</td>
                  <td className={tdClass}><Badge label={p.status} className={productStatusBadge[p.status]} /></td>
                  <td className={`${tdClass} text-warmgray`}>{p.date}</td>
                  <td className={tdClass}>
                    <div className="flex gap-1.5"><EditBtn /><DelBtn /></div>
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
