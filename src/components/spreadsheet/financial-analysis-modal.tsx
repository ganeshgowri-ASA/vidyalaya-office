"use client";

import { useState, useMemo } from "react";
import { X, DollarSign, TrendingUp, Calculator, Target } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

type TabKey = "npv" | "pmt" | "xirr" | "breakeven";

export function FinancialAnalysisModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("npv");

  // NPV/IRR state
  const [discountRate, setDiscountRate] = useState("10");
  const [initialInvestment, setInitialInvestment] = useState("100000");
  const [cashFlows, setCashFlows] = useState("30000,35000,40000,45000,50000");

  // PMT state
  const [loanAmount, setLoanAmount] = useState("250000");
  const [annualRate, setAnnualRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [paymentsPerYear, setPaymentsPerYear] = useState("12");

  // XIRR state
  const [xirrDates, setXirrDates] = useState("2024-01-01,2024-06-15,2025-01-01,2025-06-15,2026-01-01");
  const [xirrFlows, setXirrFlows] = useState("-100000,25000,30000,35000,40000");

  // Break-even state
  const [fixedCosts, setFixedCosts] = useState("50000");
  const [variableCost, setVariableCost] = useState("25");
  const [sellingPrice, setSellingPrice] = useState("75");

  // Parse cash flows for NPV/IRR
  const parsedCashFlows = useMemo(() => {
    return cashFlows.split(",").map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
  }, [cashFlows]);

  // NPV calculation
  const npvResult = useMemo(() => {
    const rate = parseFloat(discountRate) / 100;
    const investment = parseFloat(initialInvestment);
    if (isNaN(rate) || isNaN(investment) || parsedCashFlows.length === 0) return null;
    let npv = -investment;
    for (let i = 0; i < parsedCashFlows.length; i++) {
      npv += parsedCashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return npv;
  }, [discountRate, initialInvestment, parsedCashFlows]);

  // IRR calculation using Newton's method
  const irrResult = useMemo(() => {
    const investment = parseFloat(initialInvestment);
    if (isNaN(investment) || parsedCashFlows.length === 0) return null;
    const allFlows = [-investment, ...parsedCashFlows];

    const npvAtRate = (r: number) => {
      let sum = 0;
      for (let i = 0; i < allFlows.length; i++) {
        sum += allFlows[i] / Math.pow(1 + r, i);
      }
      return sum;
    };

    const npvDerivative = (r: number) => {
      let sum = 0;
      for (let i = 1; i < allFlows.length; i++) {
        sum += -i * allFlows[i] / Math.pow(1 + r, i + 1);
      }
      return sum;
    };

    let rate = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      const f = npvAtRate(rate);
      const fPrime = npvDerivative(rate);
      if (Math.abs(fPrime) < 1e-12) break;
      const newRate = rate - f / fPrime;
      if (Math.abs(newRate - rate) < 1e-10) {
        rate = newRate;
        break;
      }
      rate = newRate;
    }
    return isFinite(rate) ? rate : null;
  }, [initialInvestment, parsedCashFlows]);

  // MIRR calculation
  const mirrResult = useMemo(() => {
    const investment = parseFloat(initialInvestment);
    const financeRate = parseFloat(discountRate) / 100;
    if (isNaN(investment) || isNaN(financeRate) || parsedCashFlows.length === 0) return null;

    const reinvestRate = financeRate;
    const n = parsedCashFlows.length;

    // Future value of positive cash flows (reinvested at reinvest rate)
    let fvPositive = 0;
    for (let i = 0; i < n; i++) {
      if (parsedCashFlows[i] > 0) {
        fvPositive += parsedCashFlows[i] * Math.pow(1 + reinvestRate, n - 1 - i);
      }
    }

    // Present value of negative cash flows (discounted at finance rate)
    let pvNegative = investment;
    for (let i = 0; i < n; i++) {
      if (parsedCashFlows[i] < 0) {
        pvNegative += Math.abs(parsedCashFlows[i]) / Math.pow(1 + financeRate, i + 1);
      }
    }

    if (pvNegative === 0) return null;
    const mirr = Math.pow(fvPositive / pvNegative, 1 / n) - 1;
    return isFinite(mirr) ? mirr : null;
  }, [initialInvestment, discountRate, parsedCashFlows]);

  // Cash flow chart data
  const cashFlowChartData = useMemo(() => {
    const investment = parseFloat(initialInvestment);
    if (isNaN(investment)) return [];
    const data = [{ period: "Year 0", value: -investment }];
    parsedCashFlows.forEach((cf, i) => {
      data.push({ period: `Year ${i + 1}`, value: cf });
    });
    return data;
  }, [initialInvestment, parsedCashFlows]);

  // PMT calculations
  const pmtResult = useMemo(() => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(annualRate) / 100;
    const years = parseFloat(loanTerm);
    const ppy = parseFloat(paymentsPerYear);
    if (isNaN(principal) || isNaN(rate) || isNaN(years) || isNaN(ppy) || ppy === 0) return null;

    const periodicRate = rate / ppy;
    const totalPayments = years * ppy;

    let payment: number;
    if (periodicRate === 0) {
      payment = principal / totalPayments;
    } else {
      payment = principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
        (Math.pow(1 + periodicRate, totalPayments) - 1);
    }

    const totalPayment = payment * totalPayments;
    const totalInterest = totalPayment - principal;

    return { payment, totalPayment, totalInterest, periodicRate, totalPayments };
  }, [loanAmount, annualRate, loanTerm, paymentsPerYear]);

  // Amortization schedule
  const amortizationSchedule = useMemo(() => {
    if (!pmtResult) return [];
    const principal = parseFloat(loanAmount);
    const { payment, periodicRate, totalPayments } = pmtResult;
    const schedule: { period: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let balance = principal;

    for (let i = 1; i <= totalPayments; i++) {
      const interest = balance * periodicRate;
      const principalPart = payment - interest;
      balance = Math.max(0, balance - principalPart);
      schedule.push({
        period: i,
        payment: payment,
        principal: principalPart,
        interest: interest,
        balance: balance,
      });
    }
    return schedule;
  }, [pmtResult, loanAmount]);

  // XIRR calculation
  const xirrResult = useMemo(() => {
    const dates = xirrDates.split(",").map((s) => new Date(s.trim()));
    const flows = xirrFlows.split(",").map((s) => parseFloat(s.trim()));

    if (dates.length !== flows.length || dates.length < 2) return null;
    if (dates.some((d) => isNaN(d.getTime())) || flows.some((f) => isNaN(f))) return null;

    const d0 = dates[0].getTime();
    const yearFractions = dates.map((d) => (d.getTime() - d0) / (365.25 * 24 * 60 * 60 * 1000));

    const xnpv = (rate: number) => {
      let sum = 0;
      for (let i = 0; i < flows.length; i++) {
        sum += flows[i] / Math.pow(1 + rate, yearFractions[i]);
      }
      return sum;
    };

    const xnpvDeriv = (rate: number) => {
      let sum = 0;
      for (let i = 0; i < flows.length; i++) {
        sum += -yearFractions[i] * flows[i] / Math.pow(1 + rate, yearFractions[i] + 1);
      }
      return sum;
    };

    let rate = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      const f = xnpv(rate);
      const fPrime = xnpvDeriv(rate);
      if (Math.abs(fPrime) < 1e-12) break;
      const newRate = rate - f / fPrime;
      if (Math.abs(newRate - rate) < 1e-10) {
        rate = newRate;
        break;
      }
      rate = newRate;
    }

    return isFinite(rate) ? rate : null;
  }, [xirrDates, xirrFlows]);

  // Break-even calculations
  const breakEvenResult = useMemo(() => {
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const sp = parseFloat(sellingPrice);
    if (isNaN(fc) || isNaN(vc) || isNaN(sp) || sp <= vc) return null;

    const units = fc / (sp - vc);
    const revenue = units * sp;
    return { units, revenue };
  }, [fixedCosts, variableCost, sellingPrice]);

  // Break-even chart data
  const breakEvenChartData = useMemo(() => {
    if (!breakEvenResult) return [];
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const sp = parseFloat(sellingPrice);
    const maxUnits = Math.ceil(breakEvenResult.units * 2);
    const step = Math.max(1, Math.floor(maxUnits / 20));
    const data: { units: number; totalCost: number; totalRevenue: number }[] = [];

    for (let u = 0; u <= maxUnits; u += step) {
      data.push({
        units: u,
        totalCost: fc + vc * u,
        totalRevenue: sp * u,
      });
    }
    return data;
  }, [breakEvenResult, fixedCosts, variableCost, sellingPrice]);

  if (!open) return null;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "npv", label: "NPV / IRR", icon: <DollarSign size={12} /> },
    { key: "pmt", label: "PMT", icon: <Calculator size={12} /> },
    { key: "xirr", label: "XIRR", icon: <TrendingUp size={12} /> },
    { key: "breakeven", label: "Break-Even", icon: <Target size={12} /> },
  ];

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  const formatPercent = (n: number) => (n * 100).toFixed(4) + "%";

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[700px] max-h-[90vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">Financial Analysis</h2>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 whitespace-nowrap ${
                activeTab === t.key ? "border-blue-500" : "border-transparent"
              }`}
              style={{ color: activeTab === t.key ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">

          {/* NPV / IRR Tab */}
          {activeTab === "npv" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Discount Rate (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Initial Investment</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Cash Flows (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={cashFlows}
                    onChange={(e) => setCashFlows(e.target.value)}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Net Present Value</div>
                  <div className="text-lg font-mono font-bold mt-1" style={{ color: npvResult !== null && npvResult >= 0 ? "#16a34a" : "#dc2626" }}>
                    {npvResult !== null ? formatCurrency(npvResult) : "N/A"}
                  </div>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Internal Rate of Return</div>
                  <div className="text-lg font-mono font-bold mt-1">
                    {irrResult !== null ? formatPercent(irrResult) : "N/A"}
                  </div>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Modified IRR</div>
                  <div className="text-lg font-mono font-bold mt-1">
                    {mirrResult !== null ? formatPercent(mirrResult) : "N/A"}
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              {cashFlowChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cashFlowChartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", fontSize: 12 }}
                    />
                    <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                    <Bar
                      dataKey="value"
                      name="Cash Flow"
                      fill="#3b82f6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {/* PMT Tab */}
          {activeTab === "pmt" && (
            <>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Loan Amount</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Annual Rate (%)</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Term (years)</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Payments / Year</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={paymentsPerYear}
                    onChange={(e) => setPaymentsPerYear(e.target.value)}
                  />
                </div>
              </div>

              {pmtResult && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Monthly Payment</div>
                      <div className="text-lg font-mono font-bold mt-1">{formatCurrency(pmtResult.payment)}</div>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Payment</div>
                      <div className="text-lg font-mono font-bold mt-1">{formatCurrency(pmtResult.totalPayment)}</div>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Interest</div>
                      <div className="text-lg font-mono font-bold mt-1" style={{ color: "#dc2626" }}>
                        {formatCurrency(pmtResult.totalInterest)}
                      </div>
                    </div>
                  </div>

                  {/* Amortization schedule */}
                  <div>
                    <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                      Amortization Schedule
                    </div>
                    <div
                      className="border rounded overflow-auto"
                      style={{ borderColor: "var(--border)", maxHeight: 300 }}
                    >
                      <table className="w-full text-xs">
                        <thead className="sticky top-0">
                          <tr>
                            <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Period</th>
                            <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Payment</th>
                            <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Principal</th>
                            <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Interest</th>
                            <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortizationSchedule.map((row) => (
                            <tr key={row.period}>
                              <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{row.period}</td>
                              <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{formatCurrency(row.payment)}</td>
                              <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{formatCurrency(row.principal)}</td>
                              <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{formatCurrency(row.interest)}</td>
                              <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)" }}>{formatCurrency(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* XIRR Tab */}
          {activeTab === "xirr" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Dates (comma-separated, YYYY-MM-DD)</label>
                  <input
                    type="text"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={xirrDates}
                    onChange={(e) => setXirrDates(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Cash Flows (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={xirrFlows}
                    onChange={(e) => setXirrFlows(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>XIRR (Annualized Return)</div>
                <div className="text-lg font-mono font-bold mt-1">
                  {xirrResult !== null ? formatPercent(xirrResult) : "N/A"}
                </div>
              </div>

              {/* Show parsed entries */}
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Cash Flow Entries</div>
                <div className="border rounded overflow-auto" style={{ borderColor: "var(--border)", maxHeight: 200 }}>
                  <table className="w-full text-xs">
                    <thead className="sticky top-0">
                      <tr>
                        <th className="px-3 py-1.5 border-b text-left" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Date</th>
                        <th className="px-3 py-1.5 border-b text-right" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {xirrDates.split(",").map((d, i) => {
                        const flows = xirrFlows.split(",").map((s) => parseFloat(s.trim()));
                        return (
                          <tr key={i}>
                            <td className="px-3 py-1.5 border-b font-mono" style={{ borderColor: "var(--border)" }}>{d.trim()}</td>
                            <td className="px-3 py-1.5 border-b text-right font-mono" style={{ borderColor: "var(--border)", color: (flows[i] ?? 0) < 0 ? "#dc2626" : "#16a34a" }}>
                              {!isNaN(flows[i]) ? formatCurrency(flows[i]) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Break-Even Tab */}
          {activeTab === "breakeven" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Fixed Costs</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={fixedCosts}
                    onChange={(e) => setFixedCosts(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Variable Cost / Unit</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={variableCost}
                    onChange={(e) => setVariableCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Selling Price / Unit</label>
                  <input
                    type="number"
                    className="w-full mt-1 text-sm rounded px-2 py-1.5 border outline-none font-mono"
                    style={inputStyle}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
              </div>

              {breakEvenResult ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Break-Even Units</div>
                      <div className="text-lg font-mono font-bold mt-1">{breakEvenResult.units.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: "var(--muted)" }}>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Break-Even Revenue</div>
                      <div className="text-lg font-mono font-bold mt-1">{formatCurrency(breakEvenResult.revenue)}</div>
                    </div>
                  </div>

                  {/* Line chart */}
                  {breakEvenChartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={breakEvenChartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="units" fontSize={10} label={{ value: "Units", position: "insideBottom", offset: -5, fontSize: 10 }} />
                        <YAxis fontSize={10} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", fontSize: 12 }}
                        />
                        <Legend fontSize={10} />
                        <ReferenceLine
                          x={Math.round(breakEvenResult.units)}
                          stroke="var(--muted-foreground)"
                          strokeDasharray="3 3"
                          label={{ value: "Break-Even", fontSize: 10, fill: "var(--muted-foreground)" }}
                        />
                        <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Selling price must be greater than variable cost per unit.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
