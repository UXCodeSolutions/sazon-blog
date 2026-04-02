console.log('[DEBUG] script.js loaded and parsing started');
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

// ======================== SUPABASE ========================
const supabaseUrl = 'https://cqqioxcxhgdfwbjrjsef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWlveGN4aGdkZndianJqc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjcxMTcsImV4cCI6MjA4ODg0MzExN30.B-oKK6aLvrcz5vfHVwcJitCPEq8bGbt9dMfTZolVnj8';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// ======================== THEME ========================
const THEME_KEY = 'sazon-theme';
const themeToggle = qs('.theme-toggle');
const themeIcon = qs('.theme-toggle-icon');

const getPreferredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  if (themeIcon) themeIcon.textContent = theme === 'dark' ? 'Light' : 'Dark';
};

applyTheme(getPreferredTheme());

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(getPreferredTheme());
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// ======================== MOBILE NAV ========================
const navToggle = qs('.nav-toggle');
const navMobile = qs('#nav-mobile');

const searchToggle = qs('.search-toggle');
const headerSearchBar = qs('.site-header .search-bar');

const bindTap = (el, handler) => {
  if (!el) return;
  const opts = { passive: false };
  let lastTouchTs = 0;

  el.addEventListener('touchstart', (e) => {
    lastTouchTs = Date.now();
    handler(e);
  }, opts);

  el.addEventListener('click', (e) => {
    if (Date.now() - lastTouchTs < 700) return;
    handler(e);
  });
};

const ensureMobileSearchPanel = () => {
  let panel = qs('#mobile-search-panel');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = 'mobile-search-panel';
  panel.className = 'mobile-search-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="mobile-search-inner" role="dialog" aria-label="Search">
      <div class="search-bar is-open">
        <span class="search-icon" aria-hidden="true">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </span>
        <input type="text" placeholder="Search recipes..." />
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const bar = qs('.search-bar', panel);
  if (bar) initSearch([bar]);
  return panel;
};

if (navToggle && navMobile) {
  bindTap(navToggle, (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    const nextExpanded = !expanded;
    navToggle.setAttribute('aria-expanded', String(nextExpanded));
    navMobile.classList.toggle('is-open', nextExpanded);

    if (nextExpanded && headerSearchBar) {
      headerSearchBar.classList.remove('is-open');
      if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
    }

    const mobilePanel = qs('#mobile-search-panel');
    if (nextExpanded && mobilePanel) mobilePanel.hidden = true;
  });
  qsa('#nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.classList.remove('is-open');
    });
  });
}

if (searchToggle && headerSearchBar) {
  const closeSearch = () => {
    headerSearchBar.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
    const mobilePanel = qs('#mobile-search-panel');
    if (mobilePanel) mobilePanel.hidden = true;
  };

  bindTap(searchToggle, (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const panel = ensureMobileSearchPanel();
    const panelInput = qs('input', panel);
    const panelIsOpen = !panel.hidden;

    if (panelIsOpen) {
      closeSearch();
      return;
    }

    panel.hidden = false;
    searchToggle.setAttribute('aria-expanded', 'true');
    if (panelInput) panelInput.focus();

    const isOpen = headerSearchBar.classList.contains('is-open');
    if (isOpen) {
      closeSearch();
      return;
    }

    headerSearchBar.classList.add('is-open');
    searchToggle.setAttribute('aria-expanded', 'true');

    const input = qs('input', headerSearchBar);
    if (input) input.focus();

    if (navToggle && navMobile && navMobile.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.classList.remove('is-open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!headerSearchBar.classList.contains('is-open')) return;
    if (headerSearchBar.contains(e.target) || searchToggle.contains(e.target)) return;
    closeSearch();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSearch();
  });
}

// ======================== AUTH STATE ========================
const updateAuthUI = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const authActions = qsa('.auth-actions');
  
  authActions.forEach(container => {
    if (session && session.user) {
      const email = session.user.email;
      const name = email.split('@')[0];
      container.innerHTML = `
        <span class="user-greeting">${name}</span>
        <button class="btn-logout" onclick="handleLogout()">Logout</button>
      `;
    } else {
      container.innerHTML = `
        <a href="login.html" class="header-login">Log In</a>
        <a href="register.html" class="btn-primary btn-sm">Join</a>
      `;
    }
  });
};

window.handleLogout = async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
};

