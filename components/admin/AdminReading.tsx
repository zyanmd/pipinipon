"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Eye, EyeOff, Trash2, ImageIcon, ExternalLink, Info, Loader2 } from "lucide-react"
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
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [publishingId, setPublishingId] = useState<number | null>(null)

  const handleDeleteReading = async (id: number) => {
    // Konfirmasi dengan lebih jelas
    const confirmed = confirm("⚠️ Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan!")
    if (!confirmed) return
    
    setDeletingId(id)
    try {
      console.log(`[DELETE] Attempting to delete reading with ID: ${id}`)
      const response = await readingAPI.delete(id)
      console.log(`[DELETE] Response:`, response.data)
      
      toast({ 
        title: "✅ Berhasil", 
        description: "Artikel bacaan berhasil dihapus",
        variant: "default" 
      })
      onRefresh()
    } catch (error: any) {
      console.error(`[DELETE ERROR] Failed to delete reading ${id}:`, error)
      
      // Tangani berbagai jenis error
      let errorMessage = "Gagal menghapus artikel"
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const errorData = error.response.data
        
        console.error(`[DELETE] Server error ${status}:`, errorData)
        
        if (status === 404) {
          errorMessage = "Artikel tidak ditemukan. Mungkin sudah dihapus sebelumnya."
        } else if (status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk menghapus artikel ini."
        } else if (status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali."
        } else if (status === 500) {
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti."
        } else {
          errorMessage = errorData?.error || errorData?.message || `Gagal menghapus (Error ${status})`
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Tidak ada respons dari server. Periksa koneksi internet Anda."
      } else {
        // Something else happened
        errorMessage = error.message || "Terjadi kesalahan yang tidak diketahui"
      }
      
      toast({ 
        title: "❌ Gagal Menghapus", 
        description: errorMessage,
        variant: "destructive" 
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handlePublishReading = async (id: number, isPublished: boolean) => {
    setPublishingId(id)
    try {
      console.log(`[PUBLISH] Toggling publish status for reading ${id} to: ${isPublished}`)
      await readingAPI.update(id, { is_published: isPublished ? 1 : 0 })
      
      toast({ 
        title: "✅ Berhasil", 
        description: `Artikel ${isPublished ? "dipublikasikan" : "disimpan sebagai draft"}`,
        variant: "default"
      })
      onRefresh()
    } catch (error: any) {
      console.error(`[PUBLISH ERROR] Failed to update reading ${id}:`, error)
      
      let errorMessage = "Gagal mengupdate status artikel"
      
      if (error.response) {
        const status = error.response.status
        if (status === 404) {
          errorMessage = "Artikel tidak ditemukan"
        } else if (status === 403) {
          errorMessage = "Anda tidak memiliki izin"
        } else {
          errorMessage = error.response.data?.error || errorMessage
        }
      }
      
      toast({ 
        title: "❌ Gagal", 
        description: errorMessage,
        variant: "destructive" 
      })
    } finally {
      setPublishingId(null)
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

  // Markdown Guide Component
  const MarkdownGuide = () => (
    <Dialog open={showMarkdownGuide} onOpenChange={setShowMarkdownGuide}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Panduan Format Markdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* Furigana khusus */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <p className="font-semibold mb-2">🎌 Format Khusus Furigana:</p>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {'[日本]{にほん}'}
            </code>
            <span className="mx-2">→</span>
            <ruby>
              日本<rp>(</rp><rt>にほん</rt><rp>)</rp>
            </ruby>
            <p className="text-xs text-gray-500 mt-2">Gunakan format {'[teks]{reading}'} untuk menampilkan furigana di atas kanji</p>
          </div>

          {/* Headings */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">📌 Heading (Judul)</p>
            <div className="space-y-1 ml-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs"># Heading 1</code>
              <span className="text-gray-500"> → Judul utama terbesar</span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">## Heading 2</code>
              <span className="text-gray-500"> → Sub judul</span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">### Heading 3</code>
              <span className="text-gray-500"> → Sub-sub judul</span>
            </div>
          </div>

          {/* Text formatting */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">✨ Text Formatting</p>
            <div className="space-y-1 ml-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">**teks tebal**</code>
              <span className="text-gray-500"> → <strong>teks tebal</strong></span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">*teks miring*</code>
              <span className="text-gray-500"> → <em>teks miring</em></span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">~~teks coret~~</code>
              <span className="text-gray-500"> → <del>teks coret</del></span>
            </div>
          </div>

          {/* Lists */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">📋 List (Daftar)</p>
            <div className="space-y-1 ml-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">- Item 1</code>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">- Item 2</code>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">  - Sub item</code>
              <span className="text-gray-500"> (2 spasi untuk sub list)</span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">1. List nomor 1</code>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">2. List nomor 2</code>
            </div>
          </div>

          {/* Links & Images */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">🔗 Links &amp; Images</p>
            <div className="space-y-1 ml-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">[Teks tautan](https://example.com)</code>
              <span className="text-gray-500"> → Membuat link</span>
              <br />
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">![Alt text](https://example.com/gambar.jpg)</code>
              <span className="text-gray-500"> → Menampilkan gambar</span>
            </div>
          </div>

          {/* Code Blocks */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">💻 Code Blocks</p>
            <div className="space-y-1 ml-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">`inline code`</code>
              <span className="text-gray-500"> → Kode inline</span>
              <br />
              <pre className="bg-gray-800 text-gray-200 p-2 rounded text-xs overflow-x-auto">
                <code>{'```javascript\nconsole.log("Hello World");\n```'}</code>
              </pre>
              <span className="text-gray-500"> → Block code dengan syntax highlighting</span>
            </div>
          </div>

          {/* Tables */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">📊 Tables</p>
            <pre className="bg-gray-800 text-gray-200 p-2 rounded text-xs overflow-x-auto">
              <code>{'| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |'}</code>
            </pre>
          </div>

          {/* Blockquote */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">💬 Blockquote</p>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">&gt; Ini adalah kutipan</code>
          </div>

          {/* Horizontal Rule */}
          <div className="border-t pt-3">
            <p className="font-semibold mb-2">➖ Horizontal Rule</p>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">---</code>
            <span className="text-gray-500"> → Membuat garis pemisah</span>
          </div>

          {/* Tips */}
          <div className="border-t pt-3 bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
            <p className="font-semibold mb-2">💡 Tips Penting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Gunakan <strong>baris kosong</strong> untuk memisahkan paragraf</li>
              <li>Furigana: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'[teks]{reading}'}</code></li>
              <li>Code block bisa menggunakan <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">```nama_bahasa</code></li>
              <li>Support <strong>GitHub Flavored Markdown (GFM)</strong></li>
              <li>Bisa menggunakan <strong>HTML tags</strong> juga</li>
              <li>Klik <strong>Preview</strong> untuk melihat hasil sebelum publish</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowMarkdownGuide(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manajemen Artikel Bacaan (Reading)</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMarkdownGuide(true)}>
                <Info className="h-4 w-4 mr-2" />
                Panduan Markdown
              </Button>
              <Button variant="japanese" size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Artikel
              </Button>
            </div>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handlePublishReading(r.id, r.is_published !== 1)} 
                          title={r.is_published === 1 ? "Unpublish" : "Publish"}
                          disabled={publishingId === r.id}
                        >
                          {publishingId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : r.is_published === 1 ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                          onClick={() => handleDeleteReading(r.id)} 
                          title="Delete"
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowMarkdownGuide(true)}>
                  <Info className="h-4 w-4 mr-2" />
                  Panduan Markdown
                </Button>
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
              </div>
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Konten:</h3>
                  <span className="text-xs text-muted-foreground">
                    Support Markdown &amp; Furigana
                  </span>
                </div>
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

      {/* Markdown Guide Dialog */}
      <MarkdownGuide />
    </>
  )
}