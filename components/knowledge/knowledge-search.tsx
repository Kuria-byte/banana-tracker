"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { knowledgeData } from "@/lib/knowledge-data"

export default function KnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Simple search implementation
    const results = knowledgeData.flatMap((category) =>
      category.sections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.some(
            (item) => typeof item === "string" && item.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      ),
    )

    setSearchResults(results)
    setIsSearching(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex w-full max-w-lg space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search knowledge base..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-medium mb-2">Search Results ({searchResults.length})</h3>
          <ul className="space-y-2">
            {searchResults.map((result, index) => (
              <li key={index}>
                <a
                  href={`#${result.id}`}
                  className="text-blue-600 hover:underline"
                  onClick={() => setSearchResults([])}
                >
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="mt-2 text-sm text-muted-foreground">No results found for "{searchQuery}"</div>
      )}
    </div>
  )
}
