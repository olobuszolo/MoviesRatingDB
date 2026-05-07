import { useState } from 'react'
import './App.css'
import CategoriesView from './views/CategoriesView'
import EmptyView from './views/EmptyView'
import UsersView from './views/UsersView'

type TabId = 'users' | 'movies' | 'categories' | 'actors' | 'directors'

const tabs: { id: TabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'movies', label: 'Movies' },
  { id: 'categories', label: 'Categories' },
  { id: 'actors', label: 'Actors' },
  { id: 'directors', label: 'Directors' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('users')
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? ''

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">MR</span>
          <div>
            <h1>MoviesRatingDB</h1>
            <p>Admin panel</p>
          </div>
        </div>

        <nav className="tabs" aria-label="Sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'tab tab-active' : 'tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        {activeTab === 'users' ? <UsersView /> : null}
        {activeTab === 'categories' ? <CategoriesView /> : null}
        {activeTab !== 'users' && activeTab !== 'categories' ? (
          <EmptyView label={activeTabLabel} />
        ) : null}
      </section>
    </main>
  )
}

export default App
