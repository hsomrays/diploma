import React, { Component } from 'react';
import jwt_decode from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

class Navbar extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.dropdownRef = React.createRef();
  }

  toggleDropdown = () => {
    this.dropdownRef.current.classList.toggle('show');
  };

  render() {
    const { logoutUser } = this.context;
    const token = localStorage.getItem('authTokens');
    let dropdownMenu = null;

    if (token) {
      const decoded = jwt_decode(token);
      var user_id = decoded.user_id;

      dropdownMenu = (
        <div className="nav-item dropdown">
          <button
            className="btn nav-link dropdown-toggle"
            onClick={this.toggleDropdown}
            style={{ color: 'white' }}
          >
            &#9898;
            {decoded.username}
          </button>
          <ul
            ref={this.dropdownRef}
            className="dropdown-menu dropdown-menu-right show"
            aria-labelledby="dropdownMenuButton"
          >
            <li>
              <Link className="dropdown-item" to="/profile">
                Профиль
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                onClick={logoutUser}
                style={{ cursor: 'pointer' }}
              >
                Выход
              </Link>
            </li>
          </ul>
        </div>
      );
    }

    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              <img style={{ width: 30 }} src="/icon.png" alt="" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                {token === null && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        Вход
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">
                        Регистрация
                      </Link>
                    </li>
                  </>
                )}
                {token !== null && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/documents">
                      Документы
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            {dropdownMenu}
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
