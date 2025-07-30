(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const parksData = {
            yosemite: {
                name: 'Yosemite',
                location: 'California',
                heroImage: 'https://images.unsplash.com/photo-1531339191398-75c464b51820?auto=format&fit=crop&q=80&w=1587',
                essence: 'Experience the awe-inspiring grandeur of Yosemite, a sanctuary of towering granite cliffs, ancient sequoia groves, and breathtaking waterfalls. From the iconic Half Dome to the serene Tuolumne Meadows, Yosemite is a testament to nature\'s artistry and power.',
                gallery: [
                    'https://images.unsplash.com/photo-1542332213-31f9734d206c?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1519424187790-91631ea9d597?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&q=80&w=1587'
                ]
            },
            zion: {
                name: 'Zion',
                location: 'Utah',
                heroImage: 'https://images.unsplash.com/photo-1616616909479-0b54332f3f7e?auto=format&fit=crop&q=80&w=1587',
                essence: 'Explore the dramatic landscapes of Zion, where majestic sandstone cliffs, painted in hues of cream, pink, and red, rise against a brilliant blue sky. Carved by the Virgin River, Zion\'s narrow canyons and stunning vistas offer unforgettable adventures.',
                gallery: [
                    'https://images.unsplash.com/photo-1587280501635-3a09383d466c?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1597039615453-41031b2a9a4c?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1606231262943-2a34cf87265f?auto=format&fit=crop&q=80&w=1587'
                ]
            },
            glacier: {
                name: 'Glacier',
                location: 'Montana',
                heroImage: 'https://images.unsplash.com/photo-1589434032178-5095e13589b3?auto=format&fit=crop&q=80&w=1587',
                essence: 'Discover the pristine wilderness of Glacier National Park, a land of rugged mountains, sparkling lakes, and sprawling forests. Home to grizzly bears, mountain goats, and bighorn sheep, Glacier is a paradise for hikers and nature lovers.',
                gallery: [
                    'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1579482852443-de7a7a6a4913?auto=format&fit=crop&q=80&w=1587',
                    'https://images.unsplash.com/photo-1548495033-812e4f723326?auto=format&fit=crop&q=80&w=1587'
                ]
            }
        };

        const onboardingScreen = document.getElementById('onboarding-screen');
        const welcomeButton = document.querySelector('.welcome-text');
        const mainApp = document.getElementById('main-app');
        const homeScreen = document.getElementById('home-screen');
        const parkCards = document.querySelectorAll('.park-card');
        const parkDetailScreen = document.getElementById('park-detail-screen');
        const parkDetailCloseButton = parkDetailScreen.querySelector('.close-button');
        const parkHeroImage = document.getElementById('park-hero-image');
        const heroParallaxContainer = document.querySelector('.park-hero');

        let lastScrollPosition = 0;

        const cursor = document.getElementById('cursor');
        document.addEventListener('mousemove', e => {
            window.requestAnimationFrame(() => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });

        const interactiveElements = document.querySelectorAll('button, a, .park-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });


        welcomeButton.addEventListener('click', () => {
            onboardingScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');

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
        });

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
    });
})();
