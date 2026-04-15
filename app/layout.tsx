import type { Metadata, Viewport } from "next"
import { Noto_Sans_JP, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Header } from "@/components/layout/header"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { FloatingChat } from "@/components/chat/floating-chat"
import Link from "next/link"
import { Globe } from "lucide-react"

// ─── Fonts ───────────────────────────────────────────────────────────────────
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
  weight: ["400", "500", "700", "900"],
})

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
const siteUrl = "https://pipinipon.id"
const siteName = "Pipinipon"
const siteDescription =
  "Platform belajar bahasa Jepang online terbaik di Indonesia. Kuasai kosakata, tata bahasa, dan persiapkan ujian JLPT N5 hingga N1 dengan metode modern dan menyenangkan."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${siteName} — Belajar Bahasa Jepang Online`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "belajar bahasa jepang",
    "kursus bahasa jepang online",
    "JLPT N5 N4 N3 N2 N1",
    "kosakata jepang",
    "tata bahasa jepang",
    "belajar hiragana katakana",
    "pipinipon",
    "nihongo",
    "ujian jlpt",
    "belajar jepang gratis",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Education",

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName,
    title: `${siteName} — Belajar Bahasa Jepang Online`,
    description: siteDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pipinipon — Platform Belajar Bahasa Jepang",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Belajar Bahasa Jepang Online`,
    description: siteDescription,
    images: ["/og-image.jpg"],
    creator: "@pipinipon",
    site: "@pipinipon",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: siteUrl,
    languages: {
      "id-ID": siteUrl,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },

  verification: {
    google: "google-site-verification-token",
  },

  formatDetection: { telephone: false },
  referrer: "origin-when-cross-origin",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: "id-ID",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/vocabulary?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 60,
      },
      description: siteDescription,
      foundingDate: "2023",
      areaServed: "ID",
      knowsAbout: ["Bahasa Jepang", "JLPT", "Nihongo", "Kosakata Jepang"],
      sameAs: [
        "https://instagram.com/pipinipon",
        "https://youtube.com/@pipinipon",
        "https://twitter.com/pipinipon",
      ],
    },
    {
      "@type": "Course",
      name: "Kursus Bahasa Jepang JLPT N5–N1",
      description: "Pelajari bahasa Jepang dari level N5 hingga N1 dengan kurikulum terstruktur",
      provider: { "@id": `${siteUrl}/#organization` },
      url: `${siteUrl}/vocabulary`,
      educationalLevel: ["N5", "N4", "N3", "N2", "N1"],
      inLanguage: "id-ID",
      isAccessibleForFree: true,
    },
  ],
}

const footerLinks = {
  Belajar: [
    { label: "Kosakata N5", href: "/vocabulary?jlpt_level=N5" },
    { label: "Kosakata N4", href: "/vocabulary?jlpt_level=N4" },
    { label: "Kosakata N3", href: "/vocabulary?jlpt_level=N3" },
    { label: "Tata Bahasa", href: "/grammar" },
    { label: "Latihan Soal", href: "/study" },
  ],
  Komunitas: [
    { label: "Forum Diskusi", href: "/chat" },
    { label: "Papan Peringkat", href: "/leaderboard" },
    { label: "Tantangan Harian", href: "/challenges" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "/about" },
    { label: "Hubungi Kami", href: "/contact" },
  ],
  Legal: [
    { label: "Syarat & Ketentuan", href: "/terms" },
    { label: "Kebijakan Privasi", href: "/privacy" },
  ],
}

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)
const IconYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
  </svg>
)
const IconTwitterX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const socialLinks = [
  { Icon: IconInstagram, href: "https://instagram.com/pipinipon", label: "Instagram" },
  { Icon: IconYoutube, href: "https://youtube.com/@pipinipon", label: "YouTube" },
  { Icon: IconTwitterX, href: "https://twitter.com/pipinipon", label: "Twitter / X" },
  { Icon: IconMail, href: "mailto:halo@pipinipon.id", label: "Email" },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body
        className={`${outfit.variable} ${noto.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
            >
              Lewati ke konten utama
            </a>

            <div className="relative flex min-h-screen flex-col">
              <Header />

              <main id="main-content" className="flex-1 w-full pt-4" role="main">
                {children}
              </main>

              <footer className="border-t border-border bg-muted/20 mt-auto" role="contentinfo" aria-label="Footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-1">
                      <Link href="/" className="inline-flex items-center gap-2 mb-4" aria-label="Pipinipon — Halaman Utama">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-black text-sm">ぴ</span>
                        </div>
                        <span className="font-black text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Pipinipon</span>
                      </Link>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                        Platform belajar bahasa Jepang terpercaya untuk pelajar Indonesia.
                      </p>
                      <div className="flex gap-2" aria-label="Media sosial Pipinipon">
                        {socialLinks.map((s) => (
                          <a
                            key={s.label}
                            href={s.href}
                            aria-label={s.label}
                            target={s.href.startsWith("http") ? "_blank" : undefined}
                            rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="w-8 h-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-150"
                          >
                            <s.Icon />
                          </a>
                        ))}
                      </div>
                    </div>

                    <nav className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8" aria-label="Footer navigasi">
                      {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                          <h3 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">
                            {section}
                          </h3>
                          <ul className="space-y-2" role="list">
                            {links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-150"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="border-t border-border">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} Pipinipon. Hak cipta dilindungi.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Bahasa Indonesia</span>
                    </div>
                  </div>
                </div>
              </footer>

              <FloatingChat 
                position="bottom-right"
                size="md"
                title="Chat Global"
                autoOpenOnNotification={true}
              />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}