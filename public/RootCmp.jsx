// const Router = ReactRouterDOM.HashRouter
const { useState } = React
const Router = ReactRouterDOM.BrowserRouter
const { Route, Routes } = ReactRouterDOM

import { authService } from './services/auth.service.js'

import { UserMsg } from './cmps/UserMsg.jsx'
import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { Home } from './pages/Home.jsx'
import { UserDetails } from './pages/UserDetails.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { UserIndex } from './pages/UserIndex.jsx'

export function App() {
  const [loggedinUser, setLoggedinUser] = useState(authService.getLoggedinUser())
  return (
    <Router>
      <div className="app-wrapper">
        <UserMsg />
        <AppHeader loggedinUser={loggedinUser} setLoggedinUser={setLoggedinUser} />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bug" element={<BugIndex />} />
            <Route path="/bug/:bugId" element={<BugDetails />} />
            <Route path="/user" element={<UserDetails />} />
            <Route path="/admin" element={<UserIndex />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/auth" element={<LoginSignup setLoggedinUser={setLoggedinUser} />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </Router>
  )
}
