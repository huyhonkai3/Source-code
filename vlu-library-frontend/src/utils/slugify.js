/**
 * Slugify Utility
 * Convert Vietnamese text to URL-friendly slug
 */

/**
 * Remove Vietnamese accents/diacritics
 * @param {string} str - Input string with Vietnamese characters
 * @returns {string} String without accents
 */
const removeVietnameseAccents = (str) => {
  const accentsMap = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    đ: "d",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
  };

  return str
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("");
};

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Input text
 * @returns {string} Slugified text
 *
 * @example
 * slugify('Khoa học máy tính') // 'khoa-hoc-may-tinh'
 * slugify('Triết học  ') // 'triet-hoc'
 * slugify('Công nghệ thông tin') // 'cong-nghe-thong-tin'
 */
export const slugify = (text) => {
  if (!text) return "";

  return removeVietnameseAccents(text)
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
};

export default slugify;
