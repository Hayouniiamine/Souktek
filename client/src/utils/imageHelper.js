import API_BASE_URL from "../config";

export const getImageUrl = (img) => {
  if (!img) return "/images/default_image.png"; // fallback

  if (img.startsWith("/images")) {
    // Served from public/images (React)
    return `${API_BASE_URL}${img}`;
  }

  if (img.startsWith("/uploads")) {
    // Uploaded and served by backend
    return `${API_BASE_URL}${img}`;
  }

  // If only a filename (no path), default to /uploads
  return `${API_BASE_URL}/uploads/${img}`;
};
