import { AdvisorMessage } from "@/domain";
import { IAdvisorProvider } from "@/providers/interfaces";

const INITIAL_CONVERSATION: AdvisorMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content:
      "Sat Sri Akal Gurpreet ji. I have analyzed your Dairy Processing & Milk Chilling proposal for Sidhwan Bet, Jagraon. Your business picture looks promising with a 74/100 viability score and a 1,850 L/day local supply gap. How can I help you refine your machinery, funding route, or farmer procurement agreements today?",
    timestamp: "10:00 AM",
    citations: [
      {
        id: "cit-1",
        title: "Ludhiana District Micro-Dairy Catchment Study 2026",
        source: "Punjab State Farmers & Farm Workers Commission",
      },
      {
        id: "cit-2",
        title: "PMEGP Rural Subsidy Guidelines (Rev 2025-26)",
        source: "Ministry of MSME",
      },
    ],
    actionLinks: [
      { label: "View Market Analysis", route: "/market" },
      { label: "Check Financing Route", route: "/financing" },
    ],
  },
];

const KNOWLEDGE_RESPONSES: Record<
  string,
  {
    answer: string;
    citations: { id: string; title: string; source: string }[];
    actionLinks?: { label: string; route: string }[];
  }
> = {
  capacity: {
    answer:
      "For Jagraon, a 1,000L Bulk Milk Cooler (BMC) running at 500L/day initial throughput is the optimal sweet spot. The Sidhwan Bet catchment has 25+ buffalo-rearing households that produce approximately 850L/day in summer and 1,200L/day in winter flush season. Starting at 500L/day ensures you exceed your break-even threshold (380 L/day) within the first 60 days without straining your ₹3.0 Lakh own capital buffer.",
    citations: [
      {
        id: "cit-capacity",
        title: "Bulk Milk Cooler Technical Specifications & Sizing Guide",
        source: "National Dairy Development Board (NDDB)",
      },
    ],
    actionLinks: [{ label: "Review Financial Break-Even", route: "/money" }],
  },
  pmegp: {
    answer:
      "Because your chilling unit is located in Sidhwan Bet (classified as a rural village under BDPO Jagraon) and you are eligible under the Rural Special Category, your PMEGP capital subsidy is 35% of eligible project cost. On your ₹9,00,000 capital outlay, this amounts to ₹3,15,000 credited as a back-ended subsidy after 3 years of successful operation. During this lock-in, you only service interest on the net borrowing, reducing your monthly interest burden by approximately ₹2,230/month.",
    citations: [
      {
        id: "cit-pmegp",
        title: "PMEGP E-Portal Operational Manual - Subsidy Adjustment Rules",
        source: "KVIC Central Office",
      },
    ],
    actionLinks: [{ label: "Open Scheme Checklist", route: "/financing" }],
  },
  fodder: {
    answer:
      "Green fodder (berseem and maize) prices in Punjab typically rise by 18-22% between May and July, which causes dairy farmers to demand ₹2-3/L higher farmgate prices. Under our What-If stress test, if your milk procurement cost increases from ₹42/L to ₹45/L while selling price remains ₹60/L, your DSCR dips from 1.62x to 1.34x. This remains above the 1.30x bank sanction threshold, but your monthly net cash flow tightens to ₹14,200. We strongly recommend helping your enrolled farmers source bulk silage bales during the April harvest.",
    citations: [
      {
        id: "cit-fodder",
        title: "Seasonal Fodder Price Indices in Central Plain Zone of Punjab",
        source: "Punjab Agricultural University (PAU), Ludhiana",
      },
    ],
    actionLinks: [{ label: "Run Fodder What-If Simulation", route: "/what-if" }],
  },
  licenses: {
    answer:
      "For a 1,000L chilling center in Punjab, you require four primary clearances: 1) FSSAI State License under Dairy Processing (₹3,000/yr), 2) Udyam Registration (free online self-declaration), 3) PPCB Green Category Consent to Operate (CTO) with basic soak-pit drainage, and 4) 12 kW commercial electricity connection from PSPCL. DIC Ludhiana requires proof of FSSAI and Udyam before processing the final subsidy claim.",
    citations: [
      {
        id: "cit-fssai",
        title: "Food Safety and Standards (Licensing of Food Businesses) Regulations",
        source: "FSSAI Northern Regional Office",
      },
    ],
    actionLinks: [{ label: "Review Statutory Checklist", route: "/report" }],
  },
};

export class MockAdvisorProvider implements IAdvisorProvider {
  private messages: AdvisorMessage[] = [...INITIAL_CONVERSATION];

  async getConversationHistory(): Promise<AdvisorMessage[]> {
    await new Promise((res) => setTimeout(res, 50));
    return [...this.messages];
  }

  async sendMessage(userMessage: string): Promise<AdvisorMessage> {
    await new Promise((res) => setTimeout(res, 350)); // Realistic advisory thinking delay

    const lower = userMessage.toLowerCase();
    let responseData = KNOWLEDGE_RESPONSES.capacity;

    if (lower.includes("subsidy") || lower.includes("pmegp") || lower.includes("grant") || lower.includes("loan")) {
      responseData = KNOWLEDGE_RESPONSES.pmegp;
    } else if (lower.includes("fodder") || lower.includes("cost") || lower.includes("summer") || lower.includes("price") || lower.includes("feed")) {
      responseData = KNOWLEDGE_RESPONSES.fodder;
    } else if (lower.includes("license") || lower.includes("fssai") || lower.includes("permit") || lower.includes("approval") || lower.includes("pollution")) {
      responseData = KNOWLEDGE_RESPONSES.licenses;
    } else if (lower.includes("capacity") || lower.includes("liter") || lower.includes("size") || lower.includes("cooler") || lower.includes("tank")) {
      responseData = KNOWLEDGE_RESPONSES.capacity;
    } else {
      responseData = {
        answer: `Regarding "${userMessage}": Based on the Jagraon milk shed benchmarks, your 500 L/day chilling unit has sufficient operating flexibility. With a monthly EBITDA of ~₹35,000 and 1.62x debt service coverage, you are well-positioned to approach Punjab National Bank or SBI Jagraon Branch. Would you like to review how this scenario performs under stress or inspect the complete bank-ready DPR?`,
        citations: [
          {
            id: "cit-gen",
            title: "GramVest Regional Micro-Enterprise Benchmarks",
            source: "Ludhiana Agri-Horti & Dairy Sectoral Scan 2026",
          },
        ],
        actionLinks: [
          { label: "Stress-Test in What-If", route: "/what-if" },
          { label: "View Detailed DPR Report", route: "/report" },
        ],
      };
    }

    const assistantMsg: AdvisorMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: responseData.answer,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      citations: responseData.citations,
      actionLinks: responseData.actionLinks,
    };

    this.messages.push(
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      assistantMsg
    );

    return assistantMsg;
  }

  async resetConversation(): Promise<void> {
    this.messages = [...INITIAL_CONVERSATION];
  }

  async getSuggestedQuestions(): Promise<string[]> {
    return [
      "Is 500 L/day chilling capacity enough for Jagraon market?",
      "How does the PMEGP 35% subsidy reduce my loan interest & EMI?",
      "What if summer fodder prices push milk procurement cost up to ₹45/L?",
      "What licenses are mandatory before ordering machinery (FSSAI, PPCB)?",
    ];
  }
}
