import { useEffect, useMemo, useState } from 'react'
import './App.css'

const tools = [
  {
    path: '/tools/keyword-ideas',
    title: 'Keyword ideas planner',
    description: 'Expand seed phrases into useful keyword ideas and intent groups.',
    label: 'Research',
    icon: '01',
  },
  {
    path: '/tools/keyword-clusters',
    title: 'Keyword clustering',
    description: 'Organize a keyword list into informational and buying-intent groups.',
    label: 'Organization',
    icon: '02',
  },
  {
    path: '/tools/on-page-checker',
    title: 'On-page content checker',
    description: 'Review a draft for keyword usage, title and description length.',
    label: 'Content',
    icon: '03',
  },
  {
    path: '/tools/html-audit',
    title: 'HTML SEO audit',
    description: 'Check pasted page source for common technical SEO basics.',
    label: 'Technical SEO',
    icon: '04',
  },
]

const resources = [
  {
    path: '/resources/google-keyword-planner',
    title: 'Google Keyword Planner',
    description: 'Research keyword ideas and planning estimates in Google Ads.',
    url: 'https://ads.google.com/home/tools/keyword-planner/',
    action: 'Open Keyword Planner',
  },
  {
    path: '/resources/ahrefs-keyword-generator',
    title: 'Ahrefs Keyword Generator',
    description: 'Explore keyword ideas and related terms with Ahrefs.',
    url: 'https://ahrefs.com/keyword-generator',
    action: 'Open Ahrefs',
  },
  {
    path: '/resources/semrush-keyword-research',
    title: 'Semrush Keyword Research',
    description: 'Research keywords with Semrush’s keyword tools.',
    url: 'https://www.semrush.com/analytics/keywordmagic/',
    action: 'Open Semrush',
  },
  {
    path: '/resources/google-trends',
    title: 'Google Trends',
    description: 'Compare interest over time and explore regional search trends.',
    url: 'https://trends.google.com/trends/',
    action: 'Open Google Trends',
  },
]

const seedExamples = [
  'SEO services',
  'SEO agency',
  'SEO company',
  'website SEO optimization',
  'international SEO services',
]

const keywordModifiers = [
  { text: 'best', position: 'prefix' },
  { text: 'affordable', position: 'prefix' },
  { text: 'professional', position: 'prefix' },
  { text: 'how to choose', position: 'prefix' },
  { text: 'for small businesses', position: 'suffix' },
  { text: 'for ecommerce', position: 'suffix' },
  { text: 'near me', position: 'suffix' },
  { text: 'pricing', position: 'suffix' },
  { text: 'services', position: 'suffix' },
  { text: 'agency', position: 'suffix' },
  { text: 'company', position: 'suffix' },
  { text: 'consultant', position: 'suffix' },
  { text: 'audit', position: 'suffix' },
  { text: 'optimization', position: 'suffix' },
  { text: 'strategy', position: 'suffix' },
  { text: 'tools', position: 'suffix' },
]

function classifyIntent(keyword) {
  const phrase = keyword.toLowerCase()

  if (/\b(how|what|why|guide|tutorial|learn|examples)\b/.test(phrase)) {
    return 'Informational'
  }
  if (/\b(hire|near me|services|agency|company|consultant|pricing|cost|affordable|best)\b/.test(phrase)) {
    return 'Transactional'
  }
  return 'Commercial'
}

function createKeywordIdeas(input) {
  const seeds = [...new Set(input.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))]
  const ideas = new Map()

  seeds.slice(0, 10).forEach((seed) => {
    ideas.set(seed.toLowerCase(), seed)
    keywordModifiers.forEach(({ text, position }) => {
      const idea = position === 'prefix' ? `${text} ${seed}` : `${seed} ${text}`
      ideas.set(idea.toLowerCase(), idea)
    })
  })

  return [...ideas.values()].map((keyword) => ({
    keyword,
    intent: classifyIntent(keyword),
  }))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function analyzePageContent({ title, description, heading, keyword, body }) {
  const phrase = keyword.trim()
  const content = body.trim()
  const words = content ? content.split(/\s+/).filter(Boolean) : []
  const occurrences = phrase
    ? (content.match(new RegExp(escapeRegExp(phrase), 'gi')) ?? []).length
    : 0
  const phraseWords = phrase ? phrase.split(/\s+/).length : 0
  const density = words.length ? (occurrences * phraseWords / words.length) * 100 : 0

  return {
    wordCount: words.length,
    occurrences,
    density: density.toFixed(1),
    checks: [
      { label: 'Title length is within the 50–60 character guideline', passed: title.length >= 50 && title.length <= 60 },
      { label: 'Description length is within the 140–160 character guideline', passed: description.length >= 140 && description.length <= 160 },
      { label: 'Target phrase appears in the title', passed: Boolean(phrase) && title.toLowerCase().includes(phrase.toLowerCase()) },
      { label: 'Target phrase appears in the main heading', passed: Boolean(phrase) && heading.toLowerCase().includes(phrase.toLowerCase()) },
      { label: 'Target phrase appears in the draft content', passed: occurrences > 0 },
      { label: 'Draft contains at least 300 words', passed: words.length >= 300 },
    ],
  }
}

function auditHtml(markup) {
  const documentSource = new DOMParser().parseFromString(markup, 'text/html')
  const description = documentSource.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? ''
  const robots = documentSource.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() ?? ''
  const images = [...documentSource.querySelectorAll('img')]
  const links = [...documentSource.querySelectorAll('a')]
  const h1Count = documentSource.querySelectorAll('h1').length

  return [
    { label: 'Page has a title', passed: Boolean(documentSource.title.trim()), detail: documentSource.title.trim() || 'No title found' },
    { label: 'Meta description is present', passed: Boolean(description), detail: description ? `${description.length} characters` : 'No description found' },
    { label: 'Exactly one H1 heading', passed: h1Count === 1, detail: `${h1Count} H1 heading(s) found` },
    { label: 'Viewport meta tag is present', passed: Boolean(documentSource.querySelector('meta[name="viewport"]')), detail: documentSource.querySelector('meta[name="viewport"]') ? 'Present' : 'Missing' },
    { label: 'Canonical URL is present', passed: Boolean(documentSource.querySelector('link[rel="canonical"]')), detail: documentSource.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'Missing' },
    { label: 'Images have alternative text', passed: images.every((image) => image.hasAttribute('alt') && image.getAttribute('alt').trim()), detail: `${images.filter((image) => !image.hasAttribute('alt') || !image.getAttribute('alt').trim()).length} image(s) need alt text` },
    { label: 'Links have descriptive labels', passed: links.every((link) => link.textContent.trim() || link.getAttribute('aria-label')?.trim()), detail: `${links.filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label')?.trim()).length} unlabeled link(s)` },
    { label: 'Page is not marked noindex', passed: !/\bnoindex\b/.test(robots), detail: /\bnoindex\b/.test(robots) ? 'Robots meta contains noindex' : 'No noindex directive found' },
    { label: 'Document language is specified', passed: Boolean(documentSource.documentElement.getAttribute('lang')), detail: documentSource.documentElement.getAttribute('lang') || 'Missing' },
  ]
}

function InternalLink({ href, onNavigate, className = '', children, ...props }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        onNavigate(href)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

function ToolCard({ item, onNavigate }) {
  return (
    <InternalLink className="tool-card" href={item.path} onNavigate={onNavigate}>
      <span className="tool-number">{item.icon}</span>
      <span className="tool-label">{item.label}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span className="card-link">Open tool <span aria-hidden="true">↗</span></span>
    </InternalLink>
  )
}

function Header({ eyebrow, title, description }) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  )
}

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">RankMaster Pro · SEO workspace</p>
          <h1>Make your next move in search.</h1>
          <p>Research ideas, improve on-page content, and run practical checks—all in one place.</p>
        </div>
        <InternalLink className="primary-btn" href="/tools/keyword-ideas" onNavigate={onNavigate}>
          Explore keyword ideas
        </InternalLink>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Built-in tools</p>
            <h2>Work on your SEO</h2>
          </div>
          <span className="section-note">Runs in your browser</span>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => <ToolCard key={tool.path} item={tool} onNavigate={onNavigate} />)}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Research resources</p>
            <h2>Explore keyword platforms</h2>
          </div>
          <span className="section-note">External services</span>
        </div>
        <div className="resource-grid">
          {resources.map((resource) => (
            <InternalLink
              className="resource-card"
              href={resource.path}
              key={resource.path}
              onNavigate={onNavigate}
            >
              <span className="resource-icon" aria-hidden="true">↗</span>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <span className="card-link">View guide</span>
            </InternalLink>
          ))}
        </div>
      </section>

      <aside className="notice-panel">
        <strong>About search data</strong>
        <p>Built-in tools analyze the information you enter. They do not fetch live search volumes, backlinks, or Google rankings. Use the linked providers for current market data.</p>
      </aside>
    </>
  )
}

function KeywordIdeasPage() {
  const [seeds, setSeeds] = useState(seedExamples.join('\n'))
  const [ideas, setIdeas] = useState([])
  const [filter, setFilter] = useState('')

  const filteredIdeas = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return ideas.filter((item) => item.keyword.toLowerCase().includes(needle))
  }, [filter, ideas])

  function downloadCsv() {
    const rows = [['Keyword', 'Intent'], ...filteredIdeas.map(({ keyword, intent }) => [keyword, intent])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'rankmaster-keyword-ideas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        eyebrow="Keyword research"
        title="Keyword ideas planner"
        description="Turn seed terms into a working list of long-tail ideas. Intent labels are heuristic; search volumes are not fetched."
      />
      <section className="workspace-grid">
        <form
          className="panel form-panel"
          onSubmit={(event) => {
            event.preventDefault()
            setIdeas(createKeywordIdeas(seeds))
          }}
        >
          <label htmlFor="keyword-seeds">Seed keywords <span>One phrase per line</span></label>
          <textarea id="keyword-seeds" rows="8" value={seeds} onChange={(event) => setSeeds(event.target.value)} />
          <div className="form-hint">Up to 10 seed phrases are used per generation.</div>
          <button className="primary-btn" type="submit">Generate keyword ideas</button>
        </form>

        <aside className="panel tip-panel">
          <p className="eyebrow">Ideas to start with</p>
          <h2>Build around intent</h2>
          <p>Try service keywords with modifiers such as “best”, “affordable”, “pricing”, and “for small businesses”. Validate demand in a keyword platform before prioritizing.</p>
          <div className="tip-tags">
            <span>SEO services</span>
            <span>SEO agency</span>
            <span>Website SEO audit</span>
          </div>
        </aside>
      </section>

      {ideas.length > 0 && (
        <section className="panel results-panel" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Generated locally</p>
              <h2>{filteredIdeas.length} keyword ideas</h2>
            </div>
            <button type="button" className="secondary-btn" onClick={downloadCsv}>Download CSV</button>
          </div>
          <div className="result-controls">
            <label htmlFor="idea-filter">Filter ideas</label>
            <input id="idea-filter" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search generated keywords" />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Keyword idea</th><th>Intent estimate</th></tr></thead>
              <tbody>
                {filteredIdeas.map((item) => (
                  <tr key={item.keyword}>
                    <td>{item.keyword}</td>
                    <td><span className={`intent-pill ${item.intent.toLowerCase()}`}>{item.intent}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredIdeas.length === 0 && <p className="empty-state">No ideas match this filter.</p>}
          </div>
        </section>
      )}
    </>
  )
}

function KeywordClustersPage() {
  const [input, setInput] = useState('')
  const [clusters, setClusters] = useState([])

  function groupKeywords(event) {
    event.preventDefault()
    const keywords = [...new Set(input.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))]
    const grouped = keywords.reduce((groups, keyword) => {
      const intent = classifyIntent(keyword)
      groups[intent] ??= []
      groups[intent].push(keyword)
      return groups
    }, {})
    setClusters(Object.entries(grouped))
  }

  return (
    <>
      <Header
        eyebrow="Keyword research"
        title="Keyword clustering"
        description="Paste a list of keywords and group them by a simple search-intent heuristic. Review the groups before using them in a content plan."
      />
      <form className="panel form-panel cluster-form" onSubmit={groupKeywords}>
        <label htmlFor="cluster-keywords">Keywords <span>One keyword per line</span></label>
        <textarea
          id="cluster-keywords"
          rows="10"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'SEO services\nhow to improve website SEO\nbest SEO agency'}
        />
        <button className="primary-btn" type="submit">Group keywords</button>
      </form>
      {clusters.length > 0 && (
        <section className="cluster-grid" aria-live="polite">
          {clusters.map(([intent, keywords]) => (
            <article className="panel cluster-card" key={intent}>
              <p className="eyebrow">{keywords.length} keyword{keywords.length === 1 ? '' : 's'}</p>
              <h2>{intent} intent</h2>
              <ul>{keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

function OnPageCheckerPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heading, setHeading] = useState('')
  const [keyword, setKeyword] = useState('')
  const [body, setBody] = useState('')
  const result = useMemo(
    () => analyzePageContent({ title, description, heading, keyword, body }),
    [title, description, heading, keyword, body],
  )
  const titleLength = title.length
  const descriptionLength = description.length

  return (
    <>
      <Header
        eyebrow="Content optimization"
        title="On-page content checker"
        description="Check a draft’s basic metadata and target phrase usage. This is a writing aid, not a Google ranking score."
      />
      <div className="workspace-grid checker-grid">
        <section className="panel form-panel">
          <div className="field">
            <label htmlFor="target-keyword">Target keyword</label>
            <input id="target-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. international SEO services" />
          </div>
          <div className="field">
            <label htmlFor="page-title">SEO title <span>{titleLength} characters · guideline 50–60</span></label>
            <input id="page-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="100" placeholder="Write a clear page title" />
          </div>
          <div className="field">
            <label htmlFor="meta-description">Meta description <span>{descriptionLength} characters · guideline 140–160</span></label>
            <textarea id="meta-description" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} maxLength="300" placeholder="Summarize what the page offers" />
          </div>
          <div className="field">
            <label htmlFor="main-heading">Main heading (H1)</label>
            <input id="main-heading" value={heading} onChange={(event) => setHeading(event.target.value)} placeholder="Write the page's main heading" />
          </div>
          <div className="field">
            <label htmlFor="draft-content">Draft content</label>
            <textarea id="draft-content" rows="8" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Paste or write your draft content here" />
          </div>
        </section>
        <aside className="panel analysis-panel" aria-live="polite">
          <p className="eyebrow">Live analysis</p>
          <h2>{result.wordCount} words</h2>
          <div className="metric-row"><span>Target phrase uses</span><strong>{result.occurrences}</strong></div>
          <div className="metric-row"><span>Approx. phrase density</span><strong>{result.density}%</strong></div>
          <div className="check-list">
            {result.checks.map((check) => (
              <div className="check-row" key={check.label}>
                <span className={check.passed ? 'check-mark passed' : 'check-mark'} aria-hidden="true">{check.passed ? '✓' : '•'}</span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
          <div className="snippet-preview">
            <span>Search snippet preview</span>
            <strong>{title || 'Your page title will appear here'}</strong>
            <p>{description || 'Add a meta description to preview the search snippet.'}</p>
          </div>
        </aside>
      </div>
      <p className="disclaimer">Character-length ranges are editorial guidelines, not guaranteed display limits. Search results may rewrite snippets.</p>
    </>
  )
}

function HtmlAuditPage() {
  const [markup, setMarkup] = useState('')
  const [results, setResults] = useState(null)

  return (
    <>
      <Header
        eyebrow="Technical SEO"
        title="HTML SEO audit"
        description="Paste a page’s HTML source to check common metadata and accessibility basics. This tool does not crawl a URL or execute page scripts."
      />
      <form
        className="panel form-panel audit-form"
        onSubmit={(event) => {
          event.preventDefault()
          setResults(markup.trim() ? auditHtml(markup) : [])
        }}
      >
        <label htmlFor="html-source">HTML source <span>Source is analyzed locally in your browser</span></label>
        <textarea id="html-source" rows="12" value={markup} onChange={(event) => setMarkup(event.target.value)} placeholder="Paste the page's HTML source here" />
        <button className="primary-btn" type="submit">Run HTML audit</button>
      </form>
      {results && (
        <section className="panel audit-results" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Audit results</p>
              <h2>{results.filter((result) => result.passed).length} of {results.length} checks passed</h2>
            </div>
          </div>
          {results.length === 0
            ? <p className="empty-state">Paste HTML source before running the audit.</p>
            : <div className="audit-list">
              {results.map((result) => (
                <div className="audit-row" key={result.label}>
                  <span className={result.passed ? 'check-mark passed' : 'check-mark'} aria-hidden="true">{result.passed ? '✓' : '!'}</span>
                  <div><strong>{result.label}</strong><span>{result.detail}</span></div>
                </div>
              ))}
            </div>}
        </section>
      )}
    </>
  )
}

function ResourcePage({ resource }) {
  const providerNotes = {
    '/resources/google-keyword-planner': [
      'Discover keyword ideas related to a product, service, or website.',
      'Review planning estimates and refine by location or language in your account.',
      'Use the results to shape and prioritize a campaign plan.',
    ],
    '/resources/ahrefs-keyword-generator': [
      'Enter a seed term to explore related keyword ideas.',
      'Choose a search platform and market where the tool offers coverage.',
      'Use the results as research leads, then validate intent and competition.',
    ],
    '/resources/semrush-keyword-research': [
      'Start with a seed keyword to explore related terms.',
      'Filter opportunities by intent, volume, difficulty, and market where available.',
      'Compare related terms before assigning them to pages.',
    ],
    '/resources/google-trends': [
      'Compare search interest for multiple terms over time.',
      'Select a location and time period that matches your audience.',
      'Treat trend values as relative interest, not absolute search volume.',
    ],
  }

  return (
    <>
      <Header
        eyebrow="External research resource"
        title={resource.title}
        description={resource.description}
      />
      <section className="resource-detail-grid">
        <article className="panel resource-detail">
          <p className="eyebrow">How to use it</p>
          <h2>Research with the source platform</h2>
          <ol className="steps-list">
            {providerNotes[resource.path].map((note) => <li key={note}>{note}</li>)}
          </ol>
          <a className="primary-btn" href={resource.url} target="_blank" rel="noopener noreferrer">
            {resource.action} <span aria-hidden="true">↗</span>
          </a>
        </article>
        <aside className="panel notice-panel">
          <strong>Independent resource guide</strong>
          <p>RankMaster Pro is not affiliated with {resource.title}. Availability, features, and account requirements are controlled by the provider.</p>
          <p>Search-volume and trend figures vary by market, date range, and data source. Verify metrics on the provider’s site.</p>
        </aside>
      </section>
    </>
  )
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const currentPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const currentResource = resources.find((resource) => resource.path === currentPath)
  const currentTool = tools.find((tool) => tool.path === currentPath)

  function navigate(path) {
    if (path === currentPath) return
    window.history.pushState({}, '', path)
    setPathname(path)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const pageTitle = currentResource?.title ?? currentTool?.title ?? 'SEO Tools'
    document.title = `${pageTitle} | RankMaster Pro`
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute(
        'content',
        currentResource?.description ?? currentTool?.description ?? 'Practical SEO tools for keyword research, content optimization, and technical checks.',
      )
    }
  }, [currentPath, currentResource, currentTool])

  let page
  if (currentResource) {
    page = <ResourcePage resource={currentResource} />
  } else if (currentPath === '/tools/keyword-ideas') {
    page = <KeywordIdeasPage />
  } else if (currentPath === '/tools/keyword-clusters') {
    page = <KeywordClustersPage />
  } else if (currentPath === '/tools/on-page-checker') {
    page = <OnPageCheckerPage />
  } else if (currentPath === '/tools/html-audit') {
    page = <HtmlAuditPage />
  } else {
    page = <HomePage onNavigate={navigate} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <InternalLink className="brand-block" href="/" onNavigate={navigate}>
          <span className="brand-mark">RM</span>
          <span>
            <span className="eyebrow">SEO workspace</span>
            <strong>RankMaster Pro</strong>
          </span>
        </InternalLink>

        <nav className="sidebar-nav" aria-label="SEO tools">
          <p className="nav-heading">Workspace</p>
          <InternalLink className={`nav-item ${currentPath === '/' ? 'active' : ''}`} href="/" onNavigate={navigate}>
            <span aria-hidden="true">⌂</span> Overview
          </InternalLink>
          <p className="nav-heading">Built-in tools</p>
          {tools.map((tool) => (
            <InternalLink
              className={`nav-item ${currentPath === tool.path ? 'active' : ''}`}
              href={tool.path}
              key={tool.path}
              onNavigate={navigate}
            >
              <span className="nav-dot" aria-hidden="true" /> {tool.title}
            </InternalLink>
          ))}
          <p className="nav-heading">Research platforms</p>
          {resources.map((resource) => (
            <InternalLink
              className={`nav-item ${currentPath === resource.path ? 'active' : ''}`}
              href={resource.path}
              key={resource.path}
              onNavigate={navigate}
            >
              <span className="nav-dot resource-dot" aria-hidden="true" /> {resource.title}
            </InternalLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="status-dot" />
          Local tools ready
        </div>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <span>SEO toolkit <span className="crumb-separator">/</span> {currentResource?.title ?? currentTool?.title ?? 'Overview'}</span>
          <span className="topbar-badge">No account required for built-in tools</span>
        </div>
        <div className="page-content">{page}</div>
        <footer className="app-footer">
          <span>RankMaster Pro</span>
          <span>Built-in analyses are estimates and do not replace live search data.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
