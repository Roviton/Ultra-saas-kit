/**
 * Shared appearance settings for Clerk authentication components
 * This ensures consistent styling across all Clerk components
 */

export const clerkAppearance = {
  elements: {
    formButtonPrimary: 
      "w-full py-2 px-4 bg-[#FFBE1A] text-black rounded-lg font-medium hover:bg-[#FFBE1A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFBE1A] disabled:opacity-50 transition-colors",
    card: "bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: 
      "bg-[#0A0A0A] border border-white/10 text-white hover:bg-[#1A1A1A]",
    formFieldInput: 
      "w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent",
    formFieldLabel: "text-white",
    footerActionText: "text-white",
    footerActionLink: "text-[#FFBE1A] hover:text-[#FFBE1A]/80"
  }
};
