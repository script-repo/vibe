// Application state
let allNotes = [];
let filteredNotes = [];
let searchTimeout = null;
let activeFilter = 'all';

// DOM elements - will be set after DOM loads
let searchInput, resultsGrid, emptyState, resultsCount, modal, modalTitle, modalBody, modalClose, filterChips;

// Initialize the application
function init() {
    console.log('Initializing Project Sophia Win Notes application...');
    
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    resultsGrid = document.getElementById('resultsGrid');
    emptyState = document.getElementById('emptyState');
    resultsCount = document.getElementById('resultsCount');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modalTitle');
    modalBody = document.getElementById('modalBody');
    modalClose = document.getElementById('modalClose');
    filterChips = document.querySelectorAll('.chip');
    
    // Verify DOM elements exist
    if (!searchInput || !resultsGrid || !modal) {
        console.error('Required DOM elements not found');
        return;
    }

    bindEvents();

    // Load data and initialize
    fetch('win_notes.json')
        .then(res => res.json())
        .then(data => {
            allNotes = data;
            filteredNotes = [...allNotes];
            console.log(`Loaded ${allNotes.length} win notes`);
            renderCards(filteredNotes);
            updateResultsCount(filteredNotes.length);
        })
        .catch(err => {
            console.error('Error loading win notes:', err);
        });
}

// Bind all event listeners
function bindEvents() {
    console.log('Binding event listeners...');
    
    // Search input with debouncing
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        console.log('Search input handler bound');
    }
    
    // Filter chips
    if (filterChips && filterChips.length > 0) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', handleFilterClick);
        });
        console.log(`Filter chip handlers bound for ${filterChips.length} chips`);
    }
    
    // Modal events
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', handleModalBackdropClick);
    }
    
    // Keyboard events
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleCardKeyboard);
    
    console.log('All event listeners bound successfully');
}

// Handle search input with debouncing
function handleSearchInput(event) {
    const query = event.target.value;
    console.log('Search input:', query);
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

// Perform search across all fields
function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    console.log('Performing search for:', searchTerm);
    
    if (!searchTerm) {
        // No search term - apply only active filter
        filteredNotes = allNotes.filter(note => activeFilter === 'all' || noteMatchesFilter(note, activeFilter));
    } else {
        // Search term provided - filter by search and active filter
        filteredNotes = allNotes.filter(note => {
            // First check if note matches active filter
            const matchesFilter = activeFilter === 'all' || noteMatchesFilter(note, activeFilter);
            if (!matchesFilter) return false;
            
            // Then check if note matches search term
            const searchableFields = [
                'company', 'industry', 'region', 'customer_profile',
                'business_challenge', 'why_nutanix', 'solution',
                'customer_outcomes', 'learnings', 'competition', 'quotes',
                'partnership', 'acknowledgements'
            ];
            
            const searchableText = searchableFields
                .map(field => (note[field] || '').toString())
                .join(' ')
                .toLowerCase();
                
            return searchableText.includes(searchTerm);
        });
    }
    
    console.log(`Search results: ${filteredNotes.length} notes found`);
    renderCards(filteredNotes);
    updateResultsCount(filteredNotes.length);
}

// Handle filter chip clicks
function handleFilterClick(event) {
    event.preventDefault();
    const clickedChip = event.target;
    const filter = clickedChip.dataset.filter;
    
    console.log('Filter clicked:', filter);
    
    // Update active filter
    activeFilter = filter;
    
    // Update chip visual states
    filterChips.forEach(chip => {
        chip.classList.remove('chip--active');
    });
    clickedChip.classList.add('chip--active');
    
    // Re-run search with new filter
    performSearch(searchInput ? searchInput.value : '');
}

// Check if note matches filter
function noteMatchesFilter(note, filter) {
    if (filter === 'all') return true;
    
    const solution = (note.solution || '').toUpperCase();
    return solution.includes(filter.toUpperCase());
}

