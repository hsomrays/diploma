import React, { useEffect, useState, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import {updateUserAndProfile} from '../services/AuthServices';


const Profile = () => {
  const { authTokens, setAuthTokens, setUser } = useContext(AuthContext);

  const [decodedToken, setDecodedToken] = useState(null);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('authTokens');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
      setFormData({
        username: decoded.username,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        bio: decoded.bio,
      });
    }
  }, [authTokens]);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (field) => {
    setEditField(field);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
    };
    try {
      const newTokens = await updateUserAndProfile(userData, authTokens);
      console.log('Profile updated successfully.');
  
      setAuthTokens(newTokens);
      setUser(jwt_decode(newTokens.access));
  
      localStorage.setItem("authTokens", JSON.stringify(newTokens));
      localStorage.setItem("token", newTokens.access);
  
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Server response:', error.response);
    }
  };
  


  return (
    <div className="container vh-100">
      <div className="row justify-content-center align-items-center h-100"> 
        <div className="col-md-4"> 
          <div className="card">
            <h2 className="card-header text-center">Профиль пользователя</h2> 
            {decodedToken && (
              <React.Fragment>
                <div className="card-body text-center">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="username">Имя пользователя</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="username" 
                          name="username" 
                          value={formData.username} 
                          onChange={handleChange} 
                          disabled={editField !== 'username'} // Заблокировано, если поле не редактируется
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-outline-primary" 
                            type="button" 
                            onClick={() => handleEdit('username')}
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
                          onChange={handleChange} 
                          disabled={editField !== 'email'} // Заблокировано, если поле не редактируется
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-outline-primary" 
                            type="button" 
                            onClick={() => handleEdit('email')}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Остальные поля формы */}
                    <div className="form-group">
                      <label htmlFor="first_name">Имя</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="first_name" 
                          name="first_name" 
                          value={formData.first_name} 
                          onChange={handleChange} 
                          disabled={editField !== 'first_name'} // Заблокировано, если поле не редактируется
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-outline-primary" 
                            type="button" 
                            onClick={() => handleEdit('first_name')}
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
                          onChange={handleChange} 
                          disabled={editField !== 'last_name'} // Заблокировано, если поле не редактируется
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-outline-primary" 
                            type="button" 
                            onClick={() => handleEdit('last_name')}
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
                          onChange={handleChange} 
                          disabled={editField !== 'bio'} // Заблокировано, если поле не редактируется
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-outline-primary" 
                            type="button" 
                            onClick={() => handleEdit('bio')}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    {editField && (
                      <button type="submit" className="btn btn-primary">Сохранить</button>
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
};

export default Profile;
