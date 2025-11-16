import { useState, type FormEvent } from 'react';
import type { Auth } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail } from 'lucide-react';

import { InputField } from '../../components/forms/InputField';
import type { AppPage } from '../../types';

interface LoginPageProps {
  auth: Auth | null;
  isAuthReady: boolean;
  isAdminRegistered: boolean;
  onNavigate: (page: AppPage) => void;
}

export function LoginPage({ auth, isAuthReady, isAdminRegistered, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth) {
      setError('Serviço de autenticação indisponível. Tente novamente mais tarde.');
      return;
    }

    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Login Error:', err);
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-200">
        <div>
          <img src="./logoWithLabelBright.svg" alt="Logo Carancho Aerodesign" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Acesso Administrativo</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Área reservada para a gestão do site.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <InputField
              id="email"
              name="email"
              type="email"
              placeholder="Endereço de e-mail"
              Icon={Mail}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <InputField
              id="password"
              name="password"
              placeholder="Senha"
              Icon={Lock}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              isPassword
              showPassword={showPassword}
              togglePasswordVisibility={() => setShowPassword((prev) => !prev)}
            />
          </div>
          {error ? <p className="text-red-500 text-sm text-center">{error}</p> : null}
          <div>
            <button
              type="submit"
              disabled={!isAuthReady}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Entrar
            </button>
          </div>
        </form>
        {!isAdminRegistered && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Não tem uma conta de administrador?{' '}
            <button onClick={() => onNavigate('register')} className="font-medium text-[#d4982c] hover:text-[#b58426]">
              Registe-se aqui
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
