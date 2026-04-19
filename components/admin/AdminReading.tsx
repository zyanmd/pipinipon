"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Eye, EyeOff, Trash2, ImageIcon, ExternalLink } from "lucide-react"
import { readingAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [previewReading, setPreviewReading] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

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

  const handlePreview = (reading: any) => {
    setPreviewReading(reading)
    setIsPreviewOpen(true)
  }

  const handleViewLive = (slug: string) => {
    window.open(`/reading/${slug}`, '_blank')
  }

  // Fungsi untuk memotong teks
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <>
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
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted cursor-pointer" onClick={() => handlePreview(r)}>
                          <img 
                            src={getReadingThumbnailUrl(r.thumbnail) || ''} 
                            alt={r.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center cursor-pointer" onClick={() => handlePreview(r)}>
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate cursor-pointer hover:text-emerald-600" onClick={() => handlePreview(r)}>
                      {r.title}
                    </TableCell>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(r)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(r)} title="Preview">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePublishReading(r.id, r.is_published !== 1)} title={r.is_published === 1 ? "Unpublish" : "Publish"}>
                          {r.is_published === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteReading(r.id)} title="Delete">
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

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Preview Artikel: {previewReading?.title}</span>
              {previewReading?.slug && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewLive(previewReading.slug)}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Lihat Live
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {previewReading && (
            <div className="space-y-6">
              {/* Thumbnail */}
              {getReadingThumbnailUrl(previewReading.thumbnail) && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={getReadingThumbnailUrl(previewReading.thumbnail) || ''} 
                    alt={previewReading.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{previewReading.level}</Badge>
                <Badge variant="secondary" className="capitalize">{previewReading.category}</Badge>
                <Badge className={previewReading.is_published === 1 ? "bg-green-500" : "bg-yellow-500"}>
                  {previewReading.is_published === 1 ? "Published" : "Draft"}
                </Badge>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold">{previewReading.title}</h1>
              
              {/* Author & Date */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                {previewReading.author_name && <span>Oleh: {previewReading.author_name}</span>}
                {previewReading.published_at && (
                  <span>
                    Dipublikasikan: {new Date(previewReading.published_at).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                )}
                <span>{previewReading.views || 0} dilihat</span>
              </div>
              
              {/* Excerpt */}
              {previewReading.excerpt && (
                <div className="p-4 bg-muted/30 rounded-lg italic">
                  <p className="text-muted-foreground">{previewReading.excerpt}</p>
                </div>
              )}
              
              {/* Content Preview */}
              <div>
                <h3 className="font-semibold mb-2">Konten:</h3>
                <div className="prose prose-sm max-w-none">
                  {previewReading.content ? (
                    <div className="bg-muted/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {truncateText(previewReading.content.replace(/<[^>]*>/g, ''), 1000)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Tidak ada konten</p>
                  )}
                </div>
              </div>
              
              {/* SEO Info */}
              {(previewReading.meta_title || previewReading.meta_description || previewReading.meta_keywords) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">SEO Information:</h3>
                  <div className="space-y-2 text-sm">
                    {previewReading.meta_title && (
                      <div>
                        <span className="font-medium">Meta Title:</span>
                        <p className="text-muted-foreground">{previewReading.meta_title}</p>
                      </div>
                    )}
                    {previewReading.meta_description && (
                      <div>
                        <span className="font-medium">Meta Description:</span>
                        <p className="text-muted-foreground">{previewReading.meta_description}</p>
                      </div>
                    )}
                    {previewReading.meta_keywords && (
                      <div>
                        <span className="font-medium">Meta Keywords:</span>
                        <p className="text-muted-foreground">{previewReading.meta_keywords}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Thumbnail Alt Text */}
              {previewReading.thumbnail_alt && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Thumbnail Info:</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Alt Text:</span> {previewReading.thumbnail_alt}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}