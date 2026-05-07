// Mobile Menu Functionality
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});

// Language state
let currentLanguage = 'en';
let allProjects = [];

// Helper function to get localized text
function getLocalizedText(item, field) {
    if (item[field] && typeof item[field] === 'object') {
        return item[field][currentLanguage] || item[field]['en'] || '';
    }
    return item[field] || '';
}

// Update placeholders
function updatePlaceholders() {
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.placeholder = currentLanguage === 'en' ? 'Your Name' : 'Il tuo nome';
    }

    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.placeholder = currentLanguage === 'en' ? 'Your Email' : 'La tua email';
    }

    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.placeholder = currentLanguage === 'en' ? 'Tell us about your project' : 'Parlaci del tuo progetto';
    }
}

// Translation function
function translatePage() {
    const elementsWithData = document.querySelectorAll('[data-en][data-it]');

    elementsWithData.forEach(element => {
        if (currentLanguage === 'en') {
            if (element.hasAttribute('data-en-placeholder')) {
                element.placeholder = element.getAttribute('data-en-placeholder');
            } else {
                element.textContent = element.getAttribute('data-en');
            }
        } else {
            if (element.hasAttribute('data-it-placeholder')) {
                element.placeholder = element.getAttribute('data-it-placeholder');
            } else {
                element.textContent = element.getAttribute('data-it');
            }
        }
    });

    updatePlaceholders();

    const currentLangSpan = document.getElementById('currentLang');
    if (currentLangSpan) {
        currentLangSpan.textContent = currentLanguage === 'en' ? 'ENG' : 'ITA';
    }

    document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'it';

    // Refresh projects display when language changes
    refreshProjectsDisplay();
}

// Refresh both featured and all projects
function refreshProjectsDisplay() {
    if (allProjects.length > 0) {
        const featuredProjects = allProjects.slice(0, 3);
        displayFeaturedProjects(featuredProjects);

        // If modal is open, refresh it too
        const modal = document.getElementById('projectsModal');
        if (modal.classList.contains('active')) {
            displayAllProjects(allProjects);
        }
    }
}

// Display featured projects on homepage
function displayFeaturedProjects(projects) {
    const container = document.getElementById('portfolio-container');

    if (!projects || projects.length === 0) {
        container.innerHTML = '<div class="loading">No projects to display</div>';
        return;
    }

    container.innerHTML = projects.map(project => {
        const title = getLocalizedText(project, 'title');
        const description = getLocalizedText(project, 'description');
        const plus = getLocalizedText(project, 'plus');

        return `
          <a href="${project.url}" target="_blank" class="portfolio-item">
            <div class="portfolio-img">
              ${project.logo ?
                `<img src="${project.logo}" alt="${title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-briefcase\\'></i> ${title.split(' ')[0]}'">` :
                `<i class="fas fa-briefcase"></i> ${title.split(' ')[0]}`
            }
            </div>
            <div class="portfolio-info">
              <h3>${title}</h3>
              <p>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
              <div class="portfolio-plus">📈 ${plus}</div>
            </div>
          </a>
        `;
    }).join('');
}

// Display all projects in modal
function displayAllProjects(projects) {
    const container = document.getElementById('allProjectsContainer');

    if (!projects || projects.length === 0) {
        container.innerHTML = '<div class="loading">No projects to display</div>';
        return;
    }

    container.innerHTML = projects.map(project => {
        const title = getLocalizedText(project, 'title');
        const description = getLocalizedText(project, 'description');
        const plus = getLocalizedText(project, 'plus');
        const viewText = currentLanguage === 'en' ? 'View Project' : 'Vedi Progetto';

        return `
          <a href="${project.url}" target="_blank" class="modal-card">
            <div class="modal-card-img">
              ${project.logo ?
                `<img src="${project.logo}" alt="${title}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-briefcase\\'></i>'">` :
                `<i class="fas fa-briefcase"></i>`
            }
              <div class="modal-card-badge">
                <i class="fas fa-external-link-alt"></i> ${viewText}
              </div>
            </div>
            <div class="modal-card-info">
              <h3>${title}</h3>
              <p>${description}</p>
              <div class="modal-card-plus">
                <i class="fas fa-chart-line"></i>
                ${plus}
              </div>
            </div>
          </a>
        `;
    }).join('');
}

// Language switcher setup
function setupLanguageSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    if (switcher) {
        switcher.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'it' : 'en';
            translatePage();
            localStorage.setItem('preferredLanguage', currentLanguage);
        });
    }
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Fetch and load projects
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error('Failed to load projects');
        allProjects = await response.json();
        const featuredProjects = allProjects.slice(0, 3);
        displayFeaturedProjects(featuredProjects);
        return allProjects;
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('portfolio-container').innerHTML =
            '<div class="loading" style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Failed to load projects.</div>';
    }
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('projectsModal');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const closeBtn = document.querySelector('.close-modal');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            displayAllProjects(allProjects);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Contact form submission
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = currentLanguage === 'en' ? 'Sending...' : 'Invio in corso...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const successMessage = currentLanguage === 'en'
                        ? '✓ Thank you! We will get back to you soon.'
                        : '✓ Grazie! Ti risponderemo presto.';
                    alert(successMessage);
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Form error:', error);
                const errorMessage = currentLanguage === 'en'
                    ? '✗ Oops! Something went wrong. Please try again.'
                    : '✗ Ops! Qualcosa è andato storto. Per favore riprova.';
                alert(errorMessage);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'it')) {
        currentLanguage = savedLanguage;
        translatePage();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    setupModal();
    setupContactForm();
    setupLanguageSwitcher();
    loadLanguagePreference();
});