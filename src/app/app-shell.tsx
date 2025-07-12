import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, addDoc, deleteDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Shield, Users, LogIn, LogOut, User, Lock, Twitter, Instagram, Facebook, Trophy, Star, Award, Menu, X, ChevronLeft, ChevronRight, Briefcase, Crown, UserCheck, Hash, GraduationCap, PlusCircle, Trash2, Edit, Save, LayoutDashboard, Image as ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle, XCircle, UploadCloud, Settings, Building, ChevronDown, MapPin, Mail } from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE (Conectado ao seu projeto) ---
const firebaseConfig = {
  apiKey: "AIzaSyBLIF5ursxYyllg_hgC3jICo0kLXsqbGyQ",
  authDomain: "carancho-website.firebaseapp.com",
  projectId: "carancho-website",
  storageBucket: "carancho-website.appspot.com",
  messagingSenderId: "549038888479",
  appId: "1:549038888479:web:666d35a2e873d255f1672a",
  measurementId: "G-T22B67RZ7D"
};
const appId = firebaseConfig.projectId;

// --- ESTRUTURAS DE DADOS INICIAIS (para quando a base de dados está vazia) ---
const blankTeamHierarchy = {
  captain: null,
  departments: [],
  others: []
};
const blankSiteSettings = {
    heroImageUrl: 'https://placehold.co/1600x900/e0e0e0/cccccc?text=Adicione+uma+imagem+no+Painel+Admin',
    participations: 0
};

