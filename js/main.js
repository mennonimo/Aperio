/**
 * APERIO — Interações, Micro-animações e Performance (Vanilla JS)
 * 60fps via IntersectionObserver, requestAnimationFrame e variáveis CSS.
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     1. BARRA DE PROGRESSO, HEADER COM BLUR E PARALLAX LEVE (rAF 60fps)
     ------------------------------------------------------------------------ */
  const progressBar = document.getElementById('readingProgressBar');
  const siteHeader = document.getElementById('siteHeader');
  const parallaxNodes = Array.from(document.querySelectorAll('[data-parallax]'));

  let scrollTicking = false;

  const updateOnScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollY > 24);
    }

    if (!prefersReducedMotion && parallaxNodes.length > 0 && window.innerWidth >= 768) {
      for (const el of parallaxNodes) {
        const speed = parseFloat(el.dataset.parallax || '0');
        const offset = Math.max(-140, Math.min(140, scrollY * speed));
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateOnScroll();

  /* ------------------------------------------------------------------------
     2. SCROLL REVEAL SUAVE COM STAGGER (IntersectionObserver)
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('is-visible');
            observer.unobserve(target);
            window.setTimeout(() => {
              target.style.setProperty('--delay', '0ms');
            }, 1100);
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------------
     3. BRILHO REATIVO NAS BORDAS DOS CARDS (SPOTLIGHT)
     ------------------------------------------------------------------------ */
  if (supportsFinePointer) {
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    spotlightCards.forEach((card) => {
      card.addEventListener(
        'pointermove',
        (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          card.style.setProperty('--mx', `${x.toFixed(1)}px`);
          card.style.setProperty('--my', `${y.toFixed(1)}px`);
        },
        { passive: true }
      );
    });
  }

  /* ------------------------------------------------------------------------
     4. HOVER MAGNÉTICO NOS BOTÕES DE CTA
     ------------------------------------------------------------------------ */
  if (supportsFinePointer && !prefersReducedMotion) {
    const magneticButtons = document.querySelectorAll('.btn-magnetic');

    magneticButtons.forEach((btn) => {
      const strength = btn.classList.contains('btn--header') ? 0.14 : 0.18;

      btn.addEventListener('pointermove', (event) => {
        const rect = btn.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        const moveX = Math.max(-10, Math.min(10, relX * strength));
        const moveY = Math.max(-7, Math.min(7, relY * strength));
        btn.style.transform = `translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0)`;
      });

      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. INCLINAÇÃO EDITORIAL SUAVE NO PAINEL PRISMA DO HERO
     ------------------------------------------------------------------------ */
  const heroPrism = document.getElementById('heroPrism');

  if (heroPrism && supportsFinePointer && !prefersReducedMotion) {
    const heroSection = heroPrism.closest('.hero');

    if (heroSection) {
      heroSection.addEventListener(
        'pointermove',
        (event) => {
          const rect = heroSection.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          const rotateY = nx * 7;
          const rotateX = -ny * 5;
          heroPrism.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        },
        { passive: true }
      );

      heroSection.addEventListener('pointerleave', () => {
        heroPrism.style.transform = '';
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. COMPARADOR INTERATIVO (NO CICLO DA TRAVA <-> COM O MÉTODO APERIO)
     ------------------------------------------------------------------------ */
  const contrastTabs = document.querySelectorAll('.contrast-tab');
  const contrastDisplay = document.getElementById('contrastDisplay');

  if (contrastTabs.length > 0 && contrastDisplay) {
    const values = contrastDisplay.querySelectorAll('.contrast-item__value');

    contrastTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetState = tab.dataset.state;
        if (!targetState || contrastDisplay.dataset.mode === targetState) return;

        contrastTabs.forEach((btn) => {
          const isActive = btn === tab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });

        contrastDisplay.classList.add('is-switching');

        window.setTimeout(() => {
          contrastDisplay.dataset.mode = targetState;
          values.forEach((el) => {
            const text = targetState === 'before' ? el.dataset.before : el.dataset.after;
            if (text) el.textContent = text;
          });
          contrastDisplay.classList.remove('is-switching');
        }, 140);
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. FAQ ACORDEÃO FLUIDO E ACESSÍVEL
     ------------------------------------------------------------------------ */
  const faqAccordion = document.getElementById('faqAccordion');

  if (faqAccordion) {
    const triggers = Array.from(faqAccordion.querySelectorAll('.faq-trigger'));

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const targetId = trigger.getAttribute('aria-controls');
        const targetPanel = targetId ? document.getElementById(targetId) : null;

        // Fecha os demais itens para manter a leitura focada
        triggers.forEach((other) => {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls') || '');
            if (otherPanel) otherPanel.classList.remove('is-open');
          }
        });

        const nextState = !isExpanded;
        trigger.setAttribute('aria-expanded', String(nextState));
        if (targetPanel) {
          targetPanel.classList.toggle('is-open', nextState);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. BARRA MÓVEL INTELIGENTE (OCULTA NO HERO E NA OFERTA/CTA FINAL)
     ------------------------------------------------------------------------ */
  const mobileBar = document.getElementById('mobileStickyCta');
  const heroEl = document.querySelector('.hero');
  const offerEl = document.getElementById('oferta');
  const finalCtaEl = document.querySelector('.section--final-cta');

  if (mobileBar && heroEl && 'IntersectionObserver' in window) {
    const visibleZones = new Set();
    const mobileBarLink = mobileBar.querySelector('a');

    const syncMobileBar = () => {
      const shouldShow = visibleZones.size === 0 && window.scrollY > 280;
      mobileBar.classList.toggle('is-visible', shouldShow);
      mobileBar.setAttribute('aria-hidden', String(!shouldShow));
      if (mobileBarLink) {
        mobileBarLink.tabIndex = shouldShow ? 0 : -1;
      }
    };

    const zoneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleZones.add(entry.target);
          } else {
            visibleZones.delete(entry.target);
          }
        });
        syncMobileBar();
      },
      { threshold: 0.15 }
    );

    [heroEl, offerEl, finalCtaEl].filter(Boolean).forEach((el) => zoneObserver.observe(el));
    window.addEventListener('scroll', syncMobileBar, { passive: true });
  }

  /* ------------------------------------------------------------------------
     9. MODAL INSTITUCIONAL LEVE (TERMOS DE USO & PRIVACIDADE)
     ------------------------------------------------------------------------ */
  const legalModal = document.getElementById('legalModal');
  const legalTitle = document.getElementById('legalModalTitle');
  const legalBody = document.getElementById('legalModalBody');

  const legalContent = {
    termos: {
      title: 'Termos de Uso — APERIO',
      paragraphs: [
        'Ao adquirir o curso APERIO através da plataforma Kiwify, você recebe acesso pessoal, intransferível e vitalício ao conteúdo educacional disponibilizado na área de membros.',
        'Todo o material didático, vídeos, exercícios e identidade visual são protegidos por direitos autorais. É proibida a reprodução, distribuição ou comercialização sem autorização prévia.',
        'O curso conta com Garantia Incondicional de 7 dias corridos a partir da confirmação da compra, podendo ser acionada diretamente na plataforma de pagamento para reembolso integral.',
      ],
    },
    privacidade: {
      title: 'Política de Privacidade — APERIO',
      paragraphs: [
        'Esta página tem caráter informativo e direciona o checkout com segurança para a plataforma Kiwify, responsável pelo processamento criptografado de dados cadastrais e de pagamento.',
        'Não coletamos nem armazenamos dados financeiros nesta página. O tratamento das informações fornecidas na inscrição segue a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
        'Caso tenha qualquer dúvida sobre seus dados ou acesso ao curso, utilize o canal de suporte disponível dentro da área de membros.',
      ],
    },
  };

  let lastFocusedEl = null;

  const openLegalModal = (type) => {
    const content = legalContent[type];
    if (!legalModal || !legalTitle || !legalBody || !content) return;

    lastFocusedEl = document.activeElement;
    legalTitle.textContent = content.title;
    legalBody.replaceChildren();

    content.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      legalBody.appendChild(p);
    });

    legalModal.hidden = false;
    document.body.style.overflow = 'hidden';

    const closeBtn = legalModal.querySelector('.legal-modal__close');
    if (closeBtn) closeBtn.focus();
  };

  const closeLegalModal = () => {
    if (!legalModal || legalModal.hidden) return;
    legalModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  };

  document.querySelectorAll('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', () => openLegalModal(btn.dataset.modalOpen));
  });

  document.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', closeLegalModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLegalModal();
  });

  /* ------------------------------------------------------------------------
     10. ANO ATUAL NO RODAPÉ
     ------------------------------------------------------------------------ */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