// Render cards in the grid
function renderCards(notes) {
    if (!resultsGrid) {
        console.error('Results grid element not found');
        return;
    }
    
    console.log(`Rendering ${notes.length} cards`);
    
    if (notes.length === 0) {
        resultsGrid.style.display = 'none';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }
    
    resultsGrid.style.display = 'grid';
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    resultsGrid.innerHTML = notes.map(note => createCardHTML(note)).join('');

    // Add click events to cards
    const cards = resultsGrid.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Card clicked:', notes[index].company);
            openModal(notes[index]);
        });

        // Add keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open details for ${notes[index].company}`);
    });

    // Add copy button events
    const copyButtons = resultsGrid.querySelectorAll('.card__copy');
    copyButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            copyWinNote(notes[index]);
        });
    });

    console.log(`${cards.length} card click handlers added`);
}

// Create HTML for a single card
function createCardHTML(note) {
    const portfolioBadges = extractPortfolioBadges(note.solution);
    const region = note.region || 'Global';
    
    return `
        <div class="card" data-id="${note.id}">
            <button class="card__copy" aria-label="Copy win note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
            <div class="card__header">
                <h3 class="card__company">${escapeHtml(note.company)}</h3>
                <div class="card__meta">
                    <span class="card__industry">${escapeHtml(note.industry)}</span>
                    <span class="card__region">${escapeHtml(region)}</span>
                </div>
            </div>
            <div class="card__badges">
                ${portfolioBadges.map(badge => `<span class="badge">${escapeHtml(badge)}</span>`).join('')}
            </div>
            <div class="card__challenge">
                <strong>Challenge:</strong> ${truncateText(note.business_challenge, 120)}
            </div>
            <div class="card__outcome">
                <strong>Outcome:</strong> ${truncateText(note.customer_outcomes, 100)}
            </div>
        </div>
    `;
}

// Copy win note to clipboard
function copyWinNote(note) {
    const parts = [
        `Company: ${note.company}`,
        `Industry: ${note.industry}`,
        `Region: ${note.region}`,
        `Customer Profile: ${note.customer_profile}`,
        `Business Challenge: ${note.business_challenge}`,
        `Why Nutanix: ${note.why_nutanix}`,
        `Solution: ${note.solution}`,
        `Customer Outcomes: ${note.customer_outcomes}`,
        `Quotes: ${note.quotes}`,
        `Partnership: ${note.partnership}`,
        `Learnings: ${note.learnings}`,
        `Competition: ${note.competition}`,
        `Acknowledgements: ${note.acknowledgements}`
    ];

    const text = parts.filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Win note copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy win note:', err);
        });
}

// Extract portfolio badges from solution text
function extractPortfolioBadges(solutionText) {
    const badges = [];
    const text = solutionText.toUpperCase();
    
    const products = [
        'NCI', 'NCM', 'NDB', 'NKP', 'AHV', 'PRISM', 'FLOW', 'CALM', 'FRAME',
        'OBJECTS', 'FILES', 'LEAP', 'KARBON', 'MOVE', 'X-RAY', 'LCM',
        'NC2', 'GPU', 'KUBERNETES', 'K8S', 'ROBO', 'EDGE'
    ];
    
    products.forEach(product => {
        if (text.includes(product)) {
            badges.push(product);
        }
    });
    
    if (badges.length === 0) {
        const words = solutionText.split(' ').slice(0, 2);
        badges.push(words.join(' '));
    }
    
    return badges.slice(0, 3);
}

// Open modal with note details
function openModal(note) {
    if (!modal || !modalTitle || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    console.log('Opening modal for:', note.company);
    
    modalTitle.textContent = note.company;
    modalBody.innerHTML = createModalContent(note);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    if (modalClose) {
        modalClose.focus();
    }
    
    // Open default sections
    const defaultOpenSections = ['customer-profile', 'business-challenge'];
    defaultOpenSections.forEach(sectionId => {
        const details = document.getElementById(sectionId);
        if (details) {
            details.open = true;
        }
    });
}

// Close modal
function closeModal() {
    if (!modal) return;
    
    console.log('Closing modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to search input
    if (searchInput) {
        searchInput.focus();
    }
}

// Handle modal backdrop clicks
function handleModalBackdropClick(event) {
    if (event.target === modal || event.target.classList.contains('modal__backdrop')) {
        closeModal();
    }
}

// Handle keyboard events
function handleKeydown(event) {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
    }
}

// Handle keyboard navigation for cards
function handleCardKeyboard(event) {
    if (event.target.classList.contains('card') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.target.click();
    }
}

// Create modal content with collapsible sections
function createModalContent(note) {
    const sections = [
        {
            id: 'customer-profile',
            title: 'Customer Profile',
            content: note.customer_profile,
            defaultOpen: true
        },
        {
            id: 'business-challenge',
            title: 'Business Challenge',
            content: note.business_challenge,
            defaultOpen: true
        },
        {
            id: 'why-nutanix',
            title: 'Why Now / Why Nutanix',
            content: note.why_nutanix,
            defaultOpen: false
        },
        {
            id: 'solution',
            title: 'Our Solution',
            content: note.solution,
            defaultOpen: false
        },
        {
            id: 'outcomes',
            title: 'Customer Outcomes',
            content: note.customer_outcomes,
            defaultOpen: false
        },
        {
            id: 'quotes',
            title: 'Customer Quote',
            content: note.quotes,
            defaultOpen: false,
            isQuote: true
        },
        {
            id: 'partnership',
            title: 'Power of Partnership',
            content: note.partnership,
            defaultOpen: false
        },
        {
            id: 'learnings',
            title: 'Learnings & Best Practices',
            content: note.learnings,
            defaultOpen: false
        },
        {
            id: 'competition',
            title: 'Competitive Landscape',
            content: note.competition,
            defaultOpen: false
        },
        {
            id: 'acknowledgements',
            title: 'Team Acknowledgements',
            content: note.acknowledgements,
            defaultOpen: false
        }
    ];
    
    return sections.map(section => `
        <div class="modal__section">
            <details id="${section.id}" ${section.defaultOpen ? 'open' : ''}>
                <summary>${section.title}</summary>
                <div class="details-content">
                    ${section.isQuote ? 
                        `<div class="quote-content">${escapeHtml(section.content)}</div>` :
                        `<p>${escapeHtml(section.content)}</p>`
                    }
                </div>
            </details>
        </div>
    `).join('');
}

// Update results count display
function updateResultsCount(count) {
    if (!resultsCount) return;
    
    const text = count === 1 ? 'win note found' : 'win notes found';
    resultsCount.textContent = `${count} ${text}`;
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return escapeHtml(text);
    return escapeHtml(text.substring(0, maxLength)) + '...';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    init();
});

