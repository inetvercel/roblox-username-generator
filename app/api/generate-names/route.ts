import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  console.log("API route called")
  try {
    const { keyword, type, length, count } = await req.json()
    console.log("Received parameters:", keyword, type, length, count)

    const prompt = `Generate ${count} unique and creative ${type} gaming usernames based on the keyword "${keyword}". 
    The usernames should be ${length} in length (short: 3-8 characters, medium: 9-14 characters, long: 15-20 characters, varied: mix of all lengths).
    Each username should be highly unique, creative, memorable, and ideal for gamers.
    The names should follow these rules:
    1. Be appropriate for all ages
    2. Use camelCase, underscores, or numbers for spacing/variation
    3. Include creative variations of the keyword
    4. Match the selected type (${type})
    5. Be unique and catchy for gaming communities
    6. Avoid common words or phrases that are likely to be taken (e.g., "TopGun", "ProGamer")
    7. Incorporate unexpected combinations of letters, numbers, or symbols
    8. Consider using creative misspellings or wordplay
    
    Return only the usernames separated by commas, no additional text.`

    console.log("Calling OpenAI API")
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    const names = text
      .split(",")
      .map((name) => name.trim())
      .slice(0, count)
    console.log("Generated names:", names)

    return NextResponse.json({ names })
  } catch (error) {
    console.error("Error generating names:", error)
    return NextResponse.json({ error: "Failed to generate names", details: error.message }, { status: 500 })
  }
}

