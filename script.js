// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksList = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

// Supabase Configuration
const supabaseUrl = 'https://wscrpoghwxrcgzzajzaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY3Jwb2dod3hyY2d6emFqemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI4NDAsImV4cCI6MjA5MDgyODg0MH0.x6Y5ICkNlPGCbvTvRIC0RX9m8HpXkabT6D1vldN4x_k';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 1. Navigation Background on Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Highlight Active Nav Link
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinksList.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// 2. Mobile Menu Toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isVisible = navLinks.style.display === 'flex';
        if (isVisible) {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.right = '2rem';
            navLinks.style.background = 'rgba(13, 15, 23, 0.95)';
            navLinks.style.padding = '2rem';
            navLinks.style.borderRadius = '12px';
            navLinks.style.border = '1px solid var(--glass-border)';
            navLinks.style.gap = '1.5rem';
        }
    });
}

// 3. Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (window.innerWidth <= 768 && navLinks) {
            navLinks.style.display = 'none';
        }

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Adjust offset for fixed header
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// 4. Scroll Reveal Animations
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: observer.unobserve(entry.target) to animate only once
        }
    });
};

const revealOptions = {
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// 5. Typewriter Effect Logic for the NAME
function initRoleTypewriter() {
    const roleElement = document.getElementById('static-role');
    if (roleElement) {
        const text = roleElement.textContent.trim() || "Multi-Skilled Technical Specialist";
        roleElement.textContent = '';
        roleElement.style.display = 'inline-block';
        roleElement.style.borderRight = 'none'; // Explicitly remove any line
        
        let charIndex = 0;
        let typingSpeed = 100;

        function type() {
            if (charIndex < text.length) {
                roleElement.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(type, typingSpeed);
            } else {
                // Wait 3 seconds then RESTART the animation for "tuloy-tuloy" effect
                setTimeout(() => {
                    roleElement.textContent = '';
                    charIndex = 0;
                    type();
                }, 3000);
            }
        }
        type();
    }
}

function initNameTypewriter() {
    const typeWriterElement = document.getElementById('typewriter-name');
    if (typeWriterElement) {
        // Just ensure it's visible and correctly formatted without typing
        typeWriterElement.classList.remove('typewriter');
        typeWriterElement.style.borderRight = 'none';
        typeWriterElement.style.animation = 'none';
        
        // Start Role Animation INSTANTLY (0 delay)
        initRoleTypewriter();
    }
}

// 5.5 Reviews Logic
const reviewsContainer = document.getElementById('reviews-container');

function renderReviews(reviews) {
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '';
    
    // Check if we are currently in admin mode
    const adminBar = document.getElementById('admin-bar');
    const isAdmin = adminBar && adminBar.style.display === 'flex';

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card glass reveal active';
        
        let deleteBtn = '';
        if (isAdmin) {
            deleteBtn = `<button class="review-delete-btn" onclick="deleteReview(${review.id})"><i class="fas fa-trash"></i> Delete</button>`;
        }

        card.innerHTML = `
            ${deleteBtn}
            <p class="review-text">"${review.content}"</p>
            <div class="review-author">
                <i class="fas fa-user-tie accent"></i>
                <div>
                    <h4>${review.name}</h4>
                    <p>${review.position}</p>
                </div>
            </div>
        `;
        reviewsContainer.appendChild(card);
    });
}

// Global function for deleting reviews
window.deleteReview = function(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    let reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem('employer_reviews', JSON.stringify(reviews));
    renderReviews(reviews);
    
    // Sync deletion to Supabase
    _supabase.from('resume_sections').upsert({
        id: 'employer_reviews',
        html_content: JSON.stringify(reviews)
    }).then(({error}) => {
        if (error) console.error('Error syncing deletion to Supabase:', error);
    });
};

const reviewForm = document.getElementById('review-form');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('review-name').value;
        const position = document.getElementById('review-position').value;
        const content = document.getElementById('review-content').value;
        
        const newReview = {
            id: Date.now(),
            name: name,
            position: position,
            content: content,
            date: new Date().toISOString()
        };
        
        let reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
        reviews.push(newReview);
        localStorage.setItem('employer_reviews', JSON.stringify(reviews));
        
        renderReviews(reviews);
        reviewForm.reset();
        
        // Save reviews to Supabase
        const { error } = await _supabase.from('resume_sections').upsert({
            id: 'employer_reviews',
            html_content: JSON.stringify(reviews)
        });
        
        if (error) {
            console.error('Error saving review to Supabase:', error);
        } else {
            alert("Thank you for your review!");
        }
    });
}

