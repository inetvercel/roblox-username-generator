"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Star, Copy, Save, RefreshCw, Trash2 } from "lucide-react"
import { generateNamesWithAI, checkAvailability } from "@/lib/nameGenerator"

export default function GamingNameGenerator() {
  // Cool example usernames to show immediately
  const exampleUsernames = [
    "xShadowKingx",
    "ILegendI",
    "CrystalVibe",
    "NeonWave",
    "DarkPhoenix",
    "StormBringer",
    "FrostByte",
    "BlazeMaster",
    "CosmicAce",
    "ThunderStrike",
    "NightHunter",
    "SilverWolf",
    "DragonLord",
    "EpicGamer_YT",
    "ProWizard",
  ]

  const [keyword, setKeyword] = useState("")
  const [nameType, setNameType] = useState("cool")
  const [nameLength, setNameLength] = useState("varied")
  const [generatedNames, setGeneratedNames] = useState<string[]>(exampleUsernames)
  const [savedNames, setSavedNames] = useState<string[]>([])
  const [selectedName, setSelectedName] = useState("")
  const [platform, setPlatform] = useState("")
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [showSavedNames, setShowSavedNames] = useState(false)
  const { toast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("savedNames")
    if (saved) {
      setSavedNames(JSON.parse(saved))
    }

    // Don't generate initial names - we already have example usernames
    // generateInitialNames()

    // Add event listener for postMessage
    window.addEventListener("message", handlePostMessage)

    // Cleanup
    return () => {
      window.removeEventListener("message", handlePostMessage)
    }
  }, [])

  const handlePostMessage = (event: MessageEvent) => {
    // Check if the message is from the parent (WordPress) and contains the container height
    if (event.data && event.data.type === "containerHeight") {
      // Adjust the max-height of the names container
      const namesContainer = document.getElementById("names-container")
      if (namesContainer) {
        namesContainer.style.maxHeight = `${event.data.height - 400}px` // Adjust 400px as needed
      }
    }
  }

  useEffect(() => {
    // Notify the parent (WordPress) that the content has changed
    window.parent.postMessage({ type: "contentChanged" }, "*")
  }, [])

  const generateInitialNames = async () => {
    setIsGenerating(true)
    try {
      const names = await generateRandomNames(15)
      setGeneratedNames(names)
    } catch (error) {
      console.error("Error generating initial names:", error)
      toast({
        title: "Error",
        description: "Failed to generate initial names. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRandomNames = async (count: number) => {
    const randomKeywords = ["epic", "shadow", "crystal", "storm", "neon", "cosmic", "legend", "fire", "ice", "wolf", "dragon", "king", "pro"]
    const randomTypes = ["cool", "funny", "tryhard", "aesthetic", "edgy", "og", "anime", "gaming"]
    const randomLengths = ["short", "medium", "long", "varied"]

    const keyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)]
    const type = randomTypes[Math.floor(Math.random() * randomTypes.length)]
    const length = randomLengths[Math.floor(Math.random() * randomLengths.length)]

    return await generateNamesWithAI(keyword, type, length, count)
  }

  const handleGenerate = async () => {
    if (keyword) {
      setIsGenerating(true)
      console.log("Generating names for keyword:", keyword)
      try {
        console.log("Calling generateNamesWithAI")
        const names = await generateNamesWithAI(keyword, nameType, nameLength, 15)
        console.log("Generated names:", names)
        if (names.length === 0) {
          throw new Error("No names were generated. Please try again.")
        }
        setGeneratedNames(names)
        setSelectedName("")
        setAvailability(null)
      } catch (error: any) {
        console.error("Error generating names:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to generate names. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    } else {
      console.log("No keyword provided")
      toast({
        title: "Error",
        description: "Please enter a keyword before generating names.",
        variant: "destructive",
      })
    }
  }

  const handleCheckAvailability = async () => {
    if (selectedName && platform) {
      setIsChecking(true)
      try {
        const isAvailable = await checkAvailability(selectedName, platform)
        setAvailability(isAvailable)
      } catch (error) {
        console.error("Error checking availability:", error)
        toast({
          title: "Error",
          description: "Failed to check availability. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsChecking(false)
      }
    }
  }

  const handleCopyName = (name: string) => {
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "0"
      textArea.style.top = "0"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        toast({
          title: "Copied!",
          description: `"${name}" has been copied to your clipboard.`,
        })
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err)
        toast({
          title: "Error",
          description: "Unable to copy. Please try again.",
          variant: "destructive",
        })
      }
      document.body.removeChild(textArea)
    }

    if (!navigator.clipboard) {
      fallbackCopy(name)
      return
    }

    navigator.clipboard
      .writeText(name)
      .then(() => {
        toast({
          title: "Copied!",
          description: `"${name}" has been copied to your clipboard.`,
        })
      })
      .catch((err) => {
        console.error("Could not copy text: ", err)
        fallbackCopy(name)
      })
  }

  const handleSaveName = (name: string) => {
    if (!savedNames.includes(name)) {
      const updatedSavedNames = [...savedNames, name]
      setSavedNames(updatedSavedNames)
      localStorage.setItem("savedNames", JSON.stringify(updatedSavedNames))
      toast({
        title: "Saved!",
        description: `"${name}" has been added to your saved names.`,
      })
    } else {
      toast({
        title: "Already Saved",
        description: `"${name}" is already in your saved names.`,
        variant: "destructive",
      })
    }
  }

  const handleRemoveSavedName = (nameToRemove: string) => {
    const updatedSavedNames = savedNames.filter((name) => name !== nameToRemove)
    setSavedNames(updatedSavedNames)
    localStorage.setItem("savedNames", JSON.stringify(updatedSavedNames))
    toast({
      title: "Removed!",
      description: `"${nameToRemove}" has been removed from your saved names.`,
    })
  }

  const handleClearSavedNames = () => {
    setSavedNames([])
    localStorage.removeItem("savedNames")
    toast({
      title: "Cleared!",
      description: "All saved names have been cleared.",
    })
  }

  // start iframe auto height 
  useEffect(() => {
    const sendHeightToParent = () => {
      if (contentRef.current) {
        const height = contentRef.current.offsetHeight
        window.parent.postMessage({ type: "iframeHeight", height: height }, "*")
      }
    }

    // Send initial height after component mounts
    sendHeightToParent()

    // Observe changes in the content div
    const observer = new MutationObserver(sendHeightToParent)
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }
    // Optional: Handle resize events within the iframe
    window.addEventListener("resize", sendHeightToParent)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", sendHeightToParent)
    }
  }, [contentRef]) // Run when contentRef is available
  // end iframe auto height

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 md:p-8 max-w-full overflow-hidden min-h-screen" ref={contentRef}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="keyword" className="text-base sm:text-lg mb-2 block text-gray-900 font-semibold">
                Enter your keyword
              </Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., Dragon, Ninja, Shadow"
                className="bg-gray-50 text-gray-900 border-gray-300 focus:border-red-500 focus:ring-red-500 placeholder:text-gray-400"
              />
            </div>

          <div>
            <Label className="text-base sm:text-lg mb-2 block text-gray-900 font-semibold">Username Style</Label>
            <RadioGroup value={nameType} onValueChange={setNameType} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: "cool", label: "😎 Cool", desc: "Stylish and trendy" },
                { value: "funny", label: "😂 Funny", desc: "Humorous and meme" },
                { value: "tryhard", label: "💪 Tryhard", desc: "Pro and competitive" },
                { value: "aesthetic", label: "✨ Aesthetic", desc: "Soft and pretty" },
                { value: "edgy", label: "🔥 Edgy", desc: "Dark and mysterious" },
                { value: "og", label: "👑 OG/Classic", desc: "Old school style" },
                { value: "anime", label: "⚡ Anime", desc: "Anime inspired" },
                { value: "gaming", label: "🎮 Gaming", desc: "Gaming themed" },
              ].map((type) => (
                <div key={type.value} className="relative">
                  <input
                    type="radio"
                    id={type.value}
                    value={type.value}
                    checked={nameType === type.value}
                    onChange={(e) => setNameType(e.target.value)}
                    className="peer hidden"
                  />
                  <Label
                    htmlFor={type.value}
                    className="flex flex-col p-3 rounded-lg border-2 border-gray-200 cursor-pointer transition-all hover:border-red-300 hover:bg-red-50 peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:shadow-md"
                  >
                    <span className="text-sm font-semibold text-gray-900">{type.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{type.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base sm:text-lg mb-2 block text-gray-900 font-semibold">Username Length</Label>
            <RadioGroup value={nameLength} onValueChange={setNameLength} className="flex flex-wrap gap-2 sm:gap-4">
              {["short", "medium", "long", "varied"].map((length) => (
                <div key={length} className="flex items-center space-x-2">
                  <RadioGroupItem value={length} id={length} className="text-red-600 border-gray-300" />
                  <Label htmlFor={length} className="capitalize text-sm sm:text-base text-gray-700 hover:text-gray-900 cursor-pointer">
                    {length}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-bold py-3 sm:py-4 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-red-900/50 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating Usernames..." : "🎮 Generate Roblox Usernames"}
          </Button>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="mb-2 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-red-600">⚡</span> Your Roblox Usernames:
              </h2>
              {generatedNames.length === exampleUsernames.length && 
               JSON.stringify(generatedNames) === JSON.stringify(exampleUsernames) && (
                <p className="text-xs text-gray-500 mt-1">✨ Example usernames - Enter a keyword to generate your own!</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowSavedNames(!showSavedNames)}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 text-sm sm:text-base"
              >
                <Star size={16} className="mr-2" />
                Saved ({savedNames.length})
              </Button>
              <Button
                onClick={generateInitialNames}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white text-sm sm:text-base"
                disabled={isGenerating}
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
          {showSavedNames && savedNames.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 flex items-center gap-2">
                <Star size={18} className="text-red-600" fill="currentColor" />
                Saved Usernames:
              </h3>
              <ul className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                {savedNames.map((name, index) => (
                  <li key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all">
                    <span className="text-sm sm:text-base text-gray-900">{name}</span>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyName(name)}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSavedName(name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleClearSavedNames}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base"
              >
                Clear All Saved Names
              </Button>
            </div>
          )}
          <div
            id="names-container"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto"
            style={{ maxHeight: "400px" }}
          >
            {generatedNames.map((name, index) => (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-lg hover:shadow-red-100 transition-all flex justify-between items-center group"
              >
                <span className="text-sm sm:text-base lg:text-lg break-all text-gray-900 font-medium">{name}</span>
                <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyName(name)}
                    className="text-gray-600 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 p-1 sm:p-2 transition-all"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveName(name)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-700 p-1 sm:p-2 transition-all"
                    title="Save"
                  >
                    <Save size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedName && (
          <div className="mt-6 sm:mt-8 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <SelectValue placeholder="Select platform to check" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roblox">Roblox</SelectItem>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="playstation">PlayStation</SelectItem>
                <SelectItem value="steam">Steam</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleCheckAvailability}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 sm:py-3 text-base sm:text-lg rounded-lg"
              disabled={!platform || isChecking}
            >
              {isChecking ? "Checking..." : "Check Availability"}
            </Button>

            {availability !== null && (
              <p
                className={`text-center font-bold text-base sm:text-xl ${availability ? "text-green-600" : "text-red-600"}`}
              >
                {availability ? "✓ This username is available!" : "✗ This username is already taken."}
              </p>
            )}
          </div>
        )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}
