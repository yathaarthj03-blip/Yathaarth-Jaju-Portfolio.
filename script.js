/* ==========================================================================
   Portfolio – Main JavaScript
   Premium interactive features for Yathaarth's portfolio website.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------------------
     Utility: Debounce
     Limits how often a function fires during rapid events like scroll.
  -------------------------------------------------------------------- */
  const debounce = (fn, delay = 16) => {
    let frame;
    return (...args) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fn(...args));
    };
  };

  /* --------------------------------------------------------------------
     Utility: Clamp
     Constrains a value between a minimum and maximum.
  -------------------------------------------------------------------- */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* ====================================================================
     1. PAGE LOAD ANIMATION
     Adds 'loaded' class to body after a brief delay so CSS transitions
     can orchestrate the initial page reveal.
  ==================================================================== */
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);

  /* ====================================================================
     2. NAVBAR SCROLL EFFECT
     Toggles a 'scrolled' class on the navbar when the user scrolls past
     50 px, enabling a visual background / shadow change via CSS.
  ==================================================================== */
  const navbar = document.querySelector('.navbar');

  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  // Run once on load so the class is correct if the page loads mid-scroll
  handleNavbarScroll();

  /* ====================================================================
     3. MOBILE MENU TOGGLE
     Hamburger button opens / closes the mobile navigation overlay.
     Each mobile link also closes the menu on tap.
  ==================================================================== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
  }

  /* ====================================================================
     4. SMOOTH SCROLL
     Intercepts all anchor links pointing to on-page sections and
     scrolls smoothly instead of jumping. Also closes mobile menu.
  ==================================================================== */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Ignore bare "#" links
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Close mobile menu if it happens to be open
      if (hamburger && mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  });

  /* ====================================================================
     5. SCROLL REVEAL ANIMATION (Intersection Observer)
     Elements with class 'reveal' fade / slide in as they enter the
     viewport. The 'revealed' class triggers CSS transitions.
  ==================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ====================================================================
     6. STATS COUNTER ANIMATION
     Counts numeric stat values from 0 → data-target using an
     easeOutQuart curve over 2 seconds. Each counter fires only once.
  ==================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  if (statNumbers.length > 0) {
    /** easeOutQuart: fast start, smooth deceleration */
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const duration = 2000; // 2 seconds
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.round(easedProgress * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Ensure we land exactly on the target
          el.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target); // fire only once
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  /* ====================================================================
     7. 3D CARD TILT EFFECT
     Service cards respond to cursor position with a subtle 3D rotation,
     creating a parallax-like depth effect.
  ==================================================================== */
  const serviceCards = document.querySelectorAll('.service-card');

  if (serviceCards.length > 0) {
    const MAX_ROTATION = 8; // degrees

    serviceCards.forEach((card) => {
      // Ensure the card renders in 3D space
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mouseenter', () => {
        // Add a smooth entry transition
        card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        // Normalise cursor position to –1 … +1 relative to card center
        const normalX = (e.clientX - cardCenterX) / (rect.width / 2);
        const normalY = (e.clientY - cardCenterY) / (rect.height / 2);

        // Clamp to prevent extreme values if cursor is near edges
        const rotateY = clamp(normalX * MAX_ROTATION, -MAX_ROTATION, MAX_ROTATION);
        const rotateX = clamp(-normalY * MAX_ROTATION, -MAX_ROTATION, MAX_ROTATION);

        // Apply a small tracking transition to keep movement buttery smooth
        card.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });

      card.addEventListener('mouseleave', () => {
        // Smooth transition back to resting state
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.transform = 'none';
      });

      card.addEventListener('click', (e) => {
        if (e.target.closest('.work-popup-item')) {
          e.stopPropagation();
          return;
        }
        const isCurrentlyActive = card.classList.contains('active');
        serviceCards.forEach(c => c.classList.remove('active'));
        if (!isCurrentlyActive) {
          card.classList.add('active');
        }
        e.stopPropagation();
      });
    });

    document.addEventListener('click', () => {
      serviceCards.forEach(card => card.classList.remove('active'));
    });
  }

  /* ====================================================================
     8. HERO NAME PARALLAX
     The hero name drifts horizontally as the user scrolls, creating a
     layered parallax feel. Only active while the hero section is visible.
  ==================================================================== */
  const heroNameScroll = document.querySelector('.hero-name-scroll');

  if (heroNameScroll) {
    let parallaxTicking = false;

    const updateHeroParallax = () => {
      heroNameScroll.style.transform = `translateX(-${window.scrollY * 0.4}px)`;
      parallaxTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!parallaxTicking) {
          requestAnimationFrame(updateHeroParallax);
          parallaxTicking = true;
        }
      },
      { passive: true }
    );
  }



  /* ====================================================================
     10. MAGNETIC SOCIAL LINKS
     Social icons are subtly attracted toward the cursor when it hovers
     nearby, then spring back on leave.
  ==================================================================== */
  const socialLinks = document.querySelectorAll('.social-link');

  if (socialLinks.length > 0) {
    const MAX_MAGNETIC_PULL = 5; // px

    socialLinks.forEach((link) => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const linkCenterX = rect.left + rect.width / 2;
        const linkCenterY = rect.top + rect.height / 2;

        // How far the cursor is from the element's centre
        const deltaX = e.clientX - linkCenterX;
        const deltaY = e.clientY - linkCenterY;

        // Normalise and clamp
        const moveX = clamp(
          (deltaX / (rect.width / 2)) * MAX_MAGNETIC_PULL,
          -MAX_MAGNETIC_PULL,
          MAX_MAGNETIC_PULL
        );
        const moveY = clamp(
          (deltaY / (rect.height / 2)) * MAX_MAGNETIC_PULL,
          -MAX_MAGNETIC_PULL,
          MAX_MAGNETIC_PULL
        );

        link.style.transition = 'transform 0.1s ease';
        link.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      link.addEventListener('mouseleave', () => {
        // Spring back with a bouncy easing
        link.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        link.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ====================================================================
     11. CONTACT FORM HANDLING
     Captures form data, logs it, and shows a brief success state before
     resetting. Replace console.log with a real API call in production.
  ==================================================================== */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameField = document.getElementById('name');
      const emailField = document.getElementById('email');
      const phoneField = document.getElementById('phone');
      const subjectField = document.getElementById('subject');
      const messageField = document.getElementById('message');

      const name = nameField ? nameField.value : '';
      const email = emailField ? emailField.value : '';
      const phone = phoneField ? phoneField.value : '';
      const subject = subjectField ? subjectField.value : '';
      const message = messageField ? messageField.value : '';

      const formattedText = `Hello Yathaarth,

You have a new inquiry from your portfolio website:

*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Subject:* ${subject}
*Message:* ${message}`;

      const whatsappUrl = `https://wa.me/917700014486?text=${encodeURIComponent(formattedText)}`;
      window.open(whatsappUrl, '_blank');

      // Visual success feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✓ Redirecting...';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = 'Send Message →';
          submitBtn.disabled = false;
        }, 3000);
      }

      contactForm.reset();
    });
  }

  /* ====================================================================
     12. ACTIVE NAV LINK HIGHLIGHTING
     As the user scrolls through sections, the corresponding navigation
     link receives an 'active' class for visual emphasis.
  ==================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length > 0 && sections.length > 0) {
    const ACTIVE_OFFSET = 150; // px from top considered "in view"

    const highlightActiveNav = () => {
      const scrollPos = window.scrollY + ACTIVE_OFFSET;
      let currentSectionId = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', debounce(highlightActiveNav), {
      passive: true,
    });
    // Initial highlight on load
    highlightActiveNav();
  }

  /* ====================================================================
     13. TICKER PAUSE ON HOVER
     The scrolling ticker / marquee animation pauses when the user hovers
     over it, allowing them to read the content.
  ==================================================================== */
  const tickerTrack = document.querySelector('.ticker-track');

  if (tickerTrack) {
    tickerTrack.addEventListener('mouseenter', () => {
      tickerTrack.style.animationPlayState = 'paused';
    });

    tickerTrack.addEventListener('mouseleave', () => {
      tickerTrack.style.animationPlayState = 'running';
    });
  }

  /* ====================================================================
     14. TYPEWRITER EFFECT
     Dynamically types out the hero headline text over 1.2 seconds.
  ==================================================================== */
  const heroHeadline = document.querySelector('.hero-headline');
  if (heroHeadline) {
    const text = "Technology & Finance Builder";
    heroHeadline.textContent = "";
    let charIndex = 0;
    const duration = 1200; // 1.2 seconds
    const interval = duration / text.length;
    let currentWordSpan = null;

    const type = () => {
      if (charIndex < text.length) {
        const char = text.charAt(charIndex);
        
        if (char === " ") {
          const spaceSpan = document.createElement('span');
          spaceSpan.innerHTML = "&nbsp;";
          spaceSpan.className = 'typewriter-char';
          heroHeadline.appendChild(spaceSpan);
          currentWordSpan = null;
        } else {
          if (!currentWordSpan) {
            currentWordSpan = document.createElement('span');
            currentWordSpan.className = 'typewriter-word';
            heroHeadline.appendChild(currentWordSpan);
          }
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'typewriter-char';
          currentWordSpan.appendChild(span);
        }
        
        charIndex++;
        setTimeout(type, interval);
      }
    };
    setTimeout(type, 300); // 300ms delay to align with fade-in
  }

  /* ====================================================================
     15. HERO IMAGE SLIDESHOW
     Blends and transitions identical profile photos every 2 seconds.
  ==================================================================== */
  const slides = document.querySelectorAll('.hero-slideshow .hero-image');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 2000);
  }
}); // end DOMContentLoaded
