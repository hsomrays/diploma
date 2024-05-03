import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

const Profile = () => {
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authTokens');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
    }
  }, []);

  return (
    <div className="container vh-100">
      <div className="row justify-content-center align-items-center h-100"> 
        <div className="col-md-4"> 
          <div className="card">
            <h2 className="card-header text-center">Профиль пользователя</h2> 
            {decodedToken && (
              <React.Fragment>
                <img className="card-img-top mx-auto" src={decodedToken.image} alt="Фото профиля" />
                <div className="card-body text-center">
                  <p className="card-text">Полное имя: {decodedToken.full_name}</p>
                  <p className="card-text">Род деятельности: {decodedToken.bio}</p>
                  <p className="card-text">Подтвержден: {decodedToken.verified ? 'Да' : 'Нет'}</p>
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
