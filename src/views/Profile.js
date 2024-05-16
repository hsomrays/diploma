import React, { Component } from 'react';
import jwt_decode from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import { updateUserAndProfile } from '../services/AuthServices';

class Profile extends Component {
  static contextType = AuthContext;

  state = {
    decodedToken: null,
    editField: null,
    formData: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      bio: '',
    },
  };

  componentDidMount() {
    const { authTokens } = this.context;
    const token = localStorage.getItem('authTokens');
    if (token) {
      const decoded = jwt_decode(token);
      this.setState({
        decodedToken: decoded,
        formData: {
          username: decoded.username,
          email: decoded.email,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
          bio: decoded.bio,
        },
      });
    }
  }

  handleChange = (e) => {
    const { formData } = this.state;
    this.setState({ formData: { ...formData, [e.target.name]: e.target.value } });
  };

  handleEdit = (field) => {
    this.setState({ editField: field });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { formData } = this.state;
    const { authTokens, setAuthTokens, setUser } = this.context;
    try {
      const newTokens = await updateUserAndProfile(formData, authTokens);
      console.log('Profile updated successfully.');

      setAuthTokens(newTokens);
      setUser(jwt_decode(newTokens.access));

      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      localStorage.setItem('token', newTokens.access);

      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Server response:', error.response);
    }
  };

  render() {
    const { decodedToken, editField, formData } = this.state;
    return (
      <div className="container vh-100">
        <div className="row justify-content-center align-items-center h-100">
          <div className="col-md-4">
            <div className="card">
              <h2 className="card-header text-center">Профиль пользователя</h2>
              {decodedToken && (
                <React.Fragment>
                  <div className="card-body text-center">
                    <form onSubmit={this.handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="username">Имя пользователя</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={this.handleChange}
                            disabled={editField !== 'username'}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => this.handleEdit('username')}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-group">
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={this.handleChange}
                            disabled={editField !== 'email'}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => this.handleEdit('email')}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="first_name">Имя</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={this.handleChange}
                            disabled={editField !== 'first_name'}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => this.handleEdit('first_name')}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="last_name">Фамилия</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={this.handleChange}
                            disabled={editField !== 'last_name'}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => this.handleEdit('last_name')}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="bio">Род деятельности</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={this.handleChange}
                            disabled={editField !== 'bio'}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => this.handleEdit('bio')}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      {editField && (
                        <button type="submit" className="btn btn-primary">
                          Сохранить
                        </button>
                      )}
                    </form>
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