// 6. In-Browser CMS Logic
const adminTrigger = document.getElementById('admin-trigger');
const loginModal = document.getElementById('login-modal');
const changePinModal = document.getElementById('change-pin-modal');
const adminBarElement = document.getElementById('admin-bar');
const editableRegions = document.querySelectorAll('.editable-region');

// Admin Buttons
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const btnSaveContent = document.getElementById('btn-save-content');
const btnChangePinModal = document.getElementById('btn-change-pin-modal');
const btnUpdateResumeLink = document.getElementById('btn-update-resume-link');
const btnPrintPdf = document.getElementById('btn-print-pdf');
const btnReset = document.getElementById('btn-reset');
const btnSavePin = document.getElementById('btn-save-pin');

// Inputs
const pinInput = document.getElementById('pin-input');

if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (btnLogin) btnLogin.click();
        }
    });
}

const oldPinInput = document.getElementById('old-pin-input');
const newPinInput = document.getElementById('new-pin-input');
const loginError = document.getElementById('login-error');
const pinError = document.getElementById('pin-error');

// Close buttons for modals
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        if (loginModal) loginModal.style.display = 'none';
        if (changePinModal) changePinModal.style.display = 'none';
        resetModals();
    });
});

function resetModals() {
    if (pinInput) pinInput.value = '';
    if (oldPinInput) oldPinInput.value = '';
    if (newPinInput) newPinInput.value = '';
    if (loginError) loginError.style.display = 'none';
    if (pinError) pinError.style.display = 'none';
}

// 7. Load Data from Supabase on Startup
document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI state
    toggleAdminControls(false);
    toggleAdminImageOverlays(false);

    try {
        const { data, error } = await _supabase.from('resume_sections').select('*');
        if (error) throw error;

        if (data) {
            data.forEach(item => {
                // Section Content
                const region = document.getElementById(item.id);
                if (region && item.id.startsWith('editable-')) {
                    let cleanedContent = item.html_content;

                    // SMART CLEANUP: If this is the about section, strip out any legacy nested languages
                    if (item.id === 'editable-about') {
                        const temp = document.createElement('div');
                        temp.innerHTML = cleanedContent;
                        const nestedLanguages = temp.querySelectorAll('h3, .admin-controls, #editable-languages, ul');
                        nestedLanguages.forEach(el => {
                            if (el.textContent.includes('Languages') || el.id === 'editable-languages' || el.tagName === 'UL') {
                                el.remove();
                            }
                        });
                        cleanedContent = temp.innerHTML;
                    }

                    // SMART CLEANUP: If this is the hero section, strip out any duplicate legacy H1 name
                    if (item.id === 'editable-hero') {
                        const temp = document.createElement('div');
                        temp.innerHTML = cleanedContent;
                        const legacyH1 = temp.querySelector('h1');
                        if (legacyH1) legacyH1.remove(); // Remove the non-animated name from the DB
                        cleanedContent = temp.innerHTML;
                    }

                    region.innerHTML = cleanedContent;
                }
                
                // Resume Download Link
                if (item.id === 'resume_link') {
                    const resumeLinkElement = document.getElementById('resume-download-link');
                    if (resumeLinkElement) {
                        resumeLinkElement.href = item.html_content;
                        localStorage.setItem('resume_link', item.html_content);
                    }
                }
                
                // Employer Reviews
                if (item.id === 'employer_reviews') {
                    try {
                        const reviews = JSON.parse(item.html_content);
                        localStorage.setItem('employer_reviews', JSON.stringify(reviews));
                        renderReviews(reviews || []);
                    } catch (e) {
                        console.error('Error parsing reviews JSON:', e);
                    }
                }
            });
        }
    } catch (err) {
        console.error('Initial load failed:', err);
        // Fallback to local storage if Supabase fails
        const localReviews = JSON.parse(localStorage.getItem('employer_reviews'));
        if (localReviews) renderReviews(localReviews);
    }

    // Start Name Typewriter AFTER content is loaded
    setTimeout(initNameTypewriter, 10); // Small 10ms delay for DOM consistency
    updateResetButtonVisibility();
});

