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

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMobile.hidden = expanded;

    if (!expanded && headerSearchBar) {
      headerSearchBar.classList.remove('is-open');
      if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
    }
  });
  qsa('#nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.hidden = true;
    });
  });
}

if (searchToggle && headerSearchBar) {
  const closeSearch = () => {
    headerSearchBar.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
  };

  searchToggle.addEventListener('click', () => {
    if (window.event) window.event.stopPropagation();
    const isOpen = headerSearchBar.classList.contains('is-open');
    if (isOpen) {
      closeSearch();
      return;
    }

    headerSearchBar.classList.add('is-open');
    searchToggle.setAttribute('aria-expanded', 'true');

    const input = qs('input', headerSearchBar);
    if (input) input.focus();

    if (navToggle && navMobile && !navMobile.hidden) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.hidden = true;
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
    id: 'f1', title: 'Risotto de Hongos Silvestres con Parmesano', category: 'Dinner',
    time: '45 mins', difficulty: 'Advanced', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1200',
    explanation: 'Un clásico italiano que combina la cremosidad del arroz arborio con el sabor profundo de hongos frescos y parmesano reggiano.<br><br><b>Ingredientes principales:</b><br>• 300g de arroz Arborio<br>• 250g de hongos silvestres mixtos<br>• 1 litro de caldo de verduras caliente<br>• 100g de queso Parmesano rallado<br>• 1 cebolla picada finamente<br><br><b>Instrucciones paso a paso:</b><br><br><i>Paso 1:</i> Saltea la cebolla en aceite de oliva y mantequilla hasta que esté transparente. Agrega los hongos y cocina hasta que suelten su jugo.<br><br><i>Paso 2:</i> Incorpora el arroz Arborio y tuesta durante 2 minutos revolviendo constantemente. Agrega un chorrito de vino blanco y deja evaporar.<br><br><i>Paso 3:</i> Comienza a agregar el caldo de verduras caliente, un cucharón a la vez, revolviendo sin parar y esperando a que se absorba antes de agregar el siguiente.<br><br><i>Paso 4:</i> Cuando el arroz esté al dente, retira del fuego. Incorpora el queso Parmesano, sal, pimienta y una cucharada de mantequilla fría. Cubre y deja reposar 2 minutos antes de servir.<br><br><b>Consejo del Chef:</b> El secreto para un risotto perfecto es la paciencia al agregar el caldo y mantener el líquido caliente para no cortar la cocción del arroz.'
  },
  {
    id: 'f2', title: 'Tacos al Pastor con Piña Asada', category: 'Dinner',
    time: '60 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1200',
    explanation: 'La receta tradicional mexicana con cerdo marinado en achiote, chiles y especias, coronado con piña caramelizada.<br><br><b>Ingredientes principales:</b><br>• 1 kg de lomo o pierna de cerdo en filetes finos<br>• 100g de pasta de achiote<br>• 3 chiles guajillo y 2 chiles pasilla (secos y desvenados)<br>• 1/2 taza de vinagre blanco<br>• 1/2 piña natural en rebanadas<br>• Tortillas de maíz, cilantro y cebolla<br><br><b>Instrucciones paso a paso:</b><br><br><i>Paso 1:</i> Hierve los chiles en agua hasta que ablanden. Licúalos con el achiote, vinagre, ajo, sal y especias hasta formar un adobo espeso.<br><br><i>Paso 2:</i> Marina los filetes de cerdo en esta mezcla durante al menos 4 horas (idealmente toda la noche en el refrigerador).<br><br><i>Paso 3:</i> En un sartén caliente o parrilla, asa la carne filete por filete hasta que esté dorada y ligeramente chamuscada en los bordes. Asa también las rebanadas de piña.<br><br><i>Paso 4:</i> Pica la carne y la piña. Sirve sobre tortillas calientes y decora con cebolla picada y cilantro fresco.<br><br><b>Consejo del Chef:</b> Si no tienes un trompo (el asador vertical tradicional), apilar los filetes marinados y hornearlos lentamente antes de dorarlos en la sartén da un resultado muy similar.'
  },
  {
    id: 'f3', title: 'Bowl de Açaí con Granola Artesanal', category: 'Breakfast',
    time: '15 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1200',
    explanation: 'Un desayuno energético y refrescante con açaí brasileño, frutas frescas y granola crujiente hecha en casa.<br><br><b>Ingredientes principales:</b><br>• 2 paquetes (100g c/u) de puré de açaí congelado sin azúcar<br>• 1 plátano congelado<br>• 1/2 taza de leche de almendras o jugo de manzana<br>• Granola artesanal al gusto<br>• Fresas, arándanos y rodajas de plátano fresco<br>• Miel o jarabe de agave (opcional)<br><br><b>Instrucciones paso a paso:</b><br><br><i>Paso 1:</i> Saca los paquetes de açaí del congelador 5 minutos antes para que se ablanden un poco. Rómpelos en trozos y ponlos en la licuadora.<br><br><i>Paso 2:</i> Agrega el plátano congelado y un chorrito de leche de almendras. Licúa a baja velocidad usando el tamper de la licuadora para empujar hacia las cuchillas, buscando una textura de helado espeso.<br><br><i>Paso 3:</i> Sirve la mezcla gruesa inmediatamente en un bowl frío.<br><br><i>Paso 4:</i> Decora en filas ordenadas: una fila de granola crujiente, seguida de rodajas de plátano, fresas y arándanos. Rocía con un poco de miel si deseas dulzor extra.<br><br><b>Consejo del Chef:</b> El secreto de un buen bowl es usar poca cantidad de líquido al licuar. Si te pasas, será un smoothie para beber en lugar de comer con cuchara.'
  },
  {
    id: 'f4', title: 'Salmón Glaseado con Miso y Jengibre', category: 'Dinner',
    time: '35 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200',
    explanation: 'Filetes de salmón bañados en una salsa umami de miso blanco, mirin y jengibre fresco, horneados a la perfección.'
  },
  {
    id: 'f5', title: 'Pasta Carbonara Auténtica Romana', category: 'Dinner',
    time: '25 mins', difficulty: 'Medium', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1200',
    explanation: 'La receta original sin crema: guanciale crujiente, pecorino romano, yemas de huevo y pimienta negra.'
  },
  {
    id: 'f6', title: 'Ensalada Mediterránea con Quinoa', category: 'Sides',
    time: '20 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200',
    explanation: 'Quinoa cocida con tomates cherry, pepino, aceitunas kalamata, queso feta y un aderezo de limón y hierbas.'
  },
  {
    id: 'f7', title: 'Pancakes Japoneses Soufflé', category: 'Breakfast',
    time: '30 mins', difficulty: 'Advanced', rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1200',
    explanation: 'Los famosos pancakes esponjosos japoneses, hechos con merengue batido para lograr esa textura de nube irresistible.'
  },
  {
    id: 'f8', title: 'Guacamole Clásico con Totopos', category: 'Sides',
    time: '10 mins', difficulty: 'Easy', rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1200',
    explanation: 'Aguacate maduro con cilantro fresco, cebolla roja, jalapeño, jugo de limón y sal de mar.'
  },
];

const fetchAndRenderPosts = async () => {
  console.log('[DEBUG] fetchAndRenderPosts started');
  try {
    const { data, error } = await supabase
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
          <div class="ad-skyscraper">Espacio Publicitario</div>
        </aside>
        
        <div class="article-main-content">
          <div class="article-content" style="font-size: 18px; line-height: 1.8; color: var(--text);">
            ${explanation ? explanation.replace(/\\n/g, '<br>') : '<p>Receta en preparación.</p>'}
          </div>
          
          <div style="text-align:center; margin-top: 60px; padding-top: 30px; border-top: 1px solid var(--border);">
            <a href="index.html" style="color: var(--orange); font-weight: 600; font-size: 16px;">← Volver al inicio</a>
          </div>
        </div>
        
        <aside class="article-sidebar sidebar-right">
          <div class="ad-skyscraper">Espacio Publicitario</div>
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
const initSearch = () => {
  const searchBars = qsa('.search-bar');
  
  searchBars.forEach(bar => {
    const input = qs('input', bar);
    if (!input) return;

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    bar.appendChild(dropdown);

    let debounceTimer;

    const renderResults = (results) => {
      if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-no-results">No se encontraron recetas.</div>';
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

      dropdown.innerHTML = '<div class="search-no-results">Buscando...</div>';
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
          showFormMessage(form, '¡Ya estás suscrito!', false);
        } else {
          throw error;
        }
      } else {
        showFormMessage(form, '¡Suscripción exitosa!', false);
        emailInput.value = '';
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      showFormMessage(form, 'Error al suscribir. Intenta de nuevo.', true);
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
