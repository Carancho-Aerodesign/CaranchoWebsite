import { useState, type FormEvent } from 'react';
import type { Auth } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { Lock, Mail } from 'lucide-react';

import { InputField } from '../../components/forms/InputField';
import type { AppPage, NotificationState } from '../../types';

interface RegisterPageProps {
  auth: Auth | null;
  db: Firestore | null;
  isAuthReady: boolean;
  onNavigate: (page: AppPage) => void;
  onNotify: (notification: NotificationState) => void;
}

export function RegisterPage({ auth, db, isAuthReady, onNavigate, onNotify }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth || !db) {
      setError('Serviço indisponível. Tente novamente mais tarde.');
      return;
    }

    setError('');

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'admins', credential.user.uid), {
        email: credential.user.email,
        registeredAt: new Date(),
      });
      onNotify({ message: 'Bem-vindo! O registo foi concluído com sucesso.', type: 'success' });
    } catch (err) {
      console.error('Registration Error:', err);
      setError('Erro ao registar. Verifique o e-mail e a senha (mínimo 6 caracteres).');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-200">
        <div>
          <img src="./logoWithLabel.svg" alt="Logo Carancho Aerodesign" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registar Novo Administrador</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
              placeholder="Senha (mínimo 6 caracteres)"
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
              Registar
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-[#d4982c] hover:text-[#b58426]">
            Inicie a sessão
          </button>
        </p>
      </div>
    </div>
  );
}
