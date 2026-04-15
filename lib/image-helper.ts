// lib/image-helper.ts

type ImageType = 'avatar' | 'cover' | 'grammar';

export const getImageUrl = (
  path: string | null | undefined,
  type: ImageType = 'avatar'
): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  
  const baseUrl = 'https://api.pipinipon.site';
  let cleanPath = path;
  
  // Hapus prefix yang tidak diinginkan
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }
  
  const prefixes = ['avatars/', 'covers/', 'grammar/', 'grammars/'];
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
  const baseUrl = 'https://api.pipinipon.site';
  
  // Ambil hanya nama file (setelah slash terakhir)
  let filename = thumbnail;
  const lastSlashIndex = filename.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    filename = filename.substring(lastSlashIndex + 1);
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