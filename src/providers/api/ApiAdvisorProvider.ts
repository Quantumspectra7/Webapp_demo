import { AdvisorMessage } from "@/domain";
import { IAdvisorProvider } from "@/providers/interfaces";
import { marketService, schemeService } from "@/services";

const INITIAL_CONVERSATION: AdvisorMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content:
      "Welcome to GramVest Advisor — Your Business Decision Partner. I have reviewed your selected enterprise and verified local market and financial data. Ask me about viability, capital requirements, loan affordability, government subsidies, or risks to make an informed decision.",
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  },
];

export class ApiAdvisorProvider implements IAdvisorProvider {
  private messages: AdvisorMessage[] = [...INITIAL_CONVERSATION];

  async getConversationHistory(): Promise<AdvisorMessage[]> {
    return [...this.messages];
  }

  async sendMessage(userMessage: string, context?: any): Promise<AdvisorMessage> {
    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    // Add user message to local state immediately
    this.messages.push(userMsg);

    try {
      // Build context for the API — no hardcoded fallbacks
      // If context is missing, the Gemini API will provide general guidance
      const business = context?.business || null;
      const location = context?.location || null;
      const financial = context?.financial || null;

      // Auto-fetch deep context from other domain services to send to AI
      let market = null;
      let opportunity = null;
      let risks = null;
      let viability = null;
      let schemes = null;

      try {
        const radiusKm = 5;
        market = await marketService.getAnalysis(radiusKm, location, business.categoryId || business.slug);
        opportunity = await marketService.getOpportunity();
        risks = await marketService.getRisks();
        viability = await marketService.getViabilityScore();
        schemes = await schemeService.getRecommendations();
      } catch (e) {
        console.warn("Could not fetch deep domain context for AI advisor", e);
      }

      const language = context?.language || "EN";

      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          business,
          location,
          financial,
          market,
          opportunity,
          risks,
          viability,
          schemes,
          language,
          isVoiceQuery: !!context?.isVoiceQuery,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();

      const assistantMsg: AdvisorMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.structuredData?.answer || "I'm sorry, I could not generate a response.",
        structuredData: data.structuredData,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      this.messages.push(assistantMsg);
      return assistantMsg;
    } catch (error) {
      console.error("ApiAdvisorProvider Error:", error);

      const errorMsg: AdvisorMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I am having trouble connecting to the decision engine right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      this.messages.push(errorMsg);
      return errorMsg;
    }
  }

  async resetConversation(): Promise<void> {
    this.messages = [...INITIAL_CONVERSATION];
  }

  async getSuggestedQuestions(): Promise<string[]> {
    return [
      "What is my viability score and what affects it?",
      "Can I afford this venture with my current capital?",
      "Which government scheme best fits my business?",
      "What is my biggest financial risk?",
      "What happens if my revenue falls by 20%?",
      "What licenses and approvals do I need?",
    ];
  }
}
