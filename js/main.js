/**
 * APERIO — Coreografia de Animações (GSAP 3 + ScrollTrigger) & Interações
 * 60fps via transforms/opacity/clip-path, gsap.matchMedia() e fallback seguro.
 */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. BARRA DE PROGRESSO DE LEITURA & HEADER COM BLUR (rAF LEVE)
     ------------------------------------------------------------------------ */
  const progressBar = document.getElementById('readingProgressBar');
  const siteHeader = document.getElementById('siteHeader');
  let scrollTicking = false;

  const updateHeaderAndProgress = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollY > 24);
    }

    scrollTicking = false;
  };

  const requestScrollFrame = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateHeaderAndProgress);
    }
  };

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  updateHeaderAndProgress();

  /* ------------------------------------------------------------------------
     2. COMPARADOR INTERATIVO (NO CICLO DA TRAVA <-> COM O MÉTODO APERIO)
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
     3. FAQ ACORDEÃO FLUIDO E ACESSÍVEL
     ------------------------------------------------------------------------ */
  const faqAccordion = document.getElementById('faqAccordion');

  if (faqAccordion) {
    const triggers = Array.from(faqAccordion.querySelectorAll('.faq-trigger'));

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const targetId = trigger.getAttribute('aria-controls');
        const targetPanel = targetId ? document.getElementById(targetId) : null;

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
     4. BARRA MÓVEL INTELIGENTE (OCULTA NO HERO, NA OFERTA E NO CTA FINAL)
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
     5. MODAL INSTITUCIONAL LEVE (TERMOS DE USO & PRIVACIDADE)
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

  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     6. COREOGRAFIA GSAP 3 + SCROLLTRIGGER
        Nota de segurança: elementos ficam visíveis por padrão no CSS caso
        GSAP demore ou não carregue; toda animação só ativa após validação.
     ------------------------------------------------------------------------ */
  const initGsapChoreography = () => {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 960px)',
        canHover: '(any-hover: hover) and (any-pointer: fine)',
        isMobile: '(max-width: 959px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, canHover, reduceMotion } = context.conditions;

        // Respeita integralmente prefers-reduced-motion
        if (reduceMotion) {
          return;
        }

        const cleanups = [];

        /* ------------------------------------------------------------------
           6.1 ABERTURA CINEMATOGRÁFICA DA HERO (TIMELINE NO LOAD)
           ------------------------------------------------------------------ */
        const heroTl = gsap.timeline({
          defaults: { ease: 'power4.out' },
        });

        // Split-text reveal: linhas sobem de dentro da máscara invisível
        heroTl.from('.hero .split-line__inner', {
          yPercent: 112,
          duration: 1.05,
          stagger: 0.14,
          clearProps: 'transform',
        }, 0.08);

        // Tag pill, subheadline, CTA e selos entram sincronizados
        heroTl.from('[data-hero-fade]', {
          y: 24,
          opacity: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }, 0.12);

        // Abertura em fresta da foto (clip-path de dentro para fora + zoom-out)
        const heroPhotoFrame = document.getElementById('heroPhotoFrame');
        const heroPhotoImg = heroPhotoFrame ? heroPhotoFrame.querySelector('.hero-photo-frame__img') : null;

        if (heroPhotoFrame) {
          heroTl.fromTo(
            heroPhotoFrame,
            { clipPath: 'inset(0% 48% 0% 48% round 22px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 22px)',
              duration: 1.25,
              ease: 'power4.out',
              clearProps: 'clipPath',
            },
            0.18
          );
        }

        if (heroPhotoImg) {
          heroTl.fromTo(
            heroPhotoImg,
            { scale: 1.12 },
            {
              scale: 1,
              duration: 1.4,
              ease: 'power3.out',
              clearProps: 'transform',
            },
            0.18
          );
        }

        // Chip superior e micro-card glassmorphism entram por último
        const heroStatusChip = document.getElementById('heroStatusChip');
        const heroGlassCard = document.getElementById('heroGlassCard');

        if (heroStatusChip) {
          heroTl.from(heroStatusChip, {
            y: -18,
            opacity: 0,
            scale: 0.94,
            duration: 0.78,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }, 0.62);
        }

        if (heroGlassCard) {
          heroTl.from(heroGlassCard, {
            y: 28,
            opacity: 0,
            scale: 0.94,
            duration: 0.88,
            ease: 'power3.out',
            clearProps: 'opacity,scale',
          }, 0.74);

          // Flutuação contínua quase imperceptível após a entrada
          heroTl.add(() => {
            gsap.to(heroGlassCard, {
              y: -7,
              duration: 3.1,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
          }, '>-0.1');
        }

        /* ------------------------------------------------------------------
           6.2 TRANSIÇÃO DE TEMPERATURA NO SCROLL (ROXO -> LARANJA -> AMARELO)
           ------------------------------------------------------------------ */
        const coldOrb = document.getElementById('tempOrbCold');
        const warmOrb = document.getElementById('tempOrbWarm');
        const solarOrb = document.getElementById('tempOrbSolar');
        const pageMain = document.getElementById('pageMain');

        if (coldOrb && warmOrb && solarOrb && pageMain) {
          const tempTl = gsap.timeline({
            scrollTrigger: {
              trigger: pageMain,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.2,
            },
          });

          // Fase 1 (Hero -> Dores): atmosfera fria/contida em roxo se intensifica
          tempTl
            .to(coldOrb, { opacity: 0.92, scale: 1.16, xPercent: 8, yPercent: 10, duration: 0.28 }, 0)
            .to(warmOrb, { opacity: 0.22, scale: 1.0, duration: 0.28 }, 0)
            .to(solarOrb, { opacity: 0.08, duration: 0.28 }, 0)

            // Fase 2 (Virada de Chave -> Módulos 01/02): roxo recua e laranja aquece
            .to(coldOrb, { opacity: 0.22, scale: 0.88, xPercent: -10, duration: 0.36 }, 0.28)
            .to(warmOrb, { opacity: 0.88, scale: 1.18, xPercent: -14, yPercent: -8, duration: 0.36 }, 0.28)
            .to(solarOrb, { opacity: 0.38, scale: 1.05, duration: 0.36 }, 0.28)

            // Fase 3 (Módulo 03 -> Apresentador -> Oferta -> CTA Final): amarelo solar domina
            .to(coldOrb, { opacity: 0.08, duration: 0.36 }, 0.64)
            .to(warmOrb, { opacity: 0.64, xPercent: -6, yPercent: 8, duration: 0.36 }, 0.64)
            .to(solarOrb, { opacity: 0.92, scale: 1.24, yPercent: -16, duration: 0.36 }, 0.64);
        }

        // Parallax sutil na malha global e no fundo do Hero (desktop)
        const ambientGrid = document.getElementById('ambientGrid');
        if (ambientGrid && pageMain) {
          gsap.to(ambientGrid, {
            yPercent: isDesktop ? 6 : 3,
            ease: 'none',
            scrollTrigger: {
              trigger: pageMain,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.4,
            },
          });
        }

        if (isDesktop) {
          const heroBg = document.getElementById('heroBg');
          const heroBeam = document.getElementById('heroBeam');

          if (heroBg && heroEl) {
            gsap.to(heroBg, {
              y: 110,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            });
          }

          if (heroBeam && heroEl) {
            gsap.to(heroBeam, {
              y: -70,
              x: -30,
              ease: 'none',
              scrollTrigger: {
                trigger: heroEl,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            });
          }
        }

        /* ------------------------------------------------------------------
           6.3 BROKEN GRID VIVO NOS 3 MÓDULOS (ENTRADA + SCRUB EM CAMADAS)
           ------------------------------------------------------------------ */
        const modulesStaircase = document.getElementById('modulesStaircase');

        if (modulesStaircase) {
          const moduleCards = modulesStaircase.querySelectorAll('.module-card');

          gsap.from(moduleCards, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: modulesStaircase,
              start: 'top 84%',
              once: true,
            },
          });

          // Velocidades verticais distintas por coluna no desktop
          if (isDesktop) {
            const col1 = modulesStaircase.querySelector('.module-col--m1');
            const col2 = modulesStaircase.querySelector('.module-col--m2');
            const col3 = modulesStaircase.querySelector('.module-col--m3');

            const scrubConfig = {
              trigger: modulesStaircase,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.15,
            };

            if (col1) {
              gsap.fromTo(col1, { y: 34 }, { y: -16, ease: 'none', scrollTrigger: scrubConfig });
            }
            if (col2) {
              gsap.fromTo(col2, { y: 12 }, { y: -36, ease: 'none', scrollTrigger: scrubConfig });
            }
            if (col3) {
              gsap.fromTo(col3, { y: -14 }, { y: -62, ease: 'none', scrollTrigger: scrubConfig });
            }
          }
        }

        /* ------------------------------------------------------------------
           6.4 SEÇÃO DO APRESENTADOR (CLIP-PATH REVEAL + PARALLAX SOBREPOSTO)
           ------------------------------------------------------------------ */
        const presenterMedia = document.getElementById('presenterMedia');
        const presenterMain = document.getElementById('presenterMainPhoto');
        const presenterSecondary = document.getElementById('presenterSecondaryPhoto');

        if (presenterMain) {
          const mainImg = presenterMain.querySelector('.presenter-photo__img');

          const presenterTl = gsap.timeline({
            scrollTrigger: {
              trigger: presenterMain,
              start: 'top 82%',
              once: true,
            },
          });

          presenterTl.fromTo(
            presenterMain,
            { clipPath: 'inset(0% 46% 0% 46% round 20px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 20px)',
              duration: 1.2,
              ease: 'power4.out',
              clearProps: 'clipPath',
            },
            0
          );

          if (mainImg) {
            presenterTl.fromTo(
              mainImg,
              { scale: 1.12 },
              {
                scale: 1,
                duration: 1.35,
                ease: 'power3.out',
                clearProps: 'transform',
              },
              0
            );
          }
        }

        if (presenterSecondary && presenterMedia) {
          gsap.from(presenterSecondary, {
            opacity: 0,
            scale: 0.94,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'opacity,scale',
            scrollTrigger: {
              trigger: presenterMedia,
              start: 'top 78%',
              once: true,
            },
          });

          gsap.fromTo(
            presenterSecondary,
            { y: isDesktop ? 52 : 20 },
            {
              y: isDesktop ? -44 : -16,
              ease: 'none',
              scrollTrigger: {
                trigger: presenterMedia,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }

        /* ------------------------------------------------------------------
           6.5 REVEALS EDITORIAIS NAS DEMAIS SEÇÕES
           ------------------------------------------------------------------ */
        gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
          gsap.from(el, {
            y: 34,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              once: true,
            },
          });
        });

        gsap.utils.toArray('[data-stagger-group]').forEach((group) => {
          const items = group.querySelectorAll('[data-stagger-item]');
          if (items.length === 0) return;

          gsap.from(items, {
            y: 32,
            opacity: 0,
            duration: 0.78,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: group,
              start: 'top 85%',
              once: true,
            },
          });
        });

        /* ------------------------------------------------------------------
           6.6 EFEITOS DE MOUSE PARA DESKTOP (SPOTLIGHT, MAGNÉTICO & CARD HERO)
           ------------------------------------------------------------------ */
        if (canHover) {
          // Spotlight reativo (--mouse-x, --mouse-y) nos cards de módulos, oferta e destaques
          const spotlightCards = document.querySelectorAll('.spotlight-card');

          spotlightCards.forEach((card) => {
            const onMove = (event) => {
              if (event.pointerType === 'touch') return;
              const rect = card.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;
              card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
              card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
            };

            card.addEventListener('pointermove', onMove, { passive: true });
            cleanups.push(() => card.removeEventListener('pointermove', onMove));
          });

          // Botões CTA magnéticos (suaves, responsivos e com retorno elástico)
          const magneticButtons = document.querySelectorAll('.btn-magnetic');

          magneticButtons.forEach((btn) => {
            const isHeader = btn.classList.contains('btn--header');
            const strength = isHeader ? 0.22 : 0.28;
            const maxX = isHeader ? 10 : 16;
            const maxY = isHeader ? 6 : 10;

            const onPointerMove = (event) => {
              if (event.pointerType === 'touch') return;
              const rect = btn.getBoundingClientRect();
              const dx = (event.clientX - rect.left - rect.width / 2) * strength;
              const dy = (event.clientY - rect.top - rect.height / 2) * strength;

              gsap.to(btn, {
                x: Math.max(-maxX, Math.min(maxX, dx)),
                y: Math.max(-maxY, Math.min(maxY, dy)),
                duration: 0.32,
                ease: 'power3.out',
                overwrite: 'auto',
              });
            };

            const onPointerLeave = () => {
              gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.75,
                ease: 'elastic.out(1, 0.45)',
                overwrite: 'auto',
              });
            };

            btn.addEventListener('pointermove', onPointerMove, { passive: true });
            btn.addEventListener('pointerleave', onPointerLeave);
            cleanups.push(() => {
              btn.removeEventListener('pointermove', onPointerMove);
              btn.removeEventListener('pointerleave', onPointerLeave);
              gsap.killTweensOf(btn);
              gsap.set(btn, { clearProps: 'x,y' });
            });
          });

          // Card principal do Hero seguindo o mouse com tilt 3D e parallax em camadas
          const heroShowcase = document.getElementById('heroShowcase');
          if (heroShowcase && heroEl) {
            const onHeroMove = (event) => {
              if (event.pointerType === 'touch') return;
              const rect = heroEl.getBoundingClientRect();
              const nx = (event.clientX - rect.left) / rect.width - 0.5;
              const ny = (event.clientY - rect.top) / rect.height - 0.5;

              gsap.to(heroShowcase, {
                transformPerspective: 1000,
                rotateY: nx * 10,
                rotateX: -ny * 7,
                x: nx * 16,
                y: ny * 10,
                duration: 0.72,
                ease: 'power3.out',
                overwrite: 'auto',
              });

              if (heroGlassCard) {
                gsap.to(heroGlassCard, {
                  x: nx * 20,
                  duration: 0.85,
                  ease: 'power3.out',
                  overwrite: 'auto',
                });
              }

              if (heroStatusChip) {
                gsap.to(heroStatusChip, {
                  x: nx * -14,
                  y: ny * -8,
                  duration: 0.85,
                  ease: 'power3.out',
                  overwrite: 'auto',
                });
              }
            };

            const onHeroLeave = () => {
              gsap.to(heroShowcase, {
                rotateY: 0,
                rotateX: 0,
                x: 0,
                y: 0,
                duration: 0.95,
                ease: 'power3.out',
                overwrite: 'auto',
              });

              if (heroGlassCard) {
                gsap.to(heroGlassCard, {
                  x: 0,
                  duration: 0.95,
                  ease: 'power3.out',
                  overwrite: 'auto',
                });
              }

              if (heroStatusChip) {
                gsap.to(heroStatusChip, {
                  x: 0,
                  y: 0,
                  duration: 0.95,
                  ease: 'power3.out',
                  overwrite: 'auto',
                });
              }
            };

            heroEl.addEventListener('pointermove', onHeroMove, { passive: true });
            heroEl.addEventListener('pointerleave', onHeroLeave);
            cleanups.push(() => {
              heroEl.removeEventListener('pointermove', onHeroMove);
              heroEl.removeEventListener('pointerleave', onHeroLeave);
              gsap.set(heroShowcase, { clearProps: 'transform' });
              if (heroGlassCard) gsap.set(heroGlassCard, { clearProps: 'x' });
              if (heroStatusChip) gsap.set(heroStatusChip, { clearProps: 'x,y' });
            });
          }
        }

        return () => {
          cleanups.forEach((fn) => fn());
        };
      }
    );

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  };

  /* Fallback leve de interações de mouse caso o CDN do GSAP esteja offline */
  const initFallbackPointerFX = () => {
    if (
      typeof window.gsap !== 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches
    ) {
      return;
    }

    document.querySelectorAll('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${(event.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${(event.clientY - rect.top).toFixed(1)}px`);
      }, { passive: true });
    });

    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
      const strength = btn.classList.contains('btn--header') ? 0.2 : 0.25;
      btn.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease';
      btn.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = btn.getBoundingClientRect();
        const dx = Math.max(-14, Math.min(14, (event.clientX - rect.left - rect.width / 2) * strength));
        const dy = Math.max(-9, Math.min(9, (event.clientY - rect.top - rect.height / 2) * strength));
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      }, { passive: true });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });

    const heroShowcase = document.getElementById('heroShowcase');
    if (heroShowcase && heroEl) {
      heroShowcase.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
      heroEl.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = heroEl.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        heroShowcase.style.transform = `perspective(1000px) rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 10).toFixed(2)}deg) translate3d(${(nx * 14).toFixed(1)}px, ${(ny * 8).toFixed(1)}px, 0)`;
      }, { passive: true });
      heroEl.addEventListener('pointerleave', () => {
        heroShowcase.style.transform = '';
      });
    }
  };

  initGsapChoreography();
  initFallbackPointerFX();
})();