// ======================== ARTICLE RENDERING ========================
const generateArticleHTML = (article, isCompact = false) => {
  const { id, title, category, time, difficulty, rating_stars, image_url } = article;
  const link = `article.html?id=${id}`;
  
  if (isCompact) {
    return `
      <a href="${link}" class="compact-card" data-category="${category || 'Recipe'}" style="text-decoration:none; color:inherit; display:block;">
        <div class="compact-img" style="background-image:url('${image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400'}')"></div>
        <div class="compact-body">
          <span class="compact-category">${category || 'Recipe'}</span>
          <h4 class="compact-title">${title}</h4>
          <div class="compact-meta">⏱ ${time || '20m'} ${difficulty ? `· ${difficulty}` : ''}</div>
        </div>
      </a>
    `;
  }

  return `
    <a href="${link}" class="recipe-card" style="text-decoration:none; color:inherit; display:block;">
      <div class="card-img" style="background-image:url('${image_url || 'https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=600'}')">
        <span class="card-badge">${category || 'Recipe'}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <div class="card-meta">
          <span class="rating">${rating_stars || '★★★★★'}</span>
          <span class="meta-dot">·</span>
          <span class="time">${time || '30 mins'}</span>
          <span class="meta-dot">·</span>
          <span class="difficulty">${difficulty || 'Medium'}</span>
        </div>
        <span class="view-recipe">View Recipe →</span>
      </div>
    </a>
  `;
};

const generateSliderHTML = (article) => {
  const { id, title, category, time, image_url } = article;
  return `
    <a href="article.html?id=${id}" class="slider-slide">
      <div class="slide-bg" style="background-image:url('${image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2000'}')"></div>
      <div class="slide-content">
        <span class="hero-badge">${category || 'Featured'}</span>
        <h2 class="slide-title">${title}</h2>
        <div class="slide-meta">
          <span>⏱ ${time || '30 mins'}</span>
        </div>
      </div>
    </a>
  `;
};

// ======================== HOME PAGE ========================
let heroInterval = null;
let heroCurrentIndex = 0;

const startHeroAutoPlay = () => {
  const slides = qsa('.hero-slider .slider-slide');
  if (slides.length <= 1) return;
  
  // Show first slide
  slides.forEach((s, i) => {
    s.style.position = 'absolute';
    s.style.inset = '0';
    s.style.opacity = i === 0 ? '1' : '0';
    s.style.transition = 'opacity 0.8s ease-in-out';
    s.style.pointerEvents = i === 0 ? 'auto' : 'none';
  });

  heroInterval = setInterval(() => {
    const slides = qsa('.hero-slider .slider-slide');
    if (!slides.length) return;
    slides[heroCurrentIndex].style.opacity = '0';
    slides[heroCurrentIndex].style.pointerEvents = 'none';
    heroCurrentIndex = (heroCurrentIndex + 1) % slides.length;
    slides[heroCurrentIndex].style.opacity = '1';
    slides[heroCurrentIndex].style.pointerEvents = 'auto';
    
    // Update indicators
    qsa('.hero-indicators .indicator-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === heroCurrentIndex);
    });
  }, 3000);
};

