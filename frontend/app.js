// Comprehensive win notes data - 75 entries with expanded content
const WIN_NOTES_DATA = [
    {
        "id": 1,
        "company": "Arbor Financial Group",
        "industry": "Financial Services",
        "region": "Canada",
        "customer_profile": "Arbor Financial Group is a mid-sized credit union operating 85 branches across Ontario and Quebec. As a member-owned financial cooperative, they serve over 150,000 members with traditional banking services, mortgages, and investment products. Their existing infrastructure consisted of aging three-tier architecture with separate compute, storage, and networking components that required extensive manual management and frequent maintenance windows.",
        "business_challenge": "The organization's legacy 3-tier stack was significantly impacting their monthly financial close processes, extending closure times beyond acceptable limits. Their distributed database systems experienced performance bottlenecks during peak processing periods, and their storage infrastructure lacked the performance characteristics needed for modern financial applications. The IT team was spending 60% of their time on infrastructure maintenance rather than strategic initiatives.",
        "why_nutanix": "With PCI-DSS 4.0 compliance deadline approaching, Arbor needed a solution that could provide both the performance improvements they required and the security features necessary for financial services compliance. Nutanix was selected because our HCI platform included built-in encryption, Flow network security, and comprehensive compliance reporting capabilities. The unified management approach would also reduce the complexity of their compliance audits.",
        "solution": "Deployed a 3-node Nutanix NCI cluster with all-flash storage, integrated Flow microsegmentation for network security, and Prism Central for centralized management. The implementation included migration of their core banking applications, customer relationship management systems, and regulatory reporting databases. Professional services provided comprehensive migration planning and execution with zero business disruption.",
        "customer_outcomes": "Monthly close time decreased by 70% from 8 days to 2.4 days, while IOPS performance increased by 35% during peak processing periods. Infrastructure management overhead reduced by 50%, allowing IT staff to focus on digital banking initiatives and customer experience improvements. Achieved PCI-DSS 4.0 compliance certification ahead of schedule with zero audit findings.",
        "quotes": "\"We close our books two days faster every month, which gives our finance team more time for analysis and strategic planning. The performance improvements have been remarkable, and our compliance audit was the smoothest we've ever experienced.\" - Sarah Chen, CTO",
        "partnership": "Joint design workshop with Canadian partner Softchoice enabled rapid deployment and comprehensive staff training. The partnership included ongoing support services and quarterly business reviews to ensure continued optimization and alignment with business objectives.",
        "learnings": "Pre-staging network configuration and conducting thorough application dependency mapping saved 4 hours during cutover weekend. Early engagement with compliance teams and thorough documentation of security controls streamlined the audit process significantly.",
        "competition": "Evaluated Dell VxRail with VMware vSAN and traditional VMware infrastructure solutions. Nutanix was selected due to superior ease of management, integrated security features, and comprehensive compliance reporting capabilities.",
        "acknowledgements": "Account Executive Sarah Nguyen and Systems Engineer Raj Patel provided exceptional technical guidance throughout the engagement. Customer Success Manager Lisa Thompson ensured seamless transition and ongoing optimization."
    },
    {
        "id": 2,
        "company": "CuraWell Health Systems",
        "industry": "Healthcare",
        "region": "United States",
        "customer_profile": "CuraWell Health Systems operates a 400-bed regional medical center serving a population of over 500,000 across three counties in the Midwest. As a not-for-profit healthcare organization, they provide comprehensive medical services including emergency care, surgical services, maternity care, and specialized cardiac programs. Their clinical environment supports over 800 healthcare professionals and processes more than 200,000 patient encounters annually.",
        "business_challenge": "Electronic Health Record (EHR) latency issues were significantly impacting clinical workflows and physician productivity. Login times exceeded 45 seconds, and accessing patient charts required 15-20 seconds per record. These delays were affecting patient care quality and clinician satisfaction scores. The aging infrastructure could not support the performance requirements of their Epic EHR upgrade, which demanded NVMe storage performance.",
        "why_nutanix": "The upcoming Epic upgrade required infrastructure that met Epic's validated configuration list for optimal performance. Nutanix AHV hypervisor combined with NCI all-flash clusters provided the certified platform needed while eliminating VMware licensing costs. The solution offered predictable performance, simplified management, and the ability to scale as patient volumes grew.",
        "solution": "Implemented a 5-node NX-8170 all-flash cluster with NVMe storage to support the Epic EHR environment. The deployment included AHV hypervisor, Prism Pro for intelligent operations, and comprehensive data protection with native snapshots and replication. Migration services ensured zero downtime transition from the legacy environment.",
        "customer_outcomes": "EHR login times decreased by 60% to under 18 seconds, and patient chart access improved to under 6 seconds. Nurse satisfaction scores increased by 22% due to improved system responsiveness. Overall infrastructure costs reduced by 30% through elimination of separate storage arrays and simplified management. Patient discharge processing time improved by 25%.",
        "quotes": "\"Doctors stopped complaining about charts loading slowly. The improvement in system performance has been transformational for our clinical staff productivity and ultimately benefits patient care quality.\" - Dr. Michael Rodriguez, Chief Medical Information Officer",
        "partnership": "Collaboration with Nutanix Professional Services ensured Epic-optimized configuration and best practices implementation. The partnership included comprehensive staff training and ongoing optimization services to maximize EHR performance.",
        "learnings": "Pinning EHR virtual machines to the same NUMA node significantly improved application performance. Early engagement with Epic technical teams and following Nutanix-Epic validated configurations were critical success factors.",
        "competition": "Evaluated Pure Storage FlashArray with Cisco UCS and traditional SAN solutions. Nutanix was selected for its Epic validation, integrated hypervisor, and simplified management capabilities.",
        "acknowledgements": "Customer Success Architect David Wong and Professional Services Manager Maria Allen provided exceptional technical expertise throughout the Epic implementation and optimization process."
    },
    {
        "id": 3,
        "company": "MetroRetail Corporation",
        "industry": "Retail",
        "region": "United Kingdom",
        "customer_profile": "MetroRetail Corporation operates 240 retail stores across the UK and maintains a growing e-commerce platform serving over 2 million online customers. As a fast-fashion retailer, they experience significant seasonal variations in traffic and must maintain 100% uptime during critical sales periods. Their omnichannel approach requires seamless integration between physical stores, online platforms, and mobile applications.",
        "business_challenge": "Previous Black Friday events resulted in website crashes and database failures when traffic spiked to 300% of normal levels. Their on-premises SQL cluster could not handle the concurrent user load, resulting in lost sales and customer dissatisfaction. The IT infrastructure lacked the elasticity needed to handle unpredictable demand spikes while maintaining cost efficiency during normal periods.",
        "why_nutanix": "The board mandated 100% uptime for all customer-facing systems, requiring a solution that could dynamically scale to handle traffic spikes. Nutanix NCI combined with NC2 cloud services provided the hybrid architecture needed for automatic scaling to AWS during peak periods. The integrated cost governance tools would help manage cloud spending while ensuring performance.",
        "solution": "Deployed on-premises NCI cluster for baseline workloads with NC2 on AWS configured for automatic cloud bursting during high-demand periods. Implementation included Prism Pro for predictive analytics, automated scaling policies, and comprehensive monitoring across hybrid environments. The solution provided seamless workload mobility between on-premises and cloud infrastructure.",
        "customer_outcomes": "Successfully handled 3x normal traffic volume during Black Friday with zero downtime or performance degradation. Cloud bursting automatically activated during peak periods and scaled back down, optimizing costs. Customer satisfaction scores improved by 40% due to consistent website performance. Infrastructure costs reduced by 25% through optimized resource utilization.",
        "quotes": "\"Black Friday was boring from an IT perspective – everything just worked perfectly. Our customers had a seamless shopping experience, and we achieved record sales without any technical issues.\" - James Wilson, IT Director",
        "partnership": "AWS strategic alliance enabled seamless integration and optimization of hybrid cloud architecture. Regular AWS game days and joint optimization sessions ensured continued performance improvements and cost optimization.",
        "learnings": "Implementing automated scaling runbooks and establishing clear performance thresholds reduced cloud spending by 18% while maintaining performance. Proactive monitoring and alerting prevented potential issues before they impacted customers.",
        "competition": "Evaluated HPE SimpliVity and traditional VMware with separate cloud disaster recovery solutions. Nutanix was chosen for its integrated hybrid cloud capabilities and cost governance features.",
        "acknowledgements": "Account Executive Karen Murphy and Customer Success Manager Ana Diaz provided strategic guidance throughout the hybrid cloud implementation and ongoing optimization efforts."
    }
];

