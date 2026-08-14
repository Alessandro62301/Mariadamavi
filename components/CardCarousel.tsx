"use client";

import type { ReactNode } from "react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type CardCarouselProps = {
  children: ReactNode[];
  className?: string;
};

export default function CardCarousel({ children, className = "" }: CardCarouselProps) {
  return (
    <div className={`card-carousel ${className}`.trim()}>
      <Swiper
        modules={[A11y, Keyboard, Navigation, Pagination]}
        slidesPerView={1.08}
        spaceBetween={14}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        watchOverflow
        breakpoints={{
          640: { slidesPerView: 1.7, spaceBetween: 16 },
          900: { slidesPerView: 2.35, spaceBetween: 18 },
          1180: { slidesPerView: 3, spaceBetween: 18 },
        }}
      >
        {children.map((child, index) => (
          <SwiperSlide key={index}>{child}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