const renderArticles = (articles) => {
  console.log('[DEBUG] renderArticles called with', articles?.length, 'articles');
  const editorsSelectionGrid = qs('.editors-selection .grid-3');
  const freshKitchenGrid = qs('.fresh-kitchen .grid-4x2');
  const heroSlider = qs('.hero-slider');
  
  console.log('[DEBUG] DOM selectors:', { editorsSelectionGrid: !!editorsSelectionGrid, freshKitchenGrid: !!freshKitchenGrid, heroSlider: !!heroSlider });
  
  if (!editorsSelectionGrid || !freshKitchenGrid) {
    console.warn('[DEBUG] Aborting renderArticles because a grid is missing');
    return;
  }

  editorsSelectionGrid.innerHTML = '';
  freshKitchenGrid.innerHTML = '';
  if (heroSlider) heroSlider.innerHTML = '';

  // Top 5 for Slider — now single-view with auto-advance
  if (heroSlider) {
    const sliderArticles = articles.slice(0, 5);
    sliderArticles.forEach(a => {
      heroSlider.insertAdjacentHTML('beforeend', generateSliderHTML(a));
    });
    
    // Add indicator dots
    const indicatorsHTML = `<div class="hero-indicators">${sliderArticles.map((_, i) => `<div class="indicator-dot${i === 0 ? ' active' : ''}" data-index="${i}"></div>`).join('')}</div>`;
    heroSlider.insertAdjacentHTML('afterend', indicatorsHTML);
    
    // Bind indicator clicks
    qsa('.hero-indicators .indicator-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        const slides = qsa('.hero-slider .slider-slide');
        slides[heroCurrentIndex].style.opacity = '0';
        slides[heroCurrentIndex].style.pointerEvents = 'none';
        heroCurrentIndex = idx;
        slides[heroCurrentIndex].style.opacity = '1';
        slides[heroCurrentIndex].style.pointerEvents = 'auto';
        qsa('.hero-indicators .indicator-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
        if (heroInterval) clearInterval(heroInterval);
        startHeroAutoPlay();
      });
    });
    
    startHeroAutoPlay();
  }

  // Next 3 for Editor's Selection
  articles.slice(0, 3).forEach(a => {
    editorsSelectionGrid.insertAdjacentHTML('beforeend', generateArticleHTML(a, false));
  });

  // The rest for Fresh Kitchen
  articles.slice(3, 11).forEach(a => {
    freshKitchenGrid.insertAdjacentHTML('beforeend', generateArticleHTML(a, true));
  });

  bindFilters();
};

const bindFilters = () => {
  const freshKitchenGrid = qs('.fresh-kitchen .grid-4x2');
  const filterButtons = qsa('.fresh-kitchen .filter-btn');
  if (!freshKitchenGrid || !filterButtons.length) return;
  
  const compactCards = qsa('.compact-card', freshKitchenGrid);
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.textContent.trim().toLowerCase();
      
      compactCards.forEach(card => {
        const cat = (card.dataset.category || '').toLowerCase();
        let show = filterValue === 'all' || cat.includes(filterValue);
        card.style.display = show ? '' : 'none';
      });
    });
  });
};

// Fallback static articles when Supabase is empty
const fallbackArticles = [
  {
    id: 'f1', title: 'Wild Mushroom Risotto with Parmesan', category: 'Dinner',
    time: '45 mins', difficulty: 'Advanced', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1200',
    explanation: 'A classic Italian dish that combines the creaminess of arborio rice with the deep flavor of fresh mushrooms and Parmigiano Reggiano.<br><br><b>Main Ingredients:</b><br>• 300g Arborio rice<br>• 250g mixed wild mushrooms<br>• 1 liter hot vegetable broth<br>• 100g grated Parmesan cheese<br>• 1 finely chopped onion<br><br><b>Step-by-Step Instructions:</b><br><br><i>Step 1:</i> Sauté the onion in olive oil and butter until translucent. Add the mushrooms and cook until they release their juices.<br><br><i>Step 2:</i> Add the Arborio rice and toast for 2 minutes, stirring constantly. Add a splash of white wine and let it evaporate.<br><br><i>Step 3:</i> Begin adding the hot vegetable broth one ladle at a time, stirring continuously and waiting for each addition to be absorbed before adding the next.<br><br><i>Step 4:</i> When the rice is al dente, remove from heat. Stir in the Parmesan cheese, salt, pepper and a tablespoon of cold butter. Cover and let rest 2 minutes before serving.<br><br><b>Chef\'s Tip:</b> The secret to perfect risotto is patience when adding the broth and keeping the liquid hot so it doesn\'t interrupt the rice\'s cooking process.'
  },
  {
    id: 'f2', title: 'Tacos al Pastor with Grilled Pineapple', category: 'Dinner',
    time: '60 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1200',
    explanation: 'The traditional Mexican recipe with pork marinated in achiote, chilies and spices, topped with caramelized pineapple.<br><br><b>Main Ingredients:</b><br>• 1 kg pork loin or leg, thinly sliced<br>• 100g achiote paste<br>• 3 guajillo and 2 pasilla chilies (dried and deseeded)<br>• 1/2 cup white vinegar<br>• 1/2 fresh pineapple, sliced<br>• Corn tortillas, cilantro and onion<br><br><b>Step-by-Step Instructions:</b><br><br><i>Step 1:</i> Boil the chilies in water until soft. Blend with achiote, vinegar, garlic, salt and spices into a thick paste.<br><br><i>Step 2:</i> Marinate the pork slices in the mixture for at least 4 hours (ideally overnight in the refrigerator).<br><br><i>Step 3:</i> On a hot skillet or grill, cook the meat slice by slice until golden and slightly charred on the edges. Also grill the pineapple slices.<br><br><i>Step 4:</i> Chop the meat and pineapple. Serve on warm tortillas and garnish with diced onion and fresh cilantro.<br><br><b>Chef\'s Tip:</b> If you don\'t have a trompo (the traditional vertical spit), stacking the marinated slices and slow-roasting them before searing in a pan gives a very similar result.'
  },
  {
    id: 'f3', title: 'Açaí Bowl with Homemade Granola', category: 'Breakfast',
    time: '15 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1200',
    explanation: 'An energizing and refreshing breakfast with Brazilian açaí, fresh fruits and crunchy homemade granola.<br><br><b>Main Ingredients:</b><br>• 2 packets (100g each) unsweetened frozen açaí purée<br>• 1 frozen banana<br>• 1/2 cup almond milk or apple juice<br>• Homemade granola to taste<br>• Strawberries, blueberries and fresh banana slices<br>• Honey or agave syrup (optional)<br><br><b>Step-by-Step Instructions:</b><br><br><i>Step 1:</i> Remove the açaí packets from the freezer 5 minutes ahead to soften slightly. Break into pieces and add to the blender.<br><br><i>Step 2:</i> Add the frozen banana and a splash of almond milk. Blend on low speed, using the blender tamper to push ingredients toward the blades, aiming for a thick ice cream-like texture.<br><br><i>Step 3:</i> Serve the thick mixture immediately into a chilled bowl.<br><br><i>Step 4:</i> Arrange toppings in neat rows: a row of crunchy granola, followed by banana slices, strawberries and blueberries. Drizzle with a bit of honey for extra sweetness.<br><br><b>Chef\'s Tip:</b> The secret to a good bowl is using minimal liquid when blending. Too much and it becomes a drinkable smoothie instead of a spoonable bowl.'
  },
  {
    id: 'f4', title: 'Miso-Ginger Glazed Salmon', category: 'Dinner',
    time: '35 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200',
    explanation: 'Salmon fillets coated in an umami-rich white miso, mirin and fresh ginger glaze, baked to perfection.'
  },
  {
    id: 'f5', title: 'Authentic Roman Pasta Carbonara', category: 'Dinner',
    time: '25 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1200',
    explanation: 'The original recipe without cream: crispy guanciale, pecorino romano, egg yolks and black pepper.'
  },
  {
    id: 'f6', title: 'Mediterranean Quinoa Salad', category: 'Sides',
    time: '20 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200',
    explanation: 'Cooked quinoa with cherry tomatoes, cucumber, kalamata olives, feta cheese and a lemon-herb dressing.'
  },
  {
    id: 'f7', title: 'Japanese Soufflé Pancakes', category: 'Breakfast',
    time: '30 mins', difficulty: 'Advanced', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1200',
    explanation: 'The famous fluffy Japanese pancakes, made with whipped meringue to achieve that irresistible cloud-like texture.'
  },
  {
    id: 'f8', title: 'Classic Guacamole with Tortilla Chips', category: 'Sides',
    time: '10 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1200',
    explanation: 'Ripe avocado with fresh cilantro, red onion, jalapeño, lime juice and sea salt.'
  },
];

