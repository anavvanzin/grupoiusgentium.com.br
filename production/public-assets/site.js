const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const debounce = (fn, delay = 220) => {
  let timer
  return (...args) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

const menuTrigger = $('[data-menu-trigger]')
const mobileMenu = $('[data-mobile-menu]')

if (menuTrigger && mobileMenu) {
  menuTrigger.addEventListener('click', () => {
    const open = menuTrigger.getAttribute('aria-expanded') === 'true'
    menuTrigger.setAttribute('aria-expanded', String(!open))
    mobileMenu.classList.toggle('is-open', !open)
  })
}

const searchDialog = $('[data-search-dialog]')
const globalSearch = $('[data-global-search]')
const globalResults = $('[data-global-results]')

const openSearch = () => {
  if (!searchDialog) return
  if (!searchDialog.open) searchDialog.showModal()
  window.setTimeout(() => globalSearch?.focus(), 40)
}

const closeSearch = () => {
  if (searchDialog?.open) searchDialog.close()
}

$$('[data-open-search]').forEach((button) => button.addEventListener('click', openSearch))
$('[data-close-search]')?.addEventListener('click', closeSearch)

searchDialog?.addEventListener('click', (event) => {
  if (event.target === searchDialog) closeSearch()
})

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
  }
})

const renderGlobalResults = (items, query) => {
  if (!globalResults) return
  if (!query) {
    globalResults.innerHTML = ''
    return
  }
  if (!items.length) {
    globalResults.innerHTML = '<p class="search-empty">Nenhum documento encontrado. Tente uma ideia mais ampla.</p>'
    return
  }
  globalResults.innerHTML = items.slice(0, 8).map((item) => `
    <a class="search-result" href="/arquivo/${encodeURIComponent(item.slug)}">
      <span>${escapeHtml(item.year)} · ${escapeHtml(item.type)}</span>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.eyebrow)}</p></div>
      <b aria-hidden="true">↗</b>
    </a>
  `).join('')
}

const runGlobalSearch = debounce(async (query) => {
  const value = query.trim()
  if (!value) return renderGlobalResults([], '')
  globalResults.innerHTML = '<p class="search-empty">Consultando o arquivo…</p>'
  try {
    const response = await fetch(`/api/archive?q=${encodeURIComponent(value)}`)
    if (!response.ok) throw new Error('search failed')
    const data = await response.json()
    renderGlobalResults(data.results, value)
  } catch {
    globalResults.innerHTML = '<p class="search-empty">A busca está temporariamente indisponível.</p>'
  }
})

globalSearch?.addEventListener('input', (event) => runGlobalSearch(event.currentTarget.value))

$$('[data-suggestion]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!globalSearch) return
    globalSearch.value = button.dataset.suggestion || ''
    globalSearch.dispatchEvent(new Event('input', { bubbles: true }))
    globalSearch.focus()
  })
})

const archiveResults = $('[data-archive-results]')
const archiveQuery = $('[data-archive-query]')
const archiveCount = $('[data-archive-count]')
const archiveFilterButtons = $$('[data-filter]')
let archiveType = ''

const renderArchiveCards = (items) => {
  if (!archiveResults) return
  if (!items.length) {
    archiveResults.innerHTML = '<p class="empty-state">Nenhum documento corresponde a esse percurso. Tente outro termo ou remova o filtro.</p>'
    return
  }
  archiveResults.innerHTML = items.map((item, index) => `
    <article class="archive-card is-visible" data-type="${escapeHtml(item.type)}">
      <div class="archive-meta"><span>${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(item.type)}</span></div>
      <div class="archive-copy">
        <p class="micro-label">${escapeHtml(item.eyebrow)}</p>
        <h3><a href="/arquivo/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="tag-row">${item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
      <a class="card-arrow" href="/arquivo/${encodeURIComponent(item.slug)}" aria-label="Abrir ${escapeHtml(item.title)}">↗</a>
    </article>
  `).join('')
}

const updateArchive = debounce(async () => {
  if (!archiveResults) return
  const query = archiveQuery?.value.trim() || ''
  archiveResults.setAttribute('aria-busy', 'true')
  try {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (archiveType) params.set('type', archiveType)
    const response = await fetch(`/api/archive?${params}`)
    if (!response.ok) throw new Error('archive failed')
    const data = await response.json()
    renderArchiveCards(data.results)
    if (archiveCount) archiveCount.textContent = String(data.count)
  } catch {
    archiveResults.innerHTML = '<p class="empty-state">Não foi possível consultar o arquivo agora.</p>'
  } finally {
    archiveResults.removeAttribute('aria-busy')
  }
}, 180)

archiveQuery?.addEventListener('input', updateArchive)
archiveFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    archiveType = button.dataset.filter || ''
    archiveFilterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
    updateArchive()
  })
})

const libraryQuery = $('[data-library-query]')
const libraryCards = $$('.resource-card[data-family]')
const libraryButtons = $$('[data-library-filter]')
const libraryEmpty = $('[data-library-empty]')
let libraryFamily = ''

const filterLibrary = () => {
  const query = libraryQuery?.value.trim().toLocaleLowerCase('pt-BR') || ''
  let visible = 0
  libraryCards.forEach((card) => {
    const familyMatch = !libraryFamily || card.dataset.family === libraryFamily
    const queryMatch = !query || (card.dataset.search || '').includes(query)
    card.hidden = !(familyMatch && queryMatch)
    if (!card.hidden) visible += 1
  })
  if (libraryEmpty) libraryEmpty.hidden = visible !== 0
}

libraryQuery?.addEventListener('input', debounce(filterLibrary, 120))
libraryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    libraryFamily = button.dataset.libraryFilter || ''
    libraryButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
    filterLibrary()
  })
})

const atlasNodes = $$('[data-atlas-node]')
const atlasDetail = $('[data-atlas-detail]')

atlasNodes.forEach((node) => {
  node.addEventListener('click', () => {
    atlasNodes.forEach((item) => item.setAttribute('aria-pressed', String(item === node)))
    if (!atlasDetail) return
    atlasDetail.animate(
      [{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }
    )
    atlasDetail.innerHTML = `
      <span>${escapeHtml(node.dataset.country)} · ${escapeHtml(node.dataset.period)}</span>
      <h3>${escapeHtml(node.dataset.city)}</h3>
      <p>${escapeHtml(node.dataset.institution)}</p>
      <small>${escapeHtml(node.dataset.relation)}</small>
    `
  })
})

const liveHighlight = $('[data-live-highlight]')
if (liveHighlight) {
  fetch('/api/highlight')
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((item) => {
      liveHighlight.innerHTML = `<a href="${escapeHtml(item.href)}">Em foco · ${escapeHtml(item.title)} →</a>`
    })
    .catch(() => {})
}

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: .12, rootMargin: '0px 0px -40px' })
  : null

$$('.reveal').forEach((element) => {
  if (revealObserver) revealObserver.observe(element)
  else element.classList.add('is-visible')
})

const progress = $('[data-reading-progress]')
const updateProgress = () => {
  if (!progress) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  const percent = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0
  progress.style.width = `${percent}%`
}

window.addEventListener('scroll', updateProgress, { passive: true })
updateProgress()

$$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()) })
