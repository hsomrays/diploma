import React, { useContext } from 'react';
import {Link} from 'react-router-dom'
import AuthContext from '../context/AuthContext';


function LoginPage() {

  const {loginUser} = useContext(AuthContext)
  const handleSubmit = e => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value

    loginUser(email, password)


  }

  return (
    <div>
      <section className="vh-100" style={{ backgroundColor: "#6C8CD5" }}>
        <div className="container py-5 h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-md-6 col-lg-5">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="card-body p-4 p-lg-5 text-black text-center">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3 pb-1">
                      <i
                        className="fas fa-cubes fa-2x me-3"
                        style={{ color: "#ff6219" }}
                      />
                      <h2 className="fw-bold mb-0">Добро пожаловать!</h2>
                    </div>
                    <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: 1 }}>Вход</h5>
                    <div class="form-outline mb-4">
                      <input type="email" id="form2Example17" class="form-control form-control-lg" name='email' />
                      <label class="form-label" for="form2Example17">Адрес электронной почты</label>
                    </div>
                    <div class="form-outline mb-4">
                      <input type="password" id="form2Example27" class="form-control form-control-lg" name='password' />
                      <label class="form-label" for="form2Example27">Пароль</label>
                    </div>
                    <div className="pt-1 mb-4">
                      <button
                        className="btn btn-dark btn-lg btn-block"
                        type="submit"
                      >
                        Войти
                      </button>
                    </div>
                    <p className="mb-5 pb-lg-2 text-center" style={{ color: "#393f81" }}>
                      Нет аккаунта?{' '}
                      <Link to="/register" style={{ color: "#393f81" }}>
                        Регистрация
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
        <div
          className="text-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <a className="text-dark" href="https://github.com/hsomrays">
            github.com/hsomrays
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;