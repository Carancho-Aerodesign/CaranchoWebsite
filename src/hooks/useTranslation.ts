import { useRouter } from 'next/router'; 
import en from '../../public/locales/en';
import ptBR from '../../public/locales/pt-BR';

const useTranslation = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ptBR;

  return t;
};

export default useTranslation;
