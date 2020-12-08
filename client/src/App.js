import React, { useState, useEffect } from 'react';
import Dashboard from './views/Dashboard';
import axios from 'axios';
import './App.css';

// Set Cognito Vars
const clientId = process.env.REACT_APP_CLIENT_ID;
const authDomain = process.env.REACT_APP_AUTH_DOMAIN;
const queryStringParams = new URLSearchParams(window.location.search);
const cognitoCode = queryStringParams.get('code') || null;
const lnf = queryStringParams.get('lnf') || null;
const redUrl = window.location.origin;

function App() {
  const appName = "Seattle Children's Private URL Shortener";
  const [isOpen, setIsOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const linkNotFound = lnf;
  const signUpUrl = `${authDomain}/signup?response_type=code&scope=email+openid+test/link.get+test/link.post&client_id=${clientId}&redirect_uri=${redUrl}`;
  const logInUrl = `${authDomain}/login?response_type=code&scope=email+openid+test/link.get+test/link.post&client_id=${clientId}&redirect_uri=${redUrl}`;
  const logOutUrl = `${authDomain}/logout?client_id=${clientId}&logout_uri=${redUrl}`;

  useEffect(() => {
    if (cognitoCode) exchangeToken();
    else exchangeRefreshToken();
  }, []);

  const convertJSON = (json) => {
    const oAuthTokenBodyArray = Object.entries(json).map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    });
    return oAuthTokenBodyArray.join('&');
  };

  const exchangeRefreshToken = async () => {
    const oauthTokenBodyJson = {
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: localStorage.getItem('cognitoRefreshToken'),
    };
    const oauthTokenBody = convertJSON(oauthTokenBodyJson);

    if (oauthTokenBodyJson.refresh_token) {
      try {
        const response = await axios.post(`${authDomain}/oauth2/token`, oauthTokenBody, {
          ['Content-Type']: 'application/x-www-form-urlencoded',
        });
        let json_1 = response.data;
        if (json_1.id_token) {
          localStorage.setItem('cognitoIdentityToken', json_1.id_token);
          setAuthorized(true);
        }
      } catch (e) {
        setAuthorized(false);
      }
    } else {
      return new Promise((res) => {
        return res({});
      });
    }
  };

  const exchangeToken = async () => {
    const oauthTokenBodyJson = {
      grant_type: 'authorization_code',
      client_id: clientId,
      code: cognitoCode,
      redirect_uri: redUrl,
    };
    const oauthTokenBody = convertJSON(oauthTokenBodyJson);

    try {
      const response = await axios.post(`${authDomain}/oauth2/token`, oauthTokenBody, {
        ['Content-Type']: 'application/x-www-form-urlencoded',
      });
      let json_1 = response.data;
      if (json_1.id_token) {
        localStorage.setItem('cognitoIdentityToken', json_1.id_token);
        localStorage.setItem('cognitoRefreshToken', json_1.refresh_token);
        setAuthorized(true);
      }
    } catch (e) {
      setAuthorized(false);
    }
  };

  const logout = () => {
    localStorage.setItem('cognitoIdentityToken', null);
    localStorage.setItem('cognitoRefreshToken', null);
  };

  return (
    <div className="App">
      <section className="section">
        <nav className="navbar is-fixed-top is-dark" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <div className="navbar-item">
              <h1 className="title has-text-white">{appName}</h1>
            </div>
            <a
              role="button"
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarCollapse"
              onClick={() => setIsOpen(!isOpen)}
              href={logOutUrl}
              className={`${isOpen ? 'is-active' : ''} navbar-burger burger`}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div id="navbarCollapse" className="navbar-menu">
            <div className="navbar-end">
              {authorized && (
                <a className="navbar-item" onClick={logout} href={logOutUrl}>
                  Log Out
                </a>
              )}
              {!authorized && (
                <a className="navbar-item" href={signUpUrl}>
                  Sign up
                </a>
              )}
              {!authorized && (
                <a className="navbar-item" href={logInUrl}>
                  Log in
                </a>
              )}
            </div>
          </div>
        </nav>
      </section>
      <section className="section">
        <div className="container">
          {authorized && (
            <div>
              <Dashboard />
            </div>
          )}
          {!authorized && (
            <div>
              <h1 className="title">Welcome to {appName}</h1>
              <h2 className="subtitle"></h2>
              {linkNotFound && (
                <p>
                  We&apos;re sorry, that link could not be found.
                  <a href={signUpUrl}>Sign up</a> or
                  <a href={logInUrl}>Log in</a> to register it?
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
