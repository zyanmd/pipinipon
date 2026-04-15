"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface GrammarFilterProps {
  filters: {
    level: string
    category: string
  }
  categories: string[]
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

const jlptLevels = [
  { value: "all", label: "Semua Level" },
  { value: "N5", label: "N5 - Pemula" },
  { value: "N4", label: "N4 - Dasar" },
  { value: "N3", label: "N3 - Menengah" },
  { value: "N2", label: "N2 - Mahir" },
  { value: "N1", label: "N1 - Lanjutan" },
]

export function GrammarFilter({ filters, categories, onFilterChange, onReset }: GrammarFilterProps) {
  const handleLevelChange = (value: string) => {
    onFilterChange("level", value === "all" ? "" : value)
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange("category", value === "all" ? "" : value)
  }

  const hasActiveFilters = filters.level !== "" || filters.category !== ""

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Level JLPT</Label>
            <Select
              value={filters.level || "all"}
              onValueChange={handleLevelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih level" />
              </SelectTrigger>
              <SelectContent>
                {jlptLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Kategori</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      {hasActiveFilters && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Hapus semua filter
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}