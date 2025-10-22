export async function generateNamesWithAI(
  keyword: string,
  type: string,
  length: string,
  count = 15,
): Promise<string[]> {
  console.log("generateNamesWithAI called with:", { keyword, type, length, count })

  try {
    const response = await fetch("/api/generate-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword, type, length, count }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API response:", data)

    if (!data.names || !Array.isArray(data.names)) {
      throw new Error("Invalid response format")
    }

    return data.names
  } catch (error) {
    console.error("Error in generateNamesWithAI:", error)
    throw error
  }
}

export async function checkAvailability(name: string, platform: string): Promise<boolean> {
  // This is still a mock function. In a real application, you would call an API to check availability.
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Math.random() > 0.5
}

