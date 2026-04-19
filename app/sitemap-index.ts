// app/sitemap-index.ts (opsional untuk sitemap besar)
import { MetadataRoute } from 'next'

const SITE_URL = 'https://pipinipon.web.id'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/sitemap.xml`,
      lastModified: new Date(),
    }
  ]
}