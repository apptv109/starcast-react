import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode, Thumbs } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import './MobileCarousel.css';

const MobileCarousel = ({ 
  providers, 
  currentIndex, 
  onProviderSelect,
  className = ''
}) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(currentIndex);
    }
  }, [currentIndex]);

  const handleSlideChange = (swiper) => {
    onProviderSelect(swiper.activeIndex);
  };

  const slideVariants = {
    enter: {
      scale: 0.8,
      opacity: 0
    },
    center: {
      scale: 1,
      opacity: 1
    },
    exit: {
      scale: 0.8,
      opacity: 0
    }
  };

  return (
    <div className={`mobile-carousel ${className}`}>
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, FreeMode]}
        spaceBetween={isMobile ? 15 : 20}
        slidesPerView={isMobile ? 1.2 : 2.5}
        centeredSlides={true}
        initialSlide={currentIndex}
        onSlideChange={handleSlideChange}
        navigation={{
          nextEl: '.carousel-button-next',
          prevEl: '.carousel-button-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        freeMode={{
          enabled: true,
          sticky: true,
        }}
        grabCursor={true}
        touchRatio={1.5}
        touchAngle={45}
        simulateTouch={true}
        allowTouchMove={true}
        breakpoints={{
          320: {
            slidesPerView: 1.1,
            spaceBetween: 12,
          },
          480: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },
          640: {
            slidesPerView: 1.8,
            spaceBetween: 18,
          },
          768: {
            slidesPerView: 2.2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 2.5,
            spaceBetween: 25,
          },
        }}
        className="provider-swiper"
      >
        {providers.map((provider, index) => (
          <SwiperSlide key={provider.slug} className="provider-slide">
            <motion.div
              variants={slideVariants}
              initial="enter"
              animate={index === currentIndex ? "center" : "enter"}
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`provider-card-mobile ${
                index === currentIndex ? 'active' : ''
              }`}
              onClick={() => onProviderSelect(index)}
            >
              <div className="provider-card-content">
                {provider.logo ? (
                  <img 
                    src={provider.logo} 
                    alt={provider.name} 
                    className="provider-logo-mobile"
                    loading="lazy"
                  />
                ) : (
                  <div className="provider-text-mobile">{provider.name}</div>
                )}
                <div className="provider-name-mobile">{provider.name}</div>
                <div className="provider-packages-count">
                  {provider.packages.length} packages
                </div>
              </div>
              
              {index === currentIndex && (
                <motion.div
                  className="active-indicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="carousel-button carousel-button-prev" aria-label="Previous provider">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M15 18L9 12L15 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <button className="carousel-button carousel-button-next" aria-label="Next provider">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M9 18L15 12L9 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default MobileCarousel;