// --- Admin Helper Functions ---
function updateResetButtonVisibility() {
    const adminBar = document.getElementById('admin-bar');
    const isAdmin = adminBar && adminBar.style.display === 'flex';
    if (btnReset) btnReset.style.display = isAdmin ? 'inline-block' : 'none';
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to RESET all changes? This will clear local cache and reload.")) {
            localStorage.clear();
            window.location.reload();
        }
    });
}

// Admin Login Trigger
if (adminTrigger) {
    adminTrigger.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        if (pinInput) pinInput.focus();
    });
}

// Save Content Logic
if (btnSaveContent) {
    btnSaveContent.addEventListener('click', async () => {
        const sectionsToSave = [];
        editableRegions.forEach(region => {
            sectionsToSave.push({
                id: region.id,
                html_content: region.innerHTML
            });
        });

        // Current status alerts
        btnSaveContent.textContent = "Saving...";
        btnSaveContent.disabled = true;

        const { error } = await _supabase.from('resume_sections').upsert(sectionsToSave);
        
        btnSaveContent.textContent = "Save Changes";
        btnSaveContent.disabled = false;

        if (error) {
            console.error('Error saving to Supabase:', error);
            alert('Failed to save to cloud database.');
        } else {
            alert('Changes successfully saved! They are now live.');
        }
    });
}

// Update Resume Link Logic
if (btnUpdateResumeLink) {
    btnUpdateResumeLink.addEventListener('click', async () => {
        const currentLink = localStorage.getItem('resume_link') || "https://drive.google.com/file/d/1D_qBtZvgGN0AZkoV10E4_caC23HmxwSr/view?usp=sharing";
        const newLink = prompt("Enter the new URL for your Resume:", currentLink);
        
        if (newLink && newLink.trim() !== "") {
            localStorage.setItem('resume_link', newLink);
            const resumeLinkBtn = document.getElementById('resume-download-link');
            if (resumeLinkBtn) resumeLinkBtn.href = newLink;
            
            await _supabase.from('resume_sections').upsert({
                id: 'resume_link',
                html_content: newLink
            });
            alert("Resume link updated and synced!");
        }
    });
}

// Print To PDF Logic
if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
        const adminBar = document.getElementById('admin-bar');
        const originalDisplay = adminBar.style.display;
        adminBar.style.display = 'none';
        window.print();
        adminBar.style.display = originalDisplay;
    });
}

// Change PIN Modal Trigger
if (btnChangePinModal) {
    btnChangePinModal.addEventListener('click', () => {
        changePinModal.style.display = 'flex';
    });
}

// Change PIN Logic
if (btnSavePin) {
    btnSavePin.addEventListener('click', () => {
        const currentPin = localStorage.getItem('resume_admin_pin') || '1914';
        if (oldPinInput.value !== currentPin) {
            pinError.style.display = 'block';
            pinError.textContent = 'Current PIN is incorrect.';
            return;
        }
        localStorage.setItem('resume_admin_pin', newPinInput.value);
        pinError.style.display = 'block';
        pinError.textContent = 'PIN Changed!';
        pinError.style.color = '#22c55e';
        setTimeout(() => { changePinModal.style.display = 'none'; resetModals(); }, 1500);
    });
}

// 7. Element Management
const adminControls = document.querySelectorAll('.admin-controls');
function toggleAdminControls(show) {
    adminControls.forEach(control => control.style.display = show ? 'block' : 'none');
    toggleAdminImageOverlays(show);
}

function toggleAdminImageOverlays(show) {
    document.querySelectorAll('.admin-image-overlay').forEach(overlay => {
        if (show) overlay.classList.add('active');
        else overlay.classList.remove('active');
    });
}

// Dynamic Item Functions
window.addPortfolioItem = function () {
    const container = document.getElementById('editable-portfolio');
    const items = container.querySelectorAll('.project-card');
    if (items.length === 0) return;
    const newItem = items[0].cloneNode(true);
    container.appendChild(newItem);
    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
};

window.removeLastPortfolioItem = function () {
    const container = document.getElementById('editable-portfolio');
    const items = container.querySelectorAll('.project-card');
    if (items.length > 1) container.removeChild(items[items.length - 1]);
};

window.addExperienceItem = function () {
    const timeline = document.getElementById('editable-experience');
    const items = timeline.querySelectorAll('.timeline-item');
    if (items.length === 0) return;
    const newItem = items[0].cloneNode(true);
    timeline.appendChild(newItem);
    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
};