// Generate full dataset of 75 entries
function generateCompleteDataset() {
    const baseNotes = [...WIN_NOTES_DATA];
    
    // Industry and region variations for generating additional entries
    const industries = [
        'Financial Services', 'Healthcare', 'Retail', 'Manufacturing', 'Technology',
        'Education', 'Government', 'Energy', 'Transportation', 'Media & Entertainment',
        'Insurance', 'Legal', 'Pharmaceutical', 'Automotive', 'Telecommunications'
    ];
    
    const regions = [
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
        'Japan', 'Australia', 'Singapore', 'India', 'Brazil', 'Netherlands',
        'Sweden', 'Switzerland', 'South Korea', 'Mexico'
    ];
    
    const companyPrefixes = [
        'Global', 'Metro', 'Prime', 'Elite', 'Advanced', 'Unified', 'Smart',
        'Next', 'Future', 'Innovative', 'Dynamic', 'Strategic', 'Premier',
        'Superior', 'Excellence', 'Optimal', 'Peak', 'Alpha', 'Omega', 'Zenith'
    ];
    
    const companySuffixes = [
        'Systems', 'Solutions', 'Corporation', 'Group', 'Technologies', 'Services',
        'Industries', 'Enterprises', 'Partners', 'Associates', 'Holdings', 'International',
        'Global', 'Dynamics', 'Innovations', 'Ventures', 'Capital', 'Networks', 'Labs', 'Works'
    ];
    
    // Generate additional entries to reach 75
    for (let i = baseNotes.length; i < 75; i++) {
        const industry = industries[i % industries.length];
        const region = regions[i % regions.length];
        const prefix = companyPrefixes[i % companyPrefixes.length];
        const suffix = companySuffixes[i % companySuffixes.length];
        const company = `${prefix} ${suffix}`;
        
        const solutions = ['NCI', 'NCM', 'NDB', 'NKP', 'Files', 'Objects'];
        const primarySolution = solutions[i % solutions.length];
        
        baseNotes.push({
            id: i + 1,
            company: company,
            industry: industry,
            region: region,
            customer_profile: `${company} is a leading ${industry.toLowerCase()} organization headquartered in ${region}, serving customers across multiple markets with innovative solutions and services. With a workforce of over ${1000 + (i * 50)} employees, they operate in a highly competitive environment requiring agile IT infrastructure that can support rapid business growth and digital transformation initiatives. Their legacy infrastructure was limiting their ability to respond quickly to market opportunities and customer demands.`,
            business_challenge: `The organization was struggling with legacy infrastructure that couldn't scale to meet growing business demands. Performance bottlenecks were impacting customer experience and operational efficiency, while management complexity was consuming significant IT resources. ${industry === 'Healthcare' ? 'Patient care systems required high availability and performance.' : industry === 'Financial Services' ? 'Regulatory compliance and security were critical requirements.' : 'Business agility and cost optimization were key priorities.'} The existing three-tier architecture required frequent maintenance windows and lacked the flexibility needed for modern applications.`,
            why_nutanix: `${company} needed a modern infrastructure platform that could simplify operations while providing enterprise-grade performance and reliability. The digital transformation initiative required infrastructure that could support cloud-native applications and provide seamless scalability. Nutanix was selected because our hyperconverged infrastructure offered the perfect combination of simplicity, performance, and cost-effectiveness. The software-defined approach eliminated vendor lock-in and provided the flexibility to run any workload on a unified platform.`,
            solution: `Implemented comprehensive Nutanix ${primarySolution} solution with professional services support to ensure successful migration and optimization. The deployment included ${primarySolution === 'NCI' ? 'hyperconverged infrastructure with all-flash storage' : primarySolution === 'NCM' ? 'multi-cloud management and cost optimization' : primarySolution === 'NDB' ? 'database-as-a-service platform' : primarySolution === 'NKP' ? 'Kubernetes platform for container workloads' : primarySolution === 'Files' ? 'scale-out file storage solution' : 'unified object storage with S3 compatibility'}. Implementation included comprehensive planning, staff training, and ongoing support to ensure maximum value realization. The solution was designed with future growth in mind, providing a scalable foundation for continued business expansion.`,
            customer_outcomes: `Achieved significant improvements in ${primarySolution === 'NCI' ? 'application performance and infrastructure simplification' : primarySolution === 'NCM' ? 'cloud cost optimization and governance' : primarySolution === 'NDB' ? 'database provisioning speed and management efficiency' : primarySolution === 'NKP' ? 'container deployment velocity and operational consistency' : primarySolution === 'Files' ? 'file storage performance and management simplicity' : 'object storage scalability and cost reduction'}. Overall infrastructure costs reduced by ${25 + (i % 15)}% while providing improved capabilities for future business growth. User satisfaction increased significantly due to improved application performance and system reliability. The IT team gained more time to focus on strategic initiatives that drive business value rather than routine infrastructure maintenance.`,
            quotes: `"The transformation with Nutanix has exceeded our expectations in every aspect - performance, simplicity, and cost-effectiveness. Our IT team can now focus on innovation rather than infrastructure management, which has been a game-changer for our organization." - ${i % 2 === 0 ? 'Chief Technology Officer' : 'IT Director'}, ${company}`,
            partnership: `Strong collaboration with ${['local Nutanix team', 'certified partner channel', 'Nutanix Professional Services', 'regional system integrator'][i % 4]} ensured successful implementation and ongoing optimization. The partnership approach provided access to deep technical expertise and industry best practices throughout the engagement. Regular business reviews and technical consultations maintain alignment with evolving business requirements and technology trends.`,
            learnings: `Key success factors included comprehensive upfront planning, thorough stakeholder engagement, and commitment to following Nutanix best practices throughout implementation. Early adoption of monitoring and automation capabilities significantly reduced operational overhead. ${primarySolution === 'NDB' ? 'Database standardization and self-service capabilities' : primarySolution === 'NKP' ? 'Container orchestration and DevOps integration' : 'Infrastructure automation and policy-driven management'} proved critical for long-term success and user adoption.`,
            competition: `Evaluated multiple infrastructure alternatives including ${['traditional three-tier solutions', 'competing HCI platforms', 'public cloud-only approaches', 'hybrid cloud alternatives'][i % 4]}. Nutanix was ultimately selected due to superior ease of use, comprehensive software stack, proven customer success track record, and total cost of ownership advantages. The integrated approach and unified management capabilities provided significant competitive differentiation.`,
            acknowledgements: `Exceptional collaboration between Nutanix sales, engineering, and support teams ensured successful project delivery and customer satisfaction. ${['Account Executive', 'Systems Engineer', 'Customer Success Manager', 'Solutions Architect'][i % 4]} ${['Jennifer Smith', 'Michael Johnson', 'Sarah Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor'][i % 6]} provided outstanding technical leadership and customer advocacy throughout the engagement lifecycle.`
        });
    }
    
    return baseNotes;
}

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
    
    // Load data and initialize
    allNotes = generateCompleteDataset();
    filteredNotes = [...allNotes];
    
    console.log(`Loaded ${allNotes.length} win notes`);
    
    bindEvents();
    renderCards(filteredNotes);
    updateResultsCount(filteredNotes.length);
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
    
    console.log(`${cards.length} card click handlers added`);
}

// Create HTML for a single card
function createCardHTML(note) {
    const portfolioBadges = extractPortfolioBadges(note.solution);
    const region = note.region || 'Global';
    
    return `
        <div class="card" data-id="${note.id}">
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
                try {
                    winNotesData = await fetch('win_notes.json').then(r => r.json());
                    chatHistory = [{ role: 'system', content: 'You are a helpful assistant. Use the provided win notes to answer questions about Nutanix wins.' }];
                    chatMessages.innerHTML = '<div class="chat-message system">Win notes loaded. How can I help?</div>';
                } catch (err) {
                    console.error('Error loading win notes:', err);
                    chatMessages.innerHTML = `<div class="chat-message error">${escapeHtml(err.message)}</div>`;
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
                                    assistantDiv.textContent += token;
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            } catch (err) {
                                console.error('Error parsing stream chunk', err);
                            }
                        }
                    }
                }
                chatHistory.push({ role: 'assistant', content: assistantDiv.textContent });
            } catch (err) {
                console.error('Error communicating with LLM:', err);
                assistantDiv.classList.add('error');
                assistantDiv.textContent = err.message;
            }
        });
    }
});