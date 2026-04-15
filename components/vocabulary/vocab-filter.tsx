"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryAPI } from "@/lib/api"

interface VocabFilterProps {
  filters: {
    jlpt_level: string
    mastered_status: string
    kategori_id: string
  }
  onFilterChange: (key: string, value: string) => void
}

const jlptLevels = [
  { value: "all", label: "Semua Level" },
  { value: "N5", label: "N5 - Pemula" },
  { value: "N4", label: "N4 - Dasar" },
  { value: "N3", label: "N3 - Menengah" },
  { value: "N2", label: "N2 - Mahir" },
  { value: "N1", label: "N1 - Lanjutan" },
]

const masteredStatuses = [
  { value: "all", label: "Semua" },
  { value: "mastered", label: "Sudah Hafal" },
  { value: "not_mastered", label: "Belum Hafal" },
]

export function VocabFilter({ filters, onFilterChange }: VocabFilterProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll()
        setCategories(response.data.data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const handleLevelChange = (value: string) => {
    onFilterChange("jlpt_level", value === "all" ? "" : value)
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange("kategori_id", value === "all" ? "" : value)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <Label>Level JLPT</Label>
            <Select
              value={filters.jlpt_level || "all"}
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
              value={filters.kategori_id || "all"}
              onValueChange={handleCategoryChange}
              disabled={loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? "Memuat kategori..." : "Pilih kategori"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Status Hafalan</Label>
            <RadioGroup
              value={filters.mastered_status}
              onValueChange={(value) => onFilterChange("mastered_status", value)}
              className="flex gap-4"
            >
              {masteredStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={status.value} id={status.value} />
                  <Label htmlFor={status.value} className="cursor-pointer">
                    {status.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}