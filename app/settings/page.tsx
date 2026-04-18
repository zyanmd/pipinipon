"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTheme } from "@/components/providers/theme-provider"
import { userAPI, authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageCropper } from "@/components/ui/image-cropper"
import { 
  User, 
  Mail, 
  Lock, 
  Moon, 
  Sun, 
  Monitor,
  Upload,
  X,
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { getAvatarUrl, getCoverUrl } from "@/lib/image-helper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Interface untuk user dengan properti tambahan
interface ExtendedUser {
  id?: number
  username?: string
  email?: string
  avatar?: string | null
  cover_photo?: string | null
  bio?: string
  website?: string
  location?: string
  xp?: number
  streak?: number
  role?: string
  is_verified?: number
  verified_badge?: number
  [key: string]: any
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    bio: "",
    website: "",
    location: ""
  })
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Avatar upload with crop
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const [tempAvatarImage, setTempAvatarImage] = useState<string | null>(null)
  
  // Cover upload with crop
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [showCoverCropper, setShowCoverCropper] = useState(false)
  const [tempCoverImage, setTempCoverImage] = useState<string | null>(null)
  const [coverError, setCoverError] = useState(false)

  // Delete account confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cast user ke ExtendedUser
  const extendedUser = user as ExtendedUser | null

  // Redirect jika tidak login
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    if (extendedUser) {
      setProfileForm({
        bio: extendedUser.bio || "",
        website: extendedUser.website || "",
        location: extendedUser.location || ""
      })
    }
  }, [extendedUser])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    
    try {
      const response = await userAPI.updateMyProfile(profileForm)
      if (updateUser) updateUser(response.data.data.user)
      toast({
        title: "Profil diperbarui",
        description: "Informasi profil Anda berhasil disimpan.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal memperbarui profil",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Password tidak cocok",
        description: "Password baru dan konfirmasi password harus sama",
        variant: "destructive",
      })
      return
    }
    
    if (passwordForm.new_password.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    try {
      await authAPI.changePassword(passwordForm.current_password, passwordForm.new_password)
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
      toast({
        title: "Password diubah",
        description: "Password Anda berhasil diubah.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal mengubah password",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setTempAvatarImage(reader.result as string)
        setShowAvatarCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarCropComplete = async (croppedFile: File) => {
    setAvatarFile(croppedFile)
    setAvatarPreview(URL.createObjectURL(croppedFile))
    setTempAvatarImage(null)
    await uploadAvatar(croppedFile)
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return
    
    setUploadingAvatar(true)
    
    try {
      await userAPI.uploadAvatar(user.username, file)
      const response = await userAPI.getMyProfile()
      if (updateUser) updateUser(response.data.data.user)
      setAvatarFile(null)
      setAvatarPreview(null)
      toast({
        title: "Avatar diupload",
        description: "Foto profil Anda berhasil diperbarui.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal upload avatar",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setTempCoverImage(reader.result as string)
        setShowCoverCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverCropComplete = async (croppedFile: File) => {
    setCoverFile(croppedFile)
    setCoverPreview(URL.createObjectURL(croppedFile))
    setTempCoverImage(null)
    await uploadCover(croppedFile)
  }

  const uploadCover = async (file: File) => {
    if (!user) return
    
    setUploadingCover(true)
    
    try {
      await userAPI.uploadCover(user.username, file)
      const response = await userAPI.getMyProfile()
      if (updateUser) updateUser(response.data.data.user)
      setCoverFile(null)
      setCoverPreview(null)
      toast({
        title: "Cover photo diupload",
        description: "Cover photo Anda berhasil diperbarui.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal upload cover",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setUploadingCover(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user) return
    
    setUploadingAvatar(true)
    
    try {
      await userAPI.deleteAvatar(user.username)
      if (updateUser) {
        const updatedUser = { ...user, avatar: "default-avatar.jpg" } as any
        updateUser(updatedUser)
      }
      toast({
        title: "Avatar dihapus",
        description: "Foto profil berhasil dihapus.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal hapus avatar",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteCover = async () => {
    if (!user) return
    
    setUploadingCover(true)
    
    try {
      await userAPI.deleteCover(user.username)
      if (updateUser) {
        const updatedUser = { ...user, cover_photo: "default-cover.jpg" } as any
        updateUser(updatedUser)
      }
      setCoverError(false)
      toast({
        title: "Cover photo dihapus",
        description: "Cover photo berhasil dihapus.",
      })
    } catch (error: any) {
      toast({
        title: "Gagal hapus cover",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setUploadingCover(false)
    }
  }

  // PERBAIKAN: Hapus akun langsung tanpa verifikasi password
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    
    try {
      const response = await userAPI.deleteMyAccount()
      
      if (response.data.success) {
        logout()
        router.push("/")
        toast({
          title: "Akun dihapus",
          description: "Akun Anda telah berhasil dihapus.",
        })
      } else {
        throw new Error(response.data.error || "Gagal menghapus akun")
      }
    } catch (error: any) {
      console.error("Delete account error:", error)
      toast({
        title: "Gagal hapus akun",
        description: error.response?.data?.error || "Terjadi kesalahan",
        variant: "destructive",
      })
      setDeleteLoading(false)
    }
  }

  const openDeleteDialog = () => {
    setDeleteConfirmText("")
    setShowDeleteDialog(true)
  }

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setDeleteConfirmText("")
  }

  const isDeleteEnabled = deleteConfirmText === "HAPUS AKUN"

  if (!user) {
    return null
  }

  // Get cover URL with fallback
  const coverImageUrl = coverPreview || getCoverUrl(extendedUser?.cover_photo)
  const hasValidCover = coverImageUrl && !coverError && extendedUser?.cover_photo && extendedUser.cover_photo !== "default-cover.jpg"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image Cropper Modals */}
      <ImageCropper
        open={showAvatarCropper}
        onClose={() => {
          setShowAvatarCropper(false)
          setTempAvatarImage(null)
        }}
        image={tempAvatarImage || ""}
        onCropComplete={handleAvatarCropComplete}
        aspectRatio={1}
        title="Crop Foto Profil"
      />
      
      <ImageCropper
        open={showCoverCropper}
        onClose={() => {
          setShowCoverCropper(false)
          setTempCoverImage(null)
        }}
        image={tempCoverImage || ""}
        onCropComplete={handleCoverCropComplete}
        aspectRatio={1200 / 300}
        title="Crop Cover Photo"
      />

      {/* Delete Account Confirmation Dialog - Sederhana */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus Akun Permanen
            </DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Akun Anda akan dihapus permanen beserta semua data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                Data yang akan hilang:
              </p>
              <ul className="text-xs text-red-500 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
                <li>Profil dan informasi akun</li>
                <li>Progress belajar dan streak</li>
                <li>Bookmark dan favorit</li>
                <li>Pesan chat dan mention</li>
                <li>Riwayat membaca artikel</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Ketik <span className="font-mono font-bold text-red-600">HAPUS AKUN</span> untuk konfirmasi
              </Label>
              <Input
                id="confirm-text"
                type="text"
                placeholder="HAPUS AKUN"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeDeleteDialog} disabled={deleteLoading}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!isDeleteEnabled || deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menghapus...
                </>
              ) : (
                "Hapus Permanen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="danger">Bahaya</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
                <CardDescription>Ubah foto profil Anda. Foto akan di-crop menjadi persegi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={avatarPreview || getAvatarUrl(extendedUser?.avatar)} 
                      alt={extendedUser?.username}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-japanese-500 to-japanese-600 text-white text-xl">
                      {extendedUser?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("avatar-input")?.click()}
                      disabled={uploadingAvatar}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    {extendedUser?.avatar && extendedUser.avatar !== "default-avatar.jpg" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteAvatar}
                        disabled={uploadingAvatar}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileSelect}
                />
                <p className="text-xs text-muted-foreground">
                  Format yang didukung: PNG, JPG, JPEG, GIF, WEBP. Maksimal 5MB.
                </p>
              </CardContent>
            </Card>

            {/* Cover Photo Section */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Photo</CardTitle>
                <CardDescription>Ubah cover photo profil Anda. Rasio yang disarankan 4:1 (1200x300).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gradient-to-r from-japanese-500/20 to-japanese-600/20">
                  {hasValidCover ? (
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={() => setCoverError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImageIcon className="h-8 w-8 opacity-50" />
                      <span className="text-sm">Belum ada cover photo</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("cover-input")?.click()}
                    disabled={uploadingCover}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  {extendedUser?.cover_photo && extendedUser.cover_photo !== "default-cover.jpg" && !coverError && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteCover}
                      disabled={uploadingCover}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
                <input
                  id="cover-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileSelect}
                />
                <p className="text-xs text-muted-foreground">
                  Format yang didukung: PNG, JPG, JPEG, GIF, WEBP. Maksimal 10MB.
                </p>
              </CardContent>
            </Card>

            {/* Profile Info Form */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Perbarui informasi profil Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Ceritakan tentang diri Anda..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      placeholder="Kota, Negara"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Tampilan</CardTitle>
              <CardDescription>Atur tema dan preferensi tampilan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "japanese" : "outline"}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-6 w-6" />
                    <span>Terang</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "japanese" : "outline"}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-6 w-6" />
                    <span>Gelap</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "japanese" : "outline"}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-6 w-6" />
                    <span>Sistem</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>Ubah password akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Tab */}
        <TabsContent value="danger">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Zona Bahaya</CardTitle>
              <CardDescription>Tindakan ini tidak dapat dibatalkan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-600 dark:text-red-400">Hapus Akun</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Setelah akun Anda dihapus, semua data akan hilang permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={openDeleteDialog}
                    disabled={loading}
                  >
                    Hapus Akun Saya
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}