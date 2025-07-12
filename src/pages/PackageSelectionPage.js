import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile, isTablet } from 'react-device-detect';
import { packageService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LTEPackageCard from '../components/common/LTEPackageCard';
import MobileCarousel from '../components/common/MobileCarousel';
import MobileLTEPackageCard from '../components/common/MobileLTEPackageCard';
import './PackageSelectionPage.css';

const PackageSelectionPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const providerSliderRef = useRef(null);

  // Define provider order
  const providerOrder = ['Vodacom', 'MTN', 'Telkom'];

  // Detect if mobile/tablet for better UX
  const isMobileDevice = isMobile || isTablet;

  useEffect(() => {
    fetchLTEPackages();
    
    // Add mobile viewport optimizations
    if (isMobileDevice) {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      
      const handleResize = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobileDevice]);

  const fetchLTEPackages = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await packageService.getLTEPackages();
      
      console.log('LTE API Response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const packages = response.data.data;
        const groupedProviders = groupPackagesByProvider(packages);
        setProviders(groupedProviders);
      } else {
        // Use default packages if API fails
        const defaultProviders = createDefaultProviders();
        setProviders(defaultProviders);
      }
    } catch (err) {
      console.error('Error fetching LTE packages:', err);
      // Use default packages on error
      const defaultProviders = createDefaultProviders();
      setProviders(defaultProviders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh functionality for mobile
  const handleRefresh = async () => {
    if (isMobileDevice) {
      await fetchLTEPackages(true);
    }
  };

  const createDefaultProviders = () => {
    const defaultPackages = [
      { id: 'default_1', name: 'Vodacom Fixed LTE 25GB', provider: 'Vodacom', provider_slug: 'vodacom', price: 169, type: 'fixed-lte', speed: '', data: '25GB', aup: '', throttle: '' },
      { id: 'default_2', name: 'Vodacom Fixed LTE 50GB', provider: 'Vodacom', provider_slug: 'vodacom', price: 269, type: 'fixed-lte', speed: '', data: '50GB', aup: '', throttle: '' },
      { id: 'default_3', name: 'MTN Fixed LTE 30Mbps', provider: 'MTN', provider_slug: 'mtn', price: 339, type: 'fixed-lte', speed: '30', data: 'Uncapped', aup: '50', throttle: '2Mbps' },
      { id: 'default_4', name: 'MTN Mobile 5GB', provider: 'MTN', provider_slug: 'mtn', price: 96, type: 'mobile-data', speed: '', data: '5.5GB', aup: '', throttle: '' },
      { id: 'default_5', name: 'Telkom 22.5GB + Night', provider: 'Telkom', provider_slug: 'telkom', price: 179, type: 'fixed-lte', speed: '', data: '22.5GB + 22.5GB Night', aup: '', throttle: '' },
    ];

    return groupPackagesByProvider(defaultPackages);
  };

  const groupPackagesByProvider = (packages) => {
    const grouped = {};
    
    // Initialize providers
    providerOrder.forEach(providerName => {
      const slug = providerName.toLowerCase();
      grouped[slug] = {
        name: providerName,
        slug: slug,
        packages: [],
        logo: null // Will be set from API data if available
      };
    });

    // Group packages by provider
    packages.forEach(pkg => {
      const providerName = pkg.provider || extractProviderFromName(pkg.name);
      const providerSlug = providerName.toLowerCase();
      
      if (grouped[providerSlug]) {
        // Determine package type from name if not provided
        let packageType = pkg.type || pkg.package_type;
        if (!packageType) {
          const titleLower = pkg.name.toLowerCase();
          if (titleLower.includes('mobile')) {
            packageType = 'mobile-data';
          } else if (titleLower.includes('5g')) {
            packageType = 'fixed-5g';
          } else {
            packageType = 'fixed-lte';
          }
        }

        const mappedPackage = {
          ...pkg,
          type: packageType,
          provider: providerName,
          provider_slug: providerSlug,
          price: parseInt(pkg.price) || 0,
          speed: pkg.speed || '',
          data: pkg.data || '',
          aup: pkg.aup || '',
          throttle: pkg.throttle || ''
        };

        grouped[providerSlug].packages.push(mappedPackage);
      }
    });

    // Sort packages within each provider
    Object.values(grouped).forEach(provider => {
      provider.packages.sort(sortPackagesByType);
    });

    // Return only providers with packages
    return Object.values(grouped).filter(provider => provider.packages.length > 0);
  };

  const extractProviderFromName = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vodacom')) return 'Vodacom';
    if (lowerName.includes('mtn')) return 'MTN';
    if (lowerName.includes('telkom')) return 'Telkom';
    return 'Other';
  };

  const sortPackagesByType = (a, b) => {
    // Check if package names contain "mobile" (case insensitive)
    const aIsMobile = a.name.toLowerCase().includes('mobile');
    const bIsMobile = b.name.toLowerCase().includes('mobile');
    
    // If one is mobile and the other isn't, mobile goes to bottom
    if (aIsMobile && !bIsMobile) return 1;
    if (!aIsMobile && bIsMobile) return -1;
    
    // If both are mobile or both are not mobile, sort by type then price
    if (aIsMobile === bIsMobile) {
      // Check for 5G in the name
      const aIs5G = a.name.toLowerCase().includes('5g');
      const bIs5G = b.name.toLowerCase().includes('5g');
      
      // 5G packages come first among non-mobile
      if (!aIsMobile && !bIsMobile) {
        if (aIs5G && !bIs5G) return -1;
        if (!aIs5G && bIs5G) return 1;
      }
      
      // Sort by price if same category
      return a.price - b.price;
    }
    
    return 0;
  };

  const handleProviderSelect = (index) => {
    setCurrentProviderIndex(index);
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 500);
  };

  const scrollToProvider = (index) => {
    if (providerSliderRef.current) {
      const slider = providerSliderRef.current;
      const slideWidth = slider.querySelector('.provider-card')?.offsetWidth || 200;
      const spacing = 20;
      const scrollLeft = (slideWidth + spacing) * index;
      
      slider.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevProvider = () => {
    const newIndex = currentProviderIndex - 1 < 0 ? providers.length - 1 : currentProviderIndex - 1;
    handleProviderSelect(newIndex);
  };

  const handleNextProvider = () => {
    const newIndex = currentProviderIndex + 1 >= providers.length ? 0 : currentProviderIndex + 1;
    handleProviderSelect(newIndex);
  };

  const handlePackageSelect = (pkg) => {
    try {
      const selectedPackage = {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        provider: pkg.provider,
        speed: pkg.speed,
        data: pkg.data,
        aup: pkg.aup,
        throttle: pkg.throttle,
        type: pkg.type
      };
      
      console.log('Selected LTE package:', selectedPackage);
      
      sessionStorage.setItem('selectedPackage', JSON.stringify(selectedPackage));
      localStorage.setItem('lastSelectedPackage', JSON.stringify(selectedPackage));
      
      // Navigate to LTE signup page
      navigate(`/lte-signup?package_id=${pkg.id}`);
    } catch (error) {
      console.error('Error selecting package:', error);
      alert('Error selecting package. Please try again.');
    }
  };

  // Determine most popular package for highlighting
  const getMostPopularPackageIndex = (packages) => {
    if (!packages || packages.length === 0) return -1;
    
    // Simple logic: middle package or lowest price with good features
    const midIndex = Math.floor(packages.length / 2);
    return midIndex;
  };

  if (loading) {
    return (
      <div className="package-selection-page">
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading LTE packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="package-selection-page">
        <div className="error-container">
          <h2>Error Loading Packages</h2>
          <p>{error}</p>
          <button onClick={() => fetchLTEPackages()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentProvider = providers[currentProviderIndex];

  return (
    <div className={`package-selection-page ${isMobileDevice ? 'mobile-optimized' : ''}`}>
      <motion.header 
        className="lte-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <motion.h1 
            className="heading-gradient"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            LTE, 5G & Mobile Data Packages
          </motion.h1>
          <motion.p 
            className="subheading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Fast, reliable connectivity for home and business. No contracts, no hassle.
          </motion.p>
        </div>
      </motion.header>

      <motion.section 
        className="lte-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="container">
          <div className="title-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Choose a Provider
            </motion.h2>
          </div>
          
          {providers.length > 0 ? (
            <>
              {/* Mobile/Tablet Carousel */}
              {isMobileDevice ? (
                <MobileCarousel
                  providers={providers}
                  currentIndex={currentProviderIndex}
                  onProviderSelect={handleProviderSelect}
                  className="mobile-provider-carousel"
                />
              ) : (
                /* Desktop Provider Selector */
                <div className="provider-selector">
                  <button 
                    className="nav-arrow nav-prev" 
                    onClick={handlePrevProvider}
                    aria-label="Previous provider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  
                  <div className="provider-slider" ref={providerSliderRef}>
                    {providers.map((provider, index) => (
                      <div
                        key={provider.slug}
                        className={`provider-card ${index === currentProviderIndex ? 'active' : ''}`}
                        onClick={() => handleProviderSelect(index)}
                      >
                        {provider.logo ? (
                          <img 
                            src={provider.logo} 
                            alt={provider.name} 
                            className="provider-logo"
                          />
                        ) : (
                          <div className="provider-text">{provider.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="nav-arrow nav-next" 
                    onClick={handleNextProvider}
                    aria-label="Next provider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </button>
                </div>
              )}
              
              {!isMobileDevice && (
                <div className="provider-indicators">
                  {providers.map((_, index) => (
                    <div
                      key={index}
                      className={`indicator ${index === currentProviderIndex ? 'active' : ''}`}
                      onClick={() => handleProviderSelect(index)}
                    />
                  ))}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentProviderIndex}
                  className={`packages-grid ${isMobileDevice ? 'mobile-packages-grid' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentProvider && currentProvider.packages.length > 0 ? (
                    currentProvider.packages.map((pkg, index) => {
                      const mostPopularIndex = getMostPopularPackageIndex(currentProvider.packages);
                      
                      return isMobileDevice ? (
                        <MobileLTEPackageCard
                          key={pkg.id}
                          package={pkg}
                          onSelect={handlePackageSelect}
                          index={index}
                          isPopular={index === mostPopularIndex}
                        />
                      ) : (
                        <LTEPackageCard
                          key={pkg.id}
                          package={pkg}
                          onSelect={handlePackageSelect}
                        />
                      );
                    })
                  ) : (
                    <div className="no-packages">
                      No packages found for this provider.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Mobile Pull-to-Refresh Indicator */}
              {refreshing && isMobileDevice && (
                <motion.div 
                  className="refresh-indicator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <LoadingSpinner />
                  <p>Refreshing packages...</p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="no-packages">
              No providers available at the moment.
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default PackageSelectionPage; 