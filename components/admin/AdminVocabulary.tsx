"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface AdminVocabularyProps {
  vocab: any[]
  onRefresh: () => void
  onAdd: () => void
}

export function AdminVocabulary({ vocab, onRefresh, onAdd }: AdminVocabularyProps) {
  const handleDeleteVocab = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vocabulary?")) return
    try {
      await adminAPI.deleteVocab(id)
      toast({ title: "Success", description: "Vocabulary deleted successfully" })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Manajemen Kosakata</CardTitle>
          <Button variant="japanese" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kosakata
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kanji</TableHead>
                <TableHead>Hiragana</TableHead>
                <TableHead>Arti</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocab.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.id}</TableCell>
                  <TableCell className="font-japanese">{v.kanji}</TableCell>
                  <TableCell className="font-japanese">{v.hiragana}</TableCell>
                  <TableCell>{v.arti}</TableCell>
                  <TableCell><Badge variant="outline">{v.jlpt_level}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteVocab(v.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}