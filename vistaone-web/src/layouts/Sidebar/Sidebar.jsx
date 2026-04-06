import { useNavigate, useLocation } from 'react-router-dom'
import { FiGrid, FiList, FiClipboard, FiFileText, FiUsers, FiFolder, FiLogOut } from 'react-icons/fi'
import '../../styles/Sidebar.css'

// map each nav label to a route path
const navRoutes = {
    'Dashboard': '/dashboard',
    'Jobs': '/jobs',
    'Work Orders': '/workorders',
    'Invoices': '/invoices',
    'Vendors': '/vendors',
    'Contracts / MSA': '/contracts',
}

const Sidebar = ({ navData }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('authToken')
        navigate('/login')
    }

    // check if the current path starts with the nav items route
    const isActive = (label) => {
        const route = navRoutes[label]
        if (!route) return false
        return location.pathname.startsWith(route)
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h2 className="sidebar-title">FieldPortal</h2>
                <p className="sidebar-subtitle">Permian Basin Operations</p>
            </div>

            <nav className="sidebar-nav">
                <p className="sidebar-section-label">MAIN</p>

                <ul className="sidebar-list">
                    {navData.main.map((item) => (
                        <li
                            key={item.label}
                            className={`sidebar-item ${isActive(item.label) ? 'active' : ''}`}
                            onClick={() => {
                                const route = navRoutes[item.label]
                                if (route) navigate(route)
                            }}
                        >
                            <span className="sidebar-icon">{getIcon(item.icon)}</span>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>

                <p className="sidebar-section-label">ACCOUNT</p>

                <ul className="sidebar-list">
                    {navData.account.map((item) => (
                        <li
                            key={item.label}
                            className={`sidebar-item ${isActive(item.label) ? 'active' : ''}`}
                            onClick={() => {
                                const route = navRoutes[item.label]
                                if (route) navigate(route)
                            }}
                        >
                            <span className="sidebar-icon">{getIcon(item.icon)}</span>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">RC</div>
                    <div>
                        <p className="sidebar-user-name">R. Chavez</p>
                        <p className="sidebar-user-role">Company Rep</p>
                    </div>
                </div>

                <button className="sidebar-logout" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    )
}

const getIcon = (iconName) => {
    const icons = {
        grid: <FiGrid />,
        list: <FiList />,
        clipboard: <FiClipboard />,
        file: <FiFileText />,
        users: <FiUsers />,
        folder: <FiFolder />,
    }
    return icons[iconName] || null
}

export default Sidebar
