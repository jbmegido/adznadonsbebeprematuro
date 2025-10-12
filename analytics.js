/**
 * ============================================================================
 * ANALYTICS.JS - Tracking y Analytics
 * Landing Page Pañales Prematuros
 * ============================================================================
 * Google Analytics 4 + Event Tracking
 * Version: 1.0.0
 * ============================================================================
 */

(function() {
  'use strict';
  
  // ============================================
  // CONFIGURACIÓN
  // ============================================
  
  const CONFIG = {
    GA4_ID: '[PLACEHOLDER_GA4_ID]',
    DEBUG: false, // Cambiar a true para ver logs en desarrollo
  };
  
  
  // ============================================
  // INICIALIZACIÓN GOOGLE ANALYTICS 4
  // ============================================
  
  function initGA4() {
    if (!CONFIG.GA4_ID || CONFIG.GA4_ID === '[PLACEHOLDER_GA4_ID]') {
      console.warn('⚠️ Google Analytics ID no configurado');
      return;
    }
    
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', CONFIG.GA4_ID, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      send_page_view: true
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ GA4 inicializado:', CONFIG.GA4_ID);
    }
  }
  
  
  // ============================================
  // TRACKING DE EVENTOS
  // ============================================
  
  /**
   * Envía evento a GA4
   */
  function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'undefined') {
      console.warn('⚠️ gtag no disponible');
      return;
    }
    
    gtag('event', eventName, eventParams);
    
    if (CONFIG.DEBUG) {
      console.log('📊 Evento:', eventName, eventParams);
    }
  }
  
  
  // ============================================
  // TRACKING DE CTAs
  // ============================================
  
  function trackCTAClicks() {
    const ctaButtons = document.querySelectorAll('[data-cta]');
    
    ctaButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ctaLabel = this.getAttribute('data-cta');
        const ctaText = this.textContent.trim();
        const ctaLocation = getElementLocation(this);
        
        trackEvent('cta_click', {
          event_category: 'CTA',
          event_label: ctaLabel,
          cta_text: ctaText,
          cta_location: ctaLocation,
          value: 1
        });
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Tracking activado en ${ctaButtons.length} CTAs');
    }
  }
  
  
  // ============================================
  // TRACKING DE FORMULARIOS
  // ============================================
  
  function trackForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Track form start (primer focus en input)
      let formStarted = false;
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('focus', function() {
          if (!formStarted) {
            formStarted = true;
            trackEvent('form_start', {
              event_category: 'Form',
              event_label: form.id || 'contact_form',
              form_name: form.getAttribute('name') || form.id
            });
          }
        });
      });
      
      // Track form submit
      form.addEventListener('submit', function() {
        trackEvent('generate_lead', {
          event_category: 'Form',
          event_label: form.id || 'contact_form',
          form_name: form.getAttribute('name') || form.id,
          currency: 'EUR',
          value: 100
        });
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Tracking activado en ${forms.length} formularios');
    }
  }
  
  
  // ============================================
  // TRACKING DE SCROLL DEPTH
  // ============================================
  
  function trackScrollDepth() {
    let maxScroll = 0;
    const scrollThresholds = { 25: false, 50: false, 75: false, 100: false };
    let ticking = false;
    
    function calculateScroll() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || window.pageYOffset;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        Object.keys(scrollThresholds).forEach(threshold => {
          const thresholdNum = parseInt(threshold);
          if (scrollPercent >= thresholdNum && !scrollThresholds[threshold]) {
            scrollThresholds[threshold] = true;
            
            trackEvent('scroll_depth', {
              event_category: 'Engagement',
              event_label: threshold + '%',
              value: thresholdNum,
              max_scroll: maxScroll
            });
          }
        });
      }
      
      ticking = false;
    }
    
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(calculateScroll);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Scroll depth tracking activado');
    }
  }
  
  
  // ============================================
  // TRACKING DE TIEMPO EN PÁGINA
  // ============================================
  
  function trackTimeOnPage() {
    const startTime = Date.now();
    let timeTracked = { 30: false, 60: false, 120: false, 300: false };
    
    const interval = setInterval(function() {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      Object.keys(timeTracked).forEach(threshold => {
        const thresholdNum = parseInt(threshold);
        if (elapsedSeconds >= thresholdNum && !timeTracked[threshold]) {
          timeTracked[threshold] = true;
          
          trackEvent('time_on_page', {
            event_category: 'Engagement',
            event_label: threshold + 's',
            value: thresholdNum
          });
        }
      });
      
      // Stop tracking after 5 minutes
      if (elapsedSeconds > 300) {
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds
    
    if (CONFIG.DEBUG) {
      console.log('✅ Time on page tracking activado');
    }
  }
  
  
  // ============================================
  // TRACKING DE CLICKS EN LINKS EXTERNOS
  // ============================================
  
  function trackExternalLinks() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Check if external link
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        trackEvent('outbound_link', {
          event_category: 'Navigation',
          event_label: href,
          link_text: link.textContent.trim(),
          link_domain: new URL(href).hostname
        });
      }
      
      // Track WhatsApp links specifically
      if (href.includes('wa.me') || href.includes('whatsapp')) {
        trackEvent('contact_whatsapp', {
          event_category: 'Contact',
          event_label: 'WhatsApp Click',
          link_location: getElementLocation(link)
        });
      }
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ External links tracking activado');
    }
  }
  
  
  // ============================================
  // TRACKING DE INTERACCIONES CON FAQ
  // ============================================
  
  function trackFAQInteractions() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    
    faqTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', function() {
        const questionText = this.textContent.trim().replace('❓ ', '');
        const isExpanding = !this.classList.contains('active');
        
        if (isExpanding) {
          trackEvent('faq_opened', {
            event_category: 'FAQ',
            event_label: questionText,
            question_id: 'faq_${index + 1}',
            value: index + 1
          });
        }
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ FAQ tracking activado en ${faqTriggers.length} preguntas');
    }
  }
  
  
  // ============================================
  // TRACKING DE HOVER EN ELEMENTOS CLAVE
  // ============================================
  
  function trackFeatureHovers() {
    const features = document.querySelectorAll('.feature-card, .benefit-card');
    const hoverTime = {};
    
    features.forEach((feature, index) => {
      const featureId = 'feature_${index + 1}';
      
      feature.addEventListener('mouseenter', function() {
        hoverTime[featureId] = Date.now();
      });
      
      feature.addEventListener('mouseleave', function() {
        if (hoverTime[featureId]) {
          const duration = Date.now() - hoverTime[featureId];
          
          // Only track hovers longer than 1 second
          if (duration > 1000) {
            const featureTitle = this.querySelector('h3')?.textContent.trim() || featureId;
            
            trackEvent('feature_hover', {
              event_category: 'Engagement',
              event_label: featureTitle,
              feature_id: featureId,
              hover_duration: Math.round(duration / 1000),
              value: Math.round(duration / 1000)
            });
          }
          
          delete hoverTime[featureId];
        }
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ Feature hover tracking activado en ${features.length} elementos');
    }
  }
  
  
  // ============================================
  // TRACKING DE VISIBILIDAD DE SECCIONES
  // ============================================
  
  function trackSectionVisibility() {
    const sections = document.querySelectorAll('section[id]');
    const sectionTimes = {};
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;
        
        if (entry.isIntersecting) {
          // Section entered viewport
          sectionTimes[sectionId] = Date.now();
        } else if (sectionTimes[sectionId]) {
          // Section left viewport
          const duration = Date.now() - sectionTimes[sectionId];
          
          // Only track if visible for more than 2 seconds
          if (duration > 2000) {
            trackEvent('section_view', {
              event_category: 'Engagement',
              event_label: sectionId,
              section_name: sectionId,
              view_duration: Math.round(duration / 1000),
              value: Math.round(duration / 1000)
            });
          }
          
          delete sectionTimes[sectionId];
        }
      });
    }, {
      threshold: 0.5 // Section must be 50% visible
    });
    
    sections.forEach(section => observer.observe(section));
    
    if (CONFIG.DEBUG) {
      console.log('✅ Section visibility tracking activado en ${sections.length} secciones');
    }
  }
  
  
  // ============================================
  // TRACKING DE ERRORES JAVASCRIPT
  // ============================================
  
  function trackJavaScriptErrors() {
    window.addEventListener('error', function(e) {
      trackEvent('javascript_error', {
        event_category: 'Error',
        event_label: e.message,
        error_message: e.message,
        error_filename: e.filename,
        error_line: e.lineno,
        error_column: e.colno,
        non_interaction: true
      });
    });
    
    if (CONFIG.DEBUG) {
      console.log('✅ JavaScript error tracking activado');
    }
  }
  
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtiene la ubicación de un elemento en la página
   */
  function getElementLocation(element) {
    const section = element.closest('section');
    if (section && section.id) {
      return section.id;
    }
    
    const classList = element.classList;
    if (classList.contains('hero-section')) return 'hero';
    if (classList.contains('cta-sticky-mobile')) return 'sticky_mobile';
    if (classList.contains('whatsapp-float')) return 'floating_button';
    
    return 'unknown';
  }
  
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  function init() {
    try {
      // Initialize GA4
      initGA4();
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
      } else {
        initTracking();
      }
    } catch (error) {
      console.error('❌ Error inicializando analytics:', error);
    }
  }
  
  function initTracking() {
    try {
      trackCTAClicks();
      trackForms();
      trackScrollDepth();
      trackTimeOnPage();
      trackExternalLinks();
      trackFAQInteractions();
      trackFeatureHovers();
      trackSectionVisibility();
      trackJavaScriptErrors();
      
      if (CONFIG.DEBUG) {
        console.log('✅ Analytics completamente inicializado');
      }
    } catch (error) {
      console.error('❌ Error inicializando tracking:', error);
    }
  }
  
  // Start initialization
  init();
  
})();