"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { adminAPI, getGrammarThumbnailUrl } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Tags, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Shield,
  UserCheck,
  Loader2,
  ImageIcon,
  Upload,
  X
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Helper untuk mendapatkan URL thumbnail - FIXED return type
const getThumbnailUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
  // Cek apakah sudah mengandung folder grammar/
  if (thumbnail.includes('grammar/')) {
    return `${baseUrl}/uploads/${thumbnail}`
  }
  return `${baseUrl}/uploads/grammar/${thumbnail}`
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const [adminStats, setAdminStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersPagination, setUsersPagination] = useState<any>({})
  const [vocab, setVocab] = useState<any[]>([])
  const [grammar, setGrammar] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Grammar thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  
  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  const [showVocabDialog, setShowVocabDialog] = useState(false)
  const [selectedVocab, setSelectedVocab] = useState<any>(null)
  const [vocabForm, setVocabForm] = useState({
    kanji: "", hiragana: "", romaji: "", arti: "",
    contoh_kalimat: "", contoh_arti: "", jlpt_level: "N5", kategori_id: ""
  })
  
  const [showGrammarDialog, setShowGrammarDialog] = useState(false)
  const [selectedGrammar, setSelectedGrammar] = useState<any>(null)
  const [grammarForm, setGrammarForm] = useState({
    title: "", pattern: "", meaning: "", explanation: "",
    level: "N5", category: "", is_published: 0,
    thumbnail: "", thumbnail_alt: ""
  })
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" })
  
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user is admin
  if (!isLoading && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="pt-6">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-muted-foreground mb-4">
              Anda tidak memiliki akses ke halaman admin.
            </p>
            <Button onClick={() => window.location.href = "/dashboard"}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, usersRes, vocabRes, grammarRes, categoriesRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers({ page: currentPage, search: searchTerm }),
          adminAPI.getVocab({ page: 1, per_page: 50 }),
          adminAPI.getGrammar({ page: 1, per_page: 50 }),
          adminAPI.getCategories()
        ])
        
        setAdminStats(statsRes.data.data)
        setUsers(usersRes.data.data.users)
        setUsersPagination(usersRes.data.data.pagination)
        setVocab(vocabRes.data.data.vocab)
        setGrammar(grammarRes.data.data.grammar)
        setCategories(categoriesRes.data.data.categories)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({ title: "Error", description: "Gagal memuat data admin", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage, searchTerm])

  // Handle grammar form open for edit
  const handleEditGrammar = (grammarItem: any) => {
    setSelectedGrammar(grammarItem)
    setGrammarForm({
      title: grammarItem.title || "",
      pattern: grammarItem.pattern || "",
      meaning: grammarItem.meaning || "",
      explanation: grammarItem.explanation || "",
      level: grammarItem.level || "N5",
      category: grammarItem.category || "",
      is_published: grammarItem.is_published || 0,
      thumbnail: grammarItem.thumbnail || "",
      thumbnail_alt: grammarItem.thumbnail_alt || ""
    })
    // FIXED: Handle undefined case by converting to null
    const thumbnailUrl = getThumbnailUrl(grammarItem.thumbnail)
    setThumbnailPreview(thumbnailUrl)
    setThumbnailFile(null)
    setShowGrammarDialog(true)
  }

  // Handle grammar form close
  const handleGrammarDialogClose = () => {
    setShowGrammarDialog(false)
    setSelectedGrammar(null)
    setGrammarForm({
      title: "", pattern: "", meaning: "", explanation: "",
      level: "N5", category: "", is_published: 0,
      thumbnail: "", thumbnail_alt: ""
    })
    setThumbnailPreview(null)
    setThumbnailFile(null)
  }

  // Handle thumbnail selection
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File terlalu besar. Maksimal 5MB", variant: "destructive" })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "File harus berupa gambar", variant: "destructive" })
        return
      }
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  // Upload thumbnail to server
  const uploadThumbnail = async (file: File): Promise<string | null> => {
    try {
      const response = await adminAPI.uploadGrammarThumbnail(file)
      if (response.data.success) {
        return response.data.data.filename
      }
      return null
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
      return null
    }
  }

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Save grammar
  const handleSaveGrammar = async () => {
    if (!grammarForm.title || !grammarForm.pattern || !grammarForm.meaning) {
      toast({ title: "Error", description: "Title, Pattern, dan Meaning wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    setUploadingThumbnail(true)

    try {
      let thumbnailUrl = grammarForm.thumbnail
      
      // Upload thumbnail if new file selected
      if (thumbnailFile) {
        const uploadedFilename = await uploadThumbnail(thumbnailFile)
        if (uploadedFilename) {
          thumbnailUrl = uploadedFilename
        } else {
          toast({ title: "Error", description: "Gagal upload thumbnail", variant: "destructive" })
          setSubmitting(false)
          setUploadingThumbnail(false)
          return
        }
      }

      const grammarData = {
        ...grammarForm,
        thumbnail: thumbnailUrl
      }

      if (selectedGrammar) {
        await adminAPI.updateGrammar(selectedGrammar.id, grammarData)
        toast({ title: "Success", description: "Grammar updated successfully" })
      } else {
        await adminAPI.createGrammar(grammarData)
        toast({ title: "Success", description: "Grammar created successfully" })
      }

      // Refresh grammar list
      const grammarRes = await adminAPI.getGrammar({ page: 1, per_page: 50 })
      setGrammar(grammarRes.data.data.grammar)
      handleGrammarDialogClose()
    } catch (error: any) {
      console.error("Error saving grammar:", error)
      toast({ title: "Error", description: error.response?.data?.error || "Failed to save grammar", variant: "destructive" })
    } finally {
      setSubmitting(false)
      setUploadingThumbnail(false)
    }
  }

  // Stats cards
  const statsCards = adminStats ? [
    { title: "Total Users", value: adminStats.users.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Total Admin", value: adminStats.users.admins, icon: Shield, color: "from-purple-500 to-pink-500" },
    { title: "Verified Users", value: adminStats.users.verified, icon: UserCheck, color: "from-green-500 to-emerald-500" },
    { title: "Kosakata", value: adminStats.content.vocabulary, icon: BookOpen, color: "from-orange-500 to-red-500" },
    { title: "Tata Bahasa", value: adminStats.content.grammar, icon: GraduationCap, color: "from-teal-500 to-green-500" },
    { title: "Kategori", value: adminStats.content.categories, icon: Tags, color: "from-indigo-500 to-purple-500" },
  ] : []

  // Handle user role update
  const handleUpdateUserRole = async (username: string, role: string) => {
    try {
      await adminAPI.changeUserRole(username, role)
      toast({ title: "Success", description: `User role updated to ${role}` })
      const usersRes = await adminAPI.getUsers({ page: currentPage, search: searchTerm })
      setUsers(usersRes.data.data.users)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update role", variant: "destructive" })
    }
  }

  // Handle delete user
  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return
    try {
      await adminAPI.deleteUser(username)
      toast({ title: "Success", description: "User deleted successfully" })
      const usersRes = await adminAPI.getUsers({ page: currentPage, search: searchTerm })
      setUsers(usersRes.data.data.users)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" })
    }
  }

  // Handle delete vocab
  const handleDeleteVocab = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vocabulary?")) return
    try {
      await adminAPI.deleteVocab(id)
      toast({ title: "Success", description: "Vocabulary deleted successfully" })
      const vocabRes = await adminAPI.getVocab({ page: 1, per_page: 50 })
      setVocab(vocabRes.data.data.vocab)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  // Handle delete grammar
  const handleDeleteGrammar = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grammar?")) return
    try {
      await adminAPI.deleteGrammar(id)
      toast({ title: "Success", description: "Grammar deleted successfully" })
      const grammarRes = await adminAPI.getGrammar({ page: 1, per_page: 50 })
      setGrammar(grammarRes.data.data.grammar)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  // Handle publish grammar
  const handlePublishGrammar = async (id: number, isPublished: boolean) => {
    try {
      await adminAPI.publishGrammar(id, isPublished)
      toast({ title: "Success", description: `Grammar ${isPublished ? "published" : "unpublished"}` })
      const grammarRes = await adminAPI.getGrammar({ page: 1, per_page: 50 })
      setGrammar(grammarRes.data.data.grammar)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update", variant: "destructive" })
    }
  }

  // Handle delete category
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      await adminAPI.deleteCategory(id)
      toast({ title: "Success", description: "Category deleted successfully" })
      const categoriesRes = await adminAPI.getCategories()
      setCategories(categoriesRes.data.data.categories)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Kelola pengguna, konten, dan pengaturan sistem</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistik Belajar</CardTitle>
                <CardDescription>Ringkasan aktivitas belajar pengguna</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Sesi Belajar</span>
                  <span className="font-bold text-lg">{adminStats?.study?.total_sessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kosakata Dihafal</span>
                  <span className="font-bold text-lg">{adminStats?.study?.mastered_items || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tingkat Penguasaan</span>
                  <span className="font-bold text-lg">{adminStats?.study?.mastery_rate || 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${adminStats?.study?.mastery_rate || 0}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistik Pengguna</CardTitle>
                <CardDescription>Informasi tentang pengguna platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Pengguna</span>
                  <span className="font-bold text-lg">{adminStats?.users?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Admin</span>
                  <span className="font-bold text-lg">{adminStats?.users?.admins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Terverifikasi</span>
                  <span className="font-bold text-lg">{adminStats?.users?.verified || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bergabung 7 hari terakhir</span>
                  <span className="font-bold text-lg">{adminStats?.users?.recent_7days || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Manajemen Pengguna</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari pengguna..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select defaultValue={u.role} onValueChange={(v) => handleUpdateUserRole(u.username, v)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {u.is_verified === 1 ? (
                            <Badge variant="default" className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>{u.xp || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteUser(u.username)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {usersPagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                  <span className="py-2 px-3 text-sm">Page {currentPage} of {usersPagination.pages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === usersPagination.pages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Manajemen Kosakata</CardTitle>
                <Dialog open={showVocabDialog} onOpenChange={setShowVocabDialog}>
                  <Button variant="japanese" size="sm" onClick={() => setShowVocabDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kosakata
                  </Button>
                </Dialog>
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
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteVocab(v.id)}>
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
        </TabsContent>

        {/* Grammar Tab */}
        <TabsContent value="grammar">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manajemen Tata Bahasa</CardTitle>
                <Button variant="japanese" size="sm" onClick={() => {
                  setSelectedGrammar(null)
                  setGrammarForm({ title: "", pattern: "", meaning: "", explanation: "", level: "N5", category: "", is_published: 0, thumbnail: "", thumbnail_alt: "" })
                  setThumbnailPreview(null)
                  setThumbnailFile(null)
                  setShowGrammarDialog(true)
                }}>
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
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={getThumbnailUrl(g.thumbnail) || ''} 
                                alt={g.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Thumbnail failed to load:", getThumbnailUrl(g.thumbnail))
                                  e.currentTarget.style.display = 'none'
                                }}
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditGrammar(g)}>
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
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manajemen Kategori</CardTitle>
                <Button variant="japanese" size="sm" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kategori
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.slug}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCategory(c.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Vocabulary Dialog */}
      <Dialog open={showVocabDialog} onOpenChange={setShowVocabDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVocab ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
            <DialogDescription>Isi informasi kosakata di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Kanji</Label><Input value={vocabForm.kanji} onChange={(e) => setVocabForm({ ...vocabForm, kanji: e.target.value })} /></div>
              <div><Label>Hiragana</Label><Input value={vocabForm.hiragana} onChange={(e) => setVocabForm({ ...vocabForm, hiragana: e.target.value })} /></div>
            </div>
            <div><Label>Arti</Label><Input value={vocabForm.arti} onChange={(e) => setVocabForm({ ...vocabForm, arti: e.target.value })} /></div>
            <div><Label>Contoh Kalimat</Label><Textarea value={vocabForm.contoh_kalimat} onChange={(e) => setVocabForm({ ...vocabForm, contoh_kalimat: e.target.value })} /></div>
            <div><Label>Arti Contoh</Label><Input value={vocabForm.contoh_arti} onChange={(e) => setVocabForm({ ...vocabForm, contoh_arti: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>JLPT Level</Label>
                <Select value={vocabForm.jlpt_level} onValueChange={(v) => setVocabForm({ ...vocabForm, jlpt_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N1">N1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Kategori ID</Label><Input type="number" value={vocabForm.kategori_id} onChange={(e) => setVocabForm({ ...vocabForm, kategori_id: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVocabDialog(false)}>Batal</Button>
            <Button disabled={submitting} onClick={async () => {
              setSubmitting(true)
              try {
                if (selectedVocab) await adminAPI.updateVocab(selectedVocab.id, vocabForm)
                else await adminAPI.createVocab(vocabForm)
                toast({ title: "Success", description: `Vocabulary ${selectedVocab ? "updated" : "created"} successfully` })
                const vocabRes = await adminAPI.getVocab({ page: 1, per_page: 50 })
                setVocab(vocabRes.data.data.vocab)
                setShowVocabDialog(false)
                setSelectedVocab(null)
                setVocabForm({ kanji: "", hiragana: "", romaji: "", arti: "", contoh_kalimat: "", contoh_arti: "", jlpt_level: "N5", kategori_id: "" })
              } catch (error) { toast({ title: "Error", description: "Failed to save vocabulary", variant: "destructive" }) }
              finally { setSubmitting(false) }
            }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grammar Dialog with Thumbnail Upload */}
      <Dialog open={showGrammarDialog} onOpenChange={setShowGrammarDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGrammar ? "Edit Grammar" : "Tambah Grammar Baru"}</DialogTitle>
            <DialogDescription>Isi informasi tata bahasa di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Thumbnail Upload */}
            <div>
              <Label>Thumbnail / Cover Image</Label>
              <div className="mt-2">
                {thumbnailPreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="w-full h-32 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors mb-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload thumbnail</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP. Maks 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailSelect}
                />
              </div>
            </div>

            <div><Label>Thumbnail Alt Text</Label><Input 
              value={grammarForm.thumbnail_alt} 
              onChange={(e) => setGrammarForm({ ...grammarForm, thumbnail_alt: e.target.value })} 
              placeholder="Deskripsi gambar untuk SEO"
            /></div>
            <div><Label>Title *</Label><Input 
              value={grammarForm.title} 
              onChange={(e) => setGrammarForm({ ...grammarForm, title: e.target.value })} 
              placeholder="Contoh: Tata Bahasa ~te imasu"
            /></div>
            <div><Label>Pattern *</Label><Input 
              value={grammarForm.pattern} 
              onChange={(e) => setGrammarForm({ ...grammarForm, pattern: e.target.value })} 
              placeholder="Contoh: 〜ています"
            /></div>
            <div><Label>Meaning *</Label><Input 
              value={grammarForm.meaning} 
              onChange={(e) => setGrammarForm({ ...grammarForm, meaning: e.target.value })} 
              placeholder="Contoh: Sedang melakukan sesuatu"
            /></div>
            <div><Label>Explanation</Label><Textarea 
              rows={5} 
              value={grammarForm.explanation} 
              onChange={(e) => setGrammarForm({ ...grammarForm, explanation: e.target.value })} 
              placeholder="Penjelasan detail tentang pola kalimat ini..."
            /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={grammarForm.level} onValueChange={(v) => setGrammarForm({ ...grammarForm, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N1">N1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input 
                  value={grammarForm.category} 
                  onChange={(e) => setGrammarForm({ ...grammarForm, category: e.target.value })} 
                  placeholder="Contoh: Kata Kerja, Kata Sifat"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={String(grammarForm.is_published)} onValueChange={(v) => setGrammarForm({ ...grammarForm, is_published: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Draft</SelectItem>
                  <SelectItem value="1">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleGrammarDialogClose}>Batal</Button>
            <Button onClick={handleSaveGrammar} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {selectedGrammar ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            <DialogDescription>Isi informasi kategori di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nama Kategori</Label><Input 
              value={categoryForm.name} 
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
            /></div>
            <div><Label>Slug</Label><Input 
              value={categoryForm.slug} 
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} 
              placeholder="auto-generated" 
            /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Batal</Button>
            <Button disabled={submitting} onClick={async () => {
              setSubmitting(true)
              try {
                if (selectedCategory) await adminAPI.updateCategory(selectedCategory.id, categoryForm)
                else await adminAPI.createCategory(categoryForm)
                toast({ title: "Success", description: `Category ${selectedCategory ? "updated" : "created"} successfully` })
                const categoriesRes = await adminAPI.getCategories()
                setCategories(categoriesRes.data.data.categories)
                setShowCategoryDialog(false)
                setSelectedCategory(null)
                setCategoryForm({ name: "", slug: "" })
              } catch (error) { toast({ title: "Error", description: "Failed to save category", variant: "destructive" }) }
              finally { setSubmitting(false) }
            }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}