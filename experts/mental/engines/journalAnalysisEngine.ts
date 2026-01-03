
import { JournalAnalysisV2, PsychologicalFlexibility } from "../../../types";

export class JournalAnalysisEngine {
  
  // --- DICTIONARIES ---
  
  private static PHRASES_ACCEPTANCE_POS = ["feel x and", "accept", "despite", "willing to", "that's okay", "allow", "room for"];
  private static PHRASES_ACCEPTANCE_NEG = ["can't when", "must not", "need to avoid", "stop feeling", "shouldn't feel"];
  
  private static PHRASES_DEFUSION_POS = ["notice the", "my mind said", "thinking", "brain telling me", "just a thought", "story my mind"];
  private static PHRASES_DEFUSION_NEG = ["i am anxious", "i'm a failure", "i can't", "truth is"];
  
  private static PHRASES_VALUES_POS = ["for my team", "because it matters", "proud of", "love to", "passion for", "legacy", "identity as"];
  private static PHRASES_VALUES_NEG = ["have to", "should", "can't let down", "prove myself", "winning is everything"];
  
  private static PHRASES_PRESENT_POS = ["right now", "today", "this moment", "what i can do", "breath", "step"];
  private static PHRASES_PRESENT_NEG = ["worried about", "next week", "what if", "future", "will fail", "when i compete"];
  
  private static PHRASES_ACTION_POS = ["i did", "i trained", "despite", "even though", "i'm choosing to", "i will", "showed up"];
  private static PHRASES_ACTION_NEG = ["i want to but", "i can't right now", "i'll try later", "maybe tomorrow"];

  private static PHRASES_CATASTROPHIZING = ["never", "always", "impossible", "everyone", "no one", "all", "can't", "won't", "failure"];
  private static PHRASES_AVOIDANCE = ["they made me", "it's not my fault", "the team failed me", "coach didn't", "genetics", "bad luck"];
  private static PHRASES_ISOLATION = ["don't want to talk", "isolated", "alone", "don't want to see"];
  private static PHRASES_PERFECTIONISM = ["must be perfect", "can't make mistakes", "have to be best", "no excuses", "unacceptable"];

  // --- MAIN FUNCTION ---

  public static analyze(text: string): JournalAnalysisV2 {
    const tokens = this.tokenize(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // 1. ACT Markers
    const flex = this.extractACTMarkers(text, tokens);
    
    // 2. Risk Signals
    const risks = this.extractRiskSignals(text, tokens);
    
    // 3. Resilience Markers
    const resilience = this.extractResilienceMarkers(text, tokens);
    
    // 4. Sentiment (Naive local version)
    // A simplified sentiment analysis based on word valence if external AI fails
    const sentiment = this.naiveSentiment(tokens);
    
    // 5. Sentiment Evolution
    const evolution = this.analyzeSentimentEvolution(sentences);

    // 6. Confidence
    // Simple heuristic: length of text
    const confidence = Math.min(1, text.length / 200);

    return {
      sentiment,
      psychological_flexibility: flex,
      risk_signals: risks,
      resilience_markers: resilience,
      sentiment_evolution: evolution,
      analysis_confidence: parseFloat(confidence.toFixed(2))
    };
  }

  // --- HELPERS ---

  private static tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  }

  private static countPhrases(text: string, phrases: string[]): number {
    const lowerText = text.toLowerCase();
    let count = 0;
    phrases.forEach(p => {
      if (lowerText.includes(p)) count++;
    });
    return count;
  }

