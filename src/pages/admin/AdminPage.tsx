import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Briefcase,
  Building,
  CheckCircle,
  Circle,
  ClipboardList,
  DollarSign,
  Edit,
  FileDown,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  GraduationCap,
  PlusCircle,
  Save,
  Settings,
  Trash2,
  Trophy,
  UploadCloud,
  User as UserIcon,
  Users as UsersIcon,
} from 'lucide-react';

import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { LoadingScreen } from '../../components/layout/LoadingScreen';
import type {
  Achievement,
  FinancialSnapshot,
  NotificationState,
  Project,
  SiteSettings,
  Sponsor,
  TeamAssignment,
  TeamHierarchy,
  TeamMember,
} from '../../types';
import { appId } from '../../firebase';

type AdminSection =
  | 'members'
  | 'departments'
  | 'projects'
  | 'achievements'
  | 'sponsors'
  | 'financial'
  | 'general'
  | 'security';

interface AdminSidebarButtonProps {
  Icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const AdminSidebarButton = ({ Icon, label, isActive, onClick }: AdminSidebarButtonProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
      isActive ? 'bg-[#d4982c] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className="mr-3" size={20} />
    <span>{label}</span>
  </button>
);

interface AdminSidebarProps {
  activeSection: AdminSection;
  setSection: (section: AdminSection) => void;
}

const AdminSidebar = ({ activeSection, setSection }: AdminSidebarProps) => (
  <aside className="w-full md:w-64 flex-shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-md">
    <h2 className="text-xl font-bold mb-6 text-gray-800">Administração</h2>
    <nav className="space-y-2">
      <AdminSidebarButton Icon={UsersIcon} label="Membros" isActive={activeSection === 'members'} onClick={() => setSection('members')} />
      <AdminSidebarButton Icon={Building} label="Departamentos" isActive={activeSection === 'departments'} onClick={() => setSection('departments')} />
      <AdminSidebarButton Icon={ClipboardList} label="Projetos" isActive={activeSection === 'projects'} onClick={() => setSection('projects')} />
      <AdminSidebarButton Icon={Award} label="Conquistas" isActive={activeSection === 'achievements'} onClick={() => setSection('achievements')} />
      <AdminSidebarButton Icon={Trophy} label="Patrocinadores" isActive={activeSection === 'sponsors'} onClick={() => setSection('sponsors')} />
      <AdminSidebarButton Icon={DollarSign} label="Financeiro" isActive={activeSection === 'financial'} onClick={() => setSection('financial')} />
      <AdminSidebarButton Icon={Settings} label="Geral" isActive={activeSection === 'general'} onClick={() => setSection('general')} />
      <AdminSidebarButton Icon={Lock} label="Segurança" isActive={activeSection === 'security'} onClick={() => setSection('security')} />
    </nav>
  </aside>
);

interface MemberFormState {
  id: string | null;
  name: string;
  age: string;
  course: string;
  img: string;
  generalRoles: string[];
  assignments: TeamAssignment[];
}

interface AchievementFormState {
  title: string;
  description: string;
}

interface SponsorFormState {
  name: string;
  logoUrl: string;
  amount: number;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProjectFormState {
  id: string | null;
  year: number;
  title: string;
  description: string;
  imageUrl: string;
}

interface AdminPageProps {
  db: Firestore | null;
  storage: FirebaseStorage | null;
  teamHierarchy: TeamHierarchy | null;
  sponsors: Sponsor[];
  achievements: Achievement[];
  projects: Project[];
  siteSettings: SiteSettings;
  financials: FinancialSnapshot;
  setNotification: (notification: NotificationState) => void;
}

// --- PÁGINA DE ADMINISTRAÇÃO ---
export const AdminPage = ({ db, storage, teamHierarchy, sponsors, achievements, projects, siteSettings, setNotification, financials }: AdminPageProps) => {
  const [adminSection, setAdminSection] = useState<AdminSection>('members');
  const emptyForm: MemberFormState = { id: null, name: '', age: '', course: '', img: '', generalRoles: [], assignments: [] };
  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [achievementForm, setAchievementForm] = useState<AchievementFormState>({ title: '', description: '' });
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormState>({ name: '', logoUrl: '', amount: 0 });
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState('');
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    id: null,
    year: new Date().getFullYear(),
    title: '',
    description: '',
    imageUrl: '',
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState('');

  const availableGeneralRoles = ['Capitão', 'Capitã', 'Vice-capitão', 'Vice-capitã', 'Piloto', 'Administrador', 'Orientador'];
  const captainRoles = ['Capitão', 'Capitã'];
  const availableDepartmentRoles = ['Membro', 'Gerente'];
    useEffect(() => { setLocalSettings(siteSettings); }, [siteSettings]);
    const handleMemberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setMemberForm(prev => ({ ...prev, [name]: value }));
    };
    const handleGeneralRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setMemberForm(prev => {
            const currentValues = prev.generalRoles || [];
            return {
                ...prev,
                generalRoles: checked ? [...currentValues, value] : currentValues.filter(item => item !== value),
            };
        });
    };
    const handleAssignmentChange = (index: number, field: keyof TeamAssignment, value: string) => {
        const newAssignments = [...(memberForm.assignments || [])];
        newAssignments[index][field] = value;
        setMemberForm(prev => ({ ...prev, assignments: newAssignments }));
    };
    const addAssignment = () => { setMemberForm(prev => ({ ...prev, assignments: [...(prev.assignments || []), { department: '', role: 'Membro' }] })); };
    const removeAssignment = (index) => {
        const newAssignments = [...(memberForm.assignments || [])];
        newAssignments.splice(index, 1);
        setMemberForm(prev => ({ ...prev, assignments: newAssignments }));
    };
    const resetForm = () => {
        setMemberForm(emptyForm);
        setEditingId(null);
        setMemberImageFile(null);
        setMemberImagePreview('');
        const fileInput = document.getElementById('member-image-upload');
        if(fileInput) fileInput.value = '';
    };
    const handleMemberImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMemberImageFile(file);
            setMemberImagePreview(URL.createObjectURL(file));
        }
    };
    const handleMemberSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !storage || !teamHierarchy) return;
        setIsUploading(true);
        const memberId = editingId ?? Date.now().toString();
        let memberData = { ...memberForm, id: memberId, age: Number(memberForm.age) || 0 };
        try {
            if (memberImageFile) {
                const imageRef = ref(storage, `public/${appId}/memberImages/${memberId}.jpg`);
                const uploadTask = await uploadBytes(imageRef, memberImageFile);
                memberData.img = await getDownloadURL(uploadTask.ref);
            }
            const newHierarchy: TeamHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
            if (memberData.generalRoles?.some(role => captainRoles.includes(role))) {
                newHierarchy.members.forEach(member => {
                    if (member.id !== memberId && member.generalRoles?.some(role => captainRoles.includes(role))) {
                        member.generalRoles = member.generalRoles.filter(role => !captainRoles.includes(role));
                    }
                });
            }
            const memberIndex = newHierarchy.members.findIndex(m => m.id === editingId);
            if (memberIndex > -1) { newHierarchy.members[memberIndex] = memberData; } else { newHierarchy.members.push(memberData); }
            const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`);
            await setDoc(hierarchyRef, newHierarchy, { merge: true });
            setNotification({ message: editingId ? 'Membro atualizado!' : 'Membro adicionado!', type: 'success' });
            resetForm();
        } catch (error) { console.error("Erro ao guardar membro:", error); setNotification({ message: 'Erro ao guardar membro.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleEditMember = (member) => {
        setEditingId(member.id);
        setMemberForm({ ...member });
        setMemberImagePreview(member.img || '');
        setMemberImageFile(null);
        setAdminSection('members');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleRemoveMember = async (idToRemove) => {
        const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        newHierarchy.members = newHierarchy.members.filter(m => m.id !== idToRemove);
        try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy); setNotification({ message: 'Membro removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover membro:", error); setNotification({ message: 'Erro ao remover membro.', type: 'error' }); }
    };
    const handleAddDepartment = async () => {
        if (!db || !teamHierarchy) return;
        if (!newDepartmentName || teamHierarchy.departments.some(d => d.name === newDepartmentName)) { setNotification({ message: 'Nome de departamento inválido ou já existente.', type: 'error' }); return; }
        const newHierarchy: TeamHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        newHierarchy.departments.push({ id: Date.now().toString(), name: newDepartmentName });
        try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy, {merge: true}); setNotification({ message: 'Departamento adicionado!', type: 'success' }); setNewDepartmentName(''); } catch (error) { console.error("Erro ao adicionar departamento:", error); setNotification({ message: 'Erro ao adicionar departamento.', type: 'error' }); }
    };
    const handleRemoveDepartment = async (deptId: string) => {
        if (!db || !teamHierarchy) return;
        const newHierarchy: TeamHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        newHierarchy.departments = newHierarchy.departments.filter(d => d.id !== deptId);
        const removedDept = teamHierarchy.departments.find(d => d.id === deptId);
        newHierarchy.members.forEach(member => { member.assignments = member.assignments.filter(a => a.department !== removedDept?.name); });
        try { const hierarchyRef = doc(db, `/artifacts/${appId}/public/data/team/hierarchy`); await setDoc(hierarchyRef, newHierarchy); setNotification({ message: 'Departamento removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover departamento:", error); setNotification({ message: 'Erro ao remover departamento.', type: 'error' }); }
    };
    const handleSponsorChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setSponsorForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSponsorLogoSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) { setSponsorLogoFile(file); setSponsorLogoPreview(URL.createObjectURL(file)); }
    };
    const handleSponsorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !storage) return;
        if (!sponsorForm.name || (!sponsorLogoFile && !sponsorForm.logoUrl)) { setNotification({ message: 'Por favor, preencha o nome e forneça um logótipo (upload ou URL).', type: 'error' }); return; }
        setIsUploading(true);
        let logoUrl = sponsorForm.logoUrl; 
        try {
            if (sponsorLogoFile) {
                const logoRef = ref(storage, `public/${appId}/sponsorLogos/${Date.now()}_${sponsorLogoFile.name}`);
                const uploadTask = await uploadBytes(logoRef, sponsorLogoFile);
                logoUrl = await getDownloadURL(uploadTask.ref);
            }
            const sponsorData = { name: sponsorForm.name, logo: logoUrl, amount: Number(sponsorForm.amount) || 0, dateReceived: new Date() };
            if (editingSponsorId) {
                const sponsorRef = doc(db, `/artifacts/${appId}/public/data/sponsors`, editingSponsorId);
                await updateDoc(sponsorRef, sponsorData);
                setNotification({ message: 'Patrocinador atualizado!', type: 'success' });
            } else {
                const sponsorsColRef = collection(db, `/artifacts/${appId}/public/data/sponsors`);
                await addDoc(sponsorsColRef, sponsorData);
                setNotification({ message: 'Patrocinador adicionado!', type: 'success' });
            }
            setSponsorForm({ name: '', logoUrl: '', amount: 0 });
            setSponsorLogoFile(null);
            setSponsorLogoPreview('');
            setEditingSponsorId(null);
            const fileInput = document.getElementById('sponsor-logo-upload') as HTMLInputElement | null;
            if(fileInput) fileInput.value = '';
        } catch (error) { console.error("Erro ao adicionar/atualizar patrocinador:", error); setNotification({ message: 'Erro ao guardar patrocinador.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleEditSponsor = (sponsor) => {
        setEditingSponsorId(sponsor.id);
        setSponsorForm({ name: sponsor.name, logoUrl: sponsor.logo, amount: sponsor.amount || 0 });
        setSponsorLogoPreview(sponsor.logo);
    };
    const removeSponsor = async (id: string) => {
        if (!db) return;
        try { const sponsorRef = doc(db, `/artifacts/${appId}/public/data/sponsors`, id); await deleteDoc(sponsorRef); setNotification({ message: 'Patrocinador removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover patrocinador:", error); setNotification({ message: 'Erro ao remover patrocinador.', type: 'error' }); }
    };
    const handleSettingsChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
    const handleGeneralSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !storage) return;
        setIsUploading(true);
        let updatedSettings = { ...localSettings };
        try {
            if (heroImageFile) {
                const imageRef = ref(storage, `public/${appId}/heroImage/main.jpg`);
                const uploadTask = await uploadBytes(imageRef, heroImageFile);
                const downloadURL = await getDownloadURL(uploadTask.ref);
                updatedSettings.heroImageUrl = downloadURL;
            }
            const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
            await setDoc(settingsRef, { heroImageUrl: updatedSettings.heroImageUrl, participations: Number(updatedSettings.participations) || 0, monthlyDues: Number(updatedSettings.monthlyDues) || 0, history: updatedSettings.history, mission: updatedSettings.mission, vision: updatedSettings.vision }, { merge: true });
            setNotification({ message: 'Configurações atualizadas!', type: 'success' });
            setHeroImageFile(null);
            const fileInput = document.getElementById('hero-image-upload') as HTMLInputElement | null;
            if(fileInput) fileInput.value = '';
        } catch (error) { console.error("Erro ao guardar configurações:", error); setNotification({ message: 'Erro ao guardar configurações.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleAchievementChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setAchievementForm(prev => ({ ...prev, [name]: value }));
    };
    const handleAchievementSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db) return;
        if (!achievementForm.title || !achievementForm.description) { setNotification({ message: 'Por favor, preencha todos os campos da conquista.', type: 'error' }); return; }
        try {
            if (editingAchievementId) {
                const achievementRef = doc(db, `/artifacts/${appId}/public/data/achievements`, editingAchievementId);
                await updateDoc(achievementRef, achievementForm);
                setNotification({ message: 'Conquista atualizada!', type: 'success' });
            } else {
                const achievementsColRef = collection(db, `/artifacts/${appId}/public/data/achievements`);
                await addDoc(achievementsColRef, achievementForm);
                setNotification({ message: 'Conquista adicionada!', type: 'success' });
            }
            setAchievementForm({ title: '', description: '' });
            setEditingAchievementId(null);
        } catch (error) { console.error("Erro ao guardar conquista:", error); setNotification({ message: 'Erro ao guardar conquista.', type: 'error' }); }
    };
    const handleEditAchievement = (achievement) => {
        setEditingAchievementId(achievement.id);
        setAchievementForm({ title: achievement.title, description: achievement.description });
    };
    const removeAchievement = async (id: string) => {
        if (!db) return;
        try { const achievementRef = doc(db, `/artifacts/${appId}/public/data/achievements`, id); await deleteDoc(achievementRef); setNotification({ message: 'Conquista removida.', type: 'success' }); } catch (error) { console.error("Erro ao remover conquista:", error); setNotification({ message: 'Erro ao remover conquista.', type: 'error' }); }
    };
    const handleProjectFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setProjectForm(prev => ({ ...prev, [name]: value }));
    };
    const handleProjectImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) { setProjectImageFile(file); setProjectImagePreview(URL.createObjectURL(file)); }
    };
    const handleProjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !storage) return;
        if (!projectForm.title || !projectForm.year || !projectForm.description) { setNotification({ message: 'Por favor, preencha todos os campos do projeto.', type: 'error' }); return; }
        setIsUploading(true);
        let imageUrl = projectForm.imageUrl;
        try {
            if (projectImageFile) {
                const imageRef = ref(storage, `public/${appId}/projectImages/${Date.now()}_${projectImageFile.name}`);
                const uploadTask = await uploadBytes(imageRef, projectImageFile);
                imageUrl = await getDownloadURL(uploadTask.ref);
            }
            if (!imageUrl) { setNotification({ message: 'É necessário fornecer uma imagem para o projeto.', type: 'error' }); setIsUploading(false); return; }
            const projectData = { year: Number(projectForm.year), title: projectForm.title, description: projectForm.description, imageUrl };
            if (editingProjectId) {
                const projectRef = doc(db, `/artifacts/${appId}/public/data/projects`, editingProjectId);
                await updateDoc(projectRef, projectData);
                setNotification({ message: 'Projeto atualizado com sucesso!', type: 'success' });
            } else {
                const projectsColRef = collection(db, `/artifacts/${appId}/public/data/projects`);
                await addDoc(projectsColRef, projectData);
                setNotification({ message: 'Projeto adicionado com sucesso!', type: 'success' });
            }
            setProjectForm({ id: null, year: new Date().getFullYear(), title: '', description: '', imageUrl: '' });
            setEditingProjectId(null);
            setProjectImageFile(null);
            setProjectImagePreview('');
            const fileInput = document.getElementById('project-image-upload') as HTMLInputElement | null;
            if(fileInput) fileInput.value = '';
        } catch (error) { console.error("Erro ao guardar projeto:", error); setNotification({ message: 'Erro ao guardar o projeto.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleEditProject = (project) => {
        setEditingProjectId(project.id);
        setProjectForm({ ...project });
        setProjectImagePreview(project.imageUrl);
        setProjectImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const removeProject = async (id: string) => {
        if (!db) return;
        try { const projectRef = doc(db, `/artifacts/${appId}/public/data/projects`, id); await deleteDoc(projectRef); setNotification({ message: 'Projeto removido.', type: 'success' }); } catch (error) { console.error("Erro ao remover projeto:", error); setNotification({ message: 'Erro ao remover projeto.', type: 'error' }); }
    };
    const handlePasswordFormChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };
    const handlePasswordChangeSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { setNotification({ message: 'As novas senhas não coincidem.', type: 'error' }); return; }
        if (passwordForm.newPassword.length < 6) { setNotification({ message: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'error' }); return; }
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !user.email) { setNotification({ message: 'Sessão expirada, inicie novamente.', type: 'error' }); return; }
        const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwordForm.newPassword);
            setNotification({ message: 'Senha alterada com sucesso!', type: 'success' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) { console.error("Erro ao alterar senha:", error); setNotification({ message: 'Erro ao alterar a senha. Verifique a sua senha atual.', type: 'error' }); }
    };
    const handleTogglePayment = async (memberId: string, month: number) => {
        if (!db) return;
        const paymentId = `${memberId}_${financialYear}_${month}`;
        const paymentRef = doc(db, `/artifacts/${appId}/public/data/payments`, paymentId);
        try {
            const docSnap = await getDoc(paymentRef);
            if (docSnap.exists()) {
                await deleteDoc(paymentRef);
                setNotification({ message: 'Pagamento desmarcado.', type: 'info' });
            } else {
                await setDoc(paymentRef, { memberId, year: financialYear, month, amount: siteSettings.monthlyDues, datePaid: new Date(), });
                setNotification({ message: 'Pagamento registado!', type: 'success' });
            }
        } catch (error) { console.error("Erro ao atualizar pagamento:", error); setNotification({ message: 'Erro ao atualizar pagamento.', type: 'error' }); }
    };
    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Tipo,Data,Membro/Patrocinador,Valor\r\n";
        const yearlyPayments = financials.payments.filter(p => p.year === financialYear);
        yearlyPayments.forEach(p => {
            if(p?.datePaid && typeof p.datePaid.toDate === 'function') {
                const date = p.datePaid.toDate().toLocaleDateString('pt-BR');
                const member = teamHierarchy.members.find(m => m.id === p.memberId);
                csvContent += `Mensalidade,${date},${member?.name || 'Membro não encontrado'},${p.amount}\r\n`;
            }
        });
        const yearlySponsorships = financials.sponsorships.filter(s => s?.dateReceived && typeof s.dateReceived.toDate === 'function' && s.dateReceived.toDate().getFullYear() === financialYear);
        yearlySponsorships.forEach(s => {
            const date = s.dateReceived.toDate().toLocaleDateString('pt-BR');
            csvContent += `Patrocínio,${date},${s.name},${s.amount}\r\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financeiro_carancho_${financialYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const totalDuesPaidForYear = financials.payments.filter(p => p.year === financialYear).reduce((acc, p) => acc + p.amount, 0);
    const totalSponsorshipsForYear = financials.sponsorships
        .filter(s => s?.dateReceived && typeof s.dateReceived.toDate === 'function' && s.dateReceived.toDate().getFullYear() === financialYear)
        .reduce((acc, s) => acc + s.amount, 0);

    if (!teamHierarchy || !db || !storage) return <LoadingScreen />;
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center mb-10 text-[#d4982c]">Painel Administrativo</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <AdminSidebar activeSection={adminSection} setSection={setAdminSection} />
                <main className="flex-1">
                    {adminSection === 'general' && ( <form onSubmit={handleGeneralSettingsSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6"> <h2 className="text-2xl font-bold text-[#d4982c]">Configurações Gerais</h2> <div><label htmlFor="participations" className="block text-sm font-medium text-gray-700 mb-2">Número de Participações</label><InputField id="participations" name="participations" type="number" placeholder="Total de participações" Icon={Trophy} value={localSettings.participations || ''} onChange={handleSettingsChange} /></div> <div><label htmlFor="monthlyDues" className="block text-sm font-medium text-gray-700 mb-2">Valor da Mensalidade (R$)</label><InputField id="monthlyDues" name="monthlyDues" type="number" placeholder="Valor da mensalidade" Icon={DollarSign} value={localSettings.monthlyDues || ''} onChange={handleSettingsChange} /></div> <div><label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem da Página Inicial</label><InputField id="heroImageUrl" name="heroImageUrl" type="text" placeholder="Cole o URL da imagem aqui" Icon={LinkIcon} value={localSettings.heroImageUrl || ''} onChange={handleSettingsChange} /></div> <div><label htmlFor="hero-image-upload" className="block text-sm font-medium text-gray-700 mb-2">Ou faça upload de uma nova imagem</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"><div className="space-y-1 text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-400" /><div className="flex text-sm text-gray-600"><label htmlFor="hero-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#d4982c] hover:text-[#b58426] px-2"><span>Selecione um ficheiro</span><input id="hero-image-upload" type="file" className="sr-only" onChange={(e) => setHeroImageFile(e.target.files[0])} accept="image/*" /></label><p className="pl-1">ou arraste e solte</p></div>{heroImageFile && <p className="text-sm text-green-600 mt-2 truncate">{heroImageFile.name}</p>}</div></div></div> <div><label htmlFor="history" className="block text-sm font-medium text-gray-700 mb-2">Nossa História</label><textarea id="history" name="history" rows="5" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.history} onChange={handleSettingsChange}></textarea></div> <div><label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">Missão</label><textarea id="mission" name="mission" rows="3" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.mission} onChange={handleSettingsChange}></textarea></div> <div><label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">Visão</label><textarea id="vision" name="vision" rows="3" className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.vision} onChange={handleSettingsChange}></textarea></div> <div><button type="submit" disabled={isUploading} className="w-full bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"><Save className="mr-2" />{isUploading ? 'A guardar...' : 'Guardar Configurações'}</button></div> </form> )}
                    {adminSection === 'members' && ( <div className="space-y-8"> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingId ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2> <form onSubmit={handleMemberSubmit} className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> <InputField name="name" type="text" placeholder="Nome" Icon={UserIcon} value={memberForm.name} onChange={handleMemberChange} /> <InputField name="age" type="number" placeholder="Idade" Icon={Hash} value={memberForm.age} onChange={handleMemberChange} /> <InputField name="course" type="text" placeholder="Curso/Formação" Icon={GraduationCap} value={memberForm.course} onChange={handleMemberChange} /> </div> <div className="space-y-4"> <h4 className="text-sm font-medium text-gray-700">Atribuições em Departamentos</h4> {memberForm.assignments?.map((assignment, index) => ( <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"> <SelectField name="department" value={assignment.department} onChange={(e) => handleAssignmentChange(index, 'department', e.target.value)} Icon={Building}><option value="">Selecione Departamento</option>{teamHierarchy.departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</SelectField> <SelectField name="role" value={assignment.role} onChange={(e) => handleAssignmentChange(index, 'role', e.target.value)} Icon={Briefcase}>{availableDepartmentRoles.map(r => <option key={r}>{r}</option>)}</SelectField> <button type="button" onClick={() => removeAssignment(index)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18}/></button> </div> ))} <button type="button" onClick={addAssignment} className="text-sm font-semibold text-[#d4982c] hover:text-[#b58426] flex items-center gap-1"><PlusCircle size={16}/> Adicionar Atribuição</button> </div> <div className="space-y-2"> <h4 className="text-sm font-medium text-gray-700">Funções Gerais</h4> <div className="flex flex-wrap gap-4">{availableGeneralRoles.map(role => (<label key={role} className="flex items-center"><input type="checkbox" name="generalRoles" value={role} checked={memberForm.generalRoles?.includes(role)} onChange={(e) => handleGeneralRoleChange(e)} className="h-4 w-4 rounded border-gray-300 text-[#d4982c] focus:ring-[#d4982c]"/><span className="ml-2 text-gray-700">{role}</span></label>))}</div> </div> <div className="lg:col-span-3"><InputField name="img" type="text" placeholder="Ou cole o URL da foto" Icon={LinkIcon} value={memberForm.img} onChange={handleMemberChange} /></div> <div className="flex items-center gap-4 lg:col-span-1"> {memberImagePreview && <img loading="lazy" decoding="async" src={memberImagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#d4982c]"/>} <label htmlFor="member-image-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400"><ImageIcon className="mx-auto mb-1"/><span>{memberImageFile ? 'Alterar' : 'Foto'}</span><input id="member-image-upload" type="file" className="sr-only" onChange={handleMemberImageSelect} accept="image/*" /></label> </div> <div className="flex gap-2"><button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Save className="mr-2" />{isUploading ? 'A guardar...' : (editingId ? 'Salvar Alterações' : 'Adicionar Membro')}</button>{editingId && <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>}</div> </form> </div> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h3 className="text-xl font-bold mb-4 text-[#d4982c]">Lista de Membros</h3> <div className="space-y-2"> {teamHierarchy.members.map(member => ( <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div className="flex items-center gap-3"><img loading="lazy" decoding="async" src={member.img || 'https://placehold.co/40x40/e0e0e0/888888?text=?'} alt={member.name} className="w-10 h-10 rounded-full object-cover"/><div><span className="font-semibold text-gray-800">{member.name}</span> - <span className="text-[#d4982c]">{[...(member.generalRoles || []), ...(member.assignments || []).map(a => a.role)].join(', ')}</span></div></div> <div className="flex items-center gap-2"><button onClick={() => handleEditMember(member)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div> </div> ))} </div> </div> </div> )}
                    {adminSection === 'departments' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gerir Departamentos</h2> <div className="flex gap-4 mb-6"><InputField name="new_department" type="text" placeholder="Nome do Novo Departamento" Icon={UsersIcon} value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} /><button onClick={handleAddDepartment} className="bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><PlusCircle className="mr-2" />Adicionar</button></div> <div className="space-y-2">{teamHierarchy.departments.map(dept => (<div key={dept.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><span className="text-gray-800">{dept.name}</span><button onClick={() => handleRemoveDepartment(dept.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div>))}</div> </div> )}
                        {adminSection === 'projects' && ( <div className="space-y-8"> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingProjectId ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h2> <form onSubmit={handleProjectSubmit} className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <InputField name="title" type="text" placeholder="Título do Projeto" Icon={ClipboardList} value={projectForm.title} onChange={handleProjectFormChange} /> <InputField name="year" type="number" placeholder="Ano do Projeto" Icon={Hash} value={projectForm.year} onChange={handleProjectFormChange} /> </div> <div> <textarea name="description" placeholder="Descrição do Projeto" value={projectForm.description} onChange={handleProjectFormChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" rows="4"></textarea> </div> <div> <InputField name="imageUrl" type="text" placeholder="URL da Imagem do Projeto" Icon={LinkIcon} value={projectForm.imageUrl} onChange={handleProjectFormChange} /> </div> <div className="flex items-center gap-4"> {projectImagePreview && <img loading="lazy" decoding="async" src={projectImagePreview} alt="Preview" className="w-24 h-auto rounded-md object-cover border-2 border-[#d4982c]"/>} <label htmlFor="project-image-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400"> <UploadCloud className="mx-auto mb-1"/><span>{projectImageFile ? 'Alterar Imagem' : 'Upload de Imagem'}</span> <input id="project-image-upload" type="file" className="sr-only" onChange={handleProjectImageSelect} accept="image/*" /> </label> </div> <div className="flex gap-2"> <button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"> <Save className="mr-2" />{isUploading ? 'A guardar...' : (editingProjectId ? 'Salvar Alterações' : 'Adicionar Projeto')} </button> {editingProjectId && <button type="button" onClick={() => { setProjectForm({ id: null, year: new Date().getFullYear(), title: '', description: '', imageUrl: '' }); setEditingProjectId(null); setProjectImagePreview(''); setProjectImageFile(null); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>} </div> </form> </div> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h3 className="text-xl font-bold mb-4 text-[#d4982c]">Lista de Projetos</h3> <div className="space-y-2"> {projects.map(project => ( <div key={project.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div className="flex items-center gap-4"> <img loading="lazy" decoding="async" src={project.imageUrl || 'https://placehold.co/60x40/e0e0e0/888888?text=?'} alt={project.title} className="w-16 h-12 rounded object-cover"/> <div> <p className="font-semibold text-gray-800">{project.title} ({project.year})</p> <p className="text-sm text-gray-600 truncate w-64">{project.description}</p> </div> </div> <div className="flex items-center gap-2"> <button onClick={() => handleEditProject(project)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button> <button onClick={() => removeProject(project.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button> </div> </div> ))} </div> </div> </div> )}
                    {adminSection === 'achievements' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingAchievementId ? 'Editar Conquista' : 'Adicionar Conquista'}</h2> <form onSubmit={handleAchievementSubmit} className="space-y-4 mb-6"> <InputField name="title" type="text" placeholder="Título da Conquista" Icon={Award} value={achievementForm.title} onChange={handleAchievementChange} /> <div className="relative flex-grow"><textarea name="description" placeholder="Descrição da conquista" value={achievementForm.description} onChange={handleAchievementChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" rows="3"></textarea></div> <div className="flex gap-2"> <button type="submit" className="flex-grow bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><Save className="mr-2" />{editingAchievementId ? 'Salvar Alterações' : 'Adicionar Conquista'}</button> {editingAchievementId && <button type="button" onClick={() => { setAchievementForm({ title: '', description: '' }); setEditingAchievementId(null);}} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>} </div> </form> <div className="space-y-2"> {achievements.map(ach => ( <div key={ach.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div><p className="font-semibold text-gray-800">{ach.title}</p><p className="text-sm text-gray-600">{ach.description}</p></div> <div className="flex items-center gap-2"><button onClick={() => handleEditAchievement(ach)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => removeAchievement(ach.id)} className="text-red-500 hover:text-red-700 p-2 shrink-0"><Trash2 size={18}/></button></div> </div> ))} </div> </div> )}
                    {adminSection === 'sponsors' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingSponsorId ? 'Editar Patrocinador' : 'Adicionar Patrocinador'}</h2> <form onSubmit={handleSponsorSubmit} className="space-y-4"> <InputField name="name" type="text" placeholder="Nome do Patrocinador" Icon={Briefcase} value={sponsorForm.name} onChange={handleSponsorChange} /> <InputField name="amount" type="number" placeholder="Valor do Patrocínio (R$)" Icon={DollarSign} value={sponsorForm.amount} onChange={handleSponsorChange} /> <InputField name="logoUrl" type="text" placeholder="Ou cole o URL do Logótipo" Icon={LinkIcon} value={sponsorForm.logoUrl} onChange={handleSponsorChange} /> <div><label htmlFor="sponsor-logo-upload" className="block text-sm font-medium text-gray-700 mb-2">Logótipo do Patrocinador</label><div className="mt-1 flex items-center gap-4">{sponsorLogoPreview && <img loading="lazy" decoding="async" src={sponsorLogoPreview} alt="Preview" className="w-16 h-16 object-contain border border-gray-200 rounded-md p-1"/>}<label htmlFor="sponsor-logo-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400"><UploadCloud className="mx-auto mb-1"/><span>{sponsorLogoFile ? 'Alterar' : 'Upload'}</span><input id="sponsor-logo-upload" type="file" className="sr-only" onChange={handleSponsorLogoSelect} accept="image/*" /></label></div></div> <div className="flex gap-2"><button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><Save className="mr-2" />{isUploading ? 'A guardar...' : (editingSponsorId ? 'Salvar Alterações' : 'Adicionar Patrocinador')}</button>{editingSponsorId && <button type="button" onClick={() => { setSponsorForm({ name: '', logoUrl: '', amount: 0 }); setEditingSponsorId(null); setSponsorLogoPreview(''); setSponsorLogoFile(null); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>}</div> </form> <div className="space-y-2 mt-6">{sponsors.map(sponsor => (<div key={sponsor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><div className="flex items-center gap-4"><img loading="lazy" decoding="async" src={sponsor.logo} alt={sponsor.name} className="h-10 w-auto object-contain"/><span>{sponsor.name}</span></div><div className="flex items-center gap-2"><button onClick={() => handleEditSponsor(sponsor)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => removeSponsor(sponsor.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div></div>))}</div> </div> )}
                    {adminSection === 'security' && ( <form onSubmit={handlePasswordChangeSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6"> <h2 className="text-2xl font-bold text-[#d4982c]">Alterar Senha</h2> <InputField id="currentPassword" name="currentPassword" type="password" placeholder="Senha Atual" Icon={Lock} value={passwordForm.currentPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showCurrentPassword} togglePasswordVisibility={() => setShowCurrentPassword(!showCurrentPassword)} /> <InputField id="newPassword" name="newPassword" type="password" placeholder="Nova Senha" Icon={Lock} value={passwordForm.newPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showNewPassword} togglePasswordVisibility={() => setShowNewPassword(!showNewPassword)} /> <InputField id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirmar Nova Senha" Icon={Lock} value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showConfirmPassword} togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)} /> <div><button type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-[#d4982c] hover:bg-[#b58426] transition-all duration-300 transform hover:scale-105 shadow-lg">Alterar Senha</button></div> </form> )}
                    {adminSection === 'financial' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gestão Financeira</h2> <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center"> <div className="p-4 bg-green-100 rounded-lg"><p className="text-sm text-green-700">Total Arrecadado (Mensalidades)</p><p className="text-2xl font-bold text-green-800">R$ {totalDuesPaidForYear.toFixed(2)}</p></div> <div className="p-4 bg-blue-100 rounded-lg"><p className="text-sm text-blue-700">Total Arrecadado (Patrocínios)</p><p className="text-2xl font-bold text-blue-800">R$ {totalSponsorshipsForYear.toFixed(2)}</p></div> <div className="p-4 bg-amber-100 rounded-lg"><p className="text-sm text-amber-700">Total Geral</p><p className="text-2xl font-bold text-amber-800">R$ {(totalDuesPaidForYear + totalSponsorshipsForYear).toFixed(2)}</p></div> </div> <div className="flex justify-between items-center mb-4"> <select value={financialYear} onChange={(e) => setFinancialYear(Number(e.target.value))} className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">{Array.from({length: 3}, (_, i) => new Date().getFullYear() - i).map(year => <option key={year} value={year}>{year}</option>)}</select> <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><FileDown size={18}/>Exportar CSV</button> </div> <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>{Array.from({length: 12}, (_, i) => <th key={i} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{new Date(0, i).toLocaleString('pt-BR', { month: 'short' })}</th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{teamHierarchy?.members?.map(member => { const memberPayments = financials.payments.filter(p => p.memberId === member.id && p.year === financialYear); return (<tr key={member.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>{Array.from({length: 12}, (_, i) => { const month = i + 1; const payment = memberPayments.find(p => p.month === month); return (<td key={month} className="px-6 py-4 whitespace-nowrap text-center text-sm"><button onClick={() => handleTogglePayment(member.id, month)} className={`p-1.5 rounded-full transition-colors ${payment ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>{payment ? <CheckCircle size={18}/> : <Circle size={18}/>}</button></td>)})}</tr>)})}</tbody></table></div> </div> )}
                </main>
            </div>
        </div>
    );
};
