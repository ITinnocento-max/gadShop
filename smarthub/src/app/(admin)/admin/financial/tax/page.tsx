"use client"

const summaries = [
  { label: "VAT Collected", value: "Rwf 124,500" },
  { label: "GST Collected", value: "Rwf 0" },
  { label: "WHT", value: "Rwf 18,200" },
  { label: "Total Tax Liability", value: "Rwf 142,700" },
]

const taxRates = [
  { type: "VAT", rate: "18%", effective: "Jan 2024", status: "Active" },
  { type: "GST", rate: "0%", effective: "N/A", status: "Not Configured" },
  { type: "Withholding Tax", rate: "15%", effective: "Jan 2024", status: "Active" },
  { type: "Corporate Income Tax", rate: "30%", effective: "Jan 2024", status: "Active" },
]

const links = ["VAT", "GST", "Withholding Tax", "Tax Rates", "Tax Rules", "Tax Reports"]

export default function TaxPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">{"Tax"}</h1>
        <p className="text-text-secondary mt-1">Manage tax rates, rules, and filings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaries.map((s) => (
          <div key={s.label} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
            <p className="text-text-secondary text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-text mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Current Tax Rates</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-text-secondary">
                <th className="pb-3 font-medium">Tax Type</th>
                <th className="pb-3 font-medium">Rate</th>
                <th className="pb-3 font-medium">Effective Date</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((tr) => (
                <tr key={tr.type} className="border-b border-outline-variant/10 text-text">
                  <td className="py-3">{tr.type}</td>
                  <td className="py-3">{tr.rate}</td>
                  <td className="py-3">{tr.effective}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tr.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-neutral-500/10 text-neutral-600"
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-5 flex items-center gap-3 text-text font-medium hover:bg-outline-variant/5 transition-colors"
            >
              <span className="material-symbols-outlined text-icon">chevron_right</span>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
