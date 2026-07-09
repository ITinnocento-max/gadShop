"use client";

import { useTranslation } from "@/hooks/useTranslation";

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

export default function BalanceSheetPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("admin.balance_sheet")}</h2>
        <p className="font-body-md text-body-md text-outline mt-1">As of December 31, 2024</p>
      </div>
      <div className="bg-surface rounded-2xl shadow-soft border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/40 border-b border-outline-variant/20">
              <th className="py-3 px-4 text-left font-bold text-on-surface">Account</th>
              <th className="py-3 px-4 text-right font-bold text-on-surface">Amount (RWF)</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="ASSETS" value="Rwf 2,450,800" />

            <LineItem label="Current Assets" value="" section bold />
            <LineItem label="Cash & Cash Equivalents" value="Rwf 420,000" indent />
            <LineItem label="Accounts Receivable" value="Rwf 385,000" indent />
            <LineItem label="Inventory" value="Rwf 620,000" indent />
            <LineItem label="Prepaid Expenses" value="Rwf 45,000" indent />
            <Subtotal label="Total Current Assets" value="Rwf 1,470,000" />

            <LineItem label="Non-Current Assets" value="" section bold />
            <LineItem label="Property & Equipment" value="Rwf 680,000" indent />
            <LineItem label="Intangible Assets" value="Rwf 210,000" indent />
            <LineItem label="Long-term Investments" value="Rwf 90,800" indent />
            <Subtotal label="Total Non-Current Assets" value="Rwf 980,800" />

            <TotalRow label="Total Assets" value="Rwf 2,450,800" />

            <SectionHeader label="LIABILITIES" value="Rwf 1,180,500" />

            <LineItem label="Current Liabilities" value="" section bold />
            <LineItem label="Accounts Payable" value="Rwf 310,000" indent />
            <LineItem label="Short-term Debt" value="Rwf 180,000" indent />
            <LineItem label="Accrued Expenses" value="Rwf 95,000" indent />
            <Subtotal label="Total Current Liabilities" value="Rwf 585,000" />

            <LineItem label="Non-Current Liabilities" value="" section bold />
            <LineItem label="Long-term Debt" value="Rwf 450,000" indent />
            <LineItem label="Deferred Tax" value="Rwf 95,500" indent />
            <LineItem label="Other Liabilities" value="Rwf 50,000" indent />
            <Subtotal label="Total Non-Current Liabilities" value="Rwf 595,500" />

            <TotalRow label="Total Liabilities" value="Rwf 1,180,500" />

            <SectionHeader label="EQUITY" value="Rwf 1,270,300" />

            <LineItem label="Share Capital" value="Rwf 500,000" indent />
            <LineItem label="Retained Earnings" value="Rwf 620,300" indent />
            <LineItem label="Other Reserves" value="Rwf 150,000" indent />
            <TotalRow label="Total Equity" value="Rwf 1,270,300" />

            <TotalRow label="Total Liabilities & Equity" value="Rwf 2,450,800" double />
          </tbody>
        </table>
      </div>
    </div>
  );
}
