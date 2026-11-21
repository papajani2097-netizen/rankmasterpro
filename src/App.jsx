import { useMemo, useState } from 'react'
import './App.css'

const performanceData = [
  { name: 'Avenue Labs', category: 'Sales', score: 96, trend: '+12%', revenue: '$482K', status: 'Rising' },
  { name: 'Northstar AI', category: 'Marketing', score: 92, trend: '+8%', revenue: '$421K', status: 'Stable' },
  { name: 'Summit Studio', category: 'Creative', score: 89, trend: '+15%', revenue: '$398K', status: 'Rising' },
  { name: 'Signal Peak', category: 'Operations', score: 87, trend: '+4%', revenue: '$366K', status: 'Stable' },
  { name: 'Blue Harbor', category: 'Sales', score: 84, trend: '-2%', revenue: '$334K', status: 'Review' },
  { name: 'Nova Works', category: 'Product', score: 81, trend: '+6%', revenue: '$309K', status: 'Stable' },
]

const categories = ['All', 'Sales', 'Marketing', 'Creative', 'Operations', 'Product']

const highlights = [
  { label: 'Current rank', value: '#2', detail: 'Up 3 spots' },
  { label: 'Growth', value: '+18.4%', detail: 'vs last month' },
  { label: 'Leads qualified', value: '248', detail: 'Across 14 regions' },
]

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredData = useMemo(() => {
    return performanceData.filter((entry) => {
      const matchesCategory =
        activeCategory === 'All' || entry.category === activeCategory
      const matchesQuery = entry.name
        .toLowerCase()
        .includes(query.trim().toLowerCase())

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">RM</div>
          <div>
            <p className="eyebrow">Analytics Suite</p>
            <h2>RankMaster Pro</h2>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button className="nav-item active" type="button">Dashboard</button>
          <button className="nav-item" type="button">Leaderboard</button>
          <button className="nav-item" type="button">Campaigns</button>
          <button className="nav-item" type="button">Reports</button>
        </nav>

        <div className="mini-panel">
          <p className="eyebrow">Momentum</p>
          <h3>+28.6%</h3>
          <span>Quarter over quarter</span>
        </div>

        <a
          className="external-link"
          href="https://directyp.org/4/6fd01df714f02809c481c6a469f37d16"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit DirectYP
        </a>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Performance overview</p>
            <h1>Leadership dashboard</h1>
          </div>
          <button type="button" className="primary-btn">Export report</button>
        </header>

        <section className="stats-grid" aria-label="Summary statistics">
          {highlights.map((item) => (
            <article className="stat-card" key={item.label}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel leaderboard-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Leaderboard</p>
                <h3>Top performers</h3>
              </div>
              <div className="search-wrap">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search team"
                  aria-label="Search team"
                />
              </div>
            </div>

            <div className="filter-row" aria-label="Category filters">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === activeCategory ? 'filter-chip active' : 'filter-chip'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Trend</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry, index) => (
                    <tr key={entry.name}>
                      <td>
                        <div className="team-cell">
                          <span className="rank-badge">#{index + 1}</span>
                          <div>
                            <strong>{entry.name}</strong>
                            <small>{entry.status}</small>
                          </div>
                        </div>
                      </td>
                      <td>{entry.category}</td>
                      <td>
                        <div className="score-cell">
                          <span>{entry.score}</span>
                          <div className="progress-bar">
                            <span style={{ width: `${entry.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="trend">{entry.trend}</td>
                      <td>{entry.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel side-panel">
            <div className="panel-header compact-header">
              <div>
                <p className="eyebrow">Spotlight</p>
                <h3>Avenue Labs</h3>
              </div>
              <span className="status-pill">Top rank</span>
            </div>

            <div className="spotlight-score">
              <strong>96</strong>
              <span>Performance score</span>
            </div>

            <ul className="insight-list">
              <li>
                <span>Conversion lift</span>
                <strong>+24.8%</strong>
              </li>
              <li>
                <span>Customer retention</span>
                <strong>91.3%</strong>
              </li>
              <li>
                <span>Pipeline velocity</span>
                <strong>3.4x</strong>
              </li>
            </ul>

            <button type="button" className="secondary-btn">Review strategy</button>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
