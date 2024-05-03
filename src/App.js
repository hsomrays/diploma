import React from 'react'

import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import PrivateRoute from "./utils/PrivateRoute"
import { AuthProvider } from './context/AuthContext'

import Homepage from "./views/Homepage"
import RegisterPage from "./views/RegisterPage"
import LoginPage from "./views/LoginPage"
import DocumentsPage from "./views/DocumentsPage"
import Navbar from "./views/Navbar"
import Profile from './views/Profile'


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar/>
        <Switch>
          <PrivateRoute component={DocumentsPage} path="/documents" exact />
          <Route component={LoginPage} path="/login" />
          <Route component={RegisterPage} path="/register" exact />
          <PrivateRoute component={Profile} path="/profile" exact />
          <Route component={Homepage} path="/" exact />
        </Switch>
      </AuthProvider>
    </Router>
  )
}

export default App