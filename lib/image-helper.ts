// lib/image-helper.ts

type ImageType = 'avatar' | 'cover' | 'grammar' | 'reading';

export const getImageUrl = (
  path: string | null | undefined,
  type: ImageType = 'avatar'
): string | undefined => {
  if (!path) return undefined;
  
  // Jika sudah URL lengkap, return langsung
  if (path.startsWith('http')) return path;
  
  // Gunakan environment variable atau default
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site';
  let cleanPath = path;
  
  // Hapus prefix yang tidak diinginkan
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }
  
  // Hapus prefix folder yang mungkin sudah ada
  const prefixes = ['avatars/', 'covers/', 'grammar/', 'grammars/', 'readings/'];
  for (const prefix of prefixes) {
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.replace(prefix, '');
      break;
    }
  }
  
  // Untuk grammar, pastikan nama file dimulai dengan 'grammar_'
  if (type === 'grammar' && !cleanPath.startsWith('grammar_')) {
    // Jika tidak dimulai dengan grammar_, tambahkan
    if (cleanPath.match(/^\d+_/)) {
      cleanPath = `grammar_${cleanPath}`;
    }
  }
  
  let folder = '';
  switch (type) {
    case 'avatar': folder = 'avatars'; break;
    case 'cover': folder = 'covers'; break;
    case 'grammar': folder = 'grammar'; break;
    case 'reading': folder = 'readings'; break;
  }
  
  return `${baseUrl}/uploads/${folder}/${cleanPath}`;
};

export const getAvatarUrl = (avatar: string | null | undefined): string => {
  const url = getImageUrl(avatar, 'avatar');
  return url || '/default-avatar.png';
};

export const getCoverUrl = (cover: string | null | undefined): string => {
  const url = getImageUrl(cover, 'cover');
  return url || '/default-cover.png';
};

export const getGrammarThumbnailUrl = (thumbnail: string | null | undefined): string => {
  if (!thumbnail) return '/default-grammar.jpg';
  
  // Base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site';
  
  // Ambil hanya nama file (setelah slash terakhir)
  let filename = thumbnail;
  const lastSlashIndex = filename.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    filename = filename.substring(lastSlashIndex + 1);
  }
  
  // Hapus prefix folder jika ada
  if (filename.startsWith('grammar/')) {
    filename = filename.replace('grammar/', '');
  }
  if (filename.startsWith('grammars/')) {
    filename = filename.replace('grammars/', '');
  }
  if (filename.startsWith('uploads/')) {
    filename = filename.replace('uploads/', '');
  }
  
  // Jika filename tidak diawali 'grammar_', tambahkan
  if (!filename.startsWith('grammar_')) {
    // Jika filename hanya angka dan underscore
    if (/^\d+_/.test(filename)) {
      filename = `grammar_${filename}`;
    }
  }
  
  return `${baseUrl}/uploads/grammar/${filename}`;
};

export const getReadingThumbnailUrl = (thumbnail: string | null | undefined): string => {
  if (!thumbnail) return '/default-reading.jpg';
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site';
  
  // Ambil hanya nama file (setelah slash terakhir)
  let filename = thumbnail;
  const lastSlashIndex = filename.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    filename = filename.substring(lastSlashIndex + 1);
  }
  
  // Hapus prefix folder jika ada
  if (filename.startsWith('readings/')) {
    filename = filename.replace('readings/', '');
  }
  if (filename.startsWith('uploads/')) {
    filename = filename.replace('uploads/', '');
  }
  
  return `${baseUrl}/uploads/readings/${filename}`;
};

// Helper untuk mendapatkan URL reading dengan path yang sudah diproses
export const getReadingImageUrl = (thumbnail: string | null | undefined): string | null => {
  if (!thumbnail) return null;
  
  // Jika sudah URL lengkap
  if (thumbnail.startsWith('http')) return thumbnail;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.pipinipon.site';
  
  // Jika sudah dimulai dengan slash
  if (thumbnail.startsWith('/')) return thumbnail;
  
  // Jika sudah包含完整路径
  if (thumbnail.includes('uploads/readings/')) {
    return `${baseUrl}/${thumbnail}`;
  }
  
  return `${baseUrl}/uploads/readings/${thumbnail}`;
};