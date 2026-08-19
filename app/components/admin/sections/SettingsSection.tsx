'use client'

import { useState } from "react";

const inputClass = "w-full bg-[#f4f2ee] border border-charcoal/[0.09] rounded-lg px-3.5 py-2.5 font-barlow text-[0.83rem] text-charcoal outline-none focus:border-accent transition-colors";
const labelClass = "block text-[0.65rem] tracking-[0.18em] uppercase text-warmgray mb-1.5";

type Toggle = { label: string; on: boolean };

const INITIAL_TOGGLES: Toggle[] = [
  { label: "New order alerts",         on: true  },
  { label: "Low stock warnings",       on: true  },
  { label: "Customer registrations",   on: false },
  { label: "Weekly sales report",      on: true  },
];

export default function SettingsSection() {
  const [toggles, setToggles] = useState<Toggle[]>(INITIAL_TOGGLES);

  function flip(i: number) {
    setToggles((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, on: !t.on } : t))
    );
  }

  return (
    <div>
      <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal mb-6">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* Store details */}
        <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal/[0.09]">
            <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Store Details</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div><label className={labelClass}>Store Name</label><input className={inputClass} type="text" defaultValue="Blockfuse Vintage" /></div>
            <div><label className={labelClass}>Email Address</label><input className={inputClass} type="email" defaultValue="hello@blockfusevintage.com" /></div>
            <div><label className={labelClass}>Phone Number</label><input className={inputClass} type="tel" defaultValue="+234 800 000 0000" /></div>
            <div><label className={labelClass}>Location</label><input className={inputClass} type="text" defaultValue="Lagos, Nigeria" /></div>
            <div>
              <label className={labelClass}>Currency</label>
              <select className={`${inputClass} cursor-pointer`}>
                <option>NGN — Nigerian Naira</option>
                <option>USD — US Dollar</option>
                <option>GBP — British Pound</option>
              </select>
            </div>
            <button className="self-start font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg bg-charcoal text-cream hover:bg-[#2c2c2a] transition-colors cursor-pointer border-none mt-1">
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/[0.09]">
              <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Notifications</span>
            </div>
            <div className="px-5 py-2">
              {toggles.map((t, i) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between py-3 border-b border-charcoal/[0.05] last:border-0"
                >
                  <span className="text-[0.83rem] text-charcoal">{t.label}</span>
                  <button
                    onClick={() => flip(i)}
                    className={`relative w-[38px] h-5 rounded-full transition-colors duration-200 flex-shrink-0 border-none cursor-pointer ${
                      t.on ? "bg-accent" : "bg-charcoal/15"
                    }`}
                    aria-label={`Toggle ${t.label}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                        t.on ? "left-[20px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/[0.09]">
              <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Security</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {["Change Password", "Two-Factor Authentication"].map((label) => (
                <button
                  key={label}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-charcoal/[0.09] font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent"
                >
                  {label}
                </button>
              ))}
              <button className="w-full text-left px-4 py-2.5 rounded-lg font-barlow text-[0.72rem] tracking-[0.12em] uppercase font-medium cursor-pointer border transition-all"
                style={{ background: "rgba(176,92,58,0.07)", color: "#b05c3a", borderColor: "rgba(176,92,58,0.18)" }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
