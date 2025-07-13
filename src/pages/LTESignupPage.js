import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SignupForm from '../components/forms/SignupForm';
import LTEPackageSummary from '../components/common/LTEPackageSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { submitLTEApplication, validatePromoCode } from '../services/api';
import './LTESignupPage.css';

const LTESignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Get package ID and promo code from URL params
  const packageId = searchParams.get('package_id');
  const promoCode = searchParams.get('promo');

  useEffect(() => {
    // Load package data if package ID is provided
    if (packageId) {
      loadPackageData(packageId);
    } else {
      // Try to load from session storage
      const storedPackage = sessionStorage.getItem('selectedPackage');
      if (storedPackage) {
        try {
          const pkg = JSON.parse(storedPackage);
          setSelectedPackage(pkg);
        } catch (error) {
          console.error('Error parsing stored package:', error);
        }
      }
    }
  }, [packageId]);

  useEffect(() => {
    // Validate promo code if provided
    if (promoCode && (packageId || selectedPackage)) {
      validatePromo();
    }
  }, [promoCode, packageId, selectedPackage]);

  const loadPackageData = async (id) => {
    try {
      // Try to get from session storage first
      const storedPackage = sessionStorage.getItem('selectedPackage');
      if (storedPackage) {
        const pkg = JSON.parse(storedPackage);
        if (pkg.id === id || pkg.id === `default_${id}`) {
          setSelectedPackage(pkg);
          return;
        }
      }

      // If not found in storage, we could fetch from API
      // For now, show error message
      setErrorMessage('Package not found. Please go back and select a package.');
    } catch (error) {
      console.error('Error loading package data:', error);
      setErrorMessage('Error loading package information.');
    }
  };

  const validatePromo = async () => {
    try {
      const pkgId = packageId || selectedPackage?.id;
      if (!pkgId) return;

      const result = await validatePromoCode(promoCode, pkgId, 'lte');
      if (result.success) {
        setPromoData(result.data);
        setPromoError('');
      } else {
        setPromoError(result.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoError('Error validating promo code. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setSubmissionStatus(null);
    setErrorMessage('');

    try {
      const applicationData = {
        ...formData,
        package_id: packageId || selectedPackage?.id,
        package_type: 'lte',
        promo_code: promoCode || '',
        promo_data: promoData,
        package_data: selectedPackage
      };

      const result = await submitLTEApplication(applicationData);
      
      if (result.success) {
        setSubmissionStatus('success');
        setSuccessData({
          order_id: result.order_id,
          package_name: selectedPackage?.name || 'Selected Package'
        });
      } else {
        setSubmissionStatus('error');
        setErrorMessage(result.message || 'There was an error processing your application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmissionStatus('error');
      setErrorMessage('There was an error processing your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleBrowsePackages = () => {
    navigate('/package-selection');
  };

  if (loading) {
    return (
      <div className="lte-signup-page">
        <div className="container">
          <div className="signup-card">
            <LoadingSpinner size="large" />
            <p className="loading-text">Submitting your application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lte-signup-page">
      <div className="container">
        <div className="signup-card">
          <h2 className="signup-title">
            Complete Your <span>LTE Application</span>
          </h2>

          {submissionStatus === 'success' && successData && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Application Submitted Successfully!</h3>
              <p>
                Thank you for choosing our LTE service! Your application has been received and assigned reference number <strong>#{successData.order_id}</strong>.
              </p>
              
              <div className="next-steps">
                <h4>What happens next?</h4>
                <ol>
                  <li>Our team will review your application within 24 hours</li>
                  <li>We'll check LTE coverage in your area</li>
                  <li>You'll receive an email with account access once approved</li>
                  <li>Device delivery or collection typically within 3-5 days</li>
                </ol>
              </div>
              
              <div className="contact-info">
                <p>Questions? Contact us at <a href="mailto:starcast.tech@gmail.com">starcast.tech@gmail.com</a></p>
              </div>

              <div className="return-actions">
                <button onClick={handleReturnHome} className="btn-secondary">
                  Return to Home
                </button>
                <button onClick={handleBrowsePackages} className="btn-primary">
                  Browse More Packages
                </button>
              </div>
            </div>
          )}

          {submissionStatus === 'error' && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {submissionStatus !== 'success' && (
            <>
              {!selectedPackage && !packageId && (
                <div className="warning-message">
                  <p>No package selected. Please <a href="/package-selection" className="link-highlight">return to the package selection page</a> and select a package first.</p>
                </div>
              )}

              {selectedPackage && (
                <LTEPackageSummary 
                  package={selectedPackage} 
                  promoData={promoData}
                  promoError={promoError}
                  promoCode={promoCode}
                />
              )}

              <SignupForm 
                onSubmit={handleFormSubmit}
                disabled={!selectedPackage}
                loading={loading}
                packageType="lte"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LTESignupPage; 