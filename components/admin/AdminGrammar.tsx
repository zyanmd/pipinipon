"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, EyeOff, Trash2, ImageIcon } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const getThumbnailUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  return `${baseUrl}/uploads/grammar/${thumbnail}`
}

interface AdminGrammarProps {
  grammar: any[]
  onRefresh: () => void
  onAdd: () => void
  onEdit: (grammar: any) => void
}

export function AdminGrammar({ grammar, onRefresh, onAdd, onEdit }: AdminGrammarProps) {
  const handleDeleteGrammar = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grammar?")) return
    try {
      await adminAPI.deleteGrammar(id)
      toast({ title: "Success", description: "Grammar deleted successfully" })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  const handlePublishGrammar = async (id: number, isPublished: boolean) => {
    try {
      await adminAPI.publishGrammar(id, isPublished)
      toast({ title: "Success", description: `Grammar ${isPublished ? "published" : "unpublished"}` })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manajemen Tata Bahasa</CardTitle>
          <Button variant="japanese" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Grammar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grammar.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.id}</TableCell>
                  <TableCell>
                    {g.thumbnail ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img 
                          src={getThumbnailUrl(g.thumbnail) || ''} 
                          alt={g.title}
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{g.title}</TableCell>
                  <TableCell className="font-japanese max-w-[150px] truncate">{g.pattern}</TableCell>
                  <TableCell><Badge variant="outline">{g.level}</Badge></TableCell>
                  <TableCell>
                    {g.is_published === 1 ? (
                      <Badge className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(g)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublishGrammar(g.id, g.is_published !== 1)}>
                        {g.is_published === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteGrammar(g.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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