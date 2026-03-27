import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import '../styles/login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = () => {
    }

    return (
        <div className="login-page text-light position-relative overflow-hidden">
            <div className="row min-vh-100 g-0 justify-content-center align-items-center">
                <div className="col-lg-5 d-flex align-items-center justify-content-center px-4 px-lg-5 py-5">
                    <div className="login-panel w-100 shadow-lg">
                        <div className="mb-4">
                            <p className="login-panel-overline mb-2 text-uppercase">Secure access</p>
                            <h2 className="mb-2">Welcome back</h2>
                            <p className="login-panel-text">
                                Sign in with your client operator account to continue to the dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label login-label">Work email</label>
                                <div className="input-group login-input-group">
                                    <span className="input-group-text">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="form-control"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label login-label">Password</label>
                                <div className="input-group login-input-group">
                                    <span className="input-group-text">
                                        <LockKeyhole size={18} />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="form-control"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="btn"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="small mb-4">
                                <button type="button" className="btn btn-link p-0">
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" className="btn login-submit-btn w-100 d-inline-flex align-items-center justify-content-center gap-2">
                                Enter dashboard
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login