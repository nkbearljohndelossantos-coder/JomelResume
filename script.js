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

// 5. Typewriter Effect Logic
const typeWriterElement = document.querySelector('.typewriter');
if (typeWriterElement) {
    const text = typeWriterElement.textContent.trim();
    typeWriterElement.textContent = '';
    let charIndex = 0;
    let typingSpeed = 150;

    function type() {
        if (charIndex < text.length) {
            typeWriterElement.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        } else {
            // Once finished, remove the blinking cursor border
            setTimeout(() => {
                typeWriterElement.style.borderRight = 'none';
                typeWriterElement.style.animation = 'none';
            }, 1000);
        }
    }

    // Start typing effect after a short delay
    setTimeout(type, 1000);
}

// 5.5 Reviews Logic
const reviewForm = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

function loadReviews() {
    if (!reviewsContainer) return;
    
    // Default initial reviews if none in storage
    let reviews = JSON.parse(localStorage.getItem('employer_reviews'));
    
    if (!reviews) {
        reviews = [
            {
                id: Date.now(),
                name: "Juan Dela Cruz",
                position: "Manager, NKB Manufacturing",
                content: "Earl is a highly dedicated IT professional. His technical skills and problem-solving abilities were a great asset to our team.",
                date: new Date().toISOString()
            }
        ];
        localStorage.setItem('employer_reviews', JSON.stringify(reviews));
    }

    renderReviews(reviews);
}

function renderReviews(reviews) {
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '';
    
    const isAdmin = adminBar && adminBar.style.display === 'flex';

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card glass reveal active'; // Adding active to show immediately for now
        
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

window.deleteReview = function(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    let reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem('employer_reviews', JSON.stringify(reviews));
    renderReviews(reviews);
    markAsEdited();
};

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
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
        markAsEdited();
        
        // Save reviews to Supabase
        _supabase.from('resume_sections').upsert({
            id: 'employer_reviews',
            html_content: JSON.stringify(reviews)
        }).then(({error}) => {
            if (error) console.error('Error saving review to Supabase:', error);
        });
        
        alert("Thank you for your review!");
    });
}

// 6. In-Browser CMS Logic
const adminTrigger = document.getElementById('admin-trigger');
const loginModal = document.getElementById('login-modal');
const changePinModal = document.getElementById('change-pin-modal');
const adminBar = document.getElementById('admin-bar');
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

// Fix: Support Enter key for PIN input
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

// Check for saved content on load from Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Load data from Supabase
    const { data, error } = await _supabase.from('resume_sections').select('*');
    
    if (error) {
        console.error('Error loading from Supabase:', error);
    } else if (data) {
        data.forEach(item => {
            // Handle regular regions
            const region = document.getElementById(item.id);
            if (region && item.id.startsWith('editable-')) {
                region.innerHTML = item.html_content;
            }
            
            // Handle Resume Link
            if (item.id === 'resume_link') {
                const resumeLinkElement = document.getElementById('resume-download-link');
                if (resumeLinkElement) {
                    resumeLinkElement.href = item.html_content;
                    localStorage.setItem('resume_link', item.html_content);
                }
            }
            
            // Handle Reviews
            if (item.id === 'employer_reviews') {
                const reviews = JSON.parse(item.html_content);
                localStorage.setItem('employer_reviews', JSON.stringify(reviews));
                renderReviews(reviews || []);
            }
        });
    }

    // Load Reviews
    loadReviews();

    // Reset Visibility
    updateResetButtonVisibility();
    
    // Fix: Ensure overlays and controls are hidden on load
    toggleAdminImageOverlays(false);
    toggleAdminControls(false);
});

// --- Reset Functionality ---
function updateResetButtonVisibility() {
    if (!btnReset) return;
    
    // Always show if we're in admin mode
    const isAdmin = adminBar && adminBar.style.display === 'flex';
    if (isAdmin) {
        btnReset.style.display = 'inline-block';
    } else {
        btnReset.style.display = 'none';
    }
}

