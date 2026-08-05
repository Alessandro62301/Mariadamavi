import { brandSocialImageSize, createBrandSocialImage } from "@/lib/brand-social-image";

export const alt = "Maria da Mavi — seu próximo Apple com orientação de verdade";
export const size = brandSocialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createBrandSocialImage();
}
