// page-carousel template v2 (2026-05-27)
// Fetches https://corvusdevs.github.io/apps.json, filters out the current
// project by slug, renders cards into #corvus-carousel.
//
// Slug detection (in order):
//   1. data-current-slug="..." attribute on #corvus-carousel (RECOMMENDED
//      explicit, works on localhost / file:// / GitHub Pages identically)
//   2. First non-empty path segment of location.pathname (e.g.
//      /Corvus-Player/foo → "Corvus-Player"), works on GH Pages but fails
//      on localhost http://127.0.0.1:8765/ (no path segment)
//   3. Falls back to no exclusion (renders all apps)
//
// Failure modes:
//   - apps.json unreachable: track stays empty, CSS hides the section.
//   - apps.json malformed: console.warn + empty track.
//   - 0 apps after self-exclusion: section hides.

(function() {
    const APPS_JSON_URL = 'https://corvusdevs.github.io/apps.json';
    const section = document.getElementById('corvus-carousel');
    if (!section) return;
    const track = section.querySelector('.corvus-carousel__track');
    if (!track) return;

    function getCurrentSlug() {
        const explicit = section.getAttribute('data-current-slug');
        if (explicit) return explicit.toLowerCase();
        const segs = location.pathname.split('/').filter(Boolean);
        return segs.length ? segs[0].toLowerCase() : '';
    }

    function buildCard(app) {
        const a = document.createElement('a');
        a.className = 'corvus-carousel__card';
        a.href = app.url;
        a.setAttribute('role', 'listitem');
        if (app.accent) a.style.setProperty('--card-accent', `var(--accent-${app.accent}, var(--accent))`);

        const img = document.createElement('img');
        img.className = 'corvus-carousel__card-icon';
        img.src = app.icon;
        img.alt = '';
        img.loading = 'lazy';
        img.width = 56;
        img.height = 56;

        const tag = document.createElement('div');
        tag.className = 'corvus-carousel__card-tagline';
        tag.textContent = app.tagline || '';

        const name = document.createElement('div');
        name.className = 'corvus-carousel__card-name';
        name.textContent = app.name;

        const desc = document.createElement('p');
        desc.className = 'corvus-carousel__card-desc';
        desc.textContent = app.description || '';

        const cta = document.createElement('span');
        cta.className = 'corvus-carousel__card-cta';
        cta.textContent = 'Learn more →';

        a.append(img, tag, name, desc, cta);
        return a;
    }

    function wireNav() {
        const prev = section.querySelector('.corvus-carousel__nav--prev');
        const next = section.querySelector('.corvus-carousel__nav--next');
        if (!prev || !next) return;
        const FADE_PX = 80;
        const stepFn = () => Math.max(track.clientWidth * 0.8, 280 + 16);
        prev.addEventListener('click', () => track.scrollBy({ left: -stepFn(), behavior: 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left: stepFn(), behavior: 'smooth' }));
        function sync() {
            const atStart = track.scrollLeft <= 4;
            const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
            prev.disabled = atStart;
            next.disabled = atEnd;
            track.style.setProperty('--fade-l', atStart ? '0px' : FADE_PX + 'px');
            track.style.setProperty('--fade-r', atEnd ? '0px' : FADE_PX + 'px');
        }
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync, { passive: true });
        sync();
    }

    fetch(APPS_JSON_URL, { cache: 'default' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then(data => {
            const apps = (data && Array.isArray(data.apps)) ? data.apps : [];
            const currentSlug = getCurrentSlug();
            const filtered = apps.filter(a => (a.slug || '').toLowerCase() !== currentSlug);
            if (!filtered.length) {
                section.style.display = 'none';
                return;
            }
            filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            const frag = document.createDocumentFragment();
            for (const app of filtered) frag.appendChild(buildCard(app));
            track.appendChild(frag);
            wireNav();
        })
        .catch(err => {
            // eslint-disable-next-line no-console
            console.warn('[carousel] failed to load apps.json:', err);
            section.style.display = 'none';
        });
})();