// markAsEdited is no longer used for 5-minute window
function markAsEdited() {
    // No timer logic, but button is always visible in Admin mode anyway.
    updateResetButtonVisibility();
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to RESET all changes to the original template? This cannot be undone.")) {
            // Clear all resume-related localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('resume_content_') || 
                    key === 'resume_download_link' || 
                    key === 'employer_reviews')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            window.location.reload();
        }
    });
}

// Admin Login Trigger
if (adminTrigger) {
    adminTrigger.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

// Override removed from here as it's defined below.

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

        // Add Resume Link to save payload
        const currentLink = localStorage.getItem('resume_link') || "https://drive.google.com/file/d/1D_qBtZvgGN0AZkoV10E4_caC23HmxwSr/view?usp=sharing";
        sectionsToSave.push({
            id: 'resume_link',
            html_content: currentLink
        });

        const { error } = await _supabase.from('resume_sections').upsert(sectionsToSave);
        
        if (error) {
            console.error('Error saving to Supabase:', error);
            alert('Failed to save to cloud database.');
        } else {
            markAsEdited();
            alert('Changes successfully saved to database! They are now live for everyone.');
        }
    });
}

// Update Resume Link Logic
if (btnUpdateResumeLink) {
    btnUpdateResumeLink.addEventListener('click', () => {
        const currentLink = localStorage.getItem('resume_link') || "https://drive.google.com/file/d/1D_qBtZvgGN0AZkoV10E4_caC23HmxwSr/view?usp=sharing";
        const newLink = prompt("Enter the new URL for your Resume (Google Drive, Dropbox, etc.):", currentLink);
        
        if (newLink !== null && newLink.trim() !== "") {
            localStorage.setItem('resume_link', newLink);
            const resumeLinkElement = document.getElementById('resume-download-link');
            if (resumeLinkElement) {
                resumeLinkElement.href = newLink;
            }
            
            // Auto-save to Supabase
            _supabase.from('resume_sections').upsert({
                id: 'resume_link',
                html_content: newLink
            });

            markAsEdited();
            alert("Resume link updated successfully!");
        }
    });
}

// Print To PDF Logic
if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
        // Hide admin bar for printing
        const adminBar = document.getElementById('admin-bar');
        const originalDisplay = adminBar.style.display;
        adminBar.style.display = 'none';
        
        window.print();
        
        // Restore
        adminBar.style.display = originalDisplay;
    });
}

// Change PIN Modal Trigger
if (btnChangePinModal) {
    btnChangePinModal.addEventListener('click', () => {
        changePinModal.style.display = 'flex';
    });
}

// Save New PIN Logic
if (btnSavePin) {
    btnSavePin.addEventListener('click', () => {
        const currentPin = localStorage.getItem('resume_admin_pin') || '1914';

        if (oldPinInput.value !== currentPin) {
            pinError.style.display = 'block';
            pinError.textContent = 'Current PIN is incorrect.';
            pinError.style.color = '#ef4444';
            return;
        }

        if (newPinInput.value.length < 4) {
            pinError.style.display = 'block';
            pinError.textContent = 'New PIN must be at least 4 characters long.';
            pinError.style.color = '#ef4444';
            return;
        }

        // Success
        localStorage.setItem('resume_admin_pin', newPinInput.value);
        pinError.style.display = 'block';
        pinError.textContent = 'PIN successfully changed!';
        pinError.style.color = '#22c55e'; // Green

        setTimeout(() => {
            changePinModal.style.display = 'none';
            resetModals();
        }, 1500);
    });
}

// 7. Dynamic Addition/Removal of Elements
const adminControls = document.querySelectorAll('.admin-controls');

function toggleAdminControls(show) {
    adminControls.forEach(control => {
        control.style.display = show ? 'block' : 'none';
    });
    toggleAdminImageOverlays(show);
}



window.addPortfolioItem = function () {
    const container = document.getElementById('editable-portfolio');
    if (!container) return;
    const items = container.querySelectorAll('.project-card');
    if (items.length === 0) return;

    const newItem = items[0].cloneNode(true);
    
    // Reset contents
    const h3 = newItem.querySelector('h3');
    if (h3) h3.textContent = "New Project Name";
    
    const pTag = newItem.querySelector('p');
    if (pTag) pTag.textContent = "Description of the new project.";
    
    const tagsContainer = newItem.querySelector('.project-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '<span>Tech 1</span><span>Tech 2</span>';
    }

    container.appendChild(newItem);

    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
    markAsEdited();
};

window.removeLastPortfolioItem = function () {
    const container = document.getElementById('editable-portfolio');
    if (!container) return;
    const items = container.querySelectorAll('.project-card');
    if (items.length > 1) {
        container.removeChild(items[items.length - 1]);
        markAsEdited();
    } else {
        alert("Cannot remove the last project.");
    }
};

// Image Link Logic
function convertGDriveLink(url) {
    if (!url) return url;
    
    // Check if it's a Google Drive link
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        // Pattern 1: /file/d/FILE_ID/...
        let match = url.match(/\/file\/d\/([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
        
        // Pattern 2: ?id=FILE_ID
        match = url.match(/[?&]id=([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
    }
    return url;
}

window.triggerImageUpload = function(imgElement) {
    const currentSrc = imgElement.src;
    let newLink = prompt("Enter the New Image URL (e.g., GDrive image share link or any direct image URL):", currentSrc);
    
    if (newLink !== null && newLink.trim() !== "") {
        // Automatically convert GDrive viewer links to direct image links
        newLink = convertGDriveLink(newLink.trim());
        
        imgElement.src = newLink;
        markAsEdited();
        
        // Auto-save this specific region to Supabase
        const parentRegion = imgElement.closest('.editable-region');
        if (parentRegion && parentRegion.id) {
            _supabase.from('resume_sections').upsert({
                id: parentRegion.id,
                html_content: parentRegion.innerHTML
            }).then(({error}) => {
                if (error) console.error('Error syncing image to Supabase:', error);
            });
        }
        
        alert("Picture updated successfully! (Note: Make sure your GDrive link is set to 'Anyone with the link can view')");
    }
};

function toggleAdminImageOverlays(show) {
    const overlays = document.querySelectorAll('.admin-image-overlay');
    overlays.forEach(overlay => {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    });
}

window.addExperienceItem = function () {
    const timeline = document.getElementById('editable-experience');
    const items = timeline.querySelectorAll('.timeline-item');
    if (items.length === 0) return;

    // Clone the first item so we don't copy over heavily modified text from the last item
    const newItem = items[0].cloneNode(true);

    // Clear out the contents for the new item
    const h3 = newItem.querySelector('h3');
    if (h3) h3.textContent = "New Position / Role";

    const span = newItem.querySelector('.timeline-date');
    if (span) span.textContent = "Year | Company Name, Location";

    const ul = newItem.querySelector('ul');
    if (ul) {
        ul.innerHTML = '<li>Enter your responsibilities here.</li>';
    }

    // Insert at the end
    timeline.appendChild(newItem);

    // Ensure the new item is editable if we're in edit mode
    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
    markAsEdited();
};

window.removeLastExperienceItem = function () {
    const timeline = document.getElementById('editable-experience');
    const items = timeline.querySelectorAll('.timeline-item');
    if (items.length > 1) {
        timeline.removeChild(items[items.length - 1]);
        markAsEdited();
    } else {
        alert("Cannot remove the last item. You can edit it instead.");
    }
};

window.addEducationItem = function () {
    const container = document.getElementById('editable-education-container');
    const items = container.querySelectorAll('.project-card');
    if (items.length === 0) return;

    const newItem = items[0].cloneNode(true);
    const h3 = newItem.querySelector('h3');
    if (h3) h3.textContent = "School Name / Institution";

    const h4 = newItem.querySelector('h4');
    if (h4) h4.textContent = "Degree / Course Name";

    const pTag = newItem.querySelector('p');
    if (pTag) pTag.textContent = "Year - Year";

    container.appendChild(newItem);

    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
    markAsEdited();
};

window.removeLastEducationItem = function () {
    const container = document.getElementById('editable-education-container');
    const items = container.querySelectorAll('.project-card');
    if (items.length > 1) {
        container.removeChild(items[items.length - 1]);
        markAsEdited();
    } else {
        alert("Cannot remove the last item. You can edit it instead.");
    }
};

window.addLanguageItem = function () {
    const container = document.getElementById('editable-languages');
    if (!container) return;
    const items = container.querySelectorAll('li');
    if (items.length === 0) return;

    const newItem = items[0].cloneNode(true);
    newItem.innerHTML = '<i class="fas fa-check text-secondary" style="color: var(--accent-color);"></i> New Language';

    container.appendChild(newItem);
    markAsEdited();
};

window.removeLastLanguageItem = function () {
    const container = document.getElementById('editable-languages');
    if (!container) return;
    const items = container.querySelectorAll('li');
    if (items.length > 1) {
        container.removeChild(items[items.length - 1]);
        markAsEdited();
    } else {
        alert("Cannot remove the last item.");
    }
}

window.addSkillCategory = function () {
    const container = document.getElementById('editable-skills');
    if (!container) return;
    const items = container.querySelectorAll('.skill-card');
    if (items.length === 0) return;

    const newItem = items[0].cloneNode(true);
    const ul = newItem.querySelector('ul');
    if (ul) {
        ul.innerHTML = '<li><i class="fas fa-check-circle accent" style="margin-right: 10px;"></i> New Skill</li>';
    }
    container.appendChild(newItem);

    if (document.getElementById('admin-bar').style.display === 'flex') {
        newItem.setAttribute('contenteditable', 'true');
    }
    markAsEdited();
}

window.removeLastSkillCategory = function () {
    const container = document.getElementById('editable-skills');
    if (!container) return;
    const items = container.querySelectorAll('.skill-card');
    if (items.length > 1) {
        container.removeChild(items[items.length - 1]);
        markAsEdited();
    } else {
        alert("Cannot remove the last category.");
    }
}

window.addSkillItem = function () {
    const container = document.getElementById('editable-skills');
    if (!container) return;
    const skillCards = container.querySelectorAll('.skill-card');
    if (skillCards.length === 0) return;
    // Add to the LAST skill category
    const lastCard = skillCards[skillCards.length - 1];
    const ul = lastCard.querySelector('ul');
    if (ul) {
        const li = document.createElement('li');
        li.innerHTML = '<i class="fas fa-check-circle accent" style="margin-right: 10px;"></i> New Added Skill';
        ul.appendChild(li);
        markAsEdited();
    }
}

window.removeLastSkillItem = function () {
    const container = document.getElementById('editable-skills');
    if (!container) return;
    const skillCards = container.querySelectorAll('.skill-card');
    if (skillCards.length === 0) return;

    // Remove from the LAST skill category
    const lastCard = skillCards[skillCards.length - 1];
    const ul = lastCard.querySelector('ul');
    if (ul) {
        const items = ul.querySelectorAll('li');
        if (items.length > 1) {
            ul.removeChild(items[items.length - 1]);
            markAsEdited();
        } else {
            alert("Cannot remove the last bullet point in this category.");
        }
    }
}

// Override Login/Logout specifically for Add/Remove buttons display
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        const currentPin = localStorage.getItem('resume_admin_pin') || '1914';
        if (pinInput.value === currentPin) {
            loginModal.style.display = 'none';
            adminBar.style.display = 'flex';
            toggleAdminControls(true);
            editableRegions.forEach(el => el.setAttribute('contenteditable', 'true'));
            resetModals();
            // Re-render reviews to show delete buttons
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
        adminBar.style.display = 'none';
        toggleAdminControls(false);
        editableRegions.forEach(el => el.setAttribute('contenteditable', 'false'));
        // Re-render reviews to hide delete buttons
        const reviews = JSON.parse(localStorage.getItem('employer_reviews')) || [];
        renderReviews(reviews);
        updateResetButtonVisibility();
    });
}
