"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory?: any
  onSuccess: () => void
}

export function CategoryDialog({ open, onOpenChange, selectedCategory, onSuccess }: CategoryDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: selectedCategory?.name || "",
    slug: selectedCategory?.slug || ""
  })

  const handleSave = async () => {
    if (!categoryForm.name) {
      toast({ title: "Error", description: "Nama kategori wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      if (selectedCategory) {
        await adminAPI.updateCategory(selectedCategory.id, categoryForm)
        toast({ title: "Success", description: "Category updated successfully" })
      } else {
        await adminAPI.createCategory(categoryForm)
        toast({ title: "Success", description: "Category created successfully" })
      }
      onSuccess()
      onOpenChange(false)
      setCategoryForm({ name: "", slug: "" })
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to save category", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          <DialogDescription>Isi informasi kategori di bawah ini.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div><Label>Nama Kategori</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} /></div>
          <div><Label>Slug</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="auto-generated" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}