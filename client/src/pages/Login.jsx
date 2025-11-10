import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(email, password);
      console.log('logged in user', loggedInUser);
     
      if (loggedInUser.role === 'admin') {
        nav('/admin');
      } else if (loggedInUser.role === 'eventOfficer') {
        nav('/eventOfficer/dashboard');
      } else if (loggedInUser.role === 'student') {
      nav('/student/dashboard'); 
      }else if (loggedInUser.role === 'staff'){
      nav('/staff/dashboard'); 
      }else if (loggedInUser.role === 'ta'){
      nav('/ta/dashboard')
      }else if (loggedInUser.role === 'professor'){
        nav('/professor/dashboard');
      }else {
        nav('/vendor/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600 mt-3">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
