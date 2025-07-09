import API_BASE_URL from "../config";

export const getImageUrl = (img) => {
  if (!img) return "/images/default_image.png";

  if (img.startsWith("/images")) {
    return `${API_BASE_URL}${img}`;
  }

  if (img.startsWith("/uploads")) {
    return `${API_BASE_URL}${img}`;
  }

  // 🔥 NEW: if filename only (e.g., "88.jpg"), treat as uploaded image
  if (!img.includes("/")) {
    return `${API_BASE_URL}/uploads/${img}`;
  }

  // 🔄 fallback just in case
  return `${API_BASE_URL}${img}`;
};