const fetchAndRenderPosts = async () => {
  console.log('[DEBUG] fetchAndRenderPosts started');
  try {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    console.log('[DEBUG] Supabase response:', { data, error });

    if (error) throw error;
    if (data && data.length > 0) {
      console.log('[DEBUG] Rendering data from Supabase');
      renderArticles(data);
    } else {
      console.log('[DEBUG] No posts in Supabase, using fallback articles');
      renderArticles(fallbackArticles);
    }
  } catch (err) {
    console.error('[DEBUG] Error fetching posts:', err);
    console.log('[DEBUG] Using fallback articles due to error');
    renderArticles(fallbackArticles);
  }
};

// ======================== ARTICLE DETAIL PAGE ========================
const fetchAndRenderSinglePost = async (id) => {
  const articleContainer = qs('#article-container');
  if (!articleContainer) return;
  
  try {
    let articleData = fallbackArticles.find(a => String(a.id) === String(id));
    
    // Always try Supabase first unless it's obviously a fallback ID like "f1", but we can just query safely
    if (!articleData || !String(id).startsWith('f')) {
      const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error && data) {
        articleData = data;
      }
    }

    if (!articleData) {
      articleContainer.innerHTML = `
        <div style="text-align:center; padding:80px 0;">
          <h2>Recipe not found</h2>
          <a href="index.html" class="btn-primary" style="margin-top:20px; display:inline-block;">← Back to Home</a>
        </div>
      `;
      return;
    }

    const { title, category, time, difficulty, rating_stars, image_url, explanation } = articleData;
    
    articleContainer.innerHTML = `
      <div class="article-header" style="text-align: center; margin-bottom: 40px;">
        <span class="hero-badge">${category || 'Recipe'}</span>
        <h1 style="font-size: 42px; line-height: 1.2; margin-bottom: 20px;">${title}</h1>
        <div style="font-size: 14px; color: var(--muted); display: flex; justify-content: center; gap: 12px;">
          <span>${rating_stars || '★★★★★'}</span>
          <span>·</span>
          <span>⏱ ${time || '30 mins'}</span>
          <span>·</span>
          <span>${difficulty || 'Medium'}</span>
        </div>
      </div>
      
      <div style="border-radius: 24px; overflow: hidden; height: 400px; margin-bottom: 40px; background-image: url('${image_url || 'https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=1200'}'); background-size: cover; background-position: center;"></div>
      
      <div class="article-layout-grid">
        <aside class="article-sidebar sidebar-left">
        </aside>
        
        <div class="article-main-content">
          <div class="article-content" style="font-size: 18px; line-height: 1.8; color: var(--text);">
            ${explanation ? explanation.replace(/\\n/g, '<br>') : '<p>Recipe coming soon.</p>'}
          </div>
          
          <div style="text-align:center; margin-top: 60px; padding-top: 30px; border-top: 1px solid var(--border);">
            <a href="index.html" style="color: var(--orange); font-weight: 600; font-size: 16px;">← Back to Home</a>
          </div>
        </div>
        
        <aside class="article-sidebar sidebar-right">
        </aside>
      </div>
    `;
    
    document.title = `${title} - Sazón Blog`;
    
  } catch (err) {
    console.error('Error fetching single post:', err);
    articleContainer.innerHTML = '<h2 style="text-align:center;">Error loading recipe</h2>';
  }
};

