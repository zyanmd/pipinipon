"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Eye, 
  Database, 
  Cookie, 
  Mail, 
  Lock,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Globe,
  Clock,
  UserCheck,
  Server,
  Smartphone,
  FileText,
  Share2,
  Bell
} from "lucide-react"
import { useRouter } from "next/navigation"

const sections = [
  {
    id: "pendahuluan",
    title: "Pendahuluan",
    icon: FileText,
    content: [
      "Pipinipon (\"kami\", \"kita\", atau \"milik kami\") berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda ketika Anda menggunakan platform pembelajaran bahasa Jepang kami.",
      "Dengan menggunakan Pipinipon, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini."
    ]
  },
  {
    id: "informasi",
    title: "Informasi yang Kami Kumpulkan",
    icon: Database,
    content: [
      "• Informasi Akun: Nama, alamat email, username, dan kata sandi yang dienkripsi.",
      "• Informasi Profil: Foto profil, bio, dan preferensi bahasa yang Anda pilih.",
      "• Data Pembelajaran: Kosakata yang dipelajari, progress latihan, nilai kuis, dan streak harian.",
      "• Data Aktivitas: Waktu login, durasi belajar, fitur yang digunakan, dan interaksi dengan pengguna lain.",
      "• Informasi Perangkat: Alamat IP, jenis browser, sistem operasi, dan model perangkat.",
      "• Data Komunikasi: Pesan chat, komentar, mention, dan notifikasi yang Anda kirim atau terima."
    ]
  },
  {
    id: "penggunaan",
    title: "Bagaimana Kami Menggunakan Informasi Anda",
    icon: Eye,
    content: [
      "• Menyediakan, memelihara, dan meningkatkan layanan pembelajaran.",
      "• Menyesuaikan pengalaman belajar berdasarkan level dan preferensi Anda.",
      "• Mengirimkan notifikasi tentang aktivitas belajar, mention, dan balasan pesan.",
      "• Menganalisis penggunaan platform untuk meningkatkan fitur dan konten.",
      "• Memberikan dukungan pelanggan dan menanggapi pertanyaan Anda.",
      "• Mencegah aktivitas penipuan, penyalahgunaan, atau pelanggaran ketentuan."
    ]
  },
  {
    id: "penyimpanan",
    title: "Penyimpanan & Keamanan Data",
    icon: Server,
    content: [
      "Data Anda disimpan di server yang aman dengan enkripsi dan perlindungan tingkat lanjut.",
      "Kami menggunakan firewall, enkripsi SSL/TLS, dan praktik keamanan industri standar.",
      "Kata sandi Anda dienkripsi menggunakan algoritma hashing yang kuat (bcrypt).",
      "Data belajar Anda dicadangkan secara berkala untuk mencegah kehilangan data.",
      "Akses ke data pribadi dibatasi hanya untuk karyawan yang membutuhkan."
    ]
  },
  {
    id: "cookie",
    title: "Cookie & Teknologi Pelacakan",
    icon: Cookie,
    content: [
      "Kami menggunakan cookie untuk meningkatkan pengalaman Anda di Pipinipon:",
      "• Cookie esensial: Diperlukan untuk fungsi dasar platform (login, navigasi).",
      "• Cookie preferensi: Menyimpan pengaturan bahasa dan tema yang Anda pilih.",
      "• Cookie analitik: Membantu kami memahami bagaimana pengguna berinteraksi dengan platform.",
      "• Cookie sesi: Mengingat aktivitas Anda selama satu sesi belajar.",
      "Anda dapat mengatur browser untuk menolak cookie, tetapi beberapa fitur mungkin tidak berfungsi optimal."
    ]
  },
  {
    id: "berbagi",
    title: "Berbagi Data dengan Pihak Ketiga",
    icon: Share2,
    content: [
      "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga.",
      "Kami dapat berbagi data dengan:",
      "• Penyedia layanan hosting dan infrastruktur (Vercel, AWS, dll).",
      "• Penyedia analitik untuk meningkatkan layanan (Google Analytics, dll).",
      "• Pihak berwenang jika diwajibkan oleh hukum.",
      "Semua pihak ketiga wajib menjaga kerahasiaan data Anda."
    ]
  },
  {
    id: "hak",
    title: "Hak Anda atas Data Pribadi",
    icon: UserCheck,
    content: [
      "• Mengakses: Anda dapat melihat semua data pribadi yang kami simpan.",
      "• Memperbaiki: Anda dapat mengedit profil dan preferensi kapan saja.",
      "• Menghapus: Anda dapat menghapus akun dan semua data terkait melalui pengaturan.",
      "• Membatasi: Anda dapat membatasi pengumpulan data tertentu.",
      "• Ekspor: Anda dapat mengekspor data belajar Anda dalam format JSON.",
      "Untuk menggunakan hak-hak ini, hubungi kami di privacy@pipinipon.com"
    ]
  },
  {
    id: "retensi",
    title: "Retensi Data",
    icon: Clock,
    content: [
      "Kami menyimpan data Anda selama akun Anda aktif.",
      "Setelah akun dihapus, data pribadi akan dihapus dalam waktu 30 hari.",
      "Data anonim (tidak dapat diidentifikasi) dapat disimpan untuk analitik.",
      "Data chat dapat disimpan lebih lama untuk keperluan keamanan dan moderasi.",
      "Log aktivitas disimpan maksimal 90 hari untuk keperluan audit."
    ]
  },
  {
    id: "anak",
    title: "Privasi Anak-Anak",
    icon: Shield,
    content: [
      "Layanan kami tidak ditujukan untuk anak di bawah usia 13 tahun.",
      "Kami tidak secara sengaja mengumpulkan data dari anak di bawah 13 tahun.",
      "Jika Anda orang tua/wali dan mengetahui anak Anda telah memberikan data kepada kami, hubungi kami.",
      "Kami akan segera menghapus informasi tersebut dari server kami."
    ]
  },
  {
    id: "notifikasi",
    title: "Notifikasi & Komunikasi",
    icon: Bell,
    content: [
      "Kami dapat mengirimkan email dan notifikasi tentang:",
      "• Aktivitas belajar dan pencapaian streak.",
      "• Mention dan balasan pesan dari pengguna lain.",
      "• Pembaruan fitur dan pengumuman penting.",
      "• Pengingat belajar (jika diaktifkan).",
      "Anda dapat menonaktifkan notifikasi kapan saja melalui pengaturan."
    ]
  },
  {
    id: "perubahan",
    title: "Perubahan Kebijakan Privasi",
    icon: AlertCircle,
    content: [
      "Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu.",
      "Perubahan akan diumumkan melalui email atau notifikasi di platform.",
      "Tanggal 'Terakhir diperbarui' di bagian atas akan selalu menunjukkan versi terbaru.",
      "Dengan terus menggunakan Pipinipon setelah perubahan, Anda menyetujui kebijakan yang diperbarui."
    ]
  },
  {
    id: "kontak",
    title: "Hubungi Kami",
    icon: Mail,
    content: [
      "Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:",
      "",
      "📧 Email Privasi: privacy@pipinipon.com",
      "📧 Email Dukungan: support@pipinipon.com",
      "📍 Alamat: Jakarta, Indonesia",
      "📞 Telepon: +62 812 3456 7890",
      "",
      "Kami akan merespons pertanyaan Anda dalam waktu maksimal 7 hari kerja."
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
}

// Perbaiki tipe ease dengan 'as const'
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" as const } 
  },
}

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 pt-32 pb-20">
        {/* Decorative kanji background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
          {["プ", "ラ", "イ", "バ", "シ", "ー", "ポ", "リ", "シ", "ー"].map((char, i) => (
            <span
              key={i}
              className="absolute text-white font-black"
              style={{
                fontSize: `${100 + i * 15}px`,
                left: `${(i * 9) % 100}%`,
                top: `${(i * 12) % 80}%`,
                transform: `rotate(${i * 20}deg)`,
                opacity: 0.5,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Lock className="w-4 h-4" />
              Privasi & Keamanan
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Kebijakan Privasi
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mb-4">
              Terakhir diperbarui: 14 April 2026
            </p>
            <p className="text-white/50 max-w-2xl">
              Kami menghargai privasi Anda. Baca kebijakan ini untuk memahami bagaimana kami melindungi data pribadi Anda.
            </p>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path fill="var(--background)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Last updated badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-8 pb-4 border-b border-border"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Versi 2.0 | Berlaku mulai 14 April 2026
            </span>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12 p-6 rounded-2xl bg-muted/30 border border-border"
          >
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-foreground leading-relaxed">
                Di Pipinipon, privasi Anda adalah prioritas utama. Kebijakan Privasi ini menjelaskan 
                komitmen kami untuk melindungi informasi pribadi Anda. Kami hanya mengumpulkan data 
                yang diperlukan untuk memberikan pengalaman belajar terbaik dan tidak akan pernah 
                menjual data Anda kepada pihak ketiga.
              </p>
            </div>
          </motion.div>

          {/* Sections */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className="group scroll-mt-20"
                id={section.id}
              >
                <div className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-2">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx} className="text-muted-foreground leading-relaxed">
                          {paragraph.startsWith("•") ? (
                            <span className="block ml-2">{paragraph}</span>
                          ) : paragraph.startsWith("📧") || paragraph.startsWith("📍") || paragraph.startsWith("📞") ? (
                            <span className="block font-medium">{paragraph}</span>
                          ) : paragraph === "" ? (
                            <br />
                          ) : (
                            paragraph
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary Box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Komitmen Privasi Kami</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-blue-500" />
                    Data Anda dienkripsi dan disimpan dengan aman
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="h-3 w-3 text-blue-500" />
                    Anda dapat menghapus semua data kapan saja
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-blue-500" />
                    Kami tidak menjual data Anda ke pihak ketiga
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-blue-500" />
                    Transparan tentang bagaimana data Anda digunakan
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Acknowledgment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 text-center border-t border-border"
          >
            <p className="text-sm text-muted-foreground">
              Dengan menggunakan Pipinipon, Anda menyetujui Kebijakan Privasi ini. 
              Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim kami.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              © {new Date().getFullYear()} Pipinipon. Seluruh hak cipta dilindungi.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}