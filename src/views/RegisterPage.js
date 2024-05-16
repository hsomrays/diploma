import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

class RegisterPage extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      username: '',
      password: '',
      password2: '',
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, username, password, password2 } = this.state;
    const { registerUser } = this.context;
    registerUser(email, username, password, password2);
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { email, username, password, password2 } = this.state;

    return (
      <div style={{ marginTop: '40px' }}>
        <section className="vh-100" style={{ backgroundColor: '#6C8CD5' }}>
          <div className="container py-5 h-100">
            <div className="row justify-content-center align-items-center h-100">
              <div className="col-md-6 col-lg-5">
                <div className="card" style={{ borderRadius: '1rem' }}>
                  <div className="card-body p-4 p-lg-5 text-black text-center">
                    <form onSubmit={this.handleSubmit}>
                      <div className="mb-3 pb-1">
                        <i className="fas fa-cubes fa-2x me-3" style={{ color: '#ff6219' }} />
                        <h2 className="fw-bold mb-0">Добро пожаловать!</h2>
                      </div>
                      <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: 1 }}>
                        Регистрация
                      </h5>
                      <div className="form-outline mb-4">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          placeholder="Адрес электронной почты"
                          name="email"
                          value={email}
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className="form-outline mb-4">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Имя пользователя"
                          name="username"
                          value={username}
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className="form-outline mb-4">
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Пароль"
                          name="password"
                          value={password}
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className="form-outline mb-4">
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Подтвердите пароль"
                          name="password2"
                          value={password2}
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className="pt-1 mb-4">
                        <button className="btn btn-dark btn-lg btn-block" type="submit">
                          Зарегистрироваться
                        </button>
                      </div>
                      <p className="mb-5 pb-lg-2 text-center" style={{ color: '#393f81' }}>
                        Есть аккаунт?{' '}
                        <Link to="/login" style={{ color: '#393f81' }}>
                          Вход
                        </Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-light text-center text-lg-start">
          <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <a className="text-dark" href="https://github.com/hsomrays">
              github.com/hsomrays
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default RegisterPage;
