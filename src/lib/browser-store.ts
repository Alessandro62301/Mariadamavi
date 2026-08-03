"use client";

import type { CartItem, Product } from "@/lib/storefront";

const CART_KEY = "mavi_cart";
const WISHLIST_KEY = "mavi_wishlist";

export function readCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cartUpdated"));
}

export function addToCart(product: Product, storage: string, cor: string) {
  const current = readCart();
  const existing = current.find(
    (item) => item.slug === product.slug && item.storage === storage && item.cor === cor,
  );

  if (existing) {
    existing.quantidade += 1;
  } else {
    current.push({
      slug: product.slug,
      quantidade: 1,
      storage,
      cor,
    });
  }

  writeCart(current);
}

export function updateCartItem(
  slug: string,
  storage: string,
  cor: string,
  quantity: number,
) {
  const current = readCart();
  const next = current
    .map((item) => {
      if (item.slug === slug && item.storage === storage && item.cor === cor) {
        return {
          ...item,
          quantidade: quantity,
        };
      }

      return item;
    })
    .filter((item) => item.quantidade > 0);

  writeCart(next);
}

export function removeCartItem(slug: string, storage: string, cor: string) {
  const current = readCart().filter(
    (item) => !(item.slug === slug && item.storage === storage && item.cor === cor),
  );
  writeCart(current);
}

export function readWishlist() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleWishlist(slug: string) {
  const current = readWishlist();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("wishlistUpdated"));
  return next;
}
