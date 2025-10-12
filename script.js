/**
 * ============================================================================
 * SCRIPT.JS - Interacciones Principales
 * Landing Page Pañales Prematuros
 * ============================================================================
 * Smooth scroll, animaciones, formularios, FAQ, etc.
 * Version: 1.0.0
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
    DEBUG: false,
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
      console.log('✅ Smooth scroll activado en ${links.length} links');
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
    
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');
      
      if (!trigger || !content) return;
      
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
      console.log('✅ FAQ accordion activado en ${faqItems.length} preguntas');
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
      console.log('✅ Forms inicializados: ${forms.length}');
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
    messageEl.className = 'form-message form-message-${type}';
    messageEl.textContent = message;
    messageEl.style.cssText = '
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
    ';
    
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
      console.log('✅ Lazy loading fallback activado para ${images.length} imágenes');
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
	function openLightbox(src, alt) {
// Create lightbox overlay
const overlay = document.createElement('div');
overlay.className = 'lightbox-overlay';
overlay.style.cssText = position: fixed;top: 0;left: 0;right: 0;bottom: 0;background: rgba(0, 0, 0, 0.9);z-index: 10000;display: flex;align-items: center;justify-content: center;padding: 20px;cursor: zoom-out;animation:fadeIn 0.3s ease-out;;
// Create image
const img = document.createElement('img');
img.src = src;
img.alt = alt;
img.style.cssText = '
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s ease-out;
';

// Create close button
const closeBtn = document.createElement('button');
closeBtn.innerHTML = '&times;';
closeBtn.setAttribute('aria-label', 'Cerrar lightbox');
closeBtn.style.cssText = '
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
';

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
// 10. SCROLL PROGRESS INDICATOR (opcional)
// ============================================
function initScrollProgress() {
// Check if element exists
let progressBar = document.querySelector('.scroll-progress');
if (!progressBar) {
  // Create it if it doesn't exist
  progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
}

function updateProgress() {
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress(); // Initial call

if (CONFIG.DEBUG) {
  console.log('✅ Scroll progress indicator inicializado');
}
}
// ============================================
// 11. TOUCH INTERACTIONS (Mobile)
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
// 12. COPY TO CLIPBOARD (si se usa en futuro)
// ============================================
function initCopyToClipboard() {
const copyButtons = document.querySelectorAll('[data-copy]');
copyButtons.forEach(button => {
  button.addEventListener('click', async function() {
    const textToCopy = this.getAttribute('data-copy');
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Show feedback
      const originalText = this.textContent;
      this.textContent = '¡Copiado!';
      setTimeout(() => {
        this.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  });
});

if (CONFIG.DEBUG && copyButtons.length > 0) {
  console.log('✅ Copy to clipboard en ${copyButtons.length} elementos`);
}
}
// ============================================
// 13. PERFORMANCE MONITORING
// ============================================
function monitorPerformance() {
if (!CONFIG.DEBUG) return;
// Page load time
window.addEventListener('load', function() {
  const perfData = performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('⏱️ Tiempo de carga: ${pageLoadTime}ms');
});

// First Contentful Paint
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('🎨 First Contentful Paint: ${entry.startTime}ms');
      }
    }
  });
  
  observer.observe({ entryTypes: ['paint'] });
}
}
// ============================================
// 14. ERROR HANDLING & FALLBACKS
// ============================================
function setupErrorHandling() {
// Global error handler (already tracked in analytics.js)
window.addEventListener('error', function(e) {
if (CONFIG.DEBUG) {
console.error('❌ JavaScript Error:', e.message, e.filename, e.lineno);
}
});
// Unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
  if (CONFIG.DEBUG) {
    console.error('❌ Unhandled Promise Rejection:', e.reason);
  }
});
}
// ============================================
// 15. MOBILE MENU (si existe navegación)
// ============================================
function initMobileMenu() {
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLinks = document.querySelectorAll('.mobile-menu a');
if (!menuToggle || !mobileMenu) return;

// Toggle menu
menuToggle.addEventListener('click', function() {
  const isOpen = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', !isOpen);
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

// Close on link click
menuLinks.forEach(link => {
  link.addEventListener('click', function() {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

// Close on outside click
document.addEventListener('click', function(e) {
  if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
});

// Close on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
});

if (CONFIG.DEBUG) {
  console.log('✅ Mobile menu inicializado');
}
}
// ============================================
// 16. DEBOUNCE & THROTTLE UTILITIES
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
function throttle(func, limit) {
let inThrottle;
return function(...args) {
if (!inThrottle) {
func.apply(this, args);
inThrottle = true;
setTimeout(() => inThrottle = false, limit);
}
};
}
// ============================================
// 17. VIEWPORT HEIGHT FIX (Mobile Safari)
// ============================================
function fixViewportHeight() {
// Fix for mobile browsers (especially Safari)
const setVH = () => {
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', ${vh}px);
};
setVH();
window.addEventListener('resize', debounce(setVH, 100));

if (CONFIG.DEBUG) {
  console.log('✅ Viewport height fix aplicado');
}
}
// ============================================
// 18. PREFETCH CRITICAL RESOURCES
// ============================================
function prefetchResources() {
// Prefetch thank you page if defined
if (CONFIG.THANKYOU_URL && CONFIG.THANKYOU_URL !== '[PLACEHOLDER_THANKYOU_URL]') {
const link = document.createElement('link');
link.rel = 'prefetch';
link.href = CONFIG.THANKYOU_URL;
document.head.appendChild(link);
}
if (CONFIG.DEBUG) {
  console.log('✅ Recursos críticos prefetched');
}
}
// ============================================
// 19. ACCESSIBILITY ENHANCEMENTS
// ============================================
function enhanceAccessibility() {
// Add skip to content link if not exists
if (!document.querySelector('.skip-to-content')) {
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-to-content';
skipLink.textContent = 'Saltar al contenido';
document.body.insertBefore(skipLink, document.body.firstChild);
}
// Ensure all images have alt text
const images = document.querySelectorAll('img:not([alt])');
images.forEach(img => {
  img.setAttribute('alt', '');
  if (CONFIG.DEBUG) {
    console.warn('⚠️ Imagen sin alt text:', img.src);
  }
});

// Add ARIA labels to buttons without text
const buttons = document.querySelectorAll('button:not([aria-label])');
buttons.forEach(btn => {
  if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
    if (CONFIG.DEBUG) {
      console.warn('⚠️ Botón sin texto ni aria-label:', btn);
    }
  }
});

if (CONFIG.DEBUG) {
  console.log('✅ Accessibility enhancements aplicados');
}
}
// ============================================
// 20. INIT ALL ON DOM READY
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
initCopyToClipboard();
initMobileMenu();
  // Optional enhancements
  // initScrollProgress(); // Descomentar si se desea barra de progreso
  
  // Utilities
  fixViewportHeight();
  prefetchResources();
  enhanceAccessibility();
  setupErrorHandling();
  monitorPerformance();
  
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
// ============================================
// EXPORT FOR DEBUGGING (Development only)
// ============================================
if (CONFIG.DEBUG) {
window.LandingPage = {
config: CONFIG,
utils: {
debounce,
throttle
},
reinit: initAll
};
console.log('🔧 Debug mode activo. Accede a window.LandingPage para utilities');
}
})();
// ============================================================================
// INLINE CSS ANIMATIONS (Complemento al CSS externo)
// ============================================================================
const style = document.createElement('style');
style.textContent = '
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}
@keyframes fadeOut {
from { opacity: 1; }
to { opacity: 0; }
}
@keyframes zoomIn {
from {
opacity: 0;
transform: scale(0.9);
}
to {
opacity: 1;
transform: scale(1);
}
}
@keyframes slideDown {
from {
opacity: 0;
transform: translateY(-10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
/* Touch active state */
.touch-active {
opacity: 0.7;
transform: scale(0.98);
}
/* Form error state */
input.error,
textarea.error,
select.error {
border-color: #E74C3C !important;
background-color: #FFEBEE;
}
/* Loading spinner para botones */
.btn.submitting::after {
content: '';
width: 16px;
height: 16px;
margin-left: 8px;
border: 2px solid transparent;
border-top-color: currentColor;
border-radius: 50%;
display: inline-block;
animation: spin 0.6s linear infinite;
vertical-align: middle;
}
@keyframes spin {
to { transform: rotate(360deg); }
}
/* No scroll when modal/menu open */
body.no-scroll,
body.menu-open {
overflow: hidden;
}
/* Focus visible enhancement */
*:focus-visible {
outline: 3px solid var(--primary, #E8B4A8);
outline-offset: 3px;
}
';
document.head.appendChild(style);