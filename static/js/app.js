// ==========================================================================
// BigQuery Release Notes JS Controller
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // State Store
    let allUpdates = [];
    let activeFilters = {
        search: '',
        categories: ['Feature', 'Issue', 'Changed', 'Deprecation', 'General']
    };

    // DOM Elements
    const appContainer = document.querySelector('.app-container');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarToggleIcon = document.getElementById('sidebar-toggle-icon');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const notesContainer = document.getElementById('notes-container');
    const searchInput = document.getElementById('search-input');
    const errorBanner = document.getElementById('error-banner');
    const errorMessageText = document.getElementById('error-message-text');
    const errorClose = document.getElementById('error-close');
    
    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statShowing = document.getElementById('stat-showing');
    
    // Badge Counts (Sidebar)
    const countFeature = document.getElementById('count-feature');
    const countIssue = document.getElementById('count-issue');
    const countChanged = document.getElementById('count-changed');
    const countDeprecation = document.getElementById('count-deprecation');
    const countGeneral = document.getElementById('count-general');

    // Badge Counts (Horizontal Chips)
    const chipCountFeature = document.getElementById('chip-count-feature');
    const chipCountIssue = document.getElementById('chip-count-issue');
    const chipCountChanged = document.getElementById('chip-count-changed');
    const chipCountDeprecation = document.getElementById('chip-count-deprecation');
    const chipCountGeneral = document.getElementById('chip-count-general');

    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const modalClose = document.getElementById('modal-close');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const submitTweetBtn = document.getElementById('submit-tweet-btn');
    
    // Modal Attachment Details
    const tweetAttachType = document.getElementById('tweet-attach-type');
    const tweetAttachDate = document.getElementById('tweet-attach-date');
    const tweetAttachText = document.getElementById('tweet-attach-text');


    // ==========================================================================
    // Fetch and Load Data
    // ==========================================================================

    async function loadReleaseNotes() {
        setLoadingState(true);
        hideError();
        
        try {
            const response = await fetch('/api/release-notes');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success && Array.isArray(data.updates)) {
                allUpdates = data.updates;
                updateCategoryCounts();
                applyFiltersAndRender();
            } else {
                throw new Error(data.error || 'Failed to fetch release notes.');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            showError(`Could not fetch updates: ${error.message}. Please try again later.`);
            renderEmptyState('Failed to load feed data.', '⚠️');
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            refreshBtn.disabled = true;
            refreshBtn.classList.add('loading');
            refreshIcon.classList.add('spinning');
            // Render Skeleton Loader Cards
            notesContainer.innerHTML = `
                <div class="skeleton-card bento-large" aria-hidden="true"></div>
                <div class="skeleton-card bento-wide" aria-hidden="true"></div>
                <div class="skeleton-card" aria-hidden="true"></div>
                <div class="skeleton-card bento-tall" aria-hidden="true"></div>
                <div class="skeleton-card" aria-hidden="true"></div>
                <div class="skeleton-card" aria-hidden="true"></div>
            `;
        } else {
            refreshBtn.disabled = false;
            refreshBtn.classList.remove('loading');
            refreshIcon.classList.remove('spinning');
        }
    }

    // ==========================================================================
    // Filter and Render Logic
    // ==========================================================================

    function updateCategoryCounts() {
        const counts = { Feature: 0, Issue: 0, Changed: 0, Deprecation: 0, General: 0 };
        allUpdates.forEach(update => {
            const type = getNormalizedType(update.type);
            if (counts[type] !== undefined) {
                counts[type]++;
            } else {
                counts.General++;
            }
        });

        countFeature.textContent = counts.Feature;
        countIssue.textContent = counts.Issue;
        countChanged.textContent = counts.Changed;
        countDeprecation.textContent = counts.Deprecation;
        countGeneral.textContent = counts.General;

        chipCountFeature.textContent = counts.Feature;
        chipCountIssue.textContent = counts.Issue;
        chipCountChanged.textContent = counts.Changed;
        chipCountDeprecation.textContent = counts.Deprecation;
        chipCountGeneral.textContent = counts.General;
        
        statTotal.textContent = allUpdates.length;
    }

    function getNormalizedType(type) {
        const t = type.toLowerCase();
        if (t.includes('feature')) return 'Feature';
        if (t.includes('issue') || t.includes('bug')) return 'Issue';
        if (t.includes('change')) return 'Changed';
        if (t.includes('deprecat')) return 'Deprecation';
        return 'General';
    }

    function applyFiltersAndRender() {
        const filtered = allUpdates.filter(update => {
            const normalizedType = getNormalizedType(update.type);
            const matchesCategory = activeFilters.categories.includes(normalizedType);
            
            if (!matchesCategory) return false;

            const searchQuery = activeFilters.search.toLowerCase().trim();
            if (!searchQuery) return true;

            const matchesSearch = 
                update.type.toLowerCase().includes(searchQuery) ||
                update.date.toLowerCase().includes(searchQuery) ||
                update.body_text.toLowerCase().includes(searchQuery);

            return matchesSearch;
        });

        statShowing.textContent = filtered.length;
        renderUpdates(filtered);
    }

    function renderUpdates(updates) {
        if (updates.length === 0) {
            renderEmptyState('No updates match your selected filters or search query.', '🔍');
            return;
        }

        notesContainer.innerHTML = '';
        updates.forEach((update, index) => {
            const card = document.createElement('article');
            
            // Determine Bento size based on list index for a balanced grid layout
            let bentoClass = '';
            if (index === 0) {
                bentoClass = 'bento-large';
            } else if (index % 5 === 1) {
                bentoClass = 'bento-wide';
            } else if (index % 5 === 3) {
                bentoClass = 'bento-tall';
            }
            
            card.className = `card ${bentoClass}`.trim();
            card.id = `card-${update.id}`;
            
            const normalizedType = getNormalizedType(update.type);
            const badgeClass = `badge-${normalizedType.toLowerCase()}`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-meta">
                        <span class="card-date">${update.date}</span>
                    </div>
                    <span class="badge ${badgeClass}">${update.type}</span>
                </div>
                <div class="card-body">
                    ${update.body_html}
                </div>
                <div class="card-actions">
                    <button class="btn btn-share" data-id="${update.id}" aria-label="Tweet about this update">
                        Share on X
                    </button>
                </div>
            `;
            
            // Hook up the share button event
            const shareBtn = card.querySelector('.btn-share');
            shareBtn.addEventListener('click', () => {
                openTweetModal(update);
            });

            notesContainer.appendChild(card);
        });
    }

    function renderEmptyState(message, icon) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">${icon}</span>
                <h3>No Release Notes</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // ==========================================================================
    // Tweet Share Modal Logic
    // ==========================================================================

    function openTweetModal(update) {
        const normalizedType = getNormalizedType(update.type);
        
        // Populate attachment preview block in Modal
        tweetAttachType.className = `tweet-attachment-type text-${normalizedType.toLowerCase()}`;
        tweetAttachType.textContent = update.type;
        tweetAttachDate.textContent = update.date;
        tweetAttachText.textContent = update.body_text;

        // Draft an initial short tweet summary that fits well within 280 chars
        const header = `BigQuery [${update.type}] (${update.date}): `;
        const maxTextLen = 280 - header.length - 22; // Leave room for tags/URL
        
        let truncatedText = update.body_text;
        if (truncatedText.length > maxTextLen) {
            truncatedText = truncatedText.substring(0, maxTextLen - 3) + '...';
        }
        
        const draftText = `${header}"${truncatedText}"\n#GoogleCloud #BigQuery`;
        
        tweetTextarea.value = draftText;
        updateCharCount();
        
        // Show Modal
        tweetModal.classList.remove('hidden');
        tweetTextarea.focus();
        document.body.style.overflow = 'hidden'; // Disable scroll on body
    }

    function closeTweetModal() {
        tweetModal.classList.add('hidden');
        document.body.style.overflow = ''; // Re-enable body scroll
    }

    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCounter.textContent = `${len} / 280`;
        
        if (len > 280) {
            charCounter.classList.add('char-warning');
            submitTweetBtn.disabled = true;
        } else {
            charCounter.classList.remove('char-warning');
            submitTweetBtn.disabled = false;
        }
    }

    function submitTweet() {
        const tweetText = tweetTextarea.value.trim();
        if (!tweetText || tweetText.length > 280) return;
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        closeTweetModal();
    }

    // ==========================================================================
    // Event Listeners Setup
    // ==========================================================================

    // Refresh Button click
    refreshBtn.addEventListener('click', loadReleaseNotes);

    // Search Input text changes
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value;
        applyFiltersAndRender();
    });

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        const isClosed = appContainer.classList.toggle('sidebar-closed');
        sidebarToggleIcon.textContent = isClosed ? '▶' : '◀';
    });

    // Category Checkboxes changes (Sidebar)
    const checkboxes = document.querySelectorAll('#category-filters input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const val = checkbox.value;
            const chip = document.getElementById(`chip-${val.toLowerCase()}`);
            
            // Sync chip active status
            if (chip) {
                if (checkbox.checked) {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            }

            const activeCategories = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    activeCategories.push(cb.value);
                }
            });
            activeFilters.categories = activeCategories;
            applyFiltersAndRender();
        });
    });

    // Category Chips changes (Main Header area)
    const chips = document.querySelectorAll('#main-filter-chips .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.getAttribute('data-value');
            const checkbox = document.getElementById(`filter-${val.toLowerCase()}`);
            
            // Toggle active status on chip
            const isActive = chip.classList.toggle('active');
            
            // Sync checkbox in sidebar
            if (checkbox) {
                checkbox.checked = isActive;
            }

            const activeCategories = [];
            chips.forEach(c => {
                if (c.classList.contains('active')) {
                    activeCategories.push(c.getAttribute('data-value'));
                }
            });
            activeFilters.categories = activeCategories;
            applyFiltersAndRender();
        });
    });

    // Modal Close Triggers
    modalClose.addEventListener('click', closeTweetModal);
    
    // Close modal if clicked outside modal body
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });

    // Textarea character count keyup/change events
    tweetTextarea.addEventListener('input', updateCharCount);

    // Submit Tweet click
    submitTweetBtn.addEventListener('click', submitTweet);

    // Close Error Banner
    errorClose.addEventListener('click', hideError);

    function showError(message) {
        errorMessageText.textContent = message;
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    // Mouse movement listener for interactive background spotlight glow
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

    // ==========================================================================
    // Initialization Run
    // ==========================================================================
    loadReleaseNotes();
});
