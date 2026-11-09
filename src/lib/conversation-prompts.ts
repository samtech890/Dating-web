export type PromptCategory = "Shared interest" | "Getting to know you" | "Playful" | "Intentions";

export type ConversationPrompt = {
  category: PromptCategory;
  prompt: string;
};

const dailyThemes = [
  "A small thing you’re looking forward to",
  "The best thing you tasted recently",
  "A place you’d happily revisit",
  "Something you’ve been curious to learn",
  "Your ideal unhurried afternoon",
  "A song that changed your mood today",
  "A little win from this week",
];

const generalPrompts: ConversationPrompt[] = [
  { category: "Getting to know you", prompt: "What does a really good weekend feel like to you?" },
  { category: "Getting to know you", prompt: "What’s something you could talk about for hours?" },
  { category: "Playful", prompt: "You get a free afternoon and no plans. Where do you end up?" },
  { category: "Playful", prompt: "What’s a tiny hill you’re willing to die on?" },
  { category: "Intentions", prompt: "What helps a new connection feel comfortable and genuine for you?" },
  { category: "Intentions", prompt: "What does making time for someone look like in your life?" },
];

export function getDailyTheme(date = new Date()): string {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return dailyThemes[((day % dailyThemes.length) + dailyThemes.length) % dailyThemes.length];
}

export function getConversationPrompts(sharedInterests: string[] = []): ConversationPrompt[] {
  const shared = sharedInterests.slice(0, 8).map((interest) => ({
    category: "Shared interest" as const,
    prompt: `What first got you into ${interest.toLowerCase()}?`,
  }));
  return [...shared, ...generalPrompts];
}
