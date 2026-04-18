"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, EyeOff, Trash2, ImageIcon } from "lucide-react"
import { readingAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

const getReadingThumbnailUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site'
  return `${baseUrl}/uploads/readings/${thumbnail}`
}

interface AdminReadingProps {
  readings: any[]
  onRefresh: () => void
  onAdd: () => void
  onEdit: (reading: any) => void
}

export function AdminReading({ readings, onRefresh, onAdd, onEdit }: AdminReadingProps) {
  const handleDeleteReading = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reading article?")) return
    try {
      await readingAPI.delete(id)
      toast({ title: "Success", description: "Reading deleted successfully" })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  const handlePublishReading = async (id: number, isPublished: boolean) => {
    try {
      await readingAPI.update(id, { is_published: isPublished ? 1 : 0 })
      toast({ title: "Success", description: `Reading ${isPublished ? "published" : "unpublished"}` })
      onRefresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manajemen Artikel Bacaan (Reading)</CardTitle>
          <Button variant="japanese" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Artikel
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
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.thumbnail ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img 
                          src={getReadingThumbnailUrl(r.thumbnail) || ''} 
                          alt={r.title}
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
                  <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                  <TableCell><Badge variant="outline">{r.level}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{r.category}</Badge></TableCell>
                  <TableCell>{r.views || 0}</TableCell>
                  <TableCell>
                    {r.is_published === 1 ? (
                      <Badge className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(r)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublishReading(r.id, r.is_published !== 1)}>
                        {r.is_published === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteReading(r.id)}>
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