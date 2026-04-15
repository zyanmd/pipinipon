"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Heart, 
  Globe, 
  Target, 
  Sparkles,
  Award,
  MessageCircle,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react"

const stats = [
  { value: "50.000+", label: "Pelajar Aktif", icon: Users },
  { value: "1.200+", label: "Kosakata", icon: BookOpen },
  { value: "98%", label: "Tingkat Kepuasan", icon: Heart },
  { value: "N5–N1", label: "Level JLPT", icon: GraduationCap },
]

const values = [
  {
    title: "Aksesibel untuk Semua",
    description: "Kami percaya bahwa pendidikan bahasa Jepang harus dapat diakses oleh siapa saja, di mana saja, tanpa batasan biaya atau lokasi.",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Pembelajaran Berkualitas",
    description: "Materi disusun oleh tim ahli dengan kurikulum yang terstruktur dan metode modern yang terbukti efektif.",
    icon: Target,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Komunitas yang Mendukung",
    description: "Belajar bersama lebih dari 50.000 pelajar lain yang saling mendukung dan berbagi pengalaman.",
    icon: Users,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Inovasi Berkelanjutan",
    description: "Terus mengembangkan fitur dan materi baru untuk meningkatkan pengalaman belajar.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
]

const team = [
  {
    name: "Raihan",
    role: "Founder & Lead Developer",
    bio: "Penggemar bahasa Jepang sejak SMA, kini berdedikasi untuk membantu ribuan orang belajar bahasa Jepang dengan cara yang lebih mudah dan menyenangkan.",
    avatar: "R",
  },
  {
    name: "Tim Pengajar",
    role: "Content & Curriculum Team",
    bio: "Tim yang terdiri dari para ahli bahasa Jepang dan pendidik berpengalaman yang menyusun materi pembelajaran berkualitas.",
    avatar: "TP",
  },
  {
    name: "Tim Developer",
    role: "Tech Team",
    bio: "Insinyur perangkat lunak yang membangun platform Pipinipon agar tetap stabil, cepat, dan mudah digunakan.",
    avatar: "TD",
  },
]

const milestones = [
  { year: "2023", title: "Pipinipon Didirikan", description: "Memulai perjalanan sebagai platform belajar bahasa Jepang online." },
  { year: "2024", title: "50.000+ Pengguna", description: "Tumbuh menjadi komunitas belajar terbesar di Indonesia." },
  { year: "2025", title: "Fitur Lengkap", description: "Meluncurkan fitur chat, writing practice, dan streak calendar." },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
          {["学", "習", "日", "本", "語", "文", "化", "未", "来"].map((char, i) => (
            <span
              key={i}
              className="absolute text-white font-black"
              style={{
                fontSize: `${100 + i * 15}px`,
                left: `${(i * 11) % 100}%`,
                top: `${(i * 13) % 80}%`,
                transform: `rotate(${i * 18}deg)`,
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
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-red-300" />
              Tentang Pipinipon
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Belajar Bahasa Jepang
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                  Tanpa Batas
                </span>
              </span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Pipinipon hadir untuk membuat belajar bahasa Jepang menjadi lebih mudah, 
              menyenangkan, dan dapat diakses oleh semua orang di Indonesia.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path fill="var(--background)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-foreground">{stat.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Misi Kami</h2>
              <p className="text-muted-foreground leading-relaxed">
                Membantu lebih dari 1 juta orang Indonesia menguasai bahasa Jepang 
                melalui platform pembelajaran yang inovatif, terjangkau, dan efektif.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Visi Kami</h2>
              <p className="text-muted-foreground leading-relaxed">
                Menjadi platform belajar bahasa Jepang nomor 1 di Asia Tenggara 
                yang memberdayakan generasi muda Indonesia untuk bersaing di kancah global.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prinsip yang menjadi fondasi dalam setiap keputusan dan inovasi yang kami buat
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Kenapa Memilih Pipinipon?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lebih dari sekadar platform belajar, kami adalah mitra perjalanan Anda menguasai bahasa Jepang
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Materi Terstruktur",
                description: "Kurikulum dari N5 hingga N1 yang disusun oleh tim ahli",
                icon: BookOpen,
              },
              {
                title: "Latihan Interaktif",
                description: "Belajar sambil bermain dengan berbagai mode latihan",
                icon: Trophy,
              },
              {
                title: "Komunitas Aktif",
                description: "Diskusi dan tanya jawab dengan sesama pelajar",
                icon: MessageCircle,
              },
              {
                title: "Gratis Selamanya",
                description: "Fitur dasar dapat diakses gratis tanpa batasan",
                icon: Heart,
              },
              {
                title: "Update Berkala",
                description: "Materi dan fitur baru selalu ditambahkan secara rutin",
                icon: Zap,
              },
              {
                title: "Sertifikat Kemajuan",
                description: "Pantau perkembangan dan dapatkan sertifikat",
                icon: Award,
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tim di Balik Pipinipon
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Orang-orang yang berdedikasi untuk memberikan pengalaman belajar terbaik
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">{member.avatar}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perjalanan Kami
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tonggak penting dalam perjalanan Pipinipon
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-orange-500 to-red-500 hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative md:flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
                >
                  <div className="hidden md:block w-1/2" />
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hidden md:block" />
                  <div className="md:w-1/2 p-6 rounded-2xl bg-card border border-border">
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 p-12 md:p-16 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Mulai Perjalananmu Hari Ini
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Bergabunglah dengan ribuan pelajar lain dan kuasai bahasa Jepang bersama Pipinipon
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-red-600 hover:bg-gray-100 shadow-lg rounded-xl px-8"
                  >
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/vocabulary">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8"
                  >
                    Jelajahi Materi
                  </Button>
                </Link>
              </div>
              <p className="text-white/50 text-sm mt-6">Gratis selamanya · Tidak perlu kartu kredit</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}