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
                    <img src="${park.heroImage}" alt="${park.name}" loading="lazy">
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