// Debug logging
window.addEventListener('load', function() {
    console.log('Window loaded, application should be ready');
});
// Settings modal and chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsModalClose = document.getElementById('settingsModalClose');
    const settingsForm = document.getElementById('settingsForm');
    const modelSelect = document.getElementById('model');

    if (window.marked) {
        marked.setOptions({ breaks: true });
    }

    // Populate model options from OpenRouter
    if (modelSelect) {
        fetch('https://openrouter.ai/api/v1/models')
            .then(res => res.json())
            .then(data => {
                data.data.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = m.id;
                    modelSelect.appendChild(opt);
                });
                const savedModel = localStorage.getItem('llmModel');
                if (savedModel) modelSelect.value = savedModel;
            })
            .catch(err => console.error('Error loading models:', err));
    }

    function toggleSettingsModal() {
        settingsModal.classList.toggle('hidden');
        document.body.classList.toggle('modal-open');
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettingsModal);
    }
    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', toggleSettingsModal);
    }
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const apiToken = document.getElementById('apiToken').value;
            const model = modelSelect.value;
            // Store in local storage
            localStorage.setItem('openrouterToken', apiToken);
            localStorage.setItem('llmModel', model);
            toggleSettingsModal();
        });
    }

    // Load saved API token
    const savedToken = localStorage.getItem('openrouterToken');
    if (savedToken) {
        document.getElementById('apiToken').value = savedToken;
    }

    // Chat with Wins functionality
    const chatButton = document.getElementById('chat-with-wins');
    const chatModal = document.getElementById('chatModal');
    const chatModalClose = document.getElementById('chatModalClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    let chatHistory = [];

    function openChat() {
        chatModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function closeChat() {
        chatModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    if (chatModalClose) {
        chatModalClose.addEventListener('click', closeChat);
    }

    if (chatButton && chatForm) {
        let winNotesData = [];

        // Load win notes on first chat open
        chatButton.addEventListener('click', async function() {
            openChat();
            if (winNotesData.length === 0) {

                if (allNotes.length > 0) {
                    winNotesData = allNotes;
                    chatHistory = [{ role: 'system', content: 'You are a helpful assistant. Use the provided win notes to answer questions about Nutanix wins.' }];
                    chatMessages.innerHTML = '<div class="chat-message system">Win notes loaded. How can I help?</div>';
                } else {
                    try {
                        winNotesData = await fetch('win_notes.json').then(r => r.json());
                        chatHistory = [{ role: 'system', content: 'You are a helpful assistant. Use the provided win notes to answer questions about Nutanix wins.' }];
                        chatMessages.innerHTML = '<div class="chat-message system">Win notes loaded. How can I help?</div>';
                    } catch (err) {
                        console.error('Error loading win notes:', err);
                        chatMessages.innerHTML = `<div class="chat-message error">${escapeHtml(err.message)}</div>`;
                    }

                }
            }
        });

        function getRelevantWinNotes(query, maxResults = 3) {
            const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
            return winNotesData
                .map(note => {
                    const text = Object.values(note).join(' ').toLowerCase();
                    const score = terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
                    return { note, score };
                })
                .filter(n => n.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, maxResults)
                .map(n => n.note);
        }

        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            const userDiv = document.createElement('div');
            userDiv.className = 'chat-message user';
            userDiv.textContent = message;
            chatMessages.appendChild(userDiv);
            chatInput.value = '';
            chatHistory.push({ role: 'user', content: message });

            const apiToken = localStorage.getItem('openrouterToken');
            const model = modelSelect.value;
            if (!apiToken || !model) {
                alert('Please configure API token and model in settings.');
                return;
            }

            // Retrieve relevant notes for context
            const contextNotes = getRelevantWinNotes(message);
            const contextMsg = { role: 'system', content: `Relevant win notes: ${JSON.stringify(contextNotes)}` };
            const messagesForApi = [chatHistory[0], contextMsg, ...chatHistory.slice(1)];

            const assistantDiv = document.createElement('div');
            assistantDiv.className = 'chat-message assistant';
            chatMessages.appendChild(assistantDiv);
            let assistantText = '';


            try {
                const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    },
                    body: JSON.stringify({
                        model: model,
                        stream: true,
                        messages: messagesForApi
                    })
                });

                const reader = resp.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') {
                                reader.cancel();
                                break;
                            }
                            try {
                                const data = JSON.parse(dataStr);
                                const token = data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content;
                                if (token) {
                                    assistantText += token;
                                    assistantDiv.innerHTML = DOMPurify.sanitize(marked.parse(assistantText));

                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            } catch (err) {
                                console.error('Error parsing stream chunk', err);
                            }
                        }
                    }
                }
                chatHistory.push({ role: 'assistant', content: assistantText });
            } catch (err) {
                console.error('Error communicating with LLM:', err);
                assistantDiv.classList.add('error');
                assistantDiv.textContent = err.message;
            }
        });
    }
});