// ======================== SEARCH ========================
const initSearch = (bars) => {
  const searchBars = Array.isArray(bars) && bars.length ? bars : qsa('.search-bar');
  
  searchBars.forEach(bar => {
    const input = qs('input', bar);
    if (!input) return;

    if (bar.dataset.searchInit === 'true') return;
    bar.dataset.searchInit = 'true';

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    bar.appendChild(dropdown);

    let debounceTimer;

    const renderResults = (results) => {
      if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-no-results">No recipes found.</div>';
      } else {
        dropdown.innerHTML = results.slice(0, 5).map(article => `
          <a href="article.html?id=${article.id}" class="search-result-item">
            <div class="search-result-img" style="background-image:url('${article.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=100'}')"></div>
            <div class="search-result-info">
              <span class="search-result-title">${article.title}</span>
              <span class="search-result-cat">${article.category || 'Recipe'} • ⏱ ${article.time || '20m'}</span>
            </div>
          </a>
        `).join('');
      }
      dropdown.classList.add('active');
    };

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      
      clearTimeout(debounceTimer);
      
      if (!q) {
        dropdown.classList.remove('active');
        return;
      }

      dropdown.innerHTML = '<div class="search-no-results">Searching...</div>';
      dropdown.classList.add('active');

      debounceTimer = setTimeout(async () => {
        try {
          const { data, error } = await supabaseClient
            .from('posts')
            .select('id, title, category, time, image_url')
            .ilike('title', `%${q}%`)
            .limit(5);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            renderResults(data);
          } else {
            // Fallback search
            const localMatches = fallbackArticles.filter(a => a.title.toLowerCase().includes(q));
            renderResults(localMatches);
          }
        } catch (err) {
          console.error('Search error:', err);
          const localMatches = fallbackArticles.filter(a => a.title.toLowerCase().includes(q));
          renderResults(localMatches);
        }
      }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!bar.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Still allow Enter key to go to categories as general search
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) window.location.href = `categories.html?q=${encodeURIComponent(q)}`;
      }
    });
  });
};

