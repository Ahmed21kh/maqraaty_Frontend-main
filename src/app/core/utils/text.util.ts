/**
 * Normalises text for forgiving Arabic search: strips diacritics and tatweel, folds
 * alef variants (أ إ آ → ا), ya/alef-maqsura (ى → ي) and ta-marbuta (ة → ه), lower-cases Latin
 * and converts Arabic-Indic digits to ASCII. "أحمد" therefore matches "احمد", and "٠١٠" matches "010".
 */
export function normalizeArabic(value: string | null | undefined): string {
  return (value ?? '')
    .toString()
    .replace(/[ً-ٰٟـ]/g, '') // harakat + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .toLowerCase()
    .trim();
}
