import { Bell, Search } from 'lucide-react'
import '../../styles/TopBar.css'

const TopBar = ({ title, subtitle }) => {
    return (
        <header className="topbar d-flex align-items-center justify-content-between">
            <div className="topbar-left">
                <h1 className="topbar-title fw-bold mb-0">{title}</h1>
                {subtitle && <p className="topbar-subtitle mb-0">{subtitle}</p>}
            </div>

            <div className="topbar-right d-flex align-items-center gap-3">
                <div className="topbar-search d-flex align-items-center gap-2">
                    <Search size={14} className="topbar-search-icon" />
                    <input
                        type="text"
                        className="topbar-search-input"
                        placeholder="Search..."
                    />
                </div>
                <button className="topbar-icon-btn d-flex align-items-center justify-content-center">
                    <Bell size={16} />
                </button>
            </div>
        </header>
    )
}

export default TopBar