// ======================== NEWSLETTER ========================
const initNewsletter = () => {
  const form = qs('.subscribe-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = qs('input[type="email"]', form);
    const btn = qs('button', form);
    const email = emailInput.value.trim();
    
    if (!email) return;
    
    btn.disabled = true;
    btn.textContent = 'Subscribing...';
    
    try {
      const { error } = await supabaseClient.from('subscribers').insert({ email });
      
      if (error) {
        if (error.code === '23505') {
          showFormMessage(form, 'You are already subscribed!', false);
        } else {
          throw error;
        }
      } else {
        showFormMessage(form, 'Successfully subscribed!', false);
        emailInput.value = '';
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      showFormMessage(form, 'Error subscribing. Please try again.', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Subscribe Now';
    }
  });
};

// ======================== CONTACT ========================
const initContact = () => {
  const form = qs('#contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = qs('#contact-name', form).value.trim();
    const email = qs('#contact-email', form).value.trim();
    const message = qs('#contact-message', form).value.trim();
    const btn = qs('button[type="submit"]', form);
    
    if (!name || !email || !message) {
      showFormMessage(form, 'Please fill all fields', true);
      return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    try {
      const { error } = await supabaseClient.from('contacts').insert({ name, email, message });
      if (error) throw error;
      showFormMessage(form, 'Message received! We\'ll get back to you soon.', false);
      form.reset();
    } catch (err) {
      console.error('Contact error:', err);
      showFormMessage(form, 'Error sending message. Please try again.', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
};

// ======================== LOGIN ========================
const initLogin = () => {
  const form = qs('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#login-email', form).value.trim();
    const password = qs('#login-password', form).value.trim();
    const btn = qs('button[type="submit"]', form);
    
    if (!email || !password) {
      showFormMessage(form, 'Please fill all fields', true);
      return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Login error:', err);
      showFormMessage(form, err.message || 'Invalid credentials', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
};

// ======================== REGISTER ========================
const initRegister = () => {
  const form = qs('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#register-email', form).value.trim();
    const password = qs('#register-password', form).value.trim();
    const confirmPassword = qs('#register-confirm', form).value.trim();
    const btn = qs('button[type="submit"]', form);
    
    if (!email || !password || !confirmPassword) {
      showFormMessage(form, 'Please fill all fields', true);
      return;
    }
    if (password !== confirmPassword) {
      showFormMessage(form, 'Passwords do not match', true);
      return;
    }
    if (password.length < 6) {
      showFormMessage(form, 'Password must be at least 6 characters', true);
      return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Creating account...';
    
    try {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      showFormMessage(form, 'Account created! Redirecting...', false);
      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      showFormMessage(form, err.message || 'Registration failed', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
};

// ======================== CATEGORIES PAGE ========================
const initCategories = async () => {
  const grid = qs('#categories-grid');
  const chipsContainer = qs('#category-chips');
  const pageTitle = qs('#categories-title');
  const pageSubtitle = qs('#categories-subtitle');
  if (!grid) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchQ = urlParams.get('q') || '';
  const catFilter = urlParams.get('cat') || '';
  
  if (searchQ) {
    if (pageTitle) pageTitle.textContent = `Results: "${searchQ}"`;
    if (pageSubtitle) pageSubtitle.textContent = 'Showing recipes matching your search';
  }

  // Fetch categories
  try {
    const { data: posts } = await supabaseClient.from('posts').select('category');
    if (posts) {
      const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
      if (chipsContainer) {
        chipsContainer.innerHTML = `<button class="filter-btn ${!catFilter ? 'active' : ''}" data-cat="">All</button>` +
          cats.map(c => `<button class="filter-btn ${catFilter === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
        
        qsa('.filter-btn', chipsContainer).forEach(btn => {
          btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            window.location.href = cat ? `categories.html?cat=${encodeURIComponent(cat)}` : 'categories.html';
          });
        });
      }
    }
  } catch (e) { console.error(e); }

  // Fetch articles
  try {
    let query = supabaseClient.from('posts').select('*').order('id', { ascending: false });
    
    if (catFilter) {
      query = query.eq('category', catFilter);
    }
    if (searchQ) {
      query = query.ilike('title', `%${searchQ}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data && data.length > 0) {
      grid.innerHTML = data.map(a => generateArticleHTML(a, false)).join('');
    } else {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px 0; color:var(--muted); font-size:18px;">No recipes found</div>';
    }
  } catch (err) {
    console.error('Error fetching for categories:', err);
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:60px 0;">Error loading recipes</div>';
  }
};

// ======================== HELPERS ========================
const showFormMessage = (form, message, isError) => {
  let msgEl = qs('.form-message', form.parentElement);
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'form-message';
    form.parentElement.insertBefore(msgEl, form.nextSibling);
  }
  msgEl.textContent = message;
  msgEl.className = `form-message ${isError ? 'error' : 'success'}`;
  msgEl.style.display = 'block';
  
  if (!isError) {
    setTimeout(() => { msgEl.style.display = 'none'; }, 5000);
  }
};

// ======================== INIT ========================
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  // Update auth state in header (truly non-blocking)
  updateAuthUI().catch(e => console.warn('Auth UI update failed, continuing:', e));
  
  // Init search on all pages
  initSearch();
  
  // Page-specific init
  if (articleId) {
    fetchAndRenderSinglePost(articleId);
  } else if (qs('.editors-selection')) {
    // Home page
    fetchAndRenderPosts();
    initNewsletter();
  }
  
  // Feature-specific init
  initLogin();
  initRegister();
  initContact();
  initCategories();
});
