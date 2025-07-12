import React, { useState, useEffect, useRef } from 'react';
import { wordpressApiService } from '../services/wordpress-api';
import PackageCard from '../components/common/PackageCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './FibrePage.css';

const FibrePage = () => {
  const [providers, setProviders] = useState([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const providerSliderRef = useRef(null);

  // Define allowed providers in the exact order we want them displayed
  const allowedProviders = ['openserve', 'octotel', 'frogfoot', 'vuma', 'metrofibre', 'metrofibre-north', 'metrofibre-south'];

  useEffect(() => {
    fetchFibrePackages();
  }, []);

  const fetchFibrePackages = async () => {
    try {
      setLoading(true);
      const response = await wordpressApiService.getFibrePackages();
      
      if (response.data && response.data.success && response.data.data) {
        const packages = response.data.data;
        const groupedProviders = groupPackagesByProvider(packages);
        setProviders(groupedProviders);
      } else {
        setError('No packages found');
      }
    } catch (err) {
      console.error('Error fetching fibre packages:', err);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const groupPackagesByProvider = (packages) => {
    const grouped = {};
    
    packages.forEach(pkg => {
      // Extract provider name from package title or use a default grouping logic
      const providerName = extractProviderName(pkg.title) || 'Other';
      const providerSlug = providerName.toLowerCase().replace(/\s+/g, '-');
      
      if (!grouped[providerSlug]) {
        grouped[providerSlug] = {
          name: providerName,
          slug: providerSlug,
          packages: [],
          logo: null // Will be set if available
        };
      }
      
      grouped[providerSlug].packages.push({
        ...pkg,
        download_speed: parseInt(pkg.speed?.replace(/[^0-9]/g, '') || '0'),
        has_promo: pkg.promo_price && pkg.promo_price !== pkg.price,
        effective_price: pkg.promo_price || pkg.price
      });
    });

    // Sort packages within each provider by download speed
    Object.values(grouped).forEach(provider => {
      provider.packages.sort((a, b) => a.download_speed - b.download_speed);
    });

    // Filter and sort providers according to allowed list
    const filteredProviders = [];
    
    allowedProviders.forEach((allowedProvider, index) => {
      const provider = Object.values(grouped).find(p => 
        p.slug.includes(allowedProvider) || 
        p.name.toLowerCase().includes(allowedProvider)
      );
      
      if (provider && provider.packages.length > 0) {
        filteredProviders.push({
          ...provider,
          priority: index
        });
      }
    });

    // Add any remaining providers not in the allowed list
    Object.values(grouped).forEach(provider => {
      if (!filteredProviders.find(p => p.slug === provider.slug) && provider.packages.length > 0) {
        filteredProviders.push({
          ...provider,
          priority: 999
        });
      }
    });

    return filteredProviders.sort((a, b) => a.priority - b.priority);
  };

  const extractProviderName = (title) => {
    // Extract provider name from package title
    const providers = ['Openserve', 'Octotel', 'Frogfoot', 'Vuma', 'MetroFibre', 'PPHG', 'Lightstruck'];
    
    for (const provider of providers) {
      if (title.toLowerCase().includes(provider.toLowerCase())) {
        return provider;
      }
    }
    
    // If no known provider found, try to extract from title
    const parts = title.split(' ');
    return parts[0] || 'Other';
  };

  const handleProviderSelect = (index) => {
    setCurrentProviderIndex(index);
    scrollToProvider(index);
  };

  const scrollToProvider = (index) => {
    if (!providerSliderRef.current || !providers[index]) return;
    
    setIsScrolling(true);
    
    const slider = providerSliderRef.current;
    const cards = slider.querySelectorAll('.provider-card');
    const card = cards[index];
    
    if (card) {
      const sliderRect = slider.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      
      const cardCenter = card.offsetLeft + (cardRect.width / 2);
      const sliderCenter = sliderRect.width / 2;
      const targetScrollLeft = cardCenter - sliderCenter;
      
      slider.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
    }
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 500);
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
        name: `${providers[currentProviderIndex].name} ${pkg.speed}`,
        price: pkg.effective_price || pkg.price,
        provider: providers[currentProviderIndex].name,
        download: pkg.speed,
        upload: pkg.upload_speed || pkg.speed
      };
      
      sessionStorage.setItem('selectedPackage', JSON.stringify(selectedPackage));
      
      // Navigate to signup page
      window.location.href = `https://starcast.co.za/signup/?package_id=${pkg.id}`;
    } catch (error) {
      console.error('Error storing package:', error);
      window.location.href = `https://starcast.co.za/signup/?package_id=${pkg.id}`;
    }
  };

  if (loading) {
    return (
      <div className="fibre-page">
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading fibre packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fibre-page">
        <div className="error-container">
          <h2>Error Loading Packages</h2>
          <p>{error}</p>
          <button onClick={fetchFibrePackages} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentProvider = providers[currentProviderIndex];

  return (
    <div className="fibre-page">
      <header className="fibre-header">
        <div className="container">
          <h1 className="heading-gradient">
            Uncapped Fibre. <span>Installed Within 7 Days.</span>
          </h1>
          <p className="subheading">For Home and Business. Pro Rata Rates Apply.</p>
        </div>
      </header>

      <section className="fibre-section">
        <div className="container">
          <div className="title-container">
            <h2 className="section-title">Choose a Fibre Network</h2>
          </div>
          
          {providers.length > 0 ? (
            <>
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
              
              <div className="provider-indicators">
                {providers.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentProviderIndex ? 'active' : ''}`}
                    onClick={() => handleProviderSelect(index)}
                  />
                ))}
              </div>
              
              <div className="packages-grid">
                {currentProvider && currentProvider.packages.length > 0 ? (
                  currentProvider.packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      provider={currentProvider}
                      onSelect={handlePackageSelect}
                    />
                  ))
                ) : (
                  <div className="no-packages">
                    No packages found for this provider.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-packages">
              No providers available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FibrePage; 