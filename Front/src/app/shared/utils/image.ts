/** Photo d'origine acceptée jusqu'à 20 Mo : elle est réduite avant l'envoi. */
export const MAX_SOURCE_SIZE = 20 * 1024 * 1024;

/**
 * Réduit une photo (1280 px au plus sur le grand côté) et la recompresse en JPEG.
 * Renvoie une « data URL » base64 (data:image/jpeg;base64,…) : du texte, enregistré tel quel
 * dans la base. Une photo de téléphone de 4 Mo passe à environ 200 Ko.
 */
export async function compressImage(file: File, maxSide = 1280, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file); // échoue si ce n'est pas une image lisible
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff'; // le JPEG n'a pas de transparence : fond blanc pour les PNG
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', quality);
}

/** Vrai pour une photo envoyée depuis l'appareil (base64), faux pour une adresse en ligne. */
export function isUploadedPhoto(photo: string | null | undefined): boolean {
  return !!photo && photo.startsWith('data:image/');
}

/** Poids approximatif, en octets, d'une image base64 (4 caractères pour 3 octets). */
export function base64Size(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.round((base64.length * 3) / 4);
}
