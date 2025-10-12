/**
 * ============================================================================
 * SCRIPT.JS - Interacciones Principales
 * Landing Page Pañales Prematuros
 * ============================================================================
 * Smooth scroll, animaciones, formularios, FAQ, etc.
 * Version: 1.0.1 - FIXED
 * ============================================================================
 */

(function() {
  'use strict';
  
  // ============================================
  // CONFIGURACIÓN
  // ============================================
  
  const CONFIG = {
    FORM_ENDPOINT: '[PLACEHOLDER_FORM_ENDPOINT]',
    THANKYOU_URL: '[PLACEHOLDER_THANKYOU_URL]',
    DEBUG: true, // Activado para debugging
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 80,
  };
  
  
  // ============================================
  // 1. SMOOTH SCROLL
  // ============================================
  
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Ignore empty anchors
        if (href === '#' || href === '#!') {
          e.preventDefault();
          return;
        }
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - CONFIG.SCROLL_OFFSET;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log(`✅ Smooth scroll activado en ${links.length} links`);
    }
  }
  
  
  // ============================================
  // 2. SCROLL ANIMATIONS (Intersection Observer)
  // ============================================
  
  function initScrollAnimations() {
    // Fade-in observer for general elements
    const fadeElements = document.querySelectorAll('.fade-in-observer');
    
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => fadeObserver.observe(el));
    
    // Problem cards animation
    const problemCards = document.querySelectorAll('.problem-card');
    
    const problemObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          problemObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });
    
    problemCards.forEach(card => problemObserver.observe(card));
    
    // Infografía ahorro animation
    const infografia = document.querySelector('.infografia-ahorro');
    
    if (infografia) {
      const infografiaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            infografiaObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });
      
      infografiaObserver.observe(infografia);
    }
    
    // Stock progress bar animation
    const stockProgress = document.querySelector('.stock-progress');
    
    if (stockProgress) {
      const stockObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            stockObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.8
      });
      
      stockObserver.observe(stockProgress);
    }
    
    if (CONFIG.DEBUG) {
      console.log('✅ Scroll animations inicializadas');
    }
  }
  
  
  // ============================================
  // 3. FAQ ACCORDION
  // ============================================
  
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (CONFIG.DEBUG) {
      console.log(`🔍 FAQ items encontrados: ${faqItems.length}`);
    }
    
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');
      
      if (!trigger || !content) {
        if (CONFIG.DEBUG) {
          console.warn('⚠️ FAQ item sin trigger o content:', item);
        }
        return;
      }
      
      trigger.addEventListener('click', function() {
        const isActive = this.classList.contains('active');
        
        // Toggle active state
        this.classList.toggle('active');
        content.classList.toggle('active');
        item.classList.toggle('active');
        
        // Update ARIA
        this.setAttribute('aria-expanded', !isActive);
        
        // Adjust max-height for smooth animation
        if (!isActive) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
        
        if (CONFIG.DEBUG) {
          console.log(`FAQ ${isActive ? 'cerrado' : 'abierto'}:`, this.textContent.trim());
        }
      });
      
      // Keyboard accessibility
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log(`✅ FAQ accordion activado en ${faqItems.length} preguntas`);
    }
  }
  
  
  // ============================================
  // 4. FORMULARIOS
  // ============================================
  
  function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Prevent double submission
        if (this.classList.contains('submitting')) {
          return;
        }
        
        try {
          // Validate form
          if (!validateForm(this)) {
            return;
          }
          
          // Add loading state
          this.classList.add('submitting');
          const submitButton = this.querySelector('[type="submit"]');
          const originalButtonText = submitButton?.textContent;
          
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
          }
          
          // Prepare form data
          const formData = new FormData(this);
          
          // Submit form
          const response = await fetch(this.action || CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            // Success
            showFormMessage(this, 'success', '¡Gracias! Te contactaremos pronto.');
            this.reset();
            
            // Redirect to thank you page after delay
            setTimeout(() => {
              if (CONFIG.THANKYOU_URL && CONFIG.THANKYOU_URL !== '[PLACEHOLDER_THANKYOU_URL]') {
                window.location.href = CONFIG.THANKYOU_URL;
              }
            }, 2000);
          } else {
            // Error
            throw new Error('Error en el envío del formulario');
          }
        } catch (error) {
          console.error('Error:', error);
          showFormMessage(this, 'error', 'Hubo un error. Por favor, intenta de nuevo o contáctanos por WhatsApp.');
        } finally {
          // Remove loading state
          this.classList.remove('submitting');
          const submitButton = this.querySelector('[type="submit"]');
          
          if (submitButton && originalButtonText) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      });
      
      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateField(this);
        });
        
        input.addEventListener('input', function() {
          // Remove error state on input
          if (this.classList.contains('error')) {
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
          }
        });
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log(`✅ Forms inicializados: ${forms.length}`);
    }
  }
  
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('[required]');
    
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  function validateField(field) {
    const value = field.value.trim();
    let errorMessage = '';
    
    // Remove previous error
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Check if required
    if (field.hasAttribute('required') && !value) {
      errorMessage = 'Este campo es obligatorio';
    }
    
    // Validate email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = 'Email inválido';
      }
    }
    
    // Validate phone
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[0-9]{9,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errorMessage = 'Teléfono inválido';
      }
    }
    
    // Show error if any
    if (errorMessage) {
      field.classList.add('error');
      const errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      errorElement.textContent = errorMessage;
      errorElement.style.cssText = 'display: block; color: #E74C3C; font-size: 13px; margin-top: 4px;';
      field.parentElement.appendChild(errorElement);
      return false;
    }
    
    return true;
  }
  
  function showFormMessage(form, type, message) {
    // Remove existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      padding: 16px;
      margin-top: 16px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      background: ${type === 'success' ? '#D4EDDA' : '#F8D7DA'};
      color: ${type === 'success' ? '#155724' : '#721C24'};
      border: 1px solid ${type === 'success' ? '#C3E6CB' : '#F5C6CB'};
      animation: slideDown 0.3s ease-out;
    `;
    
    form.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }
  
  
  // ============================================
  // 5. STICKY CTA MOBILE
  // ============================================
  
  function initStickyCTA() {
    const stickyCTA = document.querySelector('.cta-sticky-mobile');
    if (!stickyCTA) return;
    
    const closeButton = stickyCTA.querySelector('.sticky-close');
    const ctaFinalSection = document.querySelector('.cta-final-wrapper');
    
    if (!ctaFinalSection) return;
    
    // Show/hide based on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Hide sticky when final CTA is visible
          stickyCTA.classList.remove('show');
        } else if (window.scrollY > window.innerHeight * 0.7) {
          // Show sticky after scrolling 70% of viewport
          const isClosed = sessionStorage.getItem('stickyCTAClosed');
          if (!isClosed) {
            stickyCTA.classList.add('show');
          }
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(ctaFinalSection);
    
    // Close button
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        stickyCTA.classList.remove('show');
        sessionStorage.setItem('stickyCTAClosed', 'true');
      });
    }
    
    if (CONFIG.DEBUG) {
      console.log('✅ Sticky CTA mobile inicializado');
    }
  }
  
  
  // ============================================
  // 6. BADGE STICKY MOBILE (Hero)
  // ============================================
  
  function initStickyBadge() {
    const badge = document.querySelector('.badge-special');
    if (!badge || window.innerWidth >= 768) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100 && currentScroll > lastScroll) {
        // Scrolling down
        badge.style.opacity = '0.9';
      } else if (currentScroll < 50) {
        // At top
        badge.style.opacity = '1';
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Sticky badge inicializado');
    }
  }
  
  
  // ============================================
  // 7. LAZY LOADING IMAGES
  // ============================================
  
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      if (CONFIG.DEBUG) {
        console.log('✅ Native lazy loading soportado');
      }
      return;
    }
    
    // Fallback for browsers that don't support lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    if (CONFIG.DEBUG) {
      console.log(`✅ Lazy loading fallback activado para ${images.length} imágenes`);
    }
  }
  
  
  // ============================================
  // 8. WHATSAPP FLOAT BUTTON
  // ============================================
  
  function initWhatsAppFloat() {
    const waButton = document.querySelector('.whatsapp-float');
    if (!waButton) return;
    
    // Show after 5 seconds or 30% scroll
    let shown = false;
    
    function showWhatsApp() {
      if (!shown) {
        waButton.style.opacity = '0';
        waButton.style.display = 'flex';
        setTimeout(() => {
          waButton.style.transition = 'opacity 0.3s ease-out';
          waButton.style.opacity = '1';
        }, 100);
        shown = true;
      }
    }
    
    // Show after delay
    setTimeout(showWhatsApp, 5000);
    
    // Show on scroll
    window.addEventListener('scroll', function() {
      if (window.scrollY > window.innerHeight * 0.3) {
        showWhatsApp();
      }
    }, { passive: true, once: true });
    
    if (CONFIG.DEBUG) {
      console.log('✅ WhatsApp float button inicializado');
    }
  }
  
  
  // ============================================
  // 9. GALLERY LIGHTBOX
  // ============================================
  
  function initGalleryLightbox() {
    const galleryImages = document.querySelectorAll('.gallery-image img');
    
    galleryImages.forEach(img => {
      img.addEventListener('click', function() {
        openLightbox(this.src, this.alt);
      });
      
      // Keyboard accessibility
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Ampliar imagen');
      
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(this.src, this.alt);
        }
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log(`✅ Gallery lightbox activado en ${galleryImages.length} imágenes`);
    }
  }
  
  function openLightbox(src, alt) {
    // Create lightbox overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      cursor: zoom-out;
      animation: fadeIn 0.3s ease-out;
    `;
    
    // Create image
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: zoomIn 0.3s ease-out;
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Cerrar lightbox');
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      font-size: 32px;
      line-height: 1;
      color: #333;
      cursor: pointer;
      transition: background 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'white';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    });
    
    // Assemble lightbox
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    
    // Close handlers
    function closeLightbox() {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('no-scroll');
      }, 300);
    }
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeLightbox();
      }
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeLightbox();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }
  
  
  // ============================================
  // 10. TOUCH INTERACTIONS (Mobile)
  // ============================================
  
  function initTouchInteractions() {
    // Add touch-active class for better mobile feedback
    const interactiveElements = document.querySelectorAll('.btn, .faq-trigger, .card, a');
    
    interactiveElements.forEach(el => {
      el.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      }, { passive: true });
      
      el.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 150);
      });
      
      el.addEventListener('touchcancel', function() {
        this.classList.remove('touch-active');
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Touch interactions mejoradas');
    }
  }
  
  
  // ============================================
  // 11. VIEWPORT HEIGHT FIX (Mobile Safari)
  // ============================================
  
  function fixViewportHeight() {
    // Fix for mobile browsers (especially Safari)
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', debounce(setVH, 100));
    
    if (CONFIG.DEBUG) {
      console.log('✅ Viewport height fix aplicado');
    }
  }
  
  
  // ============================================
  // 12. DEBOUNCE UTILITY
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  
  // ============================================
  // 13. INIT ALL ON DOM READY
  // ============================================
  
  function initAll() {
    try {
      // Core functionality
      initSmoothScroll();
      initScrollAnimations();
      initFAQ();
      initForms();
      initStickyCTA();
      initStickyBadge();
      initLazyLoading();
      initWhatsAppFloat();
      initGalleryLightbox();
      initTouchInteractions();
      
      // Utilities
      fixViewportHeight();
      
      if (CONFIG.DEBUG) {
        console.log('✅ Todas las interacciones inicializadas correctamente');
        console.log('📄 Landing Page lista y funcional');
      }
    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
    }
  }
  
  
  // ============================================
  // START APPLICATION
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  
})();
