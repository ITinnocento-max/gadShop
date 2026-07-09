"use client";

const summaryCards = [
  { label: "Output VAT (Collected)", value: "Rwf 124,500.00", color: "" },
  { label: "Input VAT (Paid)", value: "Rwf 78,200.00", color: "" },
  { label: "Net VAT Payable", value: "Rwf 46,300.00", color: "text-primary" },
  { label: "VAT Rate", value: "18%", color: "" },
];

const transactions = [
  { date: "Oct 15, 2024", invoice: "INV-2024-1042", customer: "TechCorp Ltd", type: "Output", net: "Rwf 10,250.00", vat: "Rwf 1,845.00", total: "Rwf 12,095.00" },
  { date: "Oct 28, 2024", invoice: "INV-2024-1087", customer: "GlobalTrade Inc", type: "Output", net: "Rwf 15,000.00", vat: "Rwf 2,700.00", total: "Rwf 17,700.00" },
  { date: "Nov 05, 2024", invoice: "PO-2024-0451", supplier: "OfficeWorks Ltd", type: "Input", net: "Rwf 5,600.00", vat: "Rwf 1,008.00", total: "Rwf 6,608.00" },
  { date: "Nov 18, 2024", invoice: "INV-2024-1123", customer: "BlueSky Services", type: "Output", net: "Rwf 8,750.00", vat: "Rwf 1,575.00", total: "Rwf 10,325.00" },
  { date: "Nov 29, 2024", invoice: "PO-2024-0489", supplier: "CloudHost Solutions", type: "Input", net: "Rwf 500.00", vat: "Rwf 90.00", total: "Rwf 590.00" },
];

export default function VatGstPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{"VAT/GST"}</h1>
        <p className="text-gray-400 text-sm mt-1">Tax Period: Q4 2024</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft p-5">
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant/10 rounded-xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10 text-gray-400">
              <th className="text-left p-4">Transaction Date</th>
              <th className="text-left p-4">Invoice #</th>
              <th className="text-left p-4">Customer/Supplier</th>
              <th className="text-left p-4">Type</th>
              <th className="text-right p-4">Net Amount</th>
              <th className="text-right p-4">VAT Amount</th>
              <th className="text-right p-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row) => (
              <tr key={row.invoice} className="border-b border-outline-variant/10 last:border-0">
                <td className="p-4">{row.date}</td>
                <td className="p-4 font-mono">{row.invoice}</td>
                <td className="p-4">{row.customer || row.supplier}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.type === "Output" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {row.type}
                  </span>
                </td>
                <td className="p-4 text-right">{row.net}</td>
                <td className="p-4 text-right">{row.vat}</td>
                <td className="p-4 text-right font-medium">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