// --- COMPONENTES DE UI (Navbar, Modals, etc.) ---
const LoadingScreen = () => ( <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[100]"><div className="flex flex-col items-center"><img src="https://raw.githubusercontent.com/Carancho-Aerodesign/CaranchoWebsite/v1.3/src/assets/logoWithLabel.png" alt="Logo Carancho Aerodesign" className="h-16 animate-pulse" /></div></div> );
const Navbar = ({ currentPage, setCurrentPage, user, auth }) => { const [isMenuOpen, setIsMenuOpen] = useState(false); const handleNavClick = (page) => { setIsMenuOpen(false); setCurrentPage(page); }; const handleLogout = async () => { if(auth) { await signOut(auth); } handleNavClick('home'); }; return ( <nav className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-40 border-b border-gray-200"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-20"><div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('home')}><img className="h-10" src="https://raw.githubusercontent.com/Carancho-Aerodesign/CaranchoWebsite/v1.3/src/assets/logoWithLabel.png" alt="Logo Carancho Aerodesign" /></div><div className="hidden md:block"><div className="ml-10 flex items-baseline space-x-2"><NavItem onClick={() => handleNavClick('home')} active={currentPage === 'home'}>Início</NavItem><NavItem onClick={() => handleNavClick('about')} active={currentPage === 'about'}>Sobre Nós</NavItem>{user && <NavItem onClick={() => handleNavClick('admin')} active={currentPage === 'admin'}>Painel Admin</NavItem>}</div></div><div className="flex items-center"><div className="hidden md:block">{user ? <LogoutButton onClick={handleLogout} /> : <LoginButton onClick={() => handleNavClick('login')} />}</div><div className="md:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button></div></div></div></div>{isMenuOpen && (<div className="md:hidden bg-white border-t border-gray-200"><div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"><NavItemMobile onClick={() => handleNavClick('home')} active={currentPage === 'home'}>Início</NavItemMobile><NavItemMobile onClick={() => handleNavClick('about')} active={currentPage === 'about'}>Sobre Nós</NavItemMobile>{user && <NavItemMobile onClick={() => handleNavClick('admin')} active={currentPage === 'admin'}>Painel Admin</NavItemMobile>}</div><div className="p-4 border-t border-gray-200">{user ? <LogoutButton onClick={handleLogout} fullWidth /> : <LoginButton onClick={() => handleNavClick('login')} fullWidth />}</div></div>)}</nav> );};
const NavItem = ({ onClick, children, active }) => (<a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${active ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>{children}</a>);
const NavItemMobile = ({ onClick, children, active }) => (<a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${active ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>{children}</a>);
const LoginButton = ({ onClick, fullWidth = false }) => (<button onClick={onClick} className={`bg-[#d4982c] hover:bg-[#b58426] text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 ${fullWidth ? 'w-full' : ''}`}><LogIn className="h-5 w-5 mr-2" />Login</button>);
const LogoutButton = ({ onClick, fullWidth = false }) => (<button onClick={onClick} className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 ${fullWidth ? 'w-full' : ''}`}><LogOut className="h-5 w-5 mr-2" />Logout</button>);
const TeamMemberModal = ({ member, onClose }) => { if (!member) return null; const { name, role, department, age, course, img } = member; return ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 animate-scale-up flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}><div className="md:w-2/5 flex-shrink-0 bg-gray-100">{img ? (<img src={img} alt={name} className="w-full h-48 md:h-full object-cover" />) : (<div className="w-full h-48 md:h-full flex items-center justify-center"><User size={96} className="text-gray-400" /></div>)}</div><div className="p-6 flex flex-col flex-grow text-gray-800"><h2 className="text-3xl font-bold text-[#d4982c] mb-4">{name}</h2><div className="space-y-3 text-gray-600 flex-grow"><div className="flex items-center"><Briefcase size={16} className="mr-3 text-[#d4982c] flex-shrink-0" /><span>{role}</span></div>{department && <div className="flex items-center"><Users size={16} className="mr-3 text-[#d4982c] flex-shrink-0" /><span>{department}</span></div>}{age && <div className="flex items-center"><Hash size={16} className="mr-3 text-[#d4982c] flex-shrink-0" /><span>{age} anos</span></div>}{course && <div className="flex items-center"><GraduationCap size={16} className="mr-3 text-[#d4982c] flex-shrink-0" /><span>{course}</span></div>}</div><button onClick={onClose} className="mt-6 w-full md:w-auto self-end bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Fechar</button></div><button onClick={onClose} className="absolute top-3 right-3 bg-white/50 p-1.5 rounded-full text-gray-800 hover:bg-white/80 transition-colors md:hidden"><X size={20} /></button></div></div> );};
const MemberCard = ({ member, departmentName, onCardClick }) => { const isManager = member.role === 'Gerente'; const isCaptain = member.role === 'Capitão'; const Icon = isCaptain ? Crown : (isManager ? UserCheck : User); return (<div className="text-center group cursor-pointer" onClick={() => onCardClick({ ...member, department: departmentName })}><div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto transform transition-all duration-300 group-hover:scale-105 shadow-lg ring-2 ${isCaptain ? 'ring-[#d4982c]' : 'ring-gray-300 group-hover:ring-[#d4982c]'}`}>{member.img ? (<img src={member.img} alt={member.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-gray-200"><Icon size={isCaptain ? 40 : 32} className="text-gray-500" /></div>)}</div><h4 className="mt-3 text-base sm:text-lg font-bold text-gray-900">{member.name}</h4><p className={`text-sm font-semibold text-[#d4982c]`}>{member.role}</p></div>);};
const TeamHierarchySection = ({ teamHierarchy }) => {
    const [selectedMember, setSelectedMember] = useState(null);
    if (!teamHierarchy || !teamHierarchy.captain) {
        return <div className="text-center text-gray-500 py-10 max-w-2xl mx-auto">A equipa ainda não foi formada. Adicione um capitão e membros no painel de administração para começar.</div>;
    }
    return (
        <>
            <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossa Estrutura</h2>
                </div>
                <div className="flex justify-center">
                    <MemberCard member={teamHierarchy.captain} onCardClick={setSelectedMember} />
                </div>
                <div className="space-y-12">
                    {teamHierarchy.departments.map(dept => (
                        <div key={dept.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">{dept.name}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 justify-items-center">
                                {dept.manager && <MemberCard member={dept.manager} departmentName={dept.name} onCardClick={setSelectedMember} />}
                                {dept.members.map(member => <MemberCard key={member.id} member={member} departmentName={dept.name} onCardClick={setSelectedMember} />)}
                            </div>
                        </div>
                    ))}
                    {teamHierarchy.others.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Funções de Suporte</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 justify-items-center">
                                {teamHierarchy.others.map(member => <MemberCard key={member.id} member={member} departmentName="Suporte" onCardClick={setSelectedMember} />)}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};
const Notification = ({ notification, onDismiss }) => { if (!notification) return null; const { message, type } = notification; const baseClasses = "fixed bottom-5 right-5 md:bottom-10 md:right-10 flex items-center p-4 rounded-lg shadow-lg text-white z-[999] animate-fade-in-up"; const typeClasses = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' }; const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle; useEffect(() => { const timer = setTimeout(onDismiss, 5000); return () => clearTimeout(timer); }, [onDismiss]); return (<div className={`${baseClasses} ${typeClasses[type]}`}><Icon className="mr-3" /><span>{message}</span><button onClick={onDismiss} className="ml-4"><X size={20} /></button></div>); };

// --- PÁGINAS ---
const HomePage = ({ teamHierarchy, sponsors, siteSettings, achievements }) => (<div className="space-y-24 md:space-y-32 mb-24 md:mb-32"><div className="relative h-[80vh] flex items-center justify-center text-center -mt-20 px-4"><div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${siteSettings.heroImageUrl}')` }}></div><div className="absolute inset-0 bg-black/60 z-10"></div><div className="relative z-20 animate-fade-in-up"><h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-shadow-lg text-white">Carancho Aerodesign</h1></div></div><SponsorsCarousel sponsors={sponsors} /><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center"><h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossas Conquistas</h2></div><div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-3">{achievements.length > 0 ? achievements.map(ach => (<AchievementCard key={ach.id} Icon={Trophy} title={ach.title} description={ach.description}/>)) : <p className="col-span-3 text-center text-gray-500">Nenhuma conquista adicionada ainda.</p>}</div></section><TeamHierarchySection teamHierarchy={teamHierarchy} /></div>);
const AboutPage = ({ teamHierarchy, siteSettings }) => {
    const memberCount = teamHierarchy 
        ? (teamHierarchy.captain ? 1 : 0) + 
          teamHierarchy.departments.reduce((acc, dept) => acc + (dept.manager ? 1 : 0) + dept.members.length, 0) +
          (teamHierarchy.others?.length || 0)
        : 0;

    return (
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="text-center mb-12">
                <Users className="mx-auto h-12 w-12 text-[#d4982c]" />
                <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Sobre Nós</h1>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md space-y-8">
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-4xl font-bold text-[#d4982c]">{memberCount}</h3>
                        <p className="mt-2 text-lg text-gray-600">Membros Atuais</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-4xl font-bold text-[#d4982c]">{siteSettings.participations || 0}</h3>
                        <p className="mt-2 text-lg text-gray-600">Participações em Eventos</p>
                    </div>
                </div>
                <div className="prose prose-lg max-w-none text-gray-600 text-justify">
                    <h2 className="text-[#d4982c]">Nossa História</h2>
                    <p>Fundado em 2004, o Carancho Aerodesign está celebrando 21 anos de atividade. A equipe é composta por estudantes de diversas engenharias da Universidade Federal de Santa Maria e se dedica ao desafio de projetar e construir aeronaves rádio controladas. Este trabalho é desenvolvido especificamente para participar da competição anual SAE Brasil Aerodesign, onde demonstram suas habilidades e inovações na área aeronautica.</p>
                </div>
                <div className="prose prose-lg max-w-none text-gray-600 text-justify">
                    <h2 className="text-[#d4982c]">Missão e Visão</h2>
                    <p><strong>Missão:</strong> Projetar e construir aeronaves rádio-controladas de alta performance, fomentando a inovação, a excelência em engenharia e o trabalho em equipa entre os nossos membros, preparando-os para os desafios do mercado.</p>
                    <p><strong>Visão:</strong> Consolidar a Carancho Aerodesign como uma equipa de referência no cenário nacional e internacional de aerodesign, reconhecida pela competitividade, pelo desenvolvimento de talentos e pelo impacto positivo na formação dos futuros engenheiros.</p>
                </div>
            </div>
        </div>
    );
};
const LoginPage = ({ setCurrentPage, setNotification, auth, isAuthReady, isAdminRegistered }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!auth) {
            setError('Serviço de autenticação indisponível. Tente novamente mais tarde.');
            return;
        }
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged in App will handle navigation
        } catch (err) {
            setError('E-mail ou senha inválidos.');
            console.error("Login Error:", err);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="max-w-md w-full space-y-8 bg-white backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-200">
                <div>
                    <img src="https://raw.githubusercontent.com/Carancho-Aerodesign/CaranchoWebsite/v1.3/src/assets/logoWithLabel.png" alt="Logo Carancho Aerodesign" className="mx-auto h-12 w-auto" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Acesso Administrativo</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Área reservada para a gestão do site.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <InputField id="email" name="email" type="email" placeholder="Endereço de e-mail" Icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
                        <InputField id="password" type="password" placeholder="Senha" Icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={!isAuthReady} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg">Entrar</button>
                    </div>
                </form>
                {!isAdminRegistered && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Não tem uma conta de administrador?{' '}
                        <button onClick={() => setCurrentPage('register')} className="font-medium text-[#d4982c] hover:text-[#b58426]">
                            Registe-se aqui
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

const RegisterPage = ({ setCurrentPage, setNotification, auth, isAuthReady, db }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!auth) {
            setError('Serviço de autenticação indisponível. Tente novamente mais tarde.');
            return;
        }
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "admins", user.uid), { email: user.email, registeredAt: new Date() });
            
            setNotification({ message: 'Bem-vindo! O seu registo foi concluído com sucesso.', type: 'success' });
            // The onAuthStateChanged listener will automatically redirect to the admin panel
        } catch (err) {
            setError('Erro ao registar. Verifique o e-mail e a senha (mínimo 6 caracteres).');
            console.error("Registration Error:", err);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="max-w-md w-full space-y-8 bg-white backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-200">
                <div>
                    <img src="https://raw.githubusercontent.com/Carancho-Aerodesign/CaranchoWebsite/v1.3/src/assets/logoWithLabel.png" alt="Logo Carancho Aerodesign" className="mx-auto h-12 w-auto" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registar Novo Administrador</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <InputField id="email" name="email" type="email" placeholder="Endereço de e-mail" Icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
                        <InputField id="password" type="password" placeholder="Senha (mínimo 6 caracteres)" Icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={!isAuthReady} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg">Registar</button>
                    </div>
                </form>
                 <p className="mt-2 text-center text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <button onClick={() => setCurrentPage('login')} className="font-medium text-[#d4982c] hover:text-[#b58426]">
                        Inicie a sessão
                    </button>
                </p>
            </div>
        </div>
    );
};

const AdminSidebarButton = ({ Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${isActive ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
        <Icon className="mr-3" size={20} />
        <span>{label}</span>
    </button>
);

const AdminSidebar = ({ activeSection, setSection }) => (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Administração</h2>
        <nav className="space-y-2">
            <AdminSidebarButton Icon={Users} label="Membros" isActive={activeSection === 'members'} onClick={() => setSection('members')} />
            <AdminSidebarButton Icon={Building} label="Departamentos" isActive={activeSection === 'departments'} onClick={() => setSection('departments')} />
            <AdminSidebarButton Icon={Award} label="Conquistas" isActive={activeSection === 'achievements'} onClick={() => setSection('achievements')} />
            <AdminSidebarButton Icon={Trophy} label="Patrocinadores" isActive={activeSection === 'sponsors'} onClick={() => setSection('sponsors')} />
            <AdminSidebarButton Icon={Settings} label="Geral" isActive={activeSection === 'general'} onClick={() => setSection('general')} />
        </nav>
    </aside>
);

// --- PÁGINA DE ADMINISTRAÇÃO ---
const AdminPage = ({ db, storage, teamHierarchy, sponsors, achievements, siteSettings, setNotification }) => {
    const [adminSection, setAdminSection] = useState('members');
    const emptyForm = { id: null, name: '', role: 'Membro', department: teamHierarchy?.departments[0]?.name || '', age: '', course: '', img: '' };
    const [memberForm, setMemberForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [memberImageFile, setMemberImageFile] = useState(null);
    const [memberImagePreview, setMemberImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [achievementForm, setAchievementForm] = useState({ title: '', description: '' });
    const [localSettings, setLocalSettings] = useState(siteSettings);
    const [sponsorForm, setSponsorForm] = useState({ name: '', logoUrl: '' });
    const [sponsorLogoFile, setSponsorLogoFile] = useState(null);
    const [sponsorLogoPreview, setSponsorLogoPreview] = useState('');

    useEffect(() => {
        if (teamHierarchy) {
            setMemberForm(prev => ({...prev, department: prev.department || teamHierarchy.departments[0]?.name || ''}))
        }
    }, [teamHierarchy]);
    
    useEffect(() => {
        setLocalSettings(siteSettings);
    }, [siteSettings]);

    const handleMemberChange = (e) => setMemberForm({ ...memberForm, [e.target.name]: e.target.value });
    
    const resetForm = () => {
        setMemberForm(emptyForm);
        setEditingId(null);
        setMemberImageFile(null);
        setMemberImagePreview('');
        const fileInput = document.getElementById('member-image-upload');
        if(fileInput) fileInput.value = '';
    };

    const handleMemberImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMemberImageFile(file);
            setMemberImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMemberSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const memberId = editingId || Date.now();
        let memberData = { ...memberForm, id: memberId, age: Number(memberForm.age) || 0 };
        try {
            if (memberImageFile) {
                const imageRef = ref(storage, `public/${appId}/memberImages/${memberId}.jpg`);
                const uploadTask = await uploadBytes(imageRef, memberImageFile);
                memberData.img = await getDownloadURL(uploadTask.ref);
            }
            const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
            const removeMemberById = (id) => {
                if (newHierarchy.captain?.id === id) newHierarchy.captain = null;
                newHierarchy.departments.forEach(dept => {
                    if (dept.manager?.id === id) dept.manager = null;
                    dept.members = dept.members.filter(m => m.id !== id);
                });
                newHierarchy.others = newHierarchy.others.filter(m => m.id !== id);
            };
            if (editingId) { removeMemberById(editingId); }
            if (memberData.role === 'Capitão') {
                if (newHierarchy.captain && newHierarchy.captain.id !== memberData.id) { newHierarchy.others.push({...newHierarchy.captain, role: 'Membro'}); }
                newHierarchy.captain = memberData;
            } else if (memberData.role === 'Gerente') {
                const dept = newHierarchy.departments.find(d => d.name === memberData.department);
                if (dept) { if(dept.manager && dept.manager.id !== memberData.id) { dept.members.push({...dept.manager, role: 'Membro'}); } dept.manager = memberData; }
            } else if (memberData.department === 'Suporte') { newHierarchy.others.push(memberData); } 
            else { const dept = newHierarchy.departments.find(d => d.name === memberData.department); if (dept) dept.members.push(memberData); }
            const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`);
            await setDoc(hierarchyRef, newHierarchy, { merge: true });
            setNotification({ message: editingId ? 'Membro atualizado!' : 'Membro adicionado!', type: 'success' });
            resetForm();
        } catch (error) {
            console.error("Erro ao guardar membro:", error);
            setNotification({ message: 'Erro ao guardar membro.', type: 'error' });
        } finally { setIsUploading(false); }
    };

    const handleEditMember = (member, departmentName) => {
        setEditingId(member.id);
        setMemberForm({ ...member, department: departmentName || 'Suporte' });
        setMemberImagePreview(member.img || '');
        setMemberImageFile(null);
        setAdminSection('members');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleRemoveMember = async (idToRemove) => {
        if (teamHierarchy.captain?.id === idToRemove) { setNotification({ message: "Não pode remover o capitão. Substitua-o primeiro.", type: 'error' }); return; }
        const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        newHierarchy.departments.forEach(dept => { if (dept.manager?.id === idToRemove) dept.manager = null; dept.members = dept.members.filter(m => m.id !== idToRemove); });
        newHierarchy.others = newHierarchy.others.filter(m => m.id !== idToRemove);
        try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy); setNotification({ message: 'Membro removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover membro:", error); setNotification({ message: 'Erro ao remover membro.', type: 'error' }); }
    };

    const handleAddDepartment = async () => {
        if (!newDepartmentName || teamHierarchy.departments.some(d => d.name === newDepartmentName)) { setNotification({ message: 'Nome de departamento inválido ou já existente.', type: 'error' }); return; }
        const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        newHierarchy.departments.push({ name: newDepartmentName, manager: null, members: [] });
        try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy); setNotification({ message: 'Departamento adicionado!', type: 'success' }); setNewDepartmentName(''); } catch (error) { console.error("Erro ao adicionar departamento:", error); setNotification({ message: 'Erro ao adicionar departamento.', type: 'error' }); }
    };

    const handleRemoveDepartment = async (deptName) => {
        const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        const deptIndex = newHierarchy.departments.findIndex(d => d.name === deptName);
        if (deptIndex > -1) {
            const deptToRemove = newHierarchy.departments[deptIndex];
            if (deptToRemove.manager || deptToRemove.members.length > 0) { setNotification({ message: 'Esvazie o departamento antes de o remover.', type: 'error' }); return; }
            newHierarchy.departments.splice(deptIndex, 1);
            try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy); setNotification({ message: 'Departamento removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover departamento:", error); setNotification({ message: 'Erro ao remover departamento.', type: 'error' }); }
        }
    };

    const handleSponsorChange = (e) => setSponsorForm({ ...sponsorForm, [e.target.name]: e.target.value });
    const handleSponsorLogoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSponsorLogoFile(file);
            setSponsorLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSponsorSubmit = async (e) => {
        e.preventDefault();
        if (!sponsorForm.name || (!sponsorLogoFile && !sponsorForm.logoUrl)) {
            setNotification({ message: 'Por favor, preencha o nome e forneça um logótipo (upload ou URL).', type: 'error' });
            return;
        }
        setIsUploading(true);
        let logoUrl = sponsorForm.logoUrl; 

        try {
            if (sponsorLogoFile) {
                const logoRef = ref(storage, `public/${appId}/sponsorLogos/${Date.now()}_${sponsorLogoFile.name}`);
                const uploadTask = await uploadBytes(logoRef, sponsorLogoFile);
                logoUrl = await getDownloadURL(uploadTask.ref);
            }
            
            const sponsorsColRef = collection(db, `/artifacts/${appId}/public/data/sponsors`);
            await addDoc(sponsorsColRef, { name: sponsorForm.name, logo: logoUrl });
            
            setNotification({ message: 'Patrocinador adicionado!', type: 'success' });
            setSponsorForm({ name: '', logoUrl: '' });
            setSponsorLogoFile(null);
            setSponsorLogoPreview('');
            const fileInput = document.getElementById('sponsor-logo-upload');
            if(fileInput) fileInput.value = '';

        } catch (error) {
            console.error("Erro ao adicionar patrocinador:", error);
            setNotification({ message: 'Erro ao adicionar patrocinador.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };
    const removeSponsor = async (id) => {
        try { const sponsorRef = doc(db, `/artifacts/${appId}/public/data/sponsors`, id); await deleteDoc(sponsorRef); setNotification({ message: 'Patrocinador removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover patrocinador:", error); setNotification({ message: 'Erro ao remover patrocinador.', type: 'error' }); }
    };
    
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleGeneralSettingsSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        let updatedSettings = { ...localSettings };
        
        try {
            if (heroImageFile) {
                const imageRef = ref(storage, `public/${appId}/heroImage/main.jpg`);
                const uploadTask = await uploadBytes(heroImageFile, heroImageFile);
                const downloadURL = await getDownloadURL(uploadTask.ref);
                updatedSettings.heroImageUrl = downloadURL;
            }
            
            const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
            await setDoc(settingsRef, {
                heroImageUrl: updatedSettings.heroImageUrl,
                participations: Number(updatedSettings.participations) || 0
            }, { merge: true });

            setNotification({ message: 'Configurações atualizadas!', type: 'success' });
            setHeroImageFile(null);
            const fileInput = document.getElementById('hero-image-upload');
            if(fileInput) fileInput.value = '';

        } catch (error) {
            console.error("Erro ao guardar configurações:", error);
            setNotification({ message: 'Erro ao guardar configurações.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAchievementChange = (e) => setAchievementForm({ ...achievementForm, [e.target.name]: e.target.value });
    const handleAchievementSubmit = async (e) => {
        e.preventDefault();
        if (!achievementForm.title || !achievementForm.description) {
            setNotification({ message: 'Por favor, preencha todos os campos da conquista.', type: 'error' });
            return;
        }
        try {
            const achievementsColRef = collection(db, `/artifacts/${appId}/public/data/achievements`);
            await addDoc(achievementsColRef, achievementForm);
            setNotification({ message: 'Conquista adicionada!', type: 'success' });
            setAchievementForm({ title: '', description: '' });
        } catch (error) {
            console.error("Erro ao adicionar conquista:", error);
            setNotification({ message: 'Erro ao adicionar conquista.', type: 'error' });
        }
    };
    const removeAchievement = async (id) => {
        try {
            const achievementRef = doc(db, `/artifacts/${appId}/public/data/achievements`, id);
            await deleteDoc(achievementRef);
            setNotification({ message: 'Conquista removida.', type: 'success' });
        } catch (error) {
            console.error("Erro ao remover conquista:", error);
            setNotification({ message: 'Erro ao remover conquista.', type: 'error' });
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-center mb-10 text-[#d4982c]">Painel Administrativo</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <AdminSidebar activeSection={adminSection} setSection={setAdminSection} />
                <main className="flex-1">
                    {adminSection === 'general' && (
                        <form onSubmit={handleGeneralSettingsSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
                            <h2 className="text-2xl font-bold text-[#d4982c]">Configurações Gerais</h2>
                            <div>
                                <label htmlFor="participations" className="block text-sm font-medium text-gray-700 mb-2">Número de Participações</label>
                                <InputField id="participations" name="participations" type="number" placeholder="Total de participações" Icon={Trophy} value={localSettings.participations || ''} onChange={handleSettingsChange} />
                            </div>
                            <div>
                                <label htmlFor="hero-image-upload" className="block text-sm font-medium text-gray-700 mb-2">Imagem da Página Inicial</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="hero-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#d4982c] hover:text-[#b58426] px-2"><span>Selecione um ficheiro</span><input id="hero-image-upload" type="file" className="sr-only" onChange={(e) => setHeroImageFile(e.target.files[0])} accept="image/*" /></label>
                                            <p className="pl-1">ou arraste e solte</p>
                                        </div>
                                        {heroImageFile && <p className="text-sm text-green-600 mt-2 truncate">{heroImageFile.name}</p>}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type="submit" disabled={isUploading} className="w-full bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"><Save className="mr-2" />{isUploading ? 'A guardar...' : 'Guardar Configurações'}</button>
                            </div>
                        </form>
                    )}
                    {adminSection === 'members' && (
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingId ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2>
                                <form onSubmit={handleMemberSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InputField name="name" type="text" placeholder="Nome" Icon={User} value={memberForm.name} onChange={handleMemberChange} />
                                        <InputField name="age" type="number" placeholder="Idade" Icon={Hash} value={memberForm.age} onChange={handleMemberChange} />
                                        <InputField name="course" type="text" placeholder="Curso/Formação" Icon={GraduationCap} value={memberForm.course} onChange={handleMemberChange} />
                                        <SelectField name="role" value={memberForm.role} onChange={handleMemberChange} Icon={Briefcase}>
                                            <option>Membro</option><option>Gerente</option><option>Capitão</option><option>Adm</option><option>Piloto</option>
                                        </SelectField>
                                        <SelectField name="department" value={memberForm.department} onChange={handleMemberChange} Icon={Users}>
                                            {teamHierarchy.departments.map(d => <option key={d.name}>{d.name}</option>)}<option value="Suporte">Suporte</option>
                                        </SelectField>
                                        <div className="flex items-center gap-4 lg:col-span-1">
                                            {memberImagePreview && <img src={memberImagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#d4982c]"/>}
                                            <label htmlFor="member-image-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400">
                                                <ImageIcon className="mx-auto mb-1"/><span>{memberImageFile ? 'Alterar' : 'Foto'}</span><input id="member-image-upload" type="file" className="sr-only" onChange={handleMemberImageSelect} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-3">
                                       <InputField name="img" type="text" placeholder="Ou cole o URL da foto" Icon={LinkIcon} value={memberForm.img} onChange={handleMemberChange} />
                                    </div>
                                    <div className="flex gap-2"><button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Save className="mr-2" />{isUploading ? 'A guardar...' : (editingId ? 'Salvar Alterações' : 'Adicionar Membro')}</button>{editingId && <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>}</div>
                                </form>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                                <h3 className="text-xl font-bold mb-4 text-[#d4982c]">Lista de Membros</h3>
                                <div className="space-y-2">
                                    {[teamHierarchy.captain, ...teamHierarchy.departments.flatMap(d => [d.manager, ...d.members]), ...teamHierarchy.others].filter(Boolean).map(member => (
                                        <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3"><img src={member.img || 'https://placehold.co/40x40/e0e0e0/888888?text=?'} alt={member.name} className="w-10 h-10 rounded-full object-cover"/><div><span className="font-semibold text-gray-800">{member.name}</span> - <span className="text-[#d4982c]">{member.role}</span><span className="text-gray-500 text-sm ml-2">({teamHierarchy.departments.find(d => d.members.some(m => m.id === member.id) || d.manager?.id === member.id)?.name || 'Suporte'})</span></div></div>
                                            <div className="flex items-center gap-2"><button onClick={() => handleEditMember(member, teamHierarchy.departments.find(d => d.members.some(m => m.id === member.id) || d.manager?.id === member.id)?.name || 'Suporte')} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {adminSection === 'departments' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gerir Departamentos</h2>
                            <div className="flex gap-4 mb-6"><InputField name="new_department" type="text" placeholder="Nome do Novo Departamento" Icon={Users} value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} /><button onClick={handleAddDepartment} className="bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><PlusCircle className="mr-2" />Adicionar</button></div>
                            <div className="space-y-2">{teamHierarchy.departments.map(dept => (<div key={dept.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><span className="text-gray-800">{dept.name}</span><button onClick={() => handleRemoveDepartment(dept.name)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div>))}</div>
                        </div>
                    )}
                     {adminSection === 'achievements' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gerir Conquistas</h2>
                            <form onSubmit={handleAchievementSubmit} className="space-y-4 mb-6">
                                <InputField name="title" type="text" placeholder="Título da Conquista" Icon={Award} value={achievementForm.title} onChange={handleAchievementChange} />
                                <div className="relative flex-grow">
                                    <textarea name="description" placeholder="Descrição da conquista" value={achievementForm.description} onChange={handleAchievementChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" rows="3"></textarea>
                                </div>
                                <button type="submit" className="bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><PlusCircle className="mr-2" />Adicionar Conquista</button>
                            </form>
                            <div className="space-y-2">
                                {achievements.map(ach => (
                                    <div key={ach.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <p className="font-semibold text-gray-800">{ach.title}</p>
                                            <p className="text-sm text-gray-600">{ach.description}</p>
                                        </div>
                                        <button onClick={() => removeAchievement(ach.id)} className="text-red-500 hover:text-red-700 p-2 shrink-0"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {adminSection === 'sponsors' && (
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gerir Patrocinadores</h2>
                            <form onSubmit={handleSponsorSubmit} className="space-y-4">
                                <InputField name="name" type="text" placeholder="Nome do Patrocinador" Icon={Briefcase} value={sponsorForm.name} onChange={handleSponsorChange} />
                                <InputField name="logoUrl" type="text" placeholder="Ou cole o URL do Logótipo" Icon={LinkIcon} value={sponsorForm.logoUrl} onChange={handleSponsorChange} />
                                <div>
                                    <label htmlFor="sponsor-logo-upload" className="block text-sm font-medium text-gray-700 mb-2">Logótipo do Patrocinador</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        {sponsorLogoPreview && <img src={sponsorLogoPreview} alt="Preview" className="w-16 h-16 object-contain border border-gray-200 rounded-md p-1"/>}
                                        <label htmlFor="sponsor-logo-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400">
                                            <UploadCloud className="mx-auto mb-1"/><span>{sponsorLogoFile ? 'Alterar' : 'Upload'}</span>
                                            <input id="sponsor-logo-upload" type="file" className="sr-only" onChange={handleSponsorLogoSelect} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" disabled={isUploading} className="bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><PlusCircle className="mr-2" />{isUploading ? 'A adicionar...' : 'Adicionar Patrocinador'}</button>
                            </form>
                            <div className="space-y-2 mt-6">
                                {sponsors.map(sponsor => (
                                    <div key={sponsor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4"><img src={sponsor.logo} alt={sponsor.name} className="h-10 w-auto object-contain"/><span>{sponsor.name}</span></div>
                                        <button onClick={() => removeSponsor(sponsor.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- COMPONENTES DE UI GENÉRICOS ---
const AchievementCard = ({ Icon, title, description }) => (<div className="relative p-8 bg-white rounded-xl group border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-[#d4982c]"><div className="flex-shrink-0 mb-4"><div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#d4982c] text-white"><Icon className="h-6 w-6" /></div></div><h3 className="text-xl font-bold text-gray-900">{title}</h3><p className="mt-2 text-gray-600">{description}</p></div>);
const InputField = ({ id, name, type, placeholder, Icon, value, onChange }) => (<div className="relative flex-grow"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></span><input id={id} name={name} type={type} required className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" placeholder={placeholder} value={value} onChange={onChange} /></div>);
const SelectField = ({ name, value, onChange, Icon, children }) => (
    <div className="relative flex-grow">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
        </span>
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="appearance-none rounded-md block w-full pl-10 pr-8 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm"
        >
            {children}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
    </div>
);
const Footer = () => (
    <footer className="bg-[#d4982c] text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8 space-y-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-amber-100 flex-wrap">
                    <MapPin size={16} className="shrink-0" />
                    <span>Av. Roraima nº 1000, Cidade Universitária, Bairro Camobi, Santa Maria - RS, 97105-900</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-amber-100">
                    <Mail size={16} className="shrink-0" />
                    <a href="mailto:carancho@ufsm.br" className="hover:text-white transition-colors">carancho@ufsm.br</a>
                </div>
            </div>
            <div className="flex justify-center space-x-6 mb-8">
                <a href="#" className="text-amber-100 hover:text-white transition-colors"><Twitter /></a>
                <a href="#" className="text-amber-100 hover:text-white transition-colors"><Instagram /></a>
                <a href="#" className="text-amber-100 hover:text-white transition-colors"><Facebook /></a>
            </div>
            <p className="text-base text-amber-100">&copy; {new Date().getFullYear()} Carancho Aerodesign. Todos os direitos reservados.</p>
        </div>
    </footer>
);
const SponsorsCarousel = ({ sponsors }) => {
    if (sponsors.length === 0) return null;

    const animationDuration = sponsors.length * 5; // Adjust speed based on number of sponsors

    return (
        <section className="py-12 bg-gray-100">
            <div className="text-center mb-10 px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossos Parceiros</h2>
            </div>
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
                <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" style={{ animationDuration: `${animationDuration}s`}}>
                    {sponsors.map((sponsor) => (
                        <li key={sponsor.id}><img src={sponsor.logo} alt={sponsor.name} className="max-h-12 w-auto" /></li>
                    ))}
                </ul>
                <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" style={{ animationDuration: `${animationDuration}s`}} aria-hidden="true">
                     {sponsors.map((sponsor) => (
                        <li key={`${sponsor.id}-clone`}><img src={sponsor.logo} alt={sponsor.name} className="max-h-12 w-auto" /></li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

// --- COMPONENTE PRINCIPAL DA APLICAÇÃO ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Firebase state
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [storage, setStorage] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminRegistered, setIsAdminRegistered] = useState(true); // Assume true initially to prevent register flash

  // Data state from Firestore
  const [teamHierarchy, setTeamHierarchy] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [siteSettings, setSiteSettings] = useState(blankSiteSettings);

  // Inicialização do Firebase
  useEffect(() => {
    if (Object.keys(firebaseConfig).length > 0 && !auth) {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      const firebaseStorage = getStorage(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);
      setStorage(firebaseStorage);

      onAuthStateChanged(firebaseAuth, (currentUser) => {
        setUser(currentUser);
        setIsAuthReady(true);
        setIsLoading(false);
        if(currentUser && (currentPage === 'login' || currentPage === 'register')) {
            setCurrentPage('admin');
        }
      });
    } else if (Object.keys(firebaseConfig).length === 0) { 
        setIsLoading(false);
        setIsAuthReady(true);
    }
  }, [auth]);

  // Check if an admin user exists
  useEffect(() => {
      if (!isAuthReady || !db) return;
      const adminsColRef = collection(db, 'admins');
      const q = query(adminsColRef, limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          setIsAdminRegistered(!snapshot.empty);
      }, (error) => {
          console.error("Error checking for admin:", error);
          setIsAdminRegistered(true); // Fail safe
      });
      return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch dados da Hierarquia da Equipa
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`);
    const unsubscribe = onSnapshot(hierarchyRef, (docSnap) => {
        if (docSnap.exists()) { 
            setTeamHierarchy(docSnap.data()); 
        } else {
            setTeamHierarchy(blankTeamHierarchy);
        }
    }, (error) => { console.error("Error fetching team hierarchy:", error); setNotification({message: "Erro ao carregar dados da equipa.", type: "error"}); });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch dados dos Patrocinadores
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const sponsorsColRef = collection(db, `/artifacts/${appId}/public/data/sponsors`);
    const unsubscribe = onSnapshot(sponsorsColRef, (querySnapshot) => {
        setSponsors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => { console.error("Error fetching sponsors:", error); setNotification({message: "Erro ao carregar patrocinadores.", type: "error"}); });
    return () => unsubscribe();
  }, [isAuthReady, db]);
  
  // Fetch dados das Conquistas
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const achievementsColRef = collection(db, `/artifacts/${appId}/public/data/achievements`);
    const unsubscribe = onSnapshot(achievementsColRef, (querySnapshot) => {
        setAchievements(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        console.error("Error fetching achievements:", error);
        setNotification({message: "Erro ao carregar conquistas.", type: "error"});
    });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // Fetch Configurações do Site (Imagem Principal)
  useEffect(() => {
    if (!isAuthReady || !db) return;
    const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) { 
            setSiteSettings(prev => ({ ...blankSiteSettings, ...prev, ...docSnap.data() })); 
        } else {
            setSiteSettings(blankSiteSettings);
        }
    }, (error) => { console.error("Error fetching site settings:", error); });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  const renderPage = () => {
    switch (currentPage) {
      case 'about': return <AboutPage teamHierarchy={teamHierarchy} siteSettings={siteSettings} />;
      case 'login': return <LoginPage auth={auth} isAuthReady={isAuthReady} setCurrentPage={setCurrentPage} setNotification={setNotification} isAdminRegistered={isAdminRegistered} />;
      case 'register': 
        if (isAdminRegistered) return <LoginPage auth={auth} isAuthReady={isAuthReady} setCurrentPage={setCurrentPage} setNotification={setNotification} isAdminRegistered={isAdminRegistered} />;
        return <RegisterPage auth={auth} isAuthReady={isAuthReady} db={db} setCurrentPage={setCurrentPage} setNotification={setNotification} />;
      case 'admin': return user ? <AdminPage db={db} storage={storage} teamHierarchy={teamHierarchy} sponsors={sponsors} achievements={achievements} siteSettings={siteSettings} setNotification={setNotification} /> : <LoginPage auth={auth} isAuthReady={isAuthReady} setCurrentPage={setCurrentPage} setNotification={setNotification} isAdminRegistered={isAdminRegistered} />;
      case 'home': default: return <HomePage teamHierarchy={teamHierarchy} sponsors={sponsors} siteSettings={siteSettings} achievements={achievements} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 font-sans antialiased">
      {isLoading && <LoadingScreen />}
      <div className={`flex flex-col min-h-screen transition-filter duration-500 ${isLoading ? 'blur-sm' : 'blur-none'}`}>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} auth={auth} />
        <main className="flex-grow pt-20">{!isLoading && renderPage()}</main>
        <Footer />
        <Notification notification={notification} onDismiss={() => setNotification(null)} />
      </div>
    </div>
  );
}

// --- CSS PARA ANIMAÇÕES ---
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; animation-delay: 0.2s; }
  .text-shadow-lg { text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
  @keyframes infinite-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
  }
  .animate-infinite-scroll {
      animation: infinite-scroll linear infinite;
  }
`;
document.head.appendChild(style);
