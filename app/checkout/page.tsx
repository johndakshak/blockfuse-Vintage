'use client'

import { useState } from "react";
import Link from "next/link";
import ShippingForm, { type ShippingData } from "../components/checkout/ShippingForm";
import DeliveryMethod, { DELIVERY_OPTIONS } from "../components/checkout/DeliveryMethod";
import OrderSummary from "../components/checkout/OrderSummary";
import OrderConfirmed, { type ConfirmData } from "../components/checkout/OrderConfirmed";

const SUBTOTAL = 90000;

const PAY_METHODS = [
  { key: "card", label: "Debit / Credit Card" },
  { key: "bank", label: "Bank Transfer"        },
  { key: "cod",  label: "Pay on Delivery"      },
] as const;

type PayKey = (typeof PAY_METHODS)[number]["key"];

const defaultShipping: ShippingData = {
  firstName: "", lastName: "", email: "", phone: "",
  street: "", city: "", state: "Lagos", postalCode: "",
  country: "Nigeria", notes: "",
};

export default function CheckoutPage() {
  const [shipping, setShipping]       = useState<ShippingData>(defaultShipping);
  const [deliveryId, setDeliveryId]   = useState("standard");
  const [payMethod, setPayMethod]     = useState<PayKey>("card");
  const [cardNum, setCardNum]         = useState("");
  const [cardExpiry, setCardExpiry]   = useState("");
  const [cardCvv, setCardCvv]         = useState("");
  const [cardName, setCardName]       = useState("");
  const [terms, setTerms]             = useState(false);
  const [error, setError]             = useState("");
  const [confirmed, setConfirmed]     = useState<ConfirmData | null>(null);

  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryId)!;
  const shipCost = selectedDelivery.cost;
  const total = SUBTOTAL + shipCost;

  function fmtCardNum(val: string) {
    const digits = val.replace(/\D/g, "").substring(0, 16);
    return digits.replace(/(.{4})/g, "$1  ").trim();
  }

  function fmtExpiry(val: string) {
    const digits = val.replace(/\D/g, "").substring(0, 4);
    return digits.length >= 2 ? digits.substring(0, 2) + " / " + digits.substring(2) : digits;
  }

  function placeOrder() {
    setError("");
    if (!terms) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + selectedDelivery.days);
    const arrivalDate = arrival.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const orderId = "#BV-" + (Math.floor(Math.random() * 9000) + 1000);
    const payLabel = PAY_METHODS.find((p) => p.key === payMethod)?.label ?? "";

    setConfirmed({ orderId, total, payMethod: payLabel, shipLabel: selectedDelivery.name, arrivalDate });
  }

  const inputClass = "w-full bg-cream border border-charcoal/10 rounded-lg px-4 py-3 font-barlow text-sm text-charcoal placeholder-warmgray outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,169,110,0.12)] transition-all duration-200";
  const labelClass = "block text-[0.64rem] font-barlow tracking-[0.18em] uppercase text-warmgray mb-1.5";

  return (
    <>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      {/* Slim checkout nav */}
      <nav className="fixed top-[3px] left-0 right-0 h-[60px] bg-cream/95 backdrop-blur-xl border-b border-charcoal/[0.07] flex items-center justify-between px-8 z-[500]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[34px] h-[34px] rounded-full border-2 border-accent bg-charcoal flex items-center justify-center flex-shrink-0">
            <span className="font-cormorant text-accent text-[0.85rem] font-semibold">BV</span>
          </div>
          <div className="font-bebas text-[1.2rem] tracking-[0.1em] text-charcoal leading-none">
            Blockfuse
            <sub className="block font-barlow font-light text-[0.5rem] tracking-[0.25em] uppercase text-warmgray leading-none" style={{ verticalAlign: "baseline" }}>
              Vintage
            </sub>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.1em] uppercase text-warmgray">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure Checkout
        </div>
      </nav>

      {/* Page */}
      <div className="pt-[63px] min-h-screen bg-cream">
        <div className="max-w-[1060px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── LEFT: Form column ── */}
          <div>
            {/* Breadcrumb + title */}
            <div className="mb-7">
              <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.12em] uppercase text-warmgray mb-2">
                <Link href="/" className="hover:text-accent-dark transition-colors" style={{ color: "inherit" }}>Home</Link>
                <span>/</span>
                <Link href="/cart" className="hover:text-accent-dark transition-colors" style={{ color: "inherit" }}>Cart</Link>
                <span>/</span>
                <span className="text-charcoal">Checkout</span>
              </div>
              <h1 className="font-cormorant text-[1.8rem] font-semibold text-charcoal">Checkout</h1>
            </div>

            {/* Shipping */}
            <ShippingForm data={shipping} onChange={setShipping} />

            {/* Delivery */}
            <DeliveryMethod selected={deliveryId} onChange={setDeliveryId} />

            {/* Payment */}
            <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden mb-5">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-charcoal/10">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}>
                    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Payment Method</span>
              </div>

              <div className="p-6 flex flex-col gap-3">
                {PAY_METHODS.map(({ key, label }) => {
                  const isSelected = payMethod === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setPayMethod(key)}
                      className={`border-[1.5px] rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                        isSelected ? "border-accent" : "border-charcoal/10 hover:border-accent/40"
                      }`}
                    >
                      {/* Option header */}
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Custom radio */}
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-accent" : "border-charcoal/20"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-charcoal">{label}</div>
                          <div className="text-[0.72rem] text-muted mt-0.5">
                            {key === "card" && "Visa, Mastercard, Verve"}
                            {key === "bank" && "Direct bank transfer · Reference provided"}
                            {key === "cod"  && "Pay cash when your order arrives"}
                          </div>
                        </div>
                        {/* Chips */}
                        {key === "card" && (
                          <div className="hidden sm:flex gap-1.5">
                            {[["VISA","#1a1f71"],["MC","#eb001b"],["Verve","#00a859"]].map(([n,bg]) => (
                              <span key={n} className="px-1.5 py-0.5 rounded text-[0.58rem] font-semibold text-white" style={{ background: bg }}>{n}</span>
                            ))}
                          </div>
                        )}
                        {key === "bank" && (
                          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[0.58rem] bg-charcoal/8 text-charcoal font-semibold">Bank</span>
                        )}
                        {key === "cod" && (
                          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[0.58rem] border border-accent/25 font-semibold" style={{ background: "rgba(200,169,110,0.08)", color: "#a8893e" }}>COD</span>
                        )}
                      </div>

                      {/* Expandable body */}
                      {isSelected && (
                        <div className="border-t border-charcoal/10 bg-[#faf9f6] p-5">
                          {key === "card" && (
                            <div className="flex flex-col gap-4">
                              <div>
                                <label className={labelClass}>Card Number</label>
                                <input type="text" placeholder="1234  5678  9012  3456" maxLength={22}
                                  value={cardNum} onChange={(e) => setCardNum(fmtCardNum(e.target.value))}
                                  className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Name on Card</label>
                                <input type="text" placeholder="Margaret Holloway"
                                  value={cardName} onChange={(e) => setCardName(e.target.value)}
                                  className={inputClass} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelClass}>Expiry</label>
                                  <input type="text" placeholder="MM / YY" maxLength={7}
                                    value={cardExpiry} onChange={(e) => setCardExpiry(fmtExpiry(e.target.value))}
                                    className={inputClass} />
                                </div>
                                <div>
                                  <label className={labelClass}>CVV</label>
                                  <input type="password" placeholder="•••" maxLength={4}
                                    value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                                    className={inputClass} />
                                </div>
                              </div>
                            </div>
                          )}

                          {key === "bank" && (
                            <div>
                              <div className="bg-white border border-charcoal/10 rounded-xl overflow-hidden mb-3">
                                {[
                                  { k: "Bank",    v: "First Bank Nigeria" },
                                  { k: "Account", v: "3012345678" },
                                  { k: "Name",    v: "Blockfuse Vintage Ltd" },
                                  { k: "Amount",  v: `₦${total.toLocaleString("en-NG")}` },
                                ].map(({ k, v }) => (
                                  <div key={k} className="flex justify-between items-center px-4 py-2.5 border-b border-charcoal/[0.05] last:border-0">
                                    <span className="text-[0.68rem] tracking-[0.12em] uppercase text-muted">{k}</span>
                                    <span className="text-[0.85rem] font-medium text-charcoal flex items-center gap-2">
                                      {v}
                                      <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(v)}
                                        className="border border-charcoal/15 rounded px-1.5 py-0.5 text-[0.62rem] tracking-[0.1em] uppercase text-muted hover:border-accent hover:text-accent-dark transition-all cursor-pointer bg-transparent font-barlow"
                                      >
                                        Copy
                                      </button>
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[0.75rem] text-muted leading-relaxed">
                                Transfer the exact amount and use your order ID as the payment reference. Your order will be processed once payment is confirmed.
                              </p>
                            </div>
                          )}

                          {key === "cod" && (
                            <div className="flex gap-3 items-start">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8} className="flex-shrink-0 mt-0.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                              <p className="text-[0.82rem] text-charcoal leading-relaxed">
                                Pay with cash when your order is delivered. Please have the exact amount ready. A ₦500 handling fee applies for cash on delivery orders.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms + Place Order */}
            <div>
              {error && (
                <div className="border rounded-xl px-4 py-3 text-sm mb-4 font-barlow"
                  style={{ background: "rgba(176,92,58,0.1)", borderColor: "rgba(176,92,58,0.3)", color: "#b05c3a" }}
                  role="alert">
                  {error}
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 flex-shrink-0 accent-accent w-4 h-4 cursor-pointer rounded" />
                <span className="text-[0.78rem] text-muted leading-relaxed">
                  I agree to Blockfuse Vintage&apos;s{" "}
                  <Link href="/terms" className="text-accent hover:underline">Terms &amp; Conditions</Link> and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
                  I confirm my order and delivery details are correct.
                </span>
              </label>

              <button
                onClick={placeOrder}
                className="relative overflow-hidden w-full bg-charcoal text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.2em] uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(26,26,24,0.2)] group cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="relative">
                  <path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="relative">Place Order</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[0.68rem] text-warmgray mt-3 tracking-[0.06em]">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                256-bit SSL encrypted · Your data is safe
              </div>

              <Link
                href="/cart"
                className="flex items-center justify-center gap-1.5 text-[0.72rem] tracking-[0.1em] uppercase text-muted hover:text-charcoal transition-colors mt-4"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to Cart
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div className="lg:order-last order-first">
            <OrderSummary shipCost={shipCost} />
          </div>
        </div>
      </div>

      {/* Confirmation overlay */}
      {confirmed && <OrderConfirmed data={confirmed} />}
    </>
  );
}