window.removeLastExperienceItem = function () {
    const timeline = document.getElementById('editable-experience');
    const items = timeline.querySelectorAll('.timeline-item');
    if (items.length > 1) timeline.removeChild(items[items.length - 1]);
};

window.addEducationItem = function () {
    const container = document.getElementById('editable-education-container');
    const items = container.querySelectorAll('.project-card');
    if (items.length === 0) return;
    const newItem = items[0].cloneNode(true);
    container.appendChild(newItem);
    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
};

window.removeLastEducationItem = function () {
    const container = document.getElementById('editable-education-container');
    const items = container.querySelectorAll('.project-card');
    if (items.length > 1) container.removeChild(items[items.length - 1]);
};

window.addLanguageItem = function () {
    const container = document.getElementById('editable-languages');
    const items = container.querySelectorAll('li');
    if (items.length === 0) return;
    const newItem = items[0].cloneNode(true);
    container.appendChild(newItem);
};

window.removeLastLanguageItem = function () {
    const container = document.getElementById('editable-languages');
    const items = container.querySelectorAll('li');
    if (items.length > 1) container.removeChild(items[items.length - 1]);
};

window.addSkillCategory = function () {
    const container = document.getElementById('editable-skills');
    const items = container.querySelectorAll('.skill-card');
    if (items.length === 0) return;
    const newItem = items[0].cloneNode(true);
    container.appendChild(newItem);
    if (document.getElementById('admin-bar').style.display === 'flex') newItem.setAttribute('contenteditable', 'true');
};

window.removeLastSkillCategory = function () {
    const container = document.getElementById('editable-skills');
    const items = container.querySelectorAll('.skill-card');
    if (items.length > 1) container.removeChild(items[items.length - 1]);
};

window.addSkillItem = function () {
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length === 0) return;
    const lastCard = skillCards[skillCards.length - 1];
    const ul = lastCard.querySelector('ul');
    if (ul) {
        const li = document.createElement('li');
        li.innerHTML = '<i class="fas fa-check-circle accent" style="margin-right: 10px;"></i> New Skill';
        ul.appendChild(li);
    }
};

window.removeLastSkillItem = function () {
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length === 0) return;
    const lastCard = skillCards[skillCards.length - 1];
    const ul = lastCard.querySelector('ul');
    if (ul && ul.querySelectorAll('li').length > 1) {
        ul.removeChild(ul.lastElementChild);
    }
};

window.triggerImageUpload = function(imgElement) {
    let newLink = prompt("Enter the New Image URL:", imgElement.src);
    if (newLink && newLink.trim() !== "") {
        newLink = convertGDriveLink(newLink.trim());
        imgElement.src = newLink;
        const parentRegion = imgElement.closest('.editable-region');
        if (parentRegion) {
            _supabase.from('resume_sections').upsert({
                id: parentRegion.id,
                html_content: parentRegion.innerHTML
            });
        }
        alert("Image updated!");
    }
};

function convertGDriveLink(url) {
    if (!url) return url;
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        let match = url.match(/\/file\/d\/([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
        match = url.match(/[?&]id=([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
}

// 8. Authentication Logic (FINAL)
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        const currentPin = localStorage.getItem('resume_admin_pin') || '1914';
        const adminBar = document.getElementById('admin-bar');
        if (pinInput.value === currentPin) {
            loginModal.style.display = 'none';
            adminBar.style.display = 'flex';
            toggleAdminControls(true);
            editableRegions.forEach(el => el.setAttribute('contenteditable', 'true'));
            resetModals();
            const reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
            renderReviews(reviews);
            updateResetButtonVisibility();
        } else {
            loginError.style.display = 'block';
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        const adminBar = document.getElementById('admin-bar');
        adminBar.style.display = 'none';
        toggleAdminControls(false);
        editableRegions.forEach(el => el.setAttribute('contenteditable', 'false'));
        const reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
        renderReviews(reviews);
        updateResetButtonVisibility();
    });
}

// 9. Contact Form Submission (Traditional Method)
const contactForm = document.getElementById('contact-form');
const btnSubmitContact = document.getElementById('btn-submit-contact');

if (contactForm) {
    contactForm.addEventListener('submit', () => {
        // Just show a visual indicator before the browser redirects
        if (btnSubmitContact) {
            btnSubmitContact.disabled = true;
            btnSubmitContact.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        }
        // No preventDefault() here to allow traditional form submission
    });
}