  private static extractACTMarkers(text: string, tokens: string[]): PsychologicalFlexibility {
    // Acceptance
    const accPos = this.countPhrases(text, this.PHRASES_ACCEPTANCE_POS);
    const accNeg = this.countPhrases(text, this.PHRASES_ACCEPTANCE_NEG);
    const acceptance = Math.max(0, Math.min(10, 5 + (accPos * 2) - (accNeg * 2)));

    // Defusion
    const defPos = this.countPhrases(text, this.PHRASES_DEFUSION_POS);
    const defNeg = this.countPhrases(text, this.PHRASES_DEFUSION_NEG);
    const defusion = Math.max(0, Math.min(10, 5 + (defPos * 2) - (defNeg * 2)));

    // Values
    const valPos = this.countPhrases(text, this.PHRASES_VALUES_POS);
    const valNeg = this.countPhrases(text, this.PHRASES_VALUES_NEG);
    const values = Math.max(0, Math.min(10, 5 + (valPos * 2) - (valNeg * 1.5)));

    // Present Moment
    const prePos = this.countPhrases(text, this.PHRASES_PRESENT_POS);
    const preNeg = this.countPhrases(text, this.PHRASES_PRESENT_NEG);
    const present = Math.max(0, Math.min(10, 5 + (prePos * 2) - (preNeg * 2)));

    // Committed Action
    const actPos = this.countPhrases(text, this.PHRASES_ACTION_POS);
    const actNeg = this.countPhrases(text, this.PHRASES_ACTION_NEG);
    const action = Math.max(0, Math.min(10, 5 + (actPos * 2) - (actNeg * 2)));

    return {
      acceptance_level: parseFloat(acceptance.toFixed(1)),
      cognitive_defusion: parseFloat(defusion.toFixed(1)),
      values_alignment: parseFloat(values.toFixed(1)),
      present_moment: parseFloat(present.toFixed(1)),
      committed_action: parseFloat(action.toFixed(1))
    };
  }

  private static extractRiskSignals(text: string, tokens: string[]) {
    const catastrophizing = this.countPhrases(text, this.PHRASES_CATASTROPHIZING);
    const avoidance = this.countPhrases(text, this.PHRASES_AVOIDANCE);
    const isolation = this.countPhrases(text, this.PHRASES_ISOLATION);
    const perfectionism = this.countPhrases(text, this.PHRASES_PERFECTIONISM);
    
    // Rumination: repetition of negative words
    const unique = new Set(tokens);
    const diversityRatio = unique.size / Math.max(1, tokens.length);
    const rumination = diversityRatio < 0.6 ? (1 - diversityRatio) * 10 : 0;

    return {
      catastrophizing: Math.min(10, catastrophizing * 2),
      avoidance: Math.min(10, avoidance * 2),
      rumination: parseFloat(rumination.toFixed(1)),
      isolation: Math.min(10, isolation * 2),
      perfectionism: Math.min(10, perfectionism * 2)
    };
  }

  private static extractResilienceMarkers(text: string, tokens: string[]) {
    // Simplified for local engine
    const growthWords = ["learn", "grow", "yet", "process", "improve"];
    const agencyWords = ["i can", "i will", "choice", "control"];
    
    const growthCount = tokens.filter(t => growthWords.includes(t)).length;
    const agencyCount = this.countPhrases(text, agencyWords);

    return {
      self_compassion: 5, // Placeholder requiring deeper NLP
      reframing: 5,
      growth_mindset: Math.min(10, growthCount * 2),
      perspective_taking: 5,
      agency: Math.min(10, agencyCount * 2)
    };
  }

  private static naiveSentiment(tokens: string[]): "Positive" | "Negative" | "Neutral" {
    const pos = ["good", "great", "happy", "strong", "ready", "excited", "love"];
    const neg = ["bad", "sad", "weak", "tired", "anxious", "hate", "fail"];
    
    let score = 0;
    tokens.forEach(t => {
      if (pos.includes(t)) score++;
      if (neg.includes(t)) score--;
    });

    if (score > 1) return "Positive";
    if (score < -1) return "Negative";
    return "Neutral";
  }

  private static analyzeSentimentEvolution(sentences: string[]) {
    if (sentences.length < 2) return { start_sentiment: 5, end_sentiment: 5, trajectory: "flat" as const };
    
    const startToks = this.tokenize(sentences[0]);
    const endToks = this.tokenize(sentences[sentences.length - 1]);
    
    const startVal = this.naiveSentiment(startToks) === 'Positive' ? 8 : this.naiveSentiment(startToks) === 'Negative' ? 2 : 5;
    const endVal = this.naiveSentiment(endToks) === 'Positive' ? 8 : this.naiveSentiment(endToks) === 'Negative' ? 2 : 5;
    
    let traj: "improving" | "declining" | "flat" = "flat";
    if (endVal > startVal) traj = "improving";
    if (endVal < startVal) traj = "declining";

    return {
      start_sentiment: startVal,
      end_sentiment: endVal,
      trajectory: traj
    };
  }
}
