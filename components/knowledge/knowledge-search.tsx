"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { knowledgeData } from "@/lib/knowledge-data"
import { Badge } from "@/components/ui/badge"

export default function KnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])

  // Extract popular tags from knowledge data
  useEffect(() => {
    const allTags: string[] = []
    knowledgeData.forEach((category) => {
      category.sections.forEach((section) => {
        section.content.forEach((item) => {
          if (typeof item === "object" && item.type === "card" && item.tags) {
            allTags.push(...item.tags)
          }
        })
      })
    })

    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {}
    allTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })

    // Sort tags by occurrence count and take top 5
    const sortedTags = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 5)
    setPopularTags(sortedTags)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

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

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)])
    }
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    // Trigger search immediately
    const results = knowledgeData.flatMap((category) =>
      category.sections.filter((section) =>
        section.content.some(
          (item) => typeof item === "object" && item.type === "card" && item.tags && item.tags.includes(tag),
        ),
      ),
    )
    setSearchResults(results)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex w-full max-w-lg space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search knowledge base..."
            className="pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {recentSearches.length > 0 && !searchResults.length && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  setSearchQuery(term)
                  handleTagClick(term)
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}

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
