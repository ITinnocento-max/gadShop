"use client";

const LineItem = ({ label, value, bold, section, indent }: { label: string; value: string; bold?: boolean; section?: boolean; indent?: boolean }) => (
  <tr className={`${section ? "bg-surface-container-low/20" : ""} ${bold ? "font-bold" : "font-body-md"} border-b border-outline-variant/10`}>
    <td className={`py-2 px-4 ${indent ? "pl-8" : ""} ${bold ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</td>
    <td className={`py-2 px-4 text-right ${bold ? "text-on-surface" : "text-on-surface-variant"}`}>{value}</td>
  </tr>
);

const SectionHeader = ({ label, value }: { label: string; value: string }) => (
  <tr className="bg-surface-container-low/20 border-b border-outline-variant/10">
    <td className="py-2 px-4 font-bold text-on-surface">{label}</td>
    <td className="py-2 px-4 text-right font-bold text-on-surface">{value}</td>
  </tr>
);

const Subtotal = ({ label, value }: { label: string; value: string }) => (
  <tr className="border-b border-outline-variant/10">
    <td className="py-2 px-8 font-semibold text-on-surface-variant italic">{label}</td>
    <td className="py-2 px-4 text-right font-semibold text-on-surface-variant">{value}</td>
  </tr>
);

const TotalRow = ({ label, value, double }: { label: string; value: string; double?: boolean }) => (
  <tr className={`${double ? "border-t-2 border-on-surface" : "border-t border-outline-variant/30"} border-b border-outline-variant/10`}>
    <td className={`py-3 px-4 font-bold ${double ? "text-lg" : "text-base"} text-on-surface`}>{label}</td>
    <td className={`py-3 px-4 text-right font-bold ${double ? "text-lg" : "text-base"} text-on-surface`}>{value}</td>
  </tr>
);

export default function CashFlowPage() {
  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{"Cash Flow Statement"}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">For the Year Ended December 31, 2024</p>
      </div>
      <div className="bg-surface rounded-2xl shadow-soft border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/40 border-b border-outline-variant/20">
              <th className="py-3 px-4 text-left font-bold text-on-surface">Activity</th>
              <th className="py-3 px-4 text-right font-bold text-on-surface">Amount (RWF)</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="OPERATING ACTIVITIES" value="" />

            <LineItem label="Net Income" value="Rwf 520,712" indent />
            <LineItem label="Depreciation & Amortization" value="Rwf 85,000" indent />
            <LineItem label="Change in Accounts Receivable" value="(Rwf 42,000)" indent />
            <LineItem label="Change in Inventory" value="(Rwf 18,500)" indent />
            <LineItem label="Change in Accounts Payable" value="Rwf 23,000" indent />
            <Subtotal label="Net Cash from Operations" value="Rwf 568,212" />

            <SectionHeader label="INVESTING ACTIVITIES" value="" />

            <LineItem label="Purchase of Equipment" value="(Rwf 120,000)" indent />
            <LineItem label="Sale of Assets" value="Rwf 25,000" indent />
            <Subtotal label="Net Cash from Investing" value="(Rwf 95,000)" />

            <SectionHeader label="FINANCING ACTIVITIES" value="" />

            <LineItem label="Dividends Paid" value="(Rwf 80,000)" indent />
            <LineItem label="Loan Proceeds" value="Rwf 200,000" indent />
            <LineItem label="Loan Repayments" value="(Rwf 50,000)" indent />
            <Subtotal label="Net Cash from Financing" value="Rwf 70,000" />

            <TotalRow label="Net Increase in Cash" value="Rwf 543,212" />

            <LineItem label="Beginning Cash Balance" value="Rwf 280,000" />
            <TotalRow label="Ending Cash Balance" value="Rwf 823,212" double />
          </tbody>
        </table>
      </div>
    </div>
  );
}
