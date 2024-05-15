import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from './context/AuthContext';
import RegisterPage from "./views/RegisterPage";
import LoginPage from "./views/LoginPage";
import DocumentsPage from "./views/DocumentsPage";
import Navbar from "./views/Navbar";
import Profile from './views/Profile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, [token]);

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Switch>
          <Route path="/login" component={LoginPage} />
          <PrivateRoute path="/documents" component={DocumentsPage} />
          <Route path="/register" component={RegisterPage} />
          <PrivateRoute path="/profile" component={Profile} />
          <Route render={() => (token ? <Redirect to="/documents" /> : <Redirect to="/login" />)} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
