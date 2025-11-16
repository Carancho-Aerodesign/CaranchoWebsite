import { useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  enableIndexedDbPersistence,
  getFirestore,
  limit,
  onSnapshot,
  query,
} from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import './styles/App.css';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { Navbar } from './components/layout/Navbar';
import { Notification } from './components/layout/Notification';
import { Footer } from './components/layout/Footer';
import { TeamMemberModal } from './components/modals/TeamMemberModal';
import { HomePage } from './pages/home/HomePage';
import { AboutPage } from './pages/about/AboutPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminPage } from './pages/admin/AdminPage';
import type {
  Achievement,
  AppPage,
  FinancialSnapshot,
  NotificationState,
  Project,
  SiteSettings,
  Sponsor,
  TeamHierarchy,
  TeamMember,
} from './types';
import { appId, firebaseConfig } from './firebase';

const blankTeamHierarchy: TeamHierarchy = {
  captain: null,
  departments: [],
  members: [],
};

const blankSiteSettings: SiteSettings = {
  heroImageUrl: '/capa.jpeg',
  participations: 0,
  monthlyDues: 20,
};

// --- COMPONENTES DE UI GENÉRICOS ---
// --- COMPONENTE PRINCIPAL DA APLICAÇÃO ---
export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [storageInstance, setStorageInstance] = useState<FirebaseStorage | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminRegistered, setIsAdminRegistered] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamHierarchy, setTeamHierarchy] = useState<TeamHierarchy | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(blankSiteSettings);
  const [financials, setFinancials] = useState<FinancialSnapshot>({ payments: [], sponsorships: [] });

  const latestProjectHeroUrl = useMemo(() => {
    if (!projects.length) {
      return null;
    }
    const latestProject = projects.reduce<Project | null>((currentLatest, project) => {
      if (!currentLatest) {
        return project;
      }
      if (project.year > currentLatest.year) {
        return project;
      }
      if (project.year === currentLatest.year) {
        return project.title.localeCompare(currentLatest.title) > 0 ? project : currentLatest;
      }
      return currentLatest;
    }, null);

    return latestProject?.imageUrl ?? null;
  }, [projects]);

  const homeHeroImageUrl = latestProjectHeroUrl && latestProjectHeroUrl.trim().length > 0 ? latestProjectHeroUrl : siteSettings.heroImageUrl;

  // Inicialização do Firebase
  useEffect(() => {
    if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey && !authInstance) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const firestoreDb = getFirestore(app);
      
      try {
        enableIndexedDbPersistence(firestoreDb);
      } catch (error) {
        if (error.code == 'failed-precondition') {
            console.warn("Múltiplas abas abertas, a persistência offline só será ativada em uma.");
        } else if (error.code == 'unimplemented') {
            console.warn("O navegador atual não suporta persistência offline.");
        }
      }

      const firebaseAuth = getAuth(app);
      const firebaseStorage = getStorage(app);
      setDb(firestoreDb);
      setAuthInstance(firebaseAuth);
      setStorageInstance(firebaseStorage);
      onAuthStateChanged(firebaseAuth, (currentUser) => {
        setUser(currentUser);
        setIsAuthReady(true);
        setIsLoading(false);
      });
    } else if (!firebaseConfig.apiKey) {
        console.error("Firebase API Key is missing. Please check your environment variables.");
        setIsLoading(false);
        setIsAuthReady(true);
    }
  }, [authInstance]);
  
  useEffect(() => {
    if(user && (currentPage === 'login' || currentPage === 'register')) { setCurrentPage('admin'); }
  }, [user, currentPage]);

  // Check if an admin user exists
  useEffect(() => {
      if (!isAuthReady || !db) return;
      const adminsColRef = collection(db, 'admins');
      const q = query(adminsColRef, limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => { setIsAdminRegistered(!snapshot.empty); }, (error) => { console.error("Error checking for admin:", error); setIsAdminRegistered(true); });
      return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch dados da Hierarquia da Equipa
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`);
    const unsubscribe = onSnapshot(hierarchyRef, (docSnap) => {
        if (docSnap.exists()) { setTeamHierarchy(docSnap.data()); } else { setTeamHierarchy(blankTeamHierarchy); }
    }, (error) => { console.error("Error fetching team hierarchy:", error); setNotification({message: "Erro ao carregar dados da equipa.", type: "error"}); });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch dados dos Patrocinadores
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const sponsorsColRef = collection(db, `/artifacts/${appId}/public/data/sponsors`);
    const unsubscribe = onSnapshot(sponsorsColRef, (querySnapshot) => { setSponsors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, (error) => { console.error("Error fetching sponsors:", error); setNotification({message: "Erro ao carregar patrocinadores.", type: "error"}); });
    return () => unsubscribe();
  }, [isAuthReady, db]);
  
  // Fetch dados das Conquistas
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const achievementsColRef = collection(db, `/artifacts/${appId}/public/data/achievements`);
    const unsubscribe = onSnapshot(achievementsColRef, (querySnapshot) => { setAchievements(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, (error) => { console.error("Error fetching achievements:", error); setNotification({message: "Erro ao carregar conquistas.", type: "error"}); });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch dados dos Projetos
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const projectsColRef = collection(db, `/artifacts/${appId}/public/data/projects`);
    const unsubscribe = onSnapshot(projectsColRef, (querySnapshot) => {
        setProjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        console.error("Error fetching projects:", error);
        setNotification({message: "Erro ao carregar projetos.", type: "error"});
    });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch Configurações do Site (Imagem Principal)
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) { setSiteSettings(prev => ({ ...blankSiteSettings, ...prev, ...docSnap.data() })); } else { setSiteSettings(blankSiteSettings); }
    }, (error) => { console.error("Error fetching site settings:", error); });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch Financial Data
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const paymentsColRef = collection(db, `/artifacts/${appId}/public/data/payments`);
    const sponsorshipsColRef = collection(db, `/artifacts/${appId}/public/data/sponsors`);

    const unsubPayments = onSnapshot(paymentsColRef, (snapshot) => { 
        const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        setFinancials(prev => ({ ...prev, payments: paymentsData })); 
    });
    const unsubSponsorships = onSnapshot(sponsorshipsColRef, (snapshot) => { 
        const sponsorshipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        setFinancials(prev => ({ ...prev, sponsorships: sponsorshipsData })); 
    });
    return () => { unsubPayments(); unsubSponsorships(); };
  }, [isAuthReady, db]);

  const handleLogout = async () => {
    if (authInstance) {
      await signOut(authInstance);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage teamHierarchy={teamHierarchy} siteSettings={siteSettings} />;
      case 'projects':
        return <ProjectsPage projects={projects} />;
      case 'login':
        return (
          <LoginPage
            auth={authInstance}
            isAuthReady={isAuthReady}
            isAdminRegistered={isAdminRegistered}
            onNavigate={setCurrentPage}
          />
        );
      case 'register':
        if (isAdminRegistered) {
          return (
            <LoginPage
              auth={authInstance}
              isAuthReady={isAuthReady}
              isAdminRegistered={isAdminRegistered}
              onNavigate={setCurrentPage}
            />
          );
        }
        return (
          <RegisterPage
            auth={authInstance}
            db={db}
            isAuthReady={isAuthReady}
            onNavigate={setCurrentPage}
            onNotify={setNotification}
          />
        );
      case 'admin':
        return user ? (
          <AdminPage
            db={db}
            storage={storageInstance}
            teamHierarchy={teamHierarchy}
            sponsors={sponsors}
            achievements={achievements}
            projects={projects}
            siteSettings={siteSettings}
            financials={financials}
            setNotification={setNotification}
          />
        ) : (
          <LoginPage
            auth={authInstance}
            isAuthReady={isAuthReady}
            isAdminRegistered={isAdminRegistered}
            onNavigate={setCurrentPage}
          />
        );
      case 'home':
      default:
        return (
          <HomePage
            teamHierarchy={teamHierarchy}
            sponsors={sponsors}
            siteSettings={{ ...siteSettings, heroImageUrl: homeHeroImageUrl }}
            achievements={achievements}
            onMemberSelect={setSelectedMember}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 font-sans antialiased">
      {isLoading && <LoadingScreen />}
      <div className={`flex flex-col min-h-screen transition-filter duration-500 ${isLoading ? 'blur-sm' : 'blur-none'}`}>
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
        <main className="flex-grow pt-20">{!isLoading && renderPage()}</main>
        <Footer />
        <Notification notification={notification} onDismiss={() => setNotification(null)} />
        <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      </div>
    </div>
  );
}
