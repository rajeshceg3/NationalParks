(() => {
    document.addEventListener('DOMContentLoaded', () => {
        let parksData = {};
        const onboardingScreen = document.getElementById('onboarding-screen');
        const welcomeButton = document.querySelector('.welcome-text');
        const mainApp = document.getElementById('main-app');
        const homeScreen = document.getElementById('home-screen');
        const parkDetailScreen = document.getElementById('park-detail-screen');
        const parkDetailCloseButton = parkDetailScreen.querySelector('.close-button');
        const parkHeroImage = document.getElementById('park-hero-image');
        const heroParallaxContainer = document.querySelector('.park-hero');

        const PLACEHOLDER_IMG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=";
        parkHeroImage.onerror = () => { parkHeroImage.src = PLACEHOLDER_IMG; };

        let lastScrollPosition = 0;
        let allParks = [];

        fetch('parks.json')
            .then(response => response.json())
            .then(data => {
                allParks = data;
                parksData = data.reduce((acc, park) => {
                    acc[park.name.toLowerCase().replace(/ /g, '')] = park;
                    return acc;
                }, {});
                renderParkCards(allParks);
            });

        const searchBar = document.getElementById('search-bar');
        searchBar.addEventListener('keyup', (e) => {
            const searchString = e.target.value.toLowerCase();
            const filteredParks = allParks.filter(park => {
                return park.name.toLowerCase().includes(searchString) || park.location.toLowerCase().includes(searchString);
            });
            renderParkCards(filteredParks);
        });

        function renderParkCards(parks) {
            const parkCardContainer = document.querySelector('.park-card-container');
            parkCardContainer.innerHTML = '';
            parks.forEach(park => {
                const parkCard = document.createElement('div');
                parkCard.className = 'park-card anim-hidden';
                parkCard.dataset.parkId = park.name.toLowerCase().replace(/ /g, '');
                parkCard.innerHTML = `
                    <img src="${park.heroImage}" alt="${park.name}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
                    <div class="park-card-overlay"><h3>${park.name}</h3><p>${park.location}</p></div>
                `;
                parkCardContainer.appendChild(parkCard);
            });

            const parkCards = document.querySelectorAll('.park-card');
            parkCards.forEach(card => {
                card.addEventListener('click', () => {
                    const parkId = card.dataset.parkId;
                    renderParkDetail(parkId);

                    lastScrollPosition = homeScreen.scrollTop;
                    homeScreen.classList.add('locked');
                    homeScreen.style.top = `-${lastScrollPosition}px`;

                    parkDetailScreen.classList.remove('hidden');
                    setTimeout(() => {
                        parkDetailScreen.classList.add('visible');
                        parkDetailCloseButton.focus();
                        document.addEventListener('keydown', handleFocusTrap);
                    }, 50);
                });
            });

            const animatedElements = document.querySelectorAll('.anim-hidden');
            animatedElements.forEach((el, index) => {
                el.style.transitionDelay = `${100 + index * 150}ms`;
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('anim-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            animatedElements.forEach(el => observer.observe(el));
        }

        const cursor = document.getElementById('cursor');
        document.addEventListener('mousemove', e => {
            window.requestAnimationFrame(() => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });


        welcomeButton.addEventListener('click', () => {
            onboardingScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
        });

        parkDetailCloseButton.addEventListener('click', closeParkDetail);

        function closeParkDetail() {
            parkDetailScreen.classList.remove('visible');
            document.removeEventListener('keydown', handleFocusTrap);

            setTimeout(() => {
                parkDetailScreen.classList.add('hidden');
                homeScreen.classList.remove('locked');
                homeScreen.style.top = '';
                homeScreen.scrollTop = lastScrollPosition;
            }, 500);
        }

        function handleFocusTrap(e) {
            if (e.key !== 'Tab') return;

            const focusableElements = parkDetailScreen.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }

        function renderParkDetail(parkId) {
            const data = parksData[parkId];
            if (!data) return;

            parkHeroImage.src = data.heroImage;
            document.getElementById('park-hero-name').textContent = data.name;
            document.getElementById('park-hero-location').textContent = data.location;
            document.getElementById('park-essence-text').textContent = data.essence;

            const galleryContainer = document.getElementById('park-gallery-container');
            galleryContainer.innerHTML = '';
            data.gallery.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${data.name} gallery image`;
                img.onerror = () => { img.style.display = 'none'; };
                galleryContainer.appendChild(img);
            });

            const currentHour = new Date().getHours();
            if (currentHour >= 19 && currentHour <= 20) {
                heroParallaxContainer.classList.add('golden-hour');
            } else {
                heroParallaxContainer.classList.remove('golden-hour');
            }
        }

        parkDetailScreen.addEventListener('scroll', () => {
            const scrollTop = parkDetailScreen.scrollTop;
            parkHeroImage.style.transform = `translateZ(-1px) scale(2.1) translateY(${scrollTop * 0.3}px)`;
        });

        // --- Guided Tour Logic ---
        let currentTourStep = 0;
        let isTourActive = false;
        let animationFrameId = null;

        const tourOverlay = document.getElementById('tour-overlay');
        const tourSpotlight = document.getElementById('tour-spotlight');
        const tourTooltip = document.getElementById('tour-tooltip');
        const tourTitle = document.getElementById('tour-title');
        const tourContent = document.getElementById('tour-content');
        const tourStepCounter = document.getElementById('tour-step-counter');
        const tourProgressBar = document.getElementById('tour-progress-bar');
        const tourNextBtn = document.getElementById('tour-next-btn');
        const tourPrevBtn = document.getElementById('tour-prev-btn');
        const tourCloseBtn = document.getElementById('tour-close-btn');
        const startTourBtn = document.getElementById('start-tour-btn');

        const tourSteps = [
            {
                selector: '.search-container',
                title: 'Find Your Sanctuary',
                content: 'Looking for a specific destination? Type a park name or location here.',
                placement: 'bottom'
            },
            {
                selector: '.park-card',
                title: 'Discover Places',
                content: 'Explore curated vistas. Click on any card to immerse yourself in the details.',
                placement: 'top',
                onBefore: () => {
                    if (parkDetailScreen.classList.contains('visible')) {
                        closeParkDetail();
                        return new Promise(resolve => setTimeout(resolve, 600)); // Wait for close animation
                    }
                }
            },
            {
                selector: '#park-essence-section',
                title: 'The Essence',
                content: 'Read about what makes this place truly special and connect with its history.',
                placement: 'top',
                onBefore: () => {
                    const firstParkCard = document.querySelector('.park-card');
                    if (firstParkCard && !parkDetailScreen.classList.contains('visible')) {
                        firstParkCard.click();
                        return new Promise(resolve => setTimeout(resolve, 600)); // Wait for open animation
                    }
                }
            },
            {
                selector: '.close-button',
                title: 'Return to Explore',
                content: 'Whenever you are ready, close the details view to return to the main gallery.',
                placement: 'bottom'
            }
        ];

        function startTour() {
            isTourActive = true;
            currentTourStep = 0;
            tourOverlay.classList.remove('hidden');
            tourTooltip.classList.remove('hidden');
            renderTourStep();

            // Continuous positioning update for smooth scroll tracking
            updateTourPositions();

            document.addEventListener('keydown', handleTourKeydown);
            tourOverlay.addEventListener('click', endTour);
        }

        function endTour() {
            isTourActive = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            tourOverlay.classList.add('hidden');
            tourTooltip.classList.add('hidden');
            clearTourTargetActive();
            document.removeEventListener('keydown', handleTourKeydown);
            tourOverlay.removeEventListener('click', endTour);

            // Cleanup scroll listener
            if (window.scrollHandlerAdded && window._tourScrollHandler) {
                window.removeEventListener('scroll', window._tourScrollHandler, true);
                window.scrollHandlerAdded = false;
            }
        }

        function clearTourTargetActive() {
            document.querySelectorAll('.tour-target-active').forEach(el => {
                el.classList.remove('tour-target-active');
            });
        }

        function updateTourPositions() {
            if (!isTourActive) return;

            const step = tourSteps[currentTourStep];
            if (step) {
                const targetElement = document.querySelector(step.selector);
                if (targetElement) {
                    const rect = targetElement.getBoundingClientRect();

                    // Add some padding to the spotlight
                    const padding = 10;

                    tourSpotlight.style.top = `${rect.top - padding}px`;
                    tourSpotlight.style.left = `${rect.left - padding}px`;
                    tourSpotlight.style.width = `${rect.width + (padding * 2)}px`;
                    tourSpotlight.style.height = `${rect.height + (padding * 2)}px`;

                    // Disable transition during active scroll to prevent lag
                    if(!window.scrollHandlerAdded) {
                        window._tourScrollHandler = () => {
                            tourSpotlight.style.transition = 'none';
                            tourTooltip.style.transition = 'none';

                            // Re-enable after scroll stops
                            clearTimeout(window._tourScrollTimeout);
                            window._tourScrollTimeout = setTimeout(() => {
                                tourSpotlight.style.transition = 'top 0.6s var(--ease-out-quint), left 0.6s var(--ease-out-quint), width 0.6s var(--ease-out-quint), height 0.6s var(--ease-out-quint), border-radius 0.6s var(--ease-out-quint)';
                                tourTooltip.style.transition = 'top 0.6s var(--ease-out-quint), left 0.6s var(--ease-out-quint), opacity 0.4s ease, transform 0.6s var(--ease-out-quint)';
                            }, 50);
                        };
                        window.addEventListener('scroll', window._tourScrollHandler, true); // Use capture phase for all scroll events
                        window.scrollHandlerAdded = true;
                    }

                    // Try to match the border radius of the target, fallback to a sensible default
                    const computedStyle = window.getComputedStyle(targetElement);
                    let br = computedStyle.borderRadius;
                    if (br === '0px') br = '15px'; // default gentle curve if target has none
                    tourSpotlight.style.borderRadius = br;

                    positionTooltip(targetElement, step.placement);
                }
            }
            animationFrameId = requestAnimationFrame(updateTourPositions);
        }

        async function renderTourStep() {
            if (!isTourActive) return;

            tourNextBtn.disabled = true;
            tourPrevBtn.disabled = true;

            const step = tourSteps[currentTourStep];
            clearTourTargetActive();

            // Run onBefore hook if it exists (for navigation)
            if (step.onBefore) {
                await step.onBefore();
            }

            const targetElement = document.querySelector(step.selector);
            if (!targetElement) {
                console.warn(`Tour target element not found: ${step.selector}`);
                endTour();
                return;
            }

            // Scroll element into view smoothly if needed
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Apply interaction class immediately
            targetElement.classList.add('tour-target-active');

            // Wait a moment for scrolling to settle
            setTimeout(() => {
                tourTitle.textContent = step.title;
                tourContent.textContent = step.content;
                tourStepCounter.textContent = `Step ${currentTourStep + 1} of ${tourSteps.length}`;
                tourProgressBar.style.width = `${((currentTourStep + 1) / tourSteps.length) * 100}%`;

                tourPrevBtn.disabled = currentTourStep === 0;
                tourNextBtn.textContent = currentTourStep === tourSteps.length - 1 ? 'Finish' : 'Next';
                tourNextBtn.disabled = false;
            }, 300);
        }

        function positionTooltip(target, placement) {
            const rect = target.getBoundingClientRect();
            const tooltipRect = tourTooltip.getBoundingClientRect();
            const margin = 20;

            let top = 0;
            let left = 0;

            // Simple center-x alignment logic
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

            // Prevent going off-screen horizontally
            if (left < margin) left = margin;
            if (left + tooltipRect.width > window.innerWidth - margin) left = window.innerWidth - tooltipRect.width - margin;

            if (placement === 'bottom') {
                top = rect.bottom + margin;
                // If offscreen bottom, flip to top
                if (top + tooltipRect.height > window.innerHeight - margin) {
                    top = rect.top - tooltipRect.height - margin;
                }
            } else {
                top = rect.top - tooltipRect.height - margin;
                // If offscreen top, flip to bottom
                if (top < margin) {
                    top = rect.bottom + margin;
                }
            }

            tourTooltip.style.top = `${top}px`;
            tourTooltip.style.left = `${left}px`;
        }

        function handleTourKeydown(e) {
            if (e.key === 'Escape') {
                endTour();
            } else if (e.key === 'ArrowRight' && currentTourStep < tourSteps.length - 1 && !tourNextBtn.disabled) {
                currentTourStep++;
                renderTourStep();
            } else if (e.key === 'ArrowLeft' && currentTourStep > 0 && !tourPrevBtn.disabled) {
                currentTourStep--;
                renderTourStep();
            }
        }

        startTourBtn.addEventListener('click', startTour);
        tourCloseBtn.addEventListener('click', endTour);

        tourNextBtn.addEventListener('click', () => {
            if (currentTourStep < tourSteps.length - 1) {
                currentTourStep++;
                renderTourStep();
            } else {
                endTour();
            }
        });

        tourPrevBtn.addEventListener('click', () => {
            if (currentTourStep > 0) {
                currentTourStep--;
                renderTourStep();
            }
        });

    });
})();
