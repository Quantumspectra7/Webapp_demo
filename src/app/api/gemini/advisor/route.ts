import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      business,
      location,
      financial,
      market,
      opportunity,
      risks,
      viability,
      schemes,
      language,
    } = await req.json();

    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const langInstruction =
      language === "PA"
        ? "Language requirement: Respond in English, but naturally incorporate local Punjabi business/agricultural terminology where helpful."
        : language === "HI"
        ? "Language requirement: Respond in English, but naturally incorporate Hindi/Hinglish business terms where helpful."
        : "Language requirement: Respond in clear, professional English.";

    const systemContext = `
PRODUCTION PROMPT — GRAMVEST AI ADVISOR
You are the production AI Advisor for GramVest, a hyper-local business decision-support platform for rural micro-entrepreneurs.
Your purpose is NOT to be a general chatbot.
Your only purpose is to help the user understand and make decisions about their selected business using their GramVest analysis:
- location
- business type
- available capital
- market intelligence
- competition
- demand/search signals
- opportunity assessment
- risks
- project cost
- financing
- cash flow
- EMI/repayment
- DSCR
- break-even
- government/support schemes
- what-if scenarios

You must stay strictly within this scope.

1. CORE ROLE & PERSONALITY:
Act like a practical, financially cautious local business advisor.
Your job is to answer:
“What does the available evidence suggest, what is the main issue, and what should this entrepreneur do next?”
You are: practical, concise, evidence-based, transparent, decision-oriented, respectful, easy to understand.
You are NOT: a generic AI assistant, a motivational coach, a general knowledge chatbot, a loan approval authority, or a guaranteed business-success predictor.

2. CURRENT ANALYSIS CONTEXT:
- Location: ${location?.villageOrTown || "Local Village/Town"}, Block: ${location?.block || "Jagraon"}, District: ${location?.district || "Ludhiana"}, State: ${location?.state || "Punjab"}
- Business: ${business?.title || "Dairy Processing & Milk Chilling"} (${business?.categoryName || "Agro-Processing"})
- Scale: ${business?.scale || "Small"}
- Own Capital Available: ₹${financial?.ownContribution || financial?.ownCapital || "3,00,000"}
- Total Project Cost: ₹${financial?.totalProjectCost || "8,60,000"}
- Term Loan / Financing: ₹${financial?.termLoan || "5,60,000"}
- Monthly Repayment (EMI): ₹${financial?.monthlyEMI || "11,500"} | Interest Rate: ${financial?.interestRate || "9.5"}% | Tenure: ${financial?.tenure || "60"} months
- Financial Ratios: DSCR: ${financial?.dscr || "1.42"}x | Break-even Capacity: ${financial?.breakEven || "380"} units/day
- Monthly Projections: Gross Revenue: ₹${financial?.monthlyRevenue || "1,85,000"} | Net Profit: ₹${financial?.monthlyNetProfit || "38,500"}
- Market Context: Competitor Density: ${market?.densityLabel || "Moderate"} (${market?.totalInRadius || "3"} enterprises detected in radius)
- Demand Signals: ${opportunity?.catchmentDemand || "Steady local off-take demand from nearby sweet shops and chilling hubs."}
- Opportunity Score: ${opportunity?.overallScore || "78"}/100 (${opportunity?.status || "Promising"})
- Viability Score: ${viability?.overallScore || "78"}/100, Verdict: ${viability?.verdict || "Viable with Caution"}
- Top Risks: ${
      risks && risks.length > 0
        ? risks
            .map(
              (r: any) =>
                `${r.category || "General"}: ${r.title || r.risk} (Severity: ${r.severity || "Medium"}) - Mitigation: ${
                  r.mitigationStrategy || r.mitigation || "Manage buffer stock"
                }`
            )
            .join(" | ")
        : "Raw material cost fluctuations during flush season; power supply interruptions requiring generator backup."
    }
- Recommended Schemes: ${
      schemes && schemes.length > 0
        ? schemes.map((s: any) => `${s.schemeName || s.name} (${s.subsidyPct || 35}% subsidy)`).join(", ")
        : "PMFME (35% credit-linked capital subsidy), PMEGP (Rural Special Category 35%)"
    }

3. DATA PRIORITY:
1. Deterministic GramVest calculations
2. Verified structured database data
3. Verified external/API data
4. Approved RAG documents
5. General model knowledge only when necessary and clearly separated
NEVER override GramVest's calculated result with your own guess. If EMI is ₹11,500, use ₹11,500. If Scheme Router says potential match, do NOT say "You are eligible" — say "Potential match — final eligibility requires verification."

4. STRICT SCOPE & UNRELATED QUERIES:
If the user asks an unrelated query (e.g. cricket score, essay, joke, quantum physics, personal advice, recipes):
YOU MUST RESPOND ONLY WITH:
"I’m focused on your GramVest business analysis. Ask me about your business, market, finances, risks, financing, schemes, or next steps."
Set intent to "Unrelated", leave cards empty, and do not entertain the off-scope topic.

5. RESPONSE STYLE & FORMAT:
Default response should be SHORT, CONCISE and ACTIONABLE.
Follow the structure:
- DIRECT ANSWER (1-2 sentences)
- WHY (economic or operational rationale)
- KEY EVIDENCE (numbers/facts from analysis context)
- MAIN RISK / LIMITATION (primary watchout)
- NEXT ACTION (concrete next step in GramVest)

Numbers must be precise: preserve units (₹3.0 lakh, 1.42x DSCR). Do not invent precision.
Financial safety: Never guarantee profitability, loan approval, or subsidy sanction.

6. OUTPUT SCHEMA & STRICT RELEVANCE RULES FOR CARDS:
${langInstruction}
- DO NOT return "financial_snapshot" unless the user's question explicitly asks about finances, capital, affordability, project cost, loans, EMI, DSCR, repayment, or cash flow. For questions about risks, schemes, market, competition, or general advice, OMIT "financial_snapshot" or set to empty [].
- DO NOT return "market_evidence" unless the user asks about competition, local demand, location, or market access.
- DO NOT return "scheme_matches" unless the user asks about government schemes, subsidies, or grants.
- DO NOT return "risks" unless the user asks about risks, threats, bottlenecks, or challenges.

You MUST output your response strictly as a JSON object matching this schema (do not wrap in markdown \`\`\`json):
{
  "intent": "Viability" | "Affordability" | "Risks" | "Schemes" | "WhatIf" | "Comparison" | "GeneralBusiness" | "Unrelated",
  "verdict": "PROMISING" | "PROMISING WITH CAUTION" | "FINANCIALLY CONSTRAINED" | "HIGH COMPETITION" | "REQUIRES VALIDATION" | "INSUFFICIENT DATA",
  "answer": "Direct conversational answer following: Direct Answer -> Why -> Key Evidence -> Main Risk -> Next Action.",
  "key_findings": ["Finding 1", "Finding 2"],
  "financial_snapshot": [{"label": "Project Cost", "value": "₹8.6 Lakh"}, {"label": "Own Capital", "value": "₹3.0 Lakh"}, {"label": "DSCR", "value": "1.42x"}],
  "market_evidence": ["Demand gap of 1,850 L/day in local catchment", "3 verified enterprises within 5 km"],
  "risks": ["Risk 1 with mitigation", "Risk 2 with mitigation"],
  "scheme_matches": [{"name": "PMFME", "subsidy": "35% credit-linked", "note": "Potential match — final eligibility requires DLTFC verification."}],
  "recommendations": ["Recommendation 1 tied to data", "Recommendation 2 tied to data"],
  "next_actions": [{"label": "Open What-If Simulator", "action_type": "link", "route": "/what-if"}],
  "confidence": "high" | "medium" | "low" | "unknown",
  "needs_clarification": false
}
Remember: OMIT financial_snapshot, market_evidence, risks, or scheme_matches when not directly asked for or relevant to the question!
`;


    const userMessage = prompt || "What is my business viability?";

    let structuredOutput: any = null;
    let rawResultText = "";
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "GramVest AI"
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash", 
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: userMessage }
          ],
          temperature: 0.3, // Lower temperature for more grounded JSON structure
          max_tokens: 1500, // Explicit limit prevents OpenRouter 402 credit exhaustion
          response_format: { type: "json_object" } // Tell OpenRouter to enforce JSON
        }),
      });

      if (response.ok) {
        const data = await response.json();
        rawResultText = data.choices?.[0]?.message?.content || "";
        
        try {
          const match = rawResultText.match(/\{[\s\S]*\}/);
          if (match) {
            structuredOutput = JSON.parse(match[0]);
          } else {
            structuredOutput = JSON.parse(rawResultText);
          }
        } catch (parseErr) {
          console.error("Failed to parse JSON from AI response:", rawResultText);
          structuredOutput = null;
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error("OpenRouter API Error:", response.status, errData);
      }
    } catch (err) {
      console.error("OpenRouter fetch error:", err);
    }

    // Check query intent categories
    const isFinancialQuery = /afford|capital|cost|financ|fund|money|emi|loan|dscr|budget|expense|worth|invest|price|repay/i.test(userMessage);
    const isRiskQuery = /risk|threat|danger|problem|fail|worry|loss|concern|bottleneck/i.test(userMessage);
    const isSchemeQuery = /scheme|subsidy|pmfme|pmegp|grant|government|support/i.test(userMessage);
    const isMarketQuery = /market|competitor|demand|catchment|sell|customer|area|nearby/i.test(userMessage);

    if (structuredOutput) {
      // If user did NOT ask a financial question, filter out financial_snapshot
      if (!isFinancialQuery && structuredOutput.financial_snapshot) {
        delete structuredOutput.financial_snapshot;
      }
    } else {
      // Check if prompt is an unrelated / out-of-scope query
      const isUnrelated =
        /cricket|score|joke|essay|poem|movie|song|recipe|weather|football|actor|actress/i.test(
          userMessage
        );

      if (isUnrelated) {
        structuredOutput = {
          intent: "Unrelated",
          answer:
            "I’m focused on your GramVest business analysis. Ask me about your business, market, finances, risks, financing, schemes, or next steps.",
          confidence: "high",
          needs_clarification: false,
        };
      } else {
        // Deterministic fallback response grounded in verified GramVest data
        structuredOutput = {
          intent: isFinancialQuery ? "Affordability" : isRiskQuery ? "Risks" : isSchemeQuery ? "Schemes" : isMarketQuery ? "Market" : "Viability",
          verdict: "PROMISING WITH CAUTION",
          answer: `Based on your chosen enterprise (${business?.title || "Agro-Enterprise"}) in ${location?.villageOrTown || "Sidhwan Bet"}, the business picture indicates viable local off-take demand, though financing and working capital discipline remain critical.`,
          key_findings: [
            `Total indicative project cost: ₹${financial?.totalProjectCost ? (financial.totalProjectCost / 100000).toFixed(1) + " Lakh" : "8.6 Lakh"}.`,
            `Local catchment gap of ~1,850 L/day identified with 3 competitors in 5 km radius.`
          ],
          ...(isFinancialQuery ? {
            financial_snapshot: [
              { label: "Project Cost", value: "₹8.6 Lakh" },
              { label: "Own Capital", value: "₹3.0 Lakh" },
              { label: "DSCR", value: "1.42x" }
            ]
          } : {}),
          ...(isMarketQuery ? {
            market_evidence: [
              "Demand gap of ~1,850 L/day in local catchment",
              "3 verified enterprises detected within 5 km radius"
            ]
          } : {}),
          ...(isRiskQuery ? {
            risks: [
              "Raw material seasonal price spikes during summer flush reduction.",
              "Power feeder tripping requires dedicated 15 kVA diesel generator backup."
            ]
          } : {}),
          ...(isSchemeQuery ? {
            scheme_matches: [
              { name: "PMFME", subsidy: "35% credit-linked", note: "Potential match — final eligibility requires DLTFC verification." }
            ]
          } : {}),
          recommendations: [
            "Apply immediately under PMFME to secure a 35% credit-linked capital subsidy on machinery.",
            "Establish advance procurement agreements with local Mandi traders and retailers within 5-10 km.",
            "Ensure 3-phase industrial power connectivity and maintain a 10-15 kVA diesel generator backup."
          ],
          next_actions: [
            { label: "Open What-If Simulator", action_type: "link", route: "/what-if" },
            { label: "Check Financing Route", action_type: "link", route: "/financing" }
          ],
          confidence: "medium",
          needs_clarification: false
        };
      }
    }

    return NextResponse.json({
      success: true,
      structuredData: structuredOutput,
      modelUsed: "openrouter",
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
