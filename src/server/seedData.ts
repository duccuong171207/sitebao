import { Article, Comment } from '../types.js';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'ld-news-001',
    slug: 'global-markets-enter-new-era-central-banks-digital-reserves',
    title: 'Global Markets Enter a New Era as Central Banks Restructure Digital Reserves',
    subtitle: 'Institutional capital reallocates toward decentralized sovereign yield frameworks amid changing trade corridors.',
    summary: 'An executive analysis of how primary central monetary authorities are pivoting toward sovereign algorithmic reserves, reshaping global liquidity and capital velocity across international exchanges.',
    content: `
      <p class="lead">In an unprecedented structural shift across international monetary policy, primary central banking authorities across North America, Europe, and Asia have initiated a coordinated transition toward algorithmic digital reserve assets to safeguard cross-border liquidity.</p>
      
      <p>The movement, spearheaded by a coalition of international trade partners, aims to stabilize sovereign settlement networks against inflationary volatility and clearing delays. Financial institutions in New York, London, and Tokyo recorded record institutional inflows into high-grade digital treasury bonds during early morning trading sessions.</p>

      <h2>A New Monetary Consensus</h2>
      <p>According to economic data released earlier today, cross-border treasury settlements via next-generation sovereign protocols surged by 34% quarter-over-quarter. Analysts at global clearing houses emphasize that this marks the formal end of legacy T+2 clearing protocols in favor of instant atomic finality.</p>

      <blockquote>"What we are witnessing is not merely a technical upgrade to ledger systems, but a fundamental redesign of global sovereign balance sheets," remarked senior financial strategist Dr. Elena Vance. "Capital efficiency has become the primary benchmark for central bank credibility."</blockquote>

      <h2>Impact on Commercial Credit & Energy Markets</h2>
      <p>Commercial banks have reacted swiftly, reallocating credit portfolios toward green infrastructure bonds and automated trade finance. Simultaneously, energy commodities futures shifted upward by 1.8%, reflecting heightened trade velocity across primary shipping corridors in Asia and the Mediterranean.</p>

      <p>As multinational corporations adjust their balance sheets for the second half of 2026, corporate treasurers are increasingly requiring real-time settlement mechanisms. The consensus among institutional investors is that early adopters of this infrastructure will command significant liquidity advantages through the end of the decade.</p>
    `,
    author: 'Luiis David',
    category: 'Business',
    tags: ['Global Economy', 'Central Banks', 'Finance', 'Trade', 'Markets'],
    status: 'published',
    placement: 'hero',
    images: [
      {
        id: 'img-001-a',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1600&auto=format&fit=crop',
        caption: 'The main trading floor during early morning liquidity adjustments in the financial district.',
        description: 'Financial market index monitors displaying real-time currency and treasury yields.',
        credit: 'Luiis David Editorial Bureau',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Financial market trading monitors displaying market trends',
        isFeatured: true,
        order: 1
      },
      {
        id: 'img-001-b',
        url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1600&auto=format&fit=crop',
        caption: 'Central bank headquarters hosting executive economic summits on sovereign reserve policy.',
        description: 'Architectural view of modern banking headquarters in Frankfurt.',
        credit: 'Luiis David International Press',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Modern central bank building architectural façade',
        isFeatured: false,
        order: 2
      },
      {
        id: 'img-001-c',
        url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1600&auto=format&fit=crop',
        caption: 'International currency reserves undergoing automated audit verification.',
        description: 'Close-up of financial reserve documentation and digital audit interfaces.',
        credit: 'Luiis David Special Photography',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Currency and financial documentation setup',
        isFeatured: false,
        order: 3
      }
    ],
    videos: [
      {
        id: 'vid-001',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        videoTitle: 'Central Bank Digital Reserves & Settlement Overview',
        videoDescription: 'Footage from the latest economic briefings and trading desks in New York and London.',
        videoCaption: 'Executive floor recording during morning market liquidity adjustments.',
        posterUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1600&auto=format&fit=crop',
        creator: 'Luiis David',
        copyrightOwner: 'Luiis David',
        copyrightNotice: '© Luiis David — All Rights Reserved',
        order: 2,
        isFeatured: false
      }
    ],
    publishedAtDate: '2026-07-31',
    publishedAtTime: '10:30',
    timezone: 'EST',
    displayDateTime: 'July 31, 2026 — 10:30 AM EST',
    views: 125400,
    likes: 18400,
    commentCount: 1420,
    shares: 3120,
    seoTitle: 'Global Markets Enter New Era as Central Banks Restructure Digital Reserves | Luiis David',
    metaDescription: 'Exclusive analysis by Luiis David on how primary central banks are restructuring reserve assets to accelerate sovereign trade velocity.',
    updatedAt: '2026-07-31T10:30:00Z',
    comments: [
      {
        id: 'c-001',
        articleId: 'ld-news-001',
        authorName: 'Arthur Vance',
        content: 'Excellent coverage. The analysis on atomic clearing finality provides crucial clarity for corporate treasurers.',
        createdAt: '2026-07-31 11:15 AM EST',
        likes: 142,
        isSeed: true,
        isHidden: false
      },
      {
        id: 'c-002',
        articleId: 'ld-news-001',
        authorName: 'Claire Sterling',
        content: 'Great article, the photography is really impressive. The depth of reporting here sets a high standard.',
        createdAt: '2026-07-31 11:42 AM EST',
        likes: 98,
        isSeed: true,
        isHidden: false
      },
      {
        id: 'c-003',
        articleId: 'ld-news-001',
        authorName: 'Dr. Harrison Forde',
        content: 'This is exactly the kind of news coverage I enjoy reading. Thoughtful commentary without hyperbole.',
        createdAt: '2026-07-31 12:05 PM EST',
        likes: 76,
        isSeed: true,
        isHidden: false
      },
      {
        id: 'c-004',
        articleId: 'ld-news-001',
        authorName: 'Evelyn Montgomery',
        content: 'Really well written. Looking forward to reading more analytical insights from Luiis David.',
        createdAt: '2026-07-31 12:30 PM EST',
        likes: 54,
        isSeed: true,
        isHidden: false
      }
    ]
  },
  {
    id: 'ld-news-002',
    slug: 'quantum-semiconductor-breakthrough-redefines-artificial-intelligence',
    title: 'Next-Generation Quantum Chips Achieve Room-Temperature Stability in Silicon Valley',
    subtitle: 'A major technological milestone promises 1,000x efficiency gains for enterprise AI models and cryptographic defense systems.',
    summary: 'Engineering teams in California have demonstrated room-temperature spin-qubit coherence on commercial silicon wafers, opening immediate pathways to industrial quantum computing.',
    content: `
      <p class="lead">Silicon Valley engineering labs announced a landmark scientific achievement today: stable room-temperature quantum coherence on standard 300mm silicon manufacturing lines.</p>
      
      <p>The breakthrough eliminates the restrictive cryogenic refrigeration requirement that previously hindered industrial scaling of quantum hardware. Commercial hardware partners estimate that mass fabrication could begin within 18 months, dramatically accelerating supercomputing efficiency.</p>

      <h2>1,000x Processing Efficiency</h2>
      <p>Benchmark tests conducted independently at MIT confirmed processing throughput improvements exceeding 1,000 times that of current liquid-cooled GPU clusters, while consuming less than 5% of the power.</p>

      <p>Industry executives note that this development will revolutionize molecular modeling for pharmaceuticals, satellite communications, and military-grade encryption protection.</p>
    `,
    author: 'Luiis David',
    category: 'Technology',
    tags: ['Quantum', 'Semiconductors', 'AI', 'Silicon Valley', 'Innovation'],
    status: 'published',
    placement: 'featured',
    images: [
      {
        id: 'img-002-a',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
        caption: 'Silicon wafer inspection under high-precision electron microscopes.',
        description: 'Microscopic view of next-generation semiconductor circuit architecture.',
        credit: 'Luiis David Tech Laboratory Press',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Semiconductor microchip circuit closeup',
        isFeatured: true,
        order: 1
      },
      {
        id: 'img-002-b',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1600&auto=format&fit=crop',
        caption: 'Engineers performing diagnostic telemetry on quantum wafer prototypes.',
        description: 'Cleanroom technician testing integrated photonics circuits.',
        credit: 'Luiis David Science Bureau',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Cleanroom engineer at semiconductor workstation',
        isFeatured: false,
        order: 2
      }
    ],
    publishedAtDate: '2026-07-31',
    publishedAtTime: '09:15',
    timezone: 'EST',
    displayDateTime: 'July 31, 2026 — 9:15 AM EST',
    views: 98200,
    likes: 14200,
    commentCount: 890,
    shares: 2450,
    seoTitle: 'Next-Generation Quantum Chips Achieve Room-Temperature Coherence | Luiis David',
    metaDescription: 'Luiis David reports on the room-temperature quantum computing milestone in Silicon Valley and its industrial impacts.',
    updatedAt: '2026-07-31T09:15:00Z',
    comments: [
      {
        id: 'c-201',
        articleId: 'ld-news-002',
        authorName: 'Marcus Thorne',
        content: 'Fascinating report. Eliminating cryogenic cooling transforms quantum from a lab curiosity into an immediate manufacturing reality.',
        createdAt: '2026-07-31 09:45 AM EST',
        likes: 112,
        isSeed: true,
        isHidden: false
      },
      {
        id: 'c-202',
        articleId: 'ld-news-002',
        authorName: 'Dr. Sophia Lin',
        content: 'Very interesting story and beautifully presented. The editorial graphics and images make the hardware concept crystal clear.',
        createdAt: '2026-07-31 10:10 AM EST',
        likes: 64,
        isSeed: true,
        isHidden: false
      }
    ]
  },
  {
    id: 'ld-news-003',
    slug: 'transatlantic-energy-corridors-rebalance-global-trade',
    title: 'Transatlantic Energy Corridors Rebalance Global Trade as Maritime Fleets Modernize',
    subtitle: 'High-efficiency liquefied natural gas ports and hydrogen infrastructure redraw shipping routes across North Europe.',
    summary: 'A deep dive into how updated deepwater maritime ports are shortening energy supply chains and reducing freight transit costs.',
    content: `
      <p class="lead">Deepwater port facilities across Rotterdam, Antwerp, and Eastern Seaboard terminals in the United States reported record cargo tonnage following the inauguration of green shipping channels.</p>
      
      <p>The strategic corridors utilize zero-emission dual-fuel carrier vessels, lowering oceanic freight expenses while guaranteeing strategic reserve stability for European industrial manufacturing hubs.</p>
    `,
    author: 'Luiis David',
    category: 'World',
    tags: ['Energy', 'Maritime', 'Trade', 'Europe', 'Logistics'],
    status: 'published',
    placement: 'featured',
    images: [
      {
        id: 'img-003-a',
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1600&auto=format&fit=crop',
        caption: 'Deepwater container vessel docking at modern energy import terminal.',
        description: 'Large commercial cargo container ship at harbor during sunrise.',
        credit: 'Luiis David Maritime Logistics Press',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Commercial cargo ship at port terminal',
        isFeatured: true,
        order: 1
      }
    ],
    publishedAtDate: '2026-07-31',
    publishedAtTime: '08:45',
    timezone: 'EST',
    displayDateTime: 'July 31, 2026 — 8:45 AM EST',
    views: 74100,
    likes: 8900,
    commentCount: 512,
    shares: 1180,
    seoTitle: 'Transatlantic Energy Corridors Rebalance Global Trade | Luiis David',
    metaDescription: 'Luiis David examines maritime trade corridors and modern deepwater port investments in Europe and North America.',
    updatedAt: '2026-07-31T08:45:00Z',
    comments: [
      {
        id: 'c-301',
        articleId: 'ld-news-003',
        authorName: 'Capt. Julian Hayes',
        content: 'Excellent reporting and great attention to detail. Marine logistics has undergone a complete revolution over the past 3 years.',
        createdAt: '2026-07-31 09:20 AM EST',
        likes: 45,
        isSeed: true,
        isHidden: false
      }
    ]
  },
  {
    id: 'ld-news-004',
    slug: 'the-future-of-sovereign-wealth-funds-in-infrastructure',
    title: 'The Evolution of Sovereign Wealth Funds: Direct Capital Allocation in Critical Assets',
    subtitle: 'Institutional asset managers shift away from passive indexation in favor of long-term strategic infrastructure partnerships.',
    summary: 'An exclusive editorial analysis on how $12 trillion in sovereign capital is actively funding telecommunications grids, clean power, and strategic ports.',
    content: `
      <p class="lead">Sovereign wealth managers across Scandinavia, the Middle East, and East Asia are fundamentally altering their strategic asset allocation frameworks.</p>
      
      <p>Rather than relying primarily on public equity index funds, major sovereign entities are taking controlling direct equity stakes in critical utility networks, subsea optic cables, and commercial aviation infrastructure.</p>

      <p>This long-duration investment approach aims to lock in inflation-protected yield while securing strategic supply chain resiliency for home nations over multi-decade horizons.</p>
    `,
    author: 'Luiis David',
    category: 'Analysis',
    tags: ['Sovereign Wealth', 'Infrastructure', 'Investing', 'Markets', 'Capital'],
    status: 'published',
    placement: 'breaking',
    images: [
      {
        id: 'img-004-a',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
        caption: 'Financial towers housing international sovereign investment management teams.',
        description: 'Glass skyscraper facades reflecting blue sky in metropolitan center.',
        credit: 'Luiis David Financial Architecture Bureau',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Glass skyscrapers in international financial center',
        isFeatured: true,
        order: 1
      }
    ],
    publishedAtDate: '2026-07-31',
    publishedAtTime: '07:30',
    timezone: 'EST',
    displayDateTime: 'July 31, 2026 — 7:30 AM EST',
    views: 112000,
    likes: 15600,
    commentCount: 1100,
    shares: 2890,
    seoTitle: 'The Evolution of Sovereign Wealth Funds | Analysis by Luiis David',
    metaDescription: 'Luiis David provides an in-depth analysis of sovereign wealth funds allocating $12 trillion into global strategic infrastructure.',
    updatedAt: '2026-07-31T07:30:00Z',
    comments: [
      {
        id: 'c-401',
        articleId: 'ld-news-004',
        authorName: 'Veronica Sterling',
        content: 'Very useful information. Thanks for sharing this detailed perspective on sovereign fund allocations.',
        createdAt: '2026-07-31 08:00 AM EST',
        likes: 88,
        isSeed: true,
        isHidden: false
      }
    ]
  },
  {
    id: 'ld-news-005',
    slug: 'architectural-renaissance-civic-design-in-modern-metropolises',
    title: 'The Architectural Renaissance: How Civic Design is Reclaiming Urban Centers',
    subtitle: 'Metropolitan centers blend sustainable timber engineering with historic preservation to create resilient civic spaces.',
    summary: 'A cultural survey of transformative urban architecture projects across Tokyo, Paris, London, and Chicago that prioritize human scale and civic connection.',
    content: `
      <p class="lead">Urban design has entered a transformative era where structural beauty, ecological sustainability, and public accessibility converge.</p>
      
      <p>From mass-timber civic auditoriums in Scandinavia to restored industrial waterfronts in East Asia, architects are moving away from monolithic glass boxes in favor of tactile, organic materials that harmoniously ground urban life.</p>

      <p>City planners report that public engagement in municipal culture centers has increased by over 40% in cities that prioritize daylighting, pedestrian plazas, and acoustic craftsmanship.</p>
    `,
    author: 'Luiis David',
    category: 'Culture',
    tags: ['Architecture', 'Urban Design', 'Culture', 'Cities', 'Design'],
    status: 'published',
    placement: 'section',
    images: [
      {
        id: 'img-005-a',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop',
        caption: 'A modern civic atrium featuring natural light conduits and timber lattice structures.',
        description: 'Interior architecture showcasing organic wooden beams and high ceilings.',
        credit: 'Luiis David Architectural Review',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Modern interior architectural timber design',
        isFeatured: true,
        order: 1
      },
      {
        id: 'img-005-b',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop',
        caption: 'Pedestrian plaza integrated with natural water conservation features.',
        description: 'Civic park pavilion blending modern landscaping with urban design.',
        credit: 'Luiis David Cultural Photography',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Urban public park and architectural landscape',
        isFeatured: false,
        order: 2
      }
    ],
    publishedAtDate: '2026-07-30',
    publishedAtTime: '16:00',
    timezone: 'EST',
    displayDateTime: 'July 30, 2026 — 4:00 PM EST',
    views: 62400,
    likes: 7800,
    commentCount: 420,
    shares: 1450,
    seoTitle: 'The Architectural Renaissance: Civic Design in Modern Cities | Luiis David',
    metaDescription: 'Cultural survey by Luiis David exploring how modern cities are reclaiming civic architecture through sustainable design.',
    updatedAt: '2026-07-30T16:00:00Z',
    comments: [
      {
        id: 'c-501',
        articleId: 'ld-news-005',
        authorName: 'Sebastian Cross',
        content: 'Inspiring piece. The photography captures the essence of tactile civic design brilliantly.',
        createdAt: '2026-07-30 05:15 PM EST',
        likes: 52,
        isSeed: true,
        isHidden: false
      }
    ]
  },
  {
    id: 'ld-news-006',
    slug: 'opinion-why-independent-editorial-integrity-matters-more-than-ever',
    title: 'Opinion: Why Independent Editorial Integrity Matters More Than Ever in the Automated Age',
    subtitle: 'As algorithmic noise saturates public discourse, rigorous human verification and independent perspective remain the true hallmarks of journalism.',
    summary: 'A commentary on upholding unyielding factual rigor, primary source validation, and independent voice in international reporting.',
    content: `
      <p class="lead">In an era dominated by automated content aggregation and rapid-fire social algorithms, the value of deliberate, verified, independent journalism has never been higher.</p>
      
      <p>True editorial craftsmanship demands more than speed; it requires contextual nuance, direct investigative access, and an unshakeable commitment to accountability. Readers do not seek more noise—they seek clarity, truth, and institutional trustworthiness.</p>

      <p>At <strong>Luiis David</strong>, our reporting philosophy rests upon a simple standard: uncompromising clarity, original photographic documentation, and absolute independence from corporate or political pressure.</p>
    `,
    author: 'Luiis David',
    category: 'Opinion',
    tags: ['Journalism', 'Editorial', 'Media', 'Opinion', 'Integrity'],
    status: 'published',
    placement: 'section',
    images: [
      {
        id: 'img-006-a',
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1600&auto=format&fit=crop',
        caption: 'The newsroom press floor where editorial validation and proofing take place.',
        description: 'Vintage and modern printing press machinery and newsroom desk.',
        credit: 'Luiis David Publisher Archives',
        copyright: '© Luiis David — All Rights Reserved',
        altText: 'Newspaper pressroom and editorial desk',
        isFeatured: true,
        order: 1
      }
    ],
    publishedAtDate: '2026-07-30',
    publishedAtTime: '14:20',
    timezone: 'EST',
    displayDateTime: 'July 30, 2026 — 2:20 PM EST',
    views: 89300,
    likes: 12100,
    commentCount: 940,
    shares: 2100,
    seoTitle: 'Opinion: Why Independent Editorial Integrity Matters More Than Ever | Luiis David',
    metaDescription: 'Publisher Luiis David shares his perspective on independent reporting, factual rigor, and newsroom integrity.',
    updatedAt: '2026-07-30T14:20:00Z',
    comments: [
      {
        id: 'c-601',
        articleId: 'ld-news-006',
        authorName: 'Jonathan Vance',
        content: 'A powerful testament to true journalism. This is why Luiis David is my go-to publication every morning.',
        createdAt: '2026-07-30 03:00 PM EST',
        likes: 135,
        isSeed: true,
        isHidden: false
      }
    ]
  }
];
