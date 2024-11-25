import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRegisterForm = ({ onLoginSuccess, isLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin
      ? 'http://localhost:5000/api/login'
      : 'http://localhost:5000/api/register';

    const body = isLogin
      ? { email, password }
      : { username, email, password }; // Include username in registration

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          // Store the token and username in localStorage after successful login
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);  // Store username here
          setMessage('Inicio de sesion satisfactorio!');
          onLoginSuccess();
        } else {
          setMessage('Cuenta creada correctamente! Por favor inicia sesion.');
        }
      } else {
        setMessage(data.message || 'Ocurrio un error');
      }
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Ocurrio un error. Por favor intente de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block font-medium mb-2" htmlFor="username">
                Usuario
              </label>
              <input
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                id="username"
                placeholder="Escribe tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              placeholder="Escribe tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="submit"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        {message && <p className="text-center mt-4 text-red-500">{message}</p>}
        <div className="text-center mt-4">
          <button
            className="text-blue-500 hover:text-blue-600 focus:outline-none"
            onClick={() => {
              // Navigate to the correct route based on login or register
              navigate(isLogin ? '/register' : '/login');
            }}
          >
            {isLogin
              ? "No tienes una cuenta? Registrate"
              : 'Ya tienes una cuenta? Inicia Sesion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterForm;
