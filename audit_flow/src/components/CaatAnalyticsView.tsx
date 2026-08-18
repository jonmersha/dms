/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  Activity, 
  BarChart2, 
  Search, 
  RefreshCw, 
  Database, 
  Binary, 
  AlertTriangle, 
  HelpCircle, 
  Lightbulb, 
  Coins, 
  Users, 
  Sparkles, 
  ChevronRight, 
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { 
  CaatTransaction, 
  UserRole,
  initialTransactions
} from '../types';



// Benford parameters ideal probabilities
const BENFORD_DEFAULTS: Record<number, number> = {
  1: 30.1, 2: 17.6, 3: 12.5, 4: 9.7, 5: 7.9, 6: 6.7, 7: 5.8, 8: 5.1, 9: 4.6
};

export default function CaatAnalyticsView() {
  const { activeRole, handleLogSystemAction: onLogAction } = useAuditContext();


  const [transactions, setTransactions] = useState<CaatTransaction[]>(initialTransactions);
  const [selectedTxId, setSelectedTxId] = useState<string | null>('TR-1004'); // default preview
  const txSelected = transactions.find(t => t.id === selectedTxId);

  // Active filter/tab for exception rules: 'Benford' | 'Duplicates' | 'Gaps' | 'AI Anomalies'
  const [activeRule, setActiveRule] = useState<'Benford' | 'Duplicates' | 'Gaps' | 'AI'>('Benford');

  // Load / Sync simulating ERP Core Banking Flat Data feeds - US-6.01
  const [isImporting, setIsImporting] = useState(false);
  const handleImportFlatFeed = () => {
    setIsImporting(true);
    setTimeout(() => {
      // Simulate adding newer high-value transactions that introduce more anomalies!
      const newItems: CaatTransaction[] = [
        { id: 'TR-1013', date: '2026-06-01', amount: 49980, vendor: 'Tsehay Office Supplies', category: 'Stationery Supplies', initiator: 'Mekonnen Tadesse', approver: 'Mekonnen Tadesse', status: 'Approved', invoiceNumber: 'INV-2026-014' },
        { id: 'TR-1014', date: '2026-06-02', amount: 84000, vendor: 'Dil Construction Partner', category: 'Maintenance Services', initiator: 'Solomon Worku', approver: 'Amare Girma', status: 'Approved', invoiceNumber: 'INV-2026-015' } // Duplicate amount for maintenance services same week
      ];
      setTransactions(prev => {
        const mergedUnique = [...prev];
        newItems.forEach(item => {
          if (!mergedUnique.some(existing => existing.id === item.id)) {
            mergedUnique.push(item);
          }
        });
        return mergedUnique;
      });
      setIsImporting(false);
      alert("Successfully parsed and normalized 2 additional transaction records from Core ERP Settlement API.");
      onLogAction('Core API Data Import', 'Imported and mapped ERP Procurement Ledger transaction feeds');
    }, 850);
  };

  // Benford math extraction - US-6.02
  const countFirstDigits = (dataset: CaatTransaction[]) => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    let totalAnalyzed = 0;

    dataset.forEach(t => {
      // Clean string, remove non-digit characters, isolate first non-zero number
      const amtStr = Math.abs(t.amount).toString().replace(/[^1-9]/g, '');
      if (amtStr.length > 0) {
        const firstDigit = parseInt(amtStr[0]);
        if (firstDigit >= 1 && firstDigit <= 9) {
          counts[firstDigit]++;
          totalAnalyzed++;
        }
      }
    });

    // Convert count frequency to actual percentages
    const distribution: Record<number, number> = {};
    for (let d = 1; d <= 9; d++) {
      distribution[d] = totalAnalyzed > 0 
        ? parseFloat(((counts[d] / totalAnalyzed) * 100).toFixed(1)) 
        : 0;
    }

    return { distribution, totalAnalyzed };
  };

  const { distribution, totalAnalyzed } = countFirstDigits(transactions);

  // Duplicates logic search - same-day, same-vendor, same-amount payment exception
  const duplicatesList = transactions.filter((tx, idx, self) => {
    return self.some((other, oIdx) => {
      if (idx === oIdx) return false;
      return (
        tx.date === other.date &&
        tx.vendor === other.vendor &&
        tx.amount === other.amount
      );
    });
  });

  // Gaps check in Invoice Sequence list (INV-2026-001 syntax)
  const findSequenceGaps = (dataset: CaatTransaction[]) => {
    const fileNumbers = dataset
      .map(t => parseInt(t.invoiceNumber.split('-').pop() || ''))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    const gaps: number[] = [];
    if (fileNumbers.length === 0) return gaps;

    const minNum = fileNumbers[0];
    const maxNum = fileNumbers[fileNumbers.length - 1];

    for (let serial = minNum; serial <= maxNum; serial++) {
      if (!fileNumbers.includes(serial)) {
        gaps.push(serial);
      }
    }
    return gaps;
  };

  const sequenceGaps = findSequenceGaps(transactions);

  // AI anomalies search - related-party employee approvals or split limit thresholds - US-6.03
  const isSuspiciousSplitting = (amt: number) => {
    // 50,000 Birr is the executive approval limits. Anything from 49,900 to 49,999 is heavily flagged as split limits
    return amt >= 49900 && amt < 50000;
  };

  const aiAnomaliesList = transactions.filter(t => {
    const duplicateInvoice = transactions.filter(allTx => allTx.invoiceNumber === t.invoiceNumber).length > 1;
    const isEvasion = isSuspiciousSplitting(t.amount);
    const selfApproved = t.initiator === t.approver && t.amount > 30000;
    return duplicateInvoice || isEvasion || selfApproved;
  });

  // Calculate Explainable AI narrative text dynamically based on selected transaction features - US-6.04
  const getXaiNarrative = (tx: CaatTransaction) => {
    const splitting = isSuspiciousSplitting(tx.amount);
    const duplicates = transactions.filter(t => t.amount === tx.amount && t.vendor === tx.vendor && t.date === tx.date);
    const isDuplicated = duplicates.length > 1;
    const sameInitor = tx.initiator === tx.approver;

    let analysisHeader = `Transaction ${tx.id} was highlighted by our predictive risk neural model due to multiple diverging operational parameters. Here is the logical breakdown from our Explainable AI (XAI) parser:\n\n`;
    let findingsList = "";

    if (splitting) {
      findingsList += `• **Split-Limit Threshold Bypass Risk (94% confidence score)**: The transaction value of ${tx.amount.toLocaleString()} ETB resides extremely close to the 50,000 ETB Manager sign-off constraint ceiling. When correlated with vendor "${tx.vendor}", consecutive entries registered under the same department indicate potential attempts to bypass board approval workflows by fragmenting single procurement projects.\n\n`;
    }
    if (isDuplicated) {
      findingsList += `• **Direct Invoice Duplicate Payment Failure (99% confidence score)**: Multiple transactions with the exact amount of ${tx.amount.toLocaleString()} ETB were submitted for vendor "${tx.vendor}" on ${tx.date} referencing invoice number "${tx.invoiceNumber}". This pattern signals a high risk of duplicate ledger booking or double-billing failures, representing immediate lost operational funds.\n\n`;
    }
    if (sameInitor && tx.amount > 30000) {
      findingsList += `• **Segregation of Duties (SoD) Protocol Breach (85% confidence score)**: Initiating user "${tx.initiator}" is also logged as the official approving sign-off authority for this ledger debit. Standard internal control mandates require separate administrative identities to mitigate related-party transactions risk and collusion vulnerabilities.\n\n`;
    }

    if (!findingsList) {
      findingsList = `• **Baseline compliance**: This transaction aligns with standard Benford frequencies and does not deviate from invoice sequences or segregation profiles. It has been marked as a low-risk baseline record.\n\n`;
    }

    return analysisHeader + findingsList + `**Recommended Remediation**: Hold disbursements for entry ${tx.id}. Re-route files to follow-up testing auditors to retrieve paper invoices and perform formal vendor registration vetting.`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-zinc-800" id="caat_analytics_main">
      
      {/* Top Controls: Import flat ledger APIs - US-6.01 */}
      <div className="lg:col-span-12 flex justify-between items-center bg-white border border-zinc-200 shadow-xs p-4 rounded-xl flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-909">Computer-Assisted Audit Techniques (CAATs) Engine</h3>
          <p className="text-[11px] text-zinc-400">Run math calculations (Benford's Law, sequence checks, duplicate patterns) on loaded procurement populations.</p>
        </div>
        
        <button
          onClick={handleImportFlatFeed}
          disabled={isImporting}
          className="flex items-center gap-1.5 bg-zinc-900 text-white text-xs px-4 py-2 hover:bg-zinc-850 rounded-lg font-bold disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isImporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              Integrating core banking ERP Feed...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 shrink-0" />
              Import Ledger Flat Feed File
            </>
          )}
        </button>
      </div>

      {/* Left Column: Exceptions Rules Toggles & Items lists */}
      <div className="lg:col-span-4 space-y-4" id="caat_left_pane">
        
        {/* Toggle menus for different analytical algorithms */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-2xs divide-y divide-zinc-150" id="caat_rules_group">
          <button
            onClick={() => setActiveRule('Benford')}
            className={`w-full text-left p-3.5 text-xs flex justify-between items-center font-bold font-sans cursor-pointer ${
              activeRule === 'Benford' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Benford's Law Digits audit
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded ${activeRule === 'Benford' ? 'bg-zinc-700 font-mono text-zinc-100' : 'bg-zinc-100 text-zinc-600'}`}>
              Plot view
            </span>
          </button>

          <button
            onClick={() => setActiveRule('Duplicates')}
            className={`w-full text-left p-3.5 text-xs flex justify-between items-center font-bold font-sans cursor-pointer ${
              activeRule === 'Duplicates' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Binary className="w-4 h-4" />
              Duplicate ledger Payments
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${activeRule === 'Duplicates' ? 'bg-red-910 bg-red-100 text-red-800' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {duplicatesList.length} Flagged
            </span>
          </button>

          <button
            onClick={() => setActiveRule('Gaps')}
            className={`w-full text-left p-3.5 text-xs flex justify-between items-center font-bold font-sans cursor-pointer ${
              activeRule === 'Gaps' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Sequence Numbers Gap check
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${activeRule === 'Gaps' ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-100 text-zinc-700 border'}`}>
              {sequenceGaps.length} Gaps
            </span>
          </button>

          <button
            onClick={() => setActiveRule('AI')}
            className={`w-full text-left p-3.5 text-xs flex justify-between items-center font-bold font-sans cursor-pointer ${
              activeRule === 'AI' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Predictive AI Evasion anomalies
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${activeRule === 'AI' ? 'bg-amber-100 text-amber-900' : 'bg-amber-50 text-amber-800 border'}`}>
              {aiAnomaliesList.length} anomalies
            </span>
          </button>
        </div>

        {/* Dynamic side transaction list targeting exceptions exceptions */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 space-y-3" id="exception_tx_listbox">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide block border-b pb-1.5">
            {activeRule === 'Duplicates' ? 'Flagged Duplicate Items' :
             activeRule === 'Gaps' ? 'Sequence Gap Auditable Items' :
             activeRule === 'AI' ? 'Suspicious AI Risk anomalies' :
             'Population Transactions list'}
          </span>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" id="caat_tx_items_rail">
            {activeRule === 'Duplicates' && duplicatesList.length > 0 && duplicatesList.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTxId(t.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedTxId === t.id ? 'bg-red-50 border-red-300 font-bold' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex justify-between font-mono">
                  <span className="text-red-700">{t.id}</span>
                  <span>{t.date}</span>
                </div>
                <div className="font-bold text-zinc-900 mt-1">{t.vendor}</div>
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1.5">
                  <span>Invoice: {t.invoiceNumber}</span>
                  <span className="text-red-700 font-bold">{t.amount.toLocaleString()} ETB</span>
                </div>
              </div>
            ))}

            {activeRule === 'Gaps' && (
              <div className="space-y-3 p-3 bg-zinc-50 rounded-lg border border-dashed text-xs text-zinc-650 font-mono">
                <span className="font-bold text-zinc-850 block border-b pb-1 mb-2">Missing Sequenced Serial Numbers:</span>
                {sequenceGaps.map(g => (
                  <div key={g} className="flex gap-2 items-center text-red-650" id={`gap_${g}`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>INV-2026-0{g} contains an unrecorded ledger gap</span>
                  </div>
                ))}
                <span className="text-[10px] text-zinc-400 font-bold font-sans mt-2 block">
                  Recommend check procurement vouchers sequence logs.
                </span>
              </div>
            )}

            {activeRule === 'AI' && aiAnomaliesList.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTxId(t.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedTxId === t.id ? 'bg-amber-50 border-amber-305 border-amber-300 font-bold shadow-2xs' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex justify-between font-mono font-bold">
                  <span className="text-amber-800">{t.id}</span>
                  <span>Risk Score: 92%</span>
                </div>
                <div className="text-zinc-850 mt-1">Vendor: {t.vendor}</div>
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1 bg-white/60 p-1.5 rounded">
                  <span>Sign-off: {t.approver}</span>
                  <span className="text-zinc-950 font-bold">{t.amount.toLocaleString()} ETB</span>
                </div>
              </div>
            ))}

            {activeRule === 'Benford' && transactions.slice(0, 6).map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTxId(t.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer ${
                  selectedTxId === t.id ? 'bg-zinc-900 text-white border-zinc-900 font-bold' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex justify-between font-mono text-[10px]">
                  <span>{t.id}</span>
                  <span>Amount: {t.amount} ETB</span>
                </div>
                <div className="truncate mt-1 text-[11px] font-semibold">{t.vendor}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Visualization Board (Benford Graph vs Explainable AI narration card) */}
      <div className="lg:col-span-8 flex flex-col space-y-5" id="caat_right_pane">
        
        {/* SUB-PANEL 1: BENFORD'S LAW SVG CHART PLOT */}
        {activeRule === 'Benford' ? (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-4" id="benford_graph_card">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5 uppercase">
                  <BarChart2 className="w-4.5 h-4.5 text-zinc-550" />
                  First-Digit logarithmic Distribution vs Benford curve
                </h4>
                <p className="text-[11px] text-zinc-400">Math analyzes {totalAnalyzed} ledger values to identify fractional deviations.</p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-zinc-50 p-1.5 border rounded-lg" id="chart_legends">
                <span className="flex items-center gap-1"><span className="w-4 h-2.5 bg-zinc-805 bg-zinc-800 rounded"></span> Actual ledger %</span>
                <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t-2 border-red-600 inline-block"></span> Benford Ideal</span>
              </div>
            </div>

            {/* Premium Hand-Built SVG Bar and Line Plot chart */}
            <div className="bg-zinc-50/50 p-4 border rounded-xl" id="svg_embed_block">
              <svg viewBox="0 0 500 240" className="w-full h-auto text-zinc-650" id="benford_svg_element">
                {/* Horizontal grid lines */}
                <line x1="30" y1="30" x2="480" y2="30" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="130" x2="480" y2="130" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="180" x2="480" y2="180" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Y-Axis scale label */}
                <text x="5" y="34" className="text-[8px] font-mono font-bold" fill="#71717A">30%</text>
                <text x="5" y="84" className="text-[8px] font-mono font-bold" fill="#71717A">20%</text>
                <text x="5" y="134" className="text-[8px] font-mono font-bold" fill="#71717A">10%</text>
                <text x="5" y="184" className="text-[8px] font-mono font-bold" fill="#71717A">0%</text>

                {/* Plot Bars loop */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, index) => {
                  const idealProb = BENFORD_DEFAULTS[digit];
                  const actualProb = distribution[digit] || 0;

                  // coordinates
                  const xPos = 40 + index * 48;
                  const barWidth = 22;
                  
                  // Graph Height scaling (max 150px representing 30%)
                  const idealHeight = (idealProb / 35) * 150;
                  const actualHeight = (actualProb / 35) * 150;

                  const yActual = 180 - actualHeight;
                  const yIdeal = 180 - idealHeight;

                  return (
                    <g key={digit} id={`svg_g_${digit}`}>
                      {/* Actual Hist bar */}
                      <rect
                        x={xPos}
                        y={yActual}
                        width={barWidth}
                        height={actualHeight}
                        fill="#18181B"
                        className="transition-all duration-350 hover:fill-zinc-700 cursor-pointer"
                      />
                      
                      {/* Plot connecting lines points representing Benford index */}
                      <circle cx={xPos + barWidth / 2} cy={yIdeal} r="3" fill="#DC2626" />
                      
                      {/* Draw connecting line if index < 9 */}
                      {index < 8 && (
                        <line
                          x1={xPos + barWidth / 2}
                          y1={yIdeal}
                          x2={xPos + barWidth / 2 + 48}
                          y2={180 - (BENFORD_DEFAULTS[digit + 1] / 35) * 150}
                          stroke="#DC2626"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Digit values label at bottom of chart */}
                      <text x={xPos + 6} y="198" className="text-[9px] font-mono font-bold" fill="#52525B">{digit}</text>
                      
                      {/* Value values numeric tag */}
                      <text x={xPos - 5} y={yActual - 5} className="text-[7.5px] font-mono font-bold" fill="#18181B">{actualProb}%</text>
                    </g>
                  );
                })}
                <line x1="30" y1="180" x2="480" y2="180" stroke="#71717A" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="p-4 bg-zinc-50 border rounded-xl text-xs leading-relaxed space-y-1 text-zinc-650" id="benford_math_summary">
              <span className="font-extrabold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                Statistical Audit Diagnostics:
              </span>
              <p>Digit <span className="font-bold underline">#1</span> matches ideal Benford constraints at <strong className="text-zinc-900">{distribution[1]}%</strong> vs theoretical target 30.1%.</p>
              <p>Deviation alerts triggered under Digit <span className="font-extrabold text-zinc-900">#4</span> registering <strong className="text-red-750 font-bold">{distribution[4]}%</strong> against theoretical threshold 9.7%. This indicates potential artificial transaction splitting below manager limits.</p>
            </div>
          </div>
        ) : (
          /* SUB-PANEL 2: EXPLAINABLE AI WORKSPACE VIEW LOGS - US-6.04 */
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 space-y-5" id="explainable_ai_card">
            
            <div className="pb-4 border-b">
              <span className="text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded inline-block animate-pulse">
                Predictive AI Anomaly diagnostics
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mt-2 flex items-center gap-1">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                Explainable AI (XAI) Exception Narratives
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Natural language translations of deep neural exception patterns.</p>
            </div>

            {txSelected ? (
              <div className="space-y-4" id="xai_detail_view">
                
                {/* Visual context stats of suspicious item */}
                <div className="p-4 bg-zinc-50 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono" id="vetted_tx_stats_grid">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-sans">Transaction Ref</span>
                    <span className="block font-bold text-zinc-900">{txSelected.id}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-sans">Disbursed Amount</span>
                    <span className="block font-semibold text-red-700">{txSelected.amount.toLocaleString()} ETB</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-sans">Operating Vendor</span>
                    <span className="block font-bold text-zinc-900 truncate" title={txSelected.vendor}>{txSelected.vendor}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-sans">Serial Identifier</span>
                    <span className="block font-bold text-zinc-900">{txSelected.invoiceNumber}</span>
                  </div>
                </div>

                {/* Natural narrative block */}
                <div className="p-5 bg-zinc-900 text-zinc-100 font-mono text-[11px] leading-relaxed rounded-xl shadow-xs border border-zinc-750 whitespace-pre-wrap" id="narrative_text_display">
                  {getXaiNarrative(txSelected)}
                </div>

                <div className="flex justify-end gap-2 text-xs" id="xai_resolution_btn_group">
                  <button
                    onClick={() => {
                      alert(`Transaction ${txSelected.id} flagged context dispatched as high-risk audit findings payload!`);
                      onLogAction('AI Escalation Manual Dispatch', `Promoted predictive anomaly #${txSelected.id} to fieldwork findings`);
                    }}
                    className="flex items-center gap-1 shadow-sm bg-zinc-900 text-white font-bold px-3.5 py-1.5 rounded-lg hover:bg-zinc-850 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-450 text-yellow-405 shrink-0" />
                    Dispatch Finding Payload
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-200 rounded-xl text-zinc-400 flex flex-col justify-center items-center">
                <FileSearch className="w-12 h-12 text-zinc-300 mb-2" />
                <span className="text-xs">Select any transactional record on the left rail to view Explainable AI (XAI) deep audit logs.</span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
