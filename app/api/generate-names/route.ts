import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  console.log("API route called")
  
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }
  
  // Create OpenAI provider with API key
  const openai = createOpenAI({
    apiKey: apiKey,
  })
  
  try {
    const { keyword, type, length, count } = await req.json()
    console.log("Received parameters:", keyword, type, length, count)

    // Style-specific instructions
    const styleGuide: { [key: string]: string } = {
      cool: `Make usernames stylish, trendy, and popular. Use patterns like: x${keyword}x, ${keyword}XO, ${keyword}Vibe, ${keyword}Wave, I${keyword}I, ${keyword}Mode`,
      funny: `Make usernames humorous and meme-worthy. Use funny patterns like: ${keyword}Meme, ${keyword}LOL, ${keyword}Bruh, ${keyword}XD, Sus${keyword}, ${keyword}GoofY`,
      tryhard: `Make usernames competitive and pro-level. Use tryhard patterns like: ${keyword}Pro, ${keyword}TTV, ${keyword}YT, ${keyword}FN, Try${keyword}, ${keyword}Clutch, ${keyword}Ace`,
      aesthetic: `Make usernames soft, pretty, and aesthetic. Use soft patterns like: ${keyword}Moon, ${keyword}Star, Soft${keyword}, ${keyword}Cloud, ${keyword}Skies, ${keyword}Glow`,
      edgy: `Make usernames dark, mysterious, and edgy. Use edgy patterns like: Dark${keyword}, ${keyword}Void, ${keyword}Reaper, ${keyword}Demon, Shadow${keyword}, ${keyword}Fallen`,
      og: `Make usernames classic and old-school style. Use OG patterns like: ${keyword}2009, OG${keyword}, ${keyword}Legend, ${keyword}OG, Classic${keyword}, ${keyword}King`,
      anime: `Make usernames anime and manga inspired. Use anime patterns like: ${keyword}Kun, ${keyword}Chan, ${keyword}Sama, ${keyword}Sensei, ${keyword}Senpai, Otaku${keyword}`,
      gaming: `Make usernames gaming-focused. Use gaming patterns like: ${keyword}Gaming, ${keyword}Plays, ${keyword}GG, ${keyword}Pwns, ${keyword}Rekt, Game${keyword}`
    }

    const prompt = `Generate ${count} unique and creative ${type} Roblox-style usernames based on the keyword "${keyword}". 
    The usernames should be ${length} in length (short: 3-8 characters, medium: 9-14 characters, long: 15-20 characters, varied: mix of all lengths).
    Each username should be highly unique, creative, memorable, and perfect for Roblox players.
    
    STYLE GUIDE: ${styleGuide[type] || styleGuide["cool"]}
    
    IMPORTANT Roblox Username Rules:
    1. Must be appropriate for all ages (family-friendly)
    2. Can use letters, numbers, and underscores only (NO special characters like @#$%!)
    3. Cannot start or end with an underscore
    4. Cannot have consecutive underscores
    5. Length must be between 3-20 characters
    6. Include creative variations of the keyword
    7. Match the selected style (${type}) - this is VERY important
    8. Be unique and memorable for the Roblox community
    9. Avoid common words or phrases that are likely taken
    10. Use numbers creatively (123, 999, 007, etc.)
    11. Mix upper and lowercase letters for visual appeal
    
    Examples for ${type} style:
    ${type === "cool" ? "CoolDragon, xShadowx, ILegendI, VibeKing, WaveMaster" : ""}
    ${type === "funny" ? "SusAmogus, BruhMoment, XD_Master, LOLGamer, MemeLord69" : ""}
    ${type === "tryhard" ? "ProGamer_YT, TTV_Ninja, FN_Clutch, AceMaster, TryHard_TTV" : ""}
    ${type === "aesthetic" ? "MoonGlow, StarDust, SoftCloud, AestheticVibes, CloudySkies" : ""}
    ${type === "edgy" ? "DarkVoid, ShadowReaper, FallenAngel, VoidDemon, DarkSoul666" : ""}
    ${type === "og" ? "Legend2009, OG_King, ClassicGamer, KingOG, OldSchool_Pro" : ""}
    ${type === "anime" ? "NarutoKun, SasukeKun, OtakuLord, AnimeSenpai, MangaMaster" : ""}
    ${type === "gaming" ? "GamerPro, PlaysFortnite, GG_Master, RektNoobs, GameKing123" : ""}
    
    Return only the usernames separated by commas, no additional text or numbering.`

    console.log("Calling OpenAI API with gpt-4o-mini")
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 1.2,
      maxTokens: 300,
    })

    const names = text
      .split(",")
      .map((name) => name.trim())
      .slice(0, count)
    console.log("Generated names:", names)

    return NextResponse.json({ names })
  } catch (error: unknown) {
    console.error("Error generating names:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ 
      error: "Failed to generate names", 
      details: errorMessage 
    }, { status: 500 })
  }
}

