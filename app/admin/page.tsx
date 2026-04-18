"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { adminAPI, readingAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Tags, 
  Shield,
  UserCheck,
  Newspaper
} from "lucide-react"

// Import komponen yang sudah dipisah
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { AdminUsers } from "@/components/admin/AdminUsers"
import { AdminVocabulary } from "@/components/admin/AdminVocabulary"
import { AdminGrammar } from "@/components/admin/AdminGrammar"
import { AdminReading } from "@/components/admin/AdminReading"
import { AdminCategories } from "@/components/admin/AdminCategories"
import { VocabDialog } from "@/components/admin/dialogs/VocabDialog"
import { GrammarDialog } from "@/components/admin/dialogs/GrammarDialog"
import { ReadingDialog } from "@/components/admin/dialogs/ReadingDialog"
import { CategoryDialog } from "@/components/admin/dialogs/CategoryDialog"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const [adminStats, setAdminStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersPagination, setUsersPagination] = useState<any>({})
  const [vocab, setVocab] = useState<any[]>([])
  const [grammar, setGrammar] = useState<any[]>([])
  const [readings, setReadings] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Dialog states
  const [showVocabDialog, setShowVocabDialog] = useState(false)
  const [selectedVocab, setSelectedVocab] = useState<any>(null)
  
  const [showGrammarDialog, setShowGrammarDialog] = useState(false)
  const [selectedGrammar, setSelectedGrammar] = useState<any>(null)
  
  const [showReadingDialog, setShowReadingDialog] = useState(false)
  const [selectedReading, setSelectedReading] = useState<any>(null)
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

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
  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, vocabRes, grammarRes, categoriesRes, readingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ page: currentPage, search: searchTerm }),
        adminAPI.getVocab({ page: 1, per_page: 50 }),
        adminAPI.getGrammar({ page: 1, per_page: 50 }),
        adminAPI.getCategories(),
        readingAPI.getAll({ page: 1, per_page: 50, published_only: false })
      ])
      
      setAdminStats(statsRes.data.data)
      setUsers(usersRes.data.data.users)
      setUsersPagination(usersRes.data.data.pagination)
      setVocab(vocabRes.data.data.vocab)
      setGrammar(grammarRes.data.data.grammar)
      setCategories(categoriesRes.data.data.categories)
      setReadings(readingsRes.data.data.readings || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({ title: "Error", description: "Gagal memuat data admin", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, searchTerm])

  const statsCards = adminStats ? [
    { title: "Total Users", value: adminStats.users.total, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Total Admin", value: adminStats.users.admins, icon: Shield, color: "from-purple-500 to-pink-500" },
    { title: "Verified Users", value: adminStats.users.verified, icon: UserCheck, color: "from-green-500 to-emerald-500" },
    { title: "Kosakata", value: adminStats.content.vocabulary, icon: BookOpen, color: "from-orange-500 to-red-500" },
    { title: "Tata Bahasa", value: adminStats.content.grammar, icon: GraduationCap, color: "from-teal-500 to-green-500" },
    { title: "Reading", value: readings.length, icon: Newspaper, color: "from-cyan-500 to-blue-500" },
    { title: "Kategori", value: adminStats.content.categories, icon: Tags, color: "from-indigo-500 to-purple-500" },
  ] : []

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard adminStats={adminStats} />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsers 
            users={users}
            pagination={usersPagination}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="vocabulary">
          <AdminVocabulary 
            vocab={vocab}
            onRefresh={fetchData}
            onAdd={() => setShowVocabDialog(true)}
          />
        </TabsContent>

        <TabsContent value="grammar">
          <AdminGrammar 
            grammar={grammar}
            onRefresh={fetchData}
            onAdd={() => setShowGrammarDialog(true)}
            onEdit={(g) => {
              setSelectedGrammar(g)
              setShowGrammarDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="reading">
          <AdminReading 
            readings={readings}
            onRefresh={fetchData}
            onAdd={() => setShowReadingDialog(true)}
            onEdit={(r) => {
              setSelectedReading(r)
              setShowReadingDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="categories">
          <AdminCategories 
            categories={categories}
            onRefresh={fetchData}
            onAdd={() => setShowCategoryDialog(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <VocabDialog 
        open={showVocabDialog}
        onOpenChange={setShowVocabDialog}
        selectedVocab={selectedVocab}
        onSuccess={() => {
          fetchData()
          setSelectedVocab(null)
        }}
      />

      <GrammarDialog 
        open={showGrammarDialog}
        onOpenChange={setShowGrammarDialog}
        selectedGrammar={selectedGrammar}
        onSuccess={() => {
          fetchData()
          setSelectedGrammar(null)
        }}
      />

      <ReadingDialog 
        open={showReadingDialog}
        onOpenChange={setShowReadingDialog}
        selectedReading={selectedReading}
        onSuccess={() => {
          fetchData()
          setSelectedReading(null)
        }}
      />

      <CategoryDialog 
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        selectedCategory={selectedCategory}
        onSuccess={() => {
          fetchData()
          setSelectedCategory(null)
        }}
      />
    </div>
  )
}