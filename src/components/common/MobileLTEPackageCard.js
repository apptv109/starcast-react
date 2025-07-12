import React, { useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useIntersectionObserver } from 'react-intersection-observer';
import { isMobile } from 'react-device-detect';
import './MobileLTEPackageCard.css';

const MobileLTEPackageCard = ({ package: pkg, onSelect, index = 0, isPopular = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ref, inView] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  if (!pkg) return null;

  const handleClick = () => {
    if (onSelect) {
      onSelect(pkg);
    }
  };

  const handlePressStart = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  const renderFeatures = () => {
    const features = [];
    const checkIcon = (
      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );

    // Speed feature
    if (pkg.speed && pkg.speed !== '0' && pkg.speed !== '') {
      const speedText = pkg.speed.includes('Mbps') ? pkg.speed : `${pkg.speed}Mbps`;
      features.push(
        <motion.li 
          key="speed"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + (index * 0.1) }}
        >
          {checkIcon}
          <span className="feature-label">Speed:</span>
          <span className="feature-value">{speedText}</span>
        </motion.li>
      );
    }

    // Data feature
    if (pkg.data && pkg.data !== '') {
      let dataValue = pkg.data.replace(/unlimited/gi, 'Uncapped').replace(/Unlimited/g, 'Uncapped');
      features.push(
        <motion.li 
          key="data"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 + (index * 0.1) }}
        >
          {checkIcon}
          <span className="feature-label">Data:</span>
          <span className="feature-value">{dataValue}</span>
        </motion.li>
      );
    }

    // AUP (Fair Use Policy) feature
    if (pkg.aup && pkg.aup !== '0' && pkg.aup !== '') {
      const aupText = pkg.aup.includes('GB') ? pkg.aup : `${pkg.aup}GB`;
      features.push(
        <motion.li 
          key="aup"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4 + (index * 0.1) }}
        >
          {checkIcon}
          <span className="feature-label">Fair Use:</span>
          <span className="feature-value">{aupText}</span>
        </motion.li>
      );
    }

    // Throttle feature
    if (pkg.throttle && pkg.throttle !== '') {
      features.push(
        <motion.li 
          key="throttle"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5 + (index * 0.1) }}
        >
          {checkIcon}
          <span className="feature-label">Throttled to:</span>
          <span className="feature-value">{pkg.throttle}</span>
        </motion.li>
      );
    }

    // If no features, show package type
    if (features.length === 0) {
      let typeLabel = 'Fixed LTE';
      if (pkg.type === 'mobile-data') typeLabel = 'Mobile Data';
      if (pkg.type === 'fixed-5g') typeLabel = '5G';
      
      features.push(
        <motion.li 
          key="type"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + (index * 0.1) }}
        >
          {checkIcon}
          <span className="feature-label">Type:</span>
          <span className="feature-value">{typeLabel}</span>
        </motion.li>
      );
    }

    return features;
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    pressed: {
      scale: 0.95,
      y: 2,
      transition: { duration: 0.1 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      ref={ref}
      className={`mobile-lte-package-card ${isPopular ? 'popular' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={!isMobile ? { y: -8, scale: 1.02 } : {}}
      whileTap="pressed"
      onClick={handleClick}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
    >
      {isPopular && (
        <motion.div 
          className="popular-badge"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5 + (index * 0.1), duration: 0.4 }}
        >
          ⭐ Most Popular
        </motion.div>
      )}

      <div className="package-header-mobile">
        <motion.h3 
          className="package-name-mobile"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 + (index * 0.1) }}
        >
          {pkg.name}
        </motion.h3>
        <motion.p 
          className="package-provider-mobile"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 + (index * 0.1) }}
        >
          {pkg.provider}
        </motion.p>
      </div>
      
      <motion.div 
        className="package-price-mobile"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: 0.2 + (index * 0.1), type: "spring", stiffness: 300 }}
      >
        <span className="currency-mobile">R</span>
        <span className="price-amount-mobile">{pkg.price}</span>
        <span className="period-mobile">/pm</span>
      </motion.div>
      
      <ul className="package-features-mobile">
        {renderFeatures()}
      </ul>
      
      <motion.button 
        className="package-select-btn-mobile"
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <span>Choose Plan</span>
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      <div className="package-card-overlay"></div>
    </motion.div>
  );
};

export default MobileLTEPackageCard;