"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  FileText, 
  Users, 
  Lock, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Scale,
  Receipt,
  Mail,
  Globe,
  Clock,
  Database,
  Code,
  UserCheck,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"

const sections = [
  {
    id: "penerimaan",
    title: "Penerimaan Syarat & Ketentuan",
    icon: FileText,
    content: [
      "Dengan mengakses atau menggunakan platform Pipinipon (\"Layanan\"), Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini.",
      "Jika Anda tidak menyetujui bagian mana pun dari syarat ini, Anda tidak diperbolehkan mengakses Layanan.",
      "Kami berhak untuk mengubah atau mengganti Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini."
    ]
  },
  {
    id: "akun",
    title: "Akun Pengguna",
    icon: Users,
    content: [
      "Anda harus berusia minimal 13 tahun untuk menggunakan Layanan ini.",
      "Anda bertanggung jawab penuh atas keamanan akun Anda, termasuk kerahasiaan kata sandi.",
      "Anda harus segera memberi tahu kami jika terjadi pelanggaran keamanan atau penggunaan tidak sah pada akun Anda.",
      "Kami berhak untuk menangguhkan atau menghentikan akun Anda jika melanggar ketentuan ini."
    ]
  },
  {
    id: "privasi",
    title: "Privasi & Data",
    icon: Lock,
    content: [
      "Penggunaan data pribadi Anda diatur dalam Kebijakan Privasi kami.",
      "Kami mengumpulkan data untuk meningkatkan pengalaman belajar Anda.",
      "Data belajar Anda (progress, nilai, dll) akan disimpan dan dapat dihapus atas permintaan Anda.",
      "Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa izin Anda."
    ]
  },
  {
    id: "konten",
    title: "Konten & Hak Kekayaan Intelektual",
    icon: Scale,
    content: [
      "Semua materi pembelajaran, termasuk kosakata, tata bahasa, dan latihan adalah milik Pipinipon.",
      "Anda tidak diperbolehkan menyalin, mendistribusikan, atau menjual ulang materi tanpa izin tertulis.",
      "Pengguna dapat menyimpan materi untuk penggunaan pribadi dan non-komersial.",
      "Konten yang diunggah pengguna (chat, komentar) tetap menjadi milik pengguna, tetapi kami memiliki lisensi untuk menampilkannya."
    ]
  },
  {
    id: "penggunaan",
    title: "Penggunaan yang Dilarang",
    icon: AlertCircle,
    content: [
      "Menggunakan Layanan untuk kegiatan ilegal atau melanggar hukum.",
      "Mengirimkan spam, pesan berantai, atau konten yang tidak pantas.",
      "Mengganggu atau merusak keamanan Layanan.",
      "Menggunakan bot, scraper, atau otomatisasi untuk mengakses Layanan.",
      "Meniru identitas orang lain atau menyalahgunakan akun."
    ]
  },
  {
    id: "pembayaran",
    title: "Pembayaran & Langganan",
    icon: Receipt,
    content: [
      "Fitur dasar Layanan tersedia gratis. Fitur premium mungkin memerlukan langganan berbayar.",
      "Harga dan ketersediaan fitur dapat berubah dengan pemberitahuan sebelumnya.",
      "Pembayaran diproses melalui pihak ketiga yang aman. Kami tidak menyimpan informasi kartu kredit.",
      "Pengembalian dana akan dipertimbangkan secara kasus per kasus."
    ]
  },
  {
    id: "penghentian",
    title: "Penghentian Akun",
    icon: Trash2,
    content: [
      "Anda dapat menghapus akun Anda kapan saja melalui pengaturan profil.",
      "Kami dapat menangguhkan atau menghentikan akun Anda jika melanggar ketentuan.",
      "Setelah penghentian, data Anda akan dihapus sesuai dengan Kebijakan Privasi.",
      "Beberapa data anonim mungkin tetap disimpan untuk tujuan analitik."
    ]
  },
  {
    id: "batasan",
    title: "Batasan Tanggung Jawab",
    icon: Shield,
    content: [
      "Layanan disediakan \"sebagaimana adanya\" tanpa jaminan apapun.",
      "Kami tidak bertanggung jawab atas kerugian langsung atau tidak langsung akibat penggunaan Layanan.",
      "Kami tidak menjamin bahwa Layanan akan bebas dari kesalahan atau gangguan.",
      "Hasil belajar dapat bervariasi tergantung usaha dan konsistensi pengguna."
    ]
  },
  {
    id: "kontak",
    title: "Hubungi Kami",
    icon: Mail,
    content: [
      "Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami di:",
      "📧 Email: legal@pipinipon.com",
      "📍 Alamat: Jakarta, Indonesia",
      "📞 Telepon: +62 812 3456 7890"
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

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-900 pt-32 pb-20">
        {/* Decorative kanji background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
          {["規", "約", "利", "用", "条", "項", "法", "律"].map((char, i) => (
            <span
              key={i}
              className="absolute text-white font-black"
              style={{
                fontSize: `${120 + i * 20}px`,
                left: `${(i * 12) % 100}%`,
                top: `${(i * 15) % 80}%`,
                transform: `rotate(${i * 15}deg)`,
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
              <Scale className="w-4 h-4" />
              Legal & Compliance
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Syarat & Ketentuan
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mb-4">
              Terakhir diperbarui: 14 April 2026
            </p>
            <p className="text-white/50 max-w-2xl">
              Dengan menggunakan Pipinipon, Anda menyetujui syarat dan ketentuan yang tercantum di bawah ini.
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
            <p className="text-foreground leading-relaxed">
              Selamat datang di Pipinipon! Platform belajar bahasa Jepang yang dirancang untuk membantu 
              Anda menguasai bahasa Jepang dari dasar hingga mahir. Dengan mengakses atau menggunakan 
              layanan kami, Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Harap baca dengan 
              saksama sebelum menggunakan platform kami.
            </p>
          </motion.div>

          {/* Sections */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {sections.map((section) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className="group scroll-mt-20"
                id={section.id}
              >
                <div className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, idx) => (
                        <p key={idx} className="text-muted-foreground leading-relaxed">
                          {paragraph.startsWith("•") || paragraph.startsWith("📧") || paragraph.startsWith("📍") || paragraph.startsWith("📞") ? (
                            <span className="block">{paragraph}</span>
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
            className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Ringkasan Penting</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    Layanan dasar gratis selamanya
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    Data pribadi Anda aman dan tidak akan dibagikan
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    Anda dapat menghapus akun kapan saja
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    Materi pembelajaran adalah hak cipta Pipinipon
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
              Dengan menggunakan Pipinipon, Anda mengakui bahwa Anda telah membaca, memahami, 
              dan menyetujui Syarat & Ketentuan ini.
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