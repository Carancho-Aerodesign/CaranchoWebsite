import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { deleteObject, ref } from 'firebase/storage';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle,
  Circle,
  ClipboardList,
  DollarSign,
  Edit,
  FileDown,
  Gift,
  Hash,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  GraduationCap,
  Phone,
  PlusCircle,
  Save,
  Settings,
  ShoppingCart,
  Ticket,
  Trash2,
  TrendingUp,
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
  PurchaseRecord,
  RaffleSale,
  SiteSettings,
  Sponsor,
  TeamAssignment,
  TeamHierarchy,
  TeamMember,
} from '../../types';
import { appId } from '../../firebase';
import { calculateAgeFromDate, formatDateForInput, parseDateInput } from '../../utils/dateHelpers';
import { allocateTicketNumbers } from '../../utils/raffleManager';

type AdminSection =
  | 'dashboard'
  | 'members'
  | 'departments'
  | 'projects'
  | 'achievements'
  | 'sponsors'
  | 'raffles'
  | 'dues'
  | 'financial'
  | 'purchases'
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
      <AdminSidebarButton Icon={LayoutDashboard} label="Início" isActive={activeSection === 'dashboard'} onClick={() => setSection('dashboard')} />
      <AdminSidebarButton Icon={UsersIcon} label="Membros" isActive={activeSection === 'members'} onClick={() => setSection('members')} />
      <AdminSidebarButton Icon={Building} label="Departamentos" isActive={activeSection === 'departments'} onClick={() => setSection('departments')} />
      <AdminSidebarButton Icon={ClipboardList} label="Projetos" isActive={activeSection === 'projects'} onClick={() => setSection('projects')} />
      <AdminSidebarButton Icon={Award} label="Conquistas" isActive={activeSection === 'achievements'} onClick={() => setSection('achievements')} />
      <AdminSidebarButton Icon={Trophy} label="Patrocinadores" isActive={activeSection === 'sponsors'} onClick={() => setSection('sponsors')} />
      <AdminSidebarButton Icon={Ticket} label="Rifas" isActive={activeSection === 'raffles'} onClick={() => setSection('raffles')} />
      <AdminSidebarButton Icon={CheckCircle} label="Mensalidades" isActive={activeSection === 'dues'} onClick={() => setSection('dues')} />
      <AdminSidebarButton Icon={DollarSign} label="Financeiro" isActive={activeSection === 'financial'} onClick={() => setSection('financial')} />
      <AdminSidebarButton Icon={ShoppingCart} label="Compras" isActive={activeSection === 'purchases'} onClick={() => setSection('purchases')} />
      <AdminSidebarButton Icon={Settings} label="Geral" isActive={activeSection === 'general'} onClick={() => setSection('general')} />
      <AdminSidebarButton Icon={Lock} label="Segurança" isActive={activeSection === 'security'} onClick={() => setSection('security')} />
    </nav>
  </aside>
);

interface MemberFormState {
  id: string | null;
  name: string;
  birthDate: string;
  course: string;
  img: string;
  generalRoles: string[];
  assignments: TeamAssignment[];
  membershipType: 'member' | 'trainee';
}

interface AchievementFormState {
  title: string;
  description: string;
}

interface SponsorFormState {
  name: string;
  logoUrl: string;
  amount: string;
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

interface RaffleFormState {
  id: string | null;
  ticketNumber: string;
  buyerName: string;
  sellerName: string;
  sellerId: string;
  contact: string;
  amount: string;
  received: boolean;
  quantity: string;
}

interface PurchaseFormState {
  id: string | null;
  description: string;
  amount: string;
  vendor: string;
  category: string;
  date: string;
  notes: string;
}

interface AdminPageProps {
  db: Firestore | null;
  storage: FirebaseStorage | null;
  teamHierarchy: TeamHierarchy | null;
  sponsors: Sponsor[];
  achievements: Achievement[];
  projects: Project[];
  raffles: RaffleSale[];
  purchases: PurchaseRecord[];
  siteSettings: SiteSettings;
  financials: FinancialSnapshot;
  setNotification: (notification: NotificationState) => void;
}

interface UpcomingBirthday {
  member: TeamMember;
  nextBirthday: Date;
  daysUntil: number;
  turningAge: number;
}

// --- PÁGINA DE ADMINISTRAÇÃO ---
export const AdminPage = ({ db, storage, teamHierarchy, sponsors, achievements, projects, raffles, purchases, siteSettings, setNotification, financials }: AdminPageProps) => {
  const generateRaffleCode = () => Math.random().toString(36).slice(-8).toUpperCase();
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const emptyForm: MemberFormState = { id: null, name: '', birthDate: '', course: '', img: '', generalRoles: [], assignments: [], membershipType: 'member' };
  const mapMemberToFormState = (member: TeamMember): MemberFormState => ({
    id: member.id,
    name: member.name,
    birthDate: formatDateForInput(member.birthDate),
    course: member.course ?? '',
    img: member.img ?? '',
    generalRoles: member.generalRoles ?? [],
    assignments: member.assignments ?? [],
    membershipType: member.membershipType ?? 'member',
  });
  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [achievementForm, setAchievementForm] = useState<AchievementFormState>({ title: '', description: '' });
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormState>({ name: '', logoUrl: '', amount: '' });
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
  const getDefaultRaffleForm = (): RaffleFormState => ({
    id: null,
    ticketNumber: '',
    buyerName: '',
    sellerName: '',
    sellerId: '',
    contact: '',
    amount: siteSettings.raffleTicketPrice ? String(siteSettings.raffleTicketPrice) : '',
    received: true,
    quantity: '',
  });
  const [raffleForm, setRaffleForm] = useState<RaffleFormState>(getDefaultRaffleForm());
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [raffleSearchTerm, setRaffleSearchTerm] = useState('');
  const [isSavingRaffle, setIsSavingRaffle] = useState(false);
  const [lastGeneratedTickets, setLastGeneratedTickets] = useState<string[]>([]);
  const getDefaultPurchaseForm = (): PurchaseFormState => ({
    id: null,
    description: '',
    amount: '',
    vendor: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(getDefaultPurchaseForm());
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [isUpdatingRaffleStatus, setIsUpdatingRaffleStatus] = useState(false);
  const [isGeneratingRaffleCode, setIsGeneratingRaffleCode] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const availableGeneralRoles = ['Capitão', 'Capitã', 'Vice-capitão', 'Vice-capitã', 'Piloto', 'Administrador', 'Orientador'];
  const captainRoles = ['Capitão', 'Capitã'];
  const availableDepartmentRoles = ['Membro', 'Gerente'];
  const functionsBaseUrl =
    import.meta.env.VITE_FUNCTIONS_BASE_URL ??
    `https://us-central1-${appId}.cloudfunctions.net/api`;
  const birthDateMaxValue = formatDateForInput(new Date());
  const projectCount = projects.length;

  const isManagedStorageUrl = (url?: string | null) =>
    !!url && url.includes('firebasestorage.googleapis.com') && url.includes(`public%2F${appId}%2F`);

  const deleteFileFromStorage = async (fileUrl?: string | null) => {
    if (!storage || !fileUrl || !isManagedStorageUrl(fileUrl)) return;
    try {
      const decodedUrl = decodeURIComponent(fileUrl);
      const match = decodedUrl.match(/\/o\/([^?]+)/);
      if (!match?.[1]) return;
      const storagePath = match[1];
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Erro ao excluir ficheiro antigo do armazenamento:', error);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleMemberImageDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      setMemberImageFile(file);
      setMemberImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSponsorLogoDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      setSponsorLogoFile(file);
      setSponsorLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleProjectImageDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      setProjectImageFile(file);
      setProjectImagePreview(URL.createObjectURL(file));
    }
  };

  type UploadEntity = 'member' | 'project' | 'sponsor';

  const uploadImageViaFunctions = async (file: File, target: UploadEntity) => {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const token = await currentUser.getIdToken();
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await fetch(`${functionsBaseUrl}/upload/${target}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      let message = 'Erro ao enviar imagem.';
      try {
        const errorData = await response.json();
        if (errorData?.error) message = errorData.error;
      } catch {
        // ignore JSON parsing errors
      }
      throw new Error(message);
    }
    const data = await response.json();
    if (!data?.url) {
      throw new Error('Resposta inválida do serviço de upload.');
    }
    return data.url as string;
  };
  useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    setLocalSettings((prev) => ({
      ...prev,
      participations: projectCount,
    }));
  }, [projectCount]);

  useEffect(() => {
    if (!editingRaffleId) {
      setRaffleForm((prev) => ({
        ...prev,
        amount: siteSettings.raffleTicketPrice ? String(siteSettings.raffleTicketPrice) : '',
      }));
    }
  }, [siteSettings.raffleTicketPrice, editingRaffleId]);
    const handleMemberChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const sanitizeAssignments = (assignments?: TeamAssignment[]) =>
    (assignments ?? [])
      .map((assignment) => ({
        department: assignment?.department?.trim() || '',
        role: assignment?.role?.trim() || 'Membro',
      }))
      .filter((assignment) => assignment.department.length > 0);

  const sanitizeRoles = (roles?: string[]) =>
    (roles ?? [])
      .map((role) => role?.trim())
      .filter((role): role is string => Boolean(role));
    const handleMemberSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db || !storage || !teamHierarchy) return;
        setIsUploading(true);
    const memberId = editingId ?? Date.now().toString();
    const trimmedName = memberForm.name.trim();
    if (!trimmedName) {
      setNotification({ message: 'O nome do membro é obrigatório.', type: 'error' });
      setIsUploading(false);
      return;
    }
    const normalizedBirthDate = memberForm.birthDate?.trim() ? memberForm.birthDate : undefined;
    const sanitizedAssignments = sanitizeAssignments(memberForm.assignments);
    const sanitizedRoles = sanitizeRoles(memberForm.generalRoles);
    const existingImageUrl = memberForm.img?.trim();
        let memberData: TeamMember = {
          id: memberId,
          name: trimmedName,
          generalRoles: sanitizedRoles,
          assignments: sanitizedAssignments,
          membershipType: memberForm.membershipType ?? 'member',
        };
        if (normalizedBirthDate) {
          memberData.birthDate = normalizedBirthDate;
        }
        if (memberForm.course?.trim()) {
          memberData.course = memberForm.course.trim();
        }
        if (existingImageUrl) {
          memberData.img = existingImageUrl;
        }
        try {
            if (memberImageFile) {
                if (editingId) {
                    await deleteFileFromStorage(existingImageUrl);
                }
                memberData.img = await uploadImageViaFunctions(memberImageFile, 'member');
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
    const handleEditMember = (member: TeamMember) => {
        setEditingId(member.id);
        setMemberForm(mapMemberToFormState(member));
        setMemberImagePreview(member.img || '');
        setMemberImageFile(null);
        setAdminSection('members');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleRemoveMember = async (idToRemove) => {
        const newHierarchy = JSON.parse(JSON.stringify(teamHierarchy));
        const memberToRemove = teamHierarchy.members.find(m => m.id === idToRemove);
        await deleteFileFromStorage(memberToRemove?.img);
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
        if (!sponsorForm.name || (!sponsorLogoFile && !sponsorForm.logoUrl)) { setNotification({ message: 'Por favor, preencha o nome e envie um logótipo.', type: 'error' }); return; }
        setIsUploading(true);
        let logoUrl = sponsorForm.logoUrl; 
        try {
            if (sponsorLogoFile) {
                if (editingSponsorId) {
                    await deleteFileFromStorage(sponsorForm.logoUrl);
                }
                logoUrl = await uploadImageViaFunctions(sponsorLogoFile, 'sponsor');
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
            setSponsorForm({ name: '', logoUrl: '', amount: '' });
            setSponsorLogoFile(null);
            setSponsorLogoPreview('');
            setEditingSponsorId(null);
            const fileInput = document.getElementById('sponsor-logo-upload') as HTMLInputElement | null;
            if(fileInput) fileInput.value = '';
        } catch (error) { console.error("Erro ao adicionar/atualizar patrocinador:", error); setNotification({ message: 'Erro ao guardar patrocinador.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleEditSponsor = (sponsor) => {
        setEditingSponsorId(sponsor.id);
        setSponsorForm({ name: sponsor.name, logoUrl: sponsor.logo, amount: sponsor.amount ? String(sponsor.amount) : '' });
        setSponsorLogoPreview(sponsor.logo);
    };
    const removeSponsor = async (id: string) => {
        if (!db) return;
        try {
            const sponsorToRemove = sponsors.find(s => s.id === id);
            await deleteFileFromStorage(sponsorToRemove?.logo);
            const sponsorRef = doc(db, `/artifacts/${appId}/public/data/sponsors`, id);
            await deleteDoc(sponsorRef);
            setNotification({ message: 'Patrocinador removido.', type: 'success' });
        } catch (error) { console.error("Erro ao remover patrocinador:", error); setNotification({ message: 'Erro ao remover patrocinador.', type: 'error' }); }
    };
    const handleSettingsChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
    const handleGeneralSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db) return;
        setIsUploading(true);
        let updatedSettings = { ...localSettings };
        if (!updatedSettings.raffleValidationCode && (updatedSettings.rafflePrize?.trim() ?? '').length > 0) {
            updatedSettings.raffleValidationCode = generateRaffleCode();
        }
        try {
            const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
            await setDoc(settingsRef, {
                heroImageUrl: updatedSettings.heroImageUrl,
                participations: projectCount,
                monthlyDues: Number(updatedSettings.monthlyDues) || 0,
                raffleTicketPrice: Number(updatedSettings.raffleTicketPrice) || 0,
                rafflePrize: updatedSettings.rafflePrize,
                raffleValidationCode: updatedSettings.raffleValidationCode,
                raffleClosed: updatedSettings.raffleClosed ?? siteSettings.raffleClosed ?? false,
                history: updatedSettings.history,
                mission: updatedSettings.mission,
                vision: updatedSettings.vision,
            }, { merge: true });
            setNotification({ message: 'Configurações atualizadas!', type: 'success' });
        } catch (error) { console.error("Erro ao guardar configurações:", error); setNotification({ message: 'Erro ao guardar configurações.', type: 'error' }); } finally { setIsUploading(false); }
    };
    const handleAchievementChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setAchievementForm(prev => ({ ...prev, [name]: value }));
    };
    const handleGenerateRaffleCode = async () => {
        if (!db) return;
        setIsGeneratingRaffleCode(true);
        const newCode = generateRaffleCode();
        try {
            const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
            await setDoc(settingsRef, { raffleValidationCode: newCode }, { merge: true });
            setLocalSettings(prev => ({ ...prev, raffleValidationCode: newCode }));
            setNotification({ message: 'Novo código de confirmação gerado.', type: 'success' });
        } catch (error) {
            console.error('Erro ao gerar novo código de rifa:', error);
            setNotification({ message: 'Não foi possível gerar o novo código.', type: 'error' });
        } finally {
            setIsGeneratingRaffleCode(false);
        }
    };
    const handleToggleRaffleStatus = async () => {
        if (!db) return;
        setIsUpdatingRaffleStatus(true);
        const newValue = !siteSettings.raffleClosed;
        const newCode = generateRaffleCode();
        try {
            const settingsRef = doc(db, `/artifacts/${appId}/public/data/settings/main`);
            await setDoc(settingsRef, { raffleClosed: newValue, raffleValidationCode: newCode }, { merge: true });
            setLocalSettings(prev => ({ ...prev, raffleClosed: newValue, raffleValidationCode: newCode }));
            setNotification({
                message: newValue ? 'Rifa encerrada. Novo código gerado.' : 'Rifa reaberta. Novo código gerado.',
                type: 'success',
            });
        } catch (error) { console.error('Erro ao atualizar status da rifa:', error); setNotification({ message: 'Não foi possível alterar o status da rifa.', type: 'error' }); } finally { setIsUpdatingRaffleStatus(false); }
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
                if (editingProjectId) {
                    await deleteFileFromStorage(projectForm.imageUrl);
                }
                imageUrl = await uploadImageViaFunctions(projectImageFile, 'project');
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
        try {
            const projectToRemove = projects.find(project => project.id === id);
            await deleteFileFromStorage(projectToRemove?.imageUrl);
            const projectRef = doc(db, `/artifacts/${appId}/public/data/projects`, id);
            await deleteDoc(projectRef);
            setNotification({ message: 'Projeto removido.', type: 'success' });
        } catch (error) { console.error("Erro ao remover projeto:", error); setNotification({ message: 'Erro ao remover projeto.', type: 'error' }); }
    };
    const handleRaffleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = event.target;
        if (name === 'sellerId') {
            const seller = teamHierarchy?.members.find(member => member.id === value);
            setRaffleForm(prev => ({
                ...prev,
                sellerId: value,
                sellerName: seller?.name ?? '',
            }));
            return;
        }
    if (name === 'quantity') {
        if (value === '') {
            setRaffleForm(prev => ({ ...prev, quantity: '' }));
            return;
        }
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) {
            setRaffleForm(prev => ({ ...prev, quantity: '' }));
            return;
        }
        const sanitized = Math.max(0, Math.min(500, Math.floor(numericValue)));
        setRaffleForm(prev => ({ ...prev, quantity: String(sanitized) }));
        return;
    }
        setRaffleForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    const resetRaffleForm = () => {
        setRaffleForm(getDefaultRaffleForm());
        setEditingRaffleId(null);
        setLastGeneratedTickets([]);
    };
    const handleRaffleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db) return;
        if (!raffleForm.buyerName.trim()) { setNotification({ message: 'Informe o nome do comprador.', type: 'error' }); return; }
        if (!raffleForm.sellerId && !raffleForm.sellerName) { setNotification({ message: 'Selecione o vendedor.', type: 'error' }); return; }
        let quantityForCreation = 0;
        if (!editingRaffleId) {
            const parsedQuantity = Number(raffleForm.quantity);
            if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
                setNotification({ message: 'Informe a quantidade de bilhetes.', type: 'error' });
                return;
            }
            quantityForCreation = Math.max(1, Math.min(500, Math.floor(parsedQuantity)));
        }
        const sellerName = raffleForm.sellerId ? (memberNameMap.get(raffleForm.sellerId) || '') : raffleForm.sellerName;
        const amountPerTicket = Number(raffleForm.amount) || Number(siteSettings.raffleTicketPrice) || 0;
        const rafflesColRef = collection(db, `/artifacts/${appId}/public/data/raffles`);
        setIsSavingRaffle(true);
        try {
            if (editingRaffleId) {
                const raffleRef = doc(db, `/artifacts/${appId}/public/data/raffles`, editingRaffleId);
                await updateDoc(raffleRef, {
                    buyerName: raffleForm.buyerName.trim(),
                    sellerId: raffleForm.sellerId || null,
                    sellerName,
                    contact: raffleForm.contact.trim(),
                    amount: amountPerTicket,
                    received: raffleForm.received,
                    updatedAt: new Date(),
                });
                setNotification({ message: 'Rifa atualizada!', type: 'success' });
                resetRaffleForm();
            } else {
                const allocatedNumbers = await allocateTicketNumbers(db, appId, quantityForCreation);
                const paddedNumbers = allocatedNumbers.map((num) => num.toString().padStart(3, '0'));
                await Promise.all(
                    paddedNumbers.map((ticketNumber) =>
                        addDoc(rafflesColRef, {
                            ticketNumber,
                            buyerName: raffleForm.buyerName.trim(),
                            sellerId: raffleForm.sellerId || null,
                            sellerName,
                            contact: raffleForm.contact.trim(),
                            amount: amountPerTicket,
                            received: raffleForm.received,
                            dateSold: new Date(),
                            updatedAt: new Date(),
                        }),
                    ),
                );
                setLastGeneratedTickets(paddedNumbers);
                setNotification({ message: 'Rifa registada!', type: 'success' });
                setRaffleForm(getDefaultRaffleForm());
            }
        } catch (error) { console.error('Erro ao guardar rifa:', error); setNotification({ message: 'Erro ao guardar rifa.', type: 'error' }); } finally { setIsSavingRaffle(false); }
    };
    const handleEditRaffle = (raffle: RaffleSale) => {
        setEditingRaffleId(raffle.id);
        setRaffleForm({
            id: raffle.id,
            ticketNumber: raffle.ticketNumber || '',
            buyerName: raffle.buyerName || '',
            sellerName: raffle.sellerName || '',
            sellerId: raffle.sellerId || '',
            contact: raffle.contact || '',
            amount: typeof raffle.amount === 'number' ? String(raffle.amount) : (siteSettings.raffleTicketPrice ? String(siteSettings.raffleTicketPrice) : ''),
            received: Boolean(raffle.received),
            quantity: '1',
        });
        setLastGeneratedTickets([]);
        setAdminSection('raffles');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const removeRaffle = async (id: string) => {
        if (!db) return;
        try {
            const raffleRef = doc(db, `/artifacts/${appId}/public/data/raffles`, id);
            await deleteDoc(raffleRef);
            if (editingRaffleId === id) {
                resetRaffleForm();
            }
            setNotification({ message: 'Rifa removida.', type: 'success' });
        } catch (error) { console.error('Erro ao remover rifa:', error); setNotification({ message: 'Erro ao remover rifa.', type: 'error' }); }
    };
    const toggleRaffleReceived = async (raffle: RaffleSale) => {
        if (!db) return;
        try {
            const raffleRef = doc(db, `/artifacts/${appId}/public/data/raffles`, raffle.id);
            await updateDoc(raffleRef, { received: !raffle.received, updatedAt: new Date() });
            setNotification({ message: 'Estado de recebimento atualizado.', type: 'success' });
        } catch (error) { console.error('Erro ao atualizar rifa:', error); setNotification({ message: 'Erro ao atualizar rifa.', type: 'error' }); }
    };
    const handlePurchaseChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setPurchaseForm(prev => ({ ...prev, [name]: value }));
    };
    const resetPurchaseForm = () => {
        setPurchaseForm(getDefaultPurchaseForm());
        setEditingPurchaseId(null);
    };
    const handlePurchaseSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!db) return;
        if (!purchaseForm.description.trim() || !purchaseForm.amount) { setNotification({ message: 'Descreva a compra e informe o valor.', type: 'error' }); return; }
        setIsSavingPurchase(true);
        const purchasesColRef = collection(db, `/artifacts/${appId}/public/data/purchases`);
        const amount = Number(purchaseForm.amount) || 0;
        const purchaseDate = purchaseForm.date ? new Date(purchaseForm.date) : new Date();
        const payload = {
            description: purchaseForm.description.trim(),
            vendor: purchaseForm.vendor.trim(),
            category: purchaseForm.category.trim(),
            amount,
            date: purchaseDate,
            notes: purchaseForm.notes.trim(),
            updatedAt: new Date(),
        };
        try {
            if (editingPurchaseId) {
                const purchaseRef = doc(db, `/artifacts/${appId}/public/data/purchases`, editingPurchaseId);
                await updateDoc(purchaseRef, payload);
                setNotification({ message: 'Compra atualizada!', type: 'success' });
            } else {
                await addDoc(purchasesColRef, payload);
                setNotification({ message: 'Compra registrada!', type: 'success' });
            }
            resetPurchaseForm();
        } catch (error) { console.error('Erro ao guardar compra:', error); setNotification({ message: 'Erro ao guardar compra.', type: 'error' }); } finally { setIsSavingPurchase(false); }
    };
    const handleEditPurchase = (purchase: PurchaseRecord) => {
        setEditingPurchaseId(purchase.id);
        setPurchaseForm({
            id: purchase.id,
            description: purchase.description || '',
            amount: typeof purchase.amount === 'number' ? String(purchase.amount) : '',
            vendor: purchase.vendor || '',
            category: purchase.category || '',
            date: purchase.date ? formatDateForInput(purchase.date) : new Date().toISOString().slice(0, 10),
            notes: purchase.notes || '',
        });
        setAdminSection('purchases');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const removePurchase = async (id: string) => {
        if (!db) return;
        try {
            const purchaseRef = doc(db, `/artifacts/${appId}/public/data/purchases`, id);
            await deleteDoc(purchaseRef);
            if (editingPurchaseId === id) {
                resetPurchaseForm();
            }
            setNotification({ message: 'Compra removida.', type: 'success' });
        } catch (error) { console.error('Erro ao remover compra:', error); setNotification({ message: 'Erro ao remover compra.', type: 'error' }); }
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
        const member = teamHierarchy?.members.find((m) => m.id === memberId);
        await setDoc(paymentRef, {
          memberId,
          memberName: member?.name || undefined,
          year: financialYear,
          month,
          amount: siteSettings.monthlyDues,
          datePaid: new Date(),
        });
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
        const payerName = member?.name || p.memberName || 'Membro não encontrado';
        csvContent += `Mensalidade,${date},${payerName},${p.amount}\r\n`;
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
  const raffleTicketPrice = Number(siteSettings.raffleTicketPrice) || 0;
  const rafflePrizeDescription = siteSettings.rafflePrize ?? '';
  const totalRafflesSold = raffles.length;
  const totalRaffleAmount = raffles.reduce((acc, raffle) => acc + (typeof raffle.amount === 'number' ? raffle.amount : raffleTicketPrice), 0);
  const totalRaffleReceived = raffles.filter(raffle => raffle.received).reduce((acc, raffle) => acc + (typeof raffle.amount === 'number' ? raffle.amount : raffleTicketPrice), 0);
  const parsedRaffleQuantity = Number(raffleForm.quantity);
  const raffleQuantityNumber =
    Number.isFinite(parsedRaffleQuantity) && parsedRaffleQuantity >= 0
      ? Math.min(500, Math.max(0, Math.floor(parsedRaffleQuantity)))
      : 0;
  const raffleAmountPerTicket = Number(raffleForm.amount) || raffleTicketPrice;
  const estimatedRaffleTotal = raffleAmountPerTicket * raffleQuantityNumber;

  if (!teamHierarchy || !db || !storage) return <LoadingScreen />;

  const memberSearchTermNormalized = memberSearchTerm.trim().toLowerCase();
  const filteredMembers = [...teamHierarchy.members]
    .filter(member => member.name.toLowerCase().includes(memberSearchTermNormalized))
    .sort((a, b) => a.name.localeCompare(b.name));
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const birthdaysThisMonth = teamHierarchy.members.filter(member => {
    const birthDate = parseDateInput(member.birthDate);
    return birthDate && birthDate.getMonth() === today.getMonth();
  }).length;
  const upcomingBirthdays: UpcomingBirthday[] = teamHierarchy.members
    .map(member => {
      const birthDate = parseDateInput(member.birthDate);
      if (!birthDate) return null;
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < startOfToday) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
      return {
        member,
        nextBirthday,
        daysUntil,
        turningAge: nextBirthday.getFullYear() - birthDate.getFullYear(),
      };
    })
    .filter((item): item is UpcomingBirthday => item !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);
  const raffleSearchNormalized = raffleSearchTerm.trim().toLowerCase();
  const memberNameMap = new Map<string, string>(
    teamHierarchy.members.reduce<[string, string][]>((acc, member) => {
      const key = member?.id != null ? String(member.id).trim() : '';
      if (!key) return acc;
      acc.push([key, member.name]);
      return acc;
    }, [])
  );
  const normalizeTicketNumber = (raffle: RaffleSale) => {
    const { ticketNumber } = raffle;
    if (typeof ticketNumber === 'string') return ticketNumber;
    if (typeof ticketNumber === 'number') return ticketNumber.toString();
    return '';
  };
  const filteredRaffles = [...raffles]
    .filter(raffle => {
      const sellerLabel = raffle.sellerName || (raffle.sellerId ? memberNameMap.get(raffle.sellerId) : '');
      const haystack = `${raffle.ticketNumber} ${raffle.buyerName} ${sellerLabel} ${raffle.contact ?? ''}`.toLowerCase();
      return haystack.includes(raffleSearchNormalized);
    })
    .sort((a, b) => normalizeTicketNumber(a).localeCompare(normalizeTicketNumber(b), undefined, { numeric: true, sensitivity: 'base' }));
  const paymentsForYear = financials.payments.filter(payment => payment.year === financialYear);
  const duesIncomeForYear = paymentsForYear.reduce((acc, payment) => acc + payment.amount, 0);
  const sponsorIncomeForYear = financials.sponsorships
    .filter(sponsor => sponsor.dateReceived && typeof sponsor.dateReceived.toDate === 'function' && sponsor.dateReceived.toDate().getFullYear() === financialYear)
    .reduce((acc, sponsor) => acc + sponsor.amount, 0);
  const raffleIncomeForYear = raffles
    .filter(raffle => {
      const soldDate = parseDateInput((raffle as { dateSold?: Date }).dateSold ?? raffle.updatedAt);
      return soldDate?.getFullYear() === financialYear && raffle.received;
    })
    .reduce((acc, raffle) => acc + (typeof raffle.amount === 'number' ? raffle.amount : raffleTicketPrice), 0);
  const purchaseSearchNormalized = purchaseSearchTerm.trim().toLowerCase();
  const purchasesWithDates = purchases.map(purchase => ({
    ...purchase,
    dateValue: parseDateInput((purchase as { date?: Date }).date ?? purchase.updatedAt),
  }));
  const purchasesForYear = purchasesWithDates.filter(purchase => purchase.dateValue?.getFullYear() === financialYear);
  const totalPurchasesForYear = purchasesForYear.reduce((acc, purchase) => acc + (typeof purchase.amount === 'number' ? purchase.amount : 0), 0);
  const incomeBreakdown = [
    { label: 'Mensalidades', amount: duesIncomeForYear },
    { label: 'Patrocínios', amount: sponsorIncomeForYear },
    { label: 'Rifas', amount: raffleIncomeForYear },
  ];
  const totalIncomeForYear = incomeBreakdown.reduce((acc, entry) => acc + entry.amount, 0);
  const netResultForYear = totalIncomeForYear - totalPurchasesForYear;
  const monthlyIncome = Array.from({ length: 12 }, () => 0);
  paymentsForYear.forEach(payment => {
    if (payment.month >= 1 && payment.month <= 12) {
      monthlyIncome[payment.month - 1] += payment.amount;
    }
  });
  financials.sponsorships.forEach(sponsor => {
    const date = sponsor.dateReceived && typeof sponsor.dateReceived.toDate === 'function' ? sponsor.dateReceived.toDate() : null;
    if (date && date.getFullYear() === financialYear) {
      monthlyIncome[date.getMonth()] += sponsor.amount;
    }
  });
  raffles.forEach(raffle => {
    const date = parseDateInput((raffle as { dateSold?: Date }).dateSold ?? raffle.updatedAt);
    if (date && date.getFullYear() === financialYear && raffle.received) {
      monthlyIncome[date.getMonth()] += typeof raffle.amount === 'number' ? raffle.amount : raffleTicketPrice;
    }
  });
  const monthlyExpenses = Array.from({ length: 12 }, () => 0);
  purchasesWithDates.forEach(purchase => {
    if (purchase.dateValue && purchase.dateValue.getFullYear() === financialYear) {
      monthlyExpenses[purchase.dateValue.getMonth()] += typeof purchase.amount === 'number' ? purchase.amount : 0;
    }
  });
  const maxMonthlyValue = Math.max(1, ...monthlyIncome, ...monthlyExpenses);
  const monthlyFinancialSeries = monthlyIncome.map((income, index) => {
    const expense = monthlyExpenses[index];
    const label = new Date(0, index).toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
    return {
      label,
      income,
      expense,
      incomePercent: Math.round((income / maxMonthlyValue) * 100),
      expensePercent: Math.round((expense / maxMonthlyValue) * 100),
    };
  });
  const filteredPurchases = purchasesWithDates
    .filter(purchase => {
      const haystack = `${purchase.description} ${purchase.vendor ?? ''} ${purchase.category ?? ''}`.toLowerCase();
      return haystack.includes(purchaseSearchNormalized);
    })
    .sort((a, b) => {
      if (a.dateValue && b.dateValue) {
        return b.dateValue.getTime() - a.dateValue.getTime();
      }
      return 0;
    });
  const topPayers = paymentsForYear.reduce<Record<string, { months: number; total: number; fallbackName?: string }>>((acc, payment) => {
    const memberKey =
      typeof payment.memberId === 'string'
        ? payment.memberId.trim()
        : payment.memberId != null
          ? String(payment.memberId).trim()
          : '';
    if (!memberKey) {
      return acc;
    }
    if (!acc[memberKey]) {
      acc[memberKey] = { months: 0, total: 0 };
    }
    acc[memberKey].months += 1;
    acc[memberKey].total += payment.amount;
    if (!acc[memberKey].fallbackName && typeof payment.memberName === 'string') {
      acc[memberKey].fallbackName = payment.memberName;
    }
    return acc;
  }, {});
  const topPayersList = Object.entries(topPayers)
    .map(([memberId, stats]) => ({
      memberId,
      ...stats,
      name: memberNameMap.get(memberId) ?? stats.fallbackName ?? 'Membro',
    }))
    .sort((a, b) => (b.months - a.months) || b.total - a.total)
    .slice(0, 5);
  const basePublicPath = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const raffleShareUrl = `${window.location.origin}${basePublicPath}/rifas`;
  const handleCopyRaffleLink = async () => {
    try {
      await navigator.clipboard.writeText(raffleShareUrl);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link de rifas:', error);
      setNotification({ message: 'Não foi possível copiar o link automaticamente.', type: 'error' });
    }
  };
  const expectedMonthlyRevenue = teamHierarchy.members.length * (siteSettings.monthlyDues || 0);
  const expectedAnnualRevenue = expectedMonthlyRevenue * 12;
  const paymentsByMonth = financials.payments
    .filter(payment => payment.year === financialYear)
    .reduce<Record<number, number>>((acc, payment) => {
      acc[payment.month] = (acc[payment.month] ?? 0) + payment.amount;
      return acc;
    }, {});
  const monthlyPaymentProgress = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const paid = paymentsByMonth[month] ?? 0;
    const percentage = expectedMonthlyRevenue > 0 ? Math.min(100, (paid / expectedMonthlyRevenue) * 100) : 0;
    const label = new Date(0, index).toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
    return { month, label, paid, percentage };
  });
  const recentSponsorships = [...financials.sponsorships]
    .filter(sponsor => sponsor.dateReceived && typeof sponsor.dateReceived.toDate === 'function')
    .sort((a, b) => b.dateReceived.toDate().getTime() - a.dateReceived.toDate().getTime())
    .slice(0, 3);
  const dashboardStats: Array<{ label: string; value: number; Icon: LucideIcon; accent: string }> = [
    { label: 'Membros ativos', value: teamHierarchy.members.length, Icon: UsersIcon, accent: 'text-blue-600 bg-blue-50' },
    { label: 'Projetos publicados', value: projects.length, Icon: ClipboardList, accent: 'text-amber-600 bg-amber-50' },
    { label: 'Patrocinadores ativos', value: sponsors.length, Icon: Trophy, accent: 'text-green-600 bg-green-50' },
    { label: 'Aniversários neste mês', value: birthdaysThisMonth, Icon: CalendarDays, accent: 'text-purple-600 bg-purple-50' },
    { label: 'Rifas vendidas', value: totalRafflesSold, Icon: Ticket, accent: 'text-rose-600 bg-rose-50' },
  ];
  const quickActions: Array<{ label: string; target: AdminSection }> = [
    { label: 'Gerir membros', target: 'members' },
    { label: 'Projetos', target: 'projects' },
    { label: 'Rifas', target: 'raffles' },
    { label: 'Mensalidades', target: 'dues' },
    { label: 'Financeiro', target: 'financial' },
    { label: 'Compras', target: 'purchases' },
    { label: 'Configurações gerais', target: 'general' },
  ];
  const financialYearOptions = Array.from({ length: 3 }, (_, i) => today.getFullYear() - i);
  const sortedFinancialMembers = [...teamHierarchy.members].sort((a, b) => a.name.localeCompare(b.name));
  const duesMembers = sortedFinancialMembers.filter(member => member.membershipType !== 'trainee');
  const paymentsCoveragePercentage = expectedAnnualRevenue > 0 ? Math.min(100, Math.round((totalDuesPaidForYear / expectedAnnualRevenue) * 100)) : 0;
  const hasMemberImage = Boolean(memberImageFile || memberImagePreview || memberForm.img);
  const hasSponsorLogo = Boolean(sponsorLogoFile || sponsorLogoPreview || sponsorForm.logoUrl);
  const hasProjectImage = Boolean(projectImageFile || projectImagePreview || projectForm.imageUrl);
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center mb-10 text-[#d4982c]">Painel Administrativo</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <AdminSidebar activeSection={adminSection} setSection={setAdminSection} />
                <main className="flex-1">
                    {adminSection === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {dashboardStats.map(({ label, value, Icon, accent }) => (
                                    <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                        <div className={`inline-flex items-center justify-center rounded-full p-3 mb-4 ${accent}`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-sm text-gray-500">{label}</p>
                                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Próximos aniversários</h3>
                                        <CalendarDays className="text-[#d4982c]" size={20} />
                                    </div>
                                    {upcomingBirthdays.length ? (
                                        <ul className="divide-y divide-gray-100">
                                            {upcomingBirthdays.map(({ member, nextBirthday, daysUntil, turningAge }) => (
                                                <li key={`${member.id}-birthday`} className="py-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{nextBirthday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-700">{turningAge ? `${turningAge} anos` : '—'}</p>
                                                        <p className="text-xs text-gray-400">{daysUntil === 0 ? 'Hoje' : `em ${daysUntil} dia${daysUntil === 1 ? '' : 's'}`}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Cadastre datas de nascimento para acompanhar os aniversários automaticamente.</p>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 lg:col-span-2">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Resumo financeiro</p>
                                            <h3 className="text-2xl font-bold text-gray-800">Ano {financialYear}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="text-[#d4982c]" size={20} />
                                            <select value={financialYear} onChange={(e) => setFinancialYear(Number(e.target.value))} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#d4982c] focus:outline-none focus:ring-2 focus:ring-[#d4982c]/30">
                                                {financialYearOptions.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-6">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-xs font-semibold text-green-700 uppercase">Mensalidades recebidas</p>
                                            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalDuesPaidForYear)}</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-lg">
                                            <p className="text-xs font-semibold text-amber-700 uppercase">Previsto anual</p>
                                            <p className="text-2xl font-bold text-amber-700">{formatCurrency(expectedAnnualRevenue)}</p>
                                            <p className="text-xs text-amber-700 flex items-center gap-1 mt-1"><TrendingUp size={14} /> {paymentsCoveragePercentage}% do objetivo</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-xs font-semibold text-blue-700 uppercase">Patrocínios</p>
                                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalSponsorshipsForYear)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-sm font-semibold text-gray-600 mb-3">Mensalidades por mês</p>
                                        <div className="flex items-end gap-2 h-36">
                                            {monthlyPaymentProgress.map(({ month, label, percentage }) => (
                                                <div key={month} className="flex-1">
                                                    <div className="h-28 bg-gray-100 rounded-lg overflow-hidden flex items-end justify-center">
                                                        <div className="w-3/4 bg-[#d4982c] rounded-t-lg transition-all duration-300" style={{ height: `${percentage}%` }}></div>
                                                    </div>
                                                    <p className="mt-2 text-xs font-semibold text-gray-500 text-center">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Patrocínios recentes</h3>
                                        <DollarSign className="text-[#d4982c]" size={20} />
                                    </div>
                                    {recentSponsorships.length ? (
                                        <ul className="space-y-3">
                                            {recentSponsorships.map(sponsor => (
                                                <li key={sponsor.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{sponsor.name}</p>
                                                        <p className="text-xs text-gray-500">{sponsor.dateReceived?.toDate().toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{formatCurrency(sponsor.amount)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Sem patrocínios registados recentemente.</p>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Atalhos rápidos</h3>
                                        <Settings className="text-[#d4982c]" size={20} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Mensalidade atual</p>
                                            <p className="text-xl font-bold text-gray-800">{formatCurrency(siteSettings.monthlyDues || 0)}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Participações</p>
                                            <p className="text-xl font-bold text-gray-800">{projectCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {quickActions.map(action => (
                                            <button key={action.target} type="button" onClick={() => setAdminSection(action.target)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Top 5 pagadores</h3>
                                        <CheckCircle className="text-[#d4982c]" size={20} />
                                    </div>
                                    {topPayersList.length ? (
                                        <ol className="space-y-2">
                                            {topPayersList.map((payer, index) => (
                                                <li key={payer.memberId} className="flex items-center justify-between text-sm">
                                                    <div>
                                                        <span className="font-semibold text-gray-900">#{index + 1} {payer.name}</span>
                                                        <p className="text-gray-500">{payer.months} mensalidade(s)</p>
                                                    </div>
                                                    <span className="font-bold text-gray-800">{formatCurrency(payer.total)}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="text-sm text-gray-500">Ainda não há pagamentos para este ano.</p>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Link público para rifas</h3>
                                        <Ticket className="text-[#d4982c]" size={20} />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">Partilhe com vendedores para registrar vendas sem aceder ao painel.</p>
                                    <p className="text-sm text-gray-600 mb-2">Código de confirmação: <span className="font-mono text-gray-900">{siteSettings.raffleValidationCode || '—'}</span></p>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input type="text" value={raffleShareUrl} readOnly className="flex-grow rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50" />
                                        <button type="button" onClick={handleCopyRaffleLink} className="px-4 py-2 rounded-lg bg-[#d4982c] text-white font-semibold hover:bg-[#b58426]">
                                            {shareLinkCopied ? 'Copiado!' : 'Copiar link'}
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3">
                                        <span className="text-sm text-gray-600">Status: <span className={`font-semibold ${siteSettings.raffleClosed ? 'text-red-600' : 'text-green-600'}`}>{siteSettings.raffleClosed ? 'Encerrada' : 'Ativa'}</span></span>
                                        <button type="button" onClick={handleToggleRaffleStatus} disabled={isUpdatingRaffleStatus} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                                            {isUpdatingRaffleStatus ? 'Atualizando...' : (siteSettings.raffleClosed ? 'Reabrir rifa' : 'Encerrar rifa')}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Compartilhe o link e o código com vendedores autorizados.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {adminSection === 'general' && (
                        <form onSubmit={handleGeneralSettingsSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
                            <h2 className="text-2xl font-bold text-[#d4982c]">Configurações Gerais</h2>
                            <div>
                                <label htmlFor="participations" className="block text-sm font-medium text-gray-700 mb-2">Número de Participações</label>
                                <InputField
                                    id="participations"
                                    name="participations"
                                    type="number"
                                    placeholder="Total de participações"
                                    Icon={Trophy}
                                    value={projectCount}
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Valor calculado automaticamente a partir dos projetos registados.</p>
                            </div>
                            <div>
                                <label htmlFor="monthlyDues" className="block text-sm font-medium text-gray-700 mb-2">Valor da Mensalidade (R$)</label>
                                <InputField id="monthlyDues" name="monthlyDues" type="number" placeholder="Valor da mensalidade" Icon={DollarSign} value={localSettings.monthlyDues || ''} onChange={handleSettingsChange} />
                            </div>
                            <div>
                                <label htmlFor="raffleTicketPrice" className="block text-sm font-medium text-gray-700 mb-2">Valor da Rifa (R$)</label>
                                <InputField id="raffleTicketPrice" name="raffleTicketPrice" type="number" placeholder="Preço por bilhete" Icon={Ticket} value={localSettings.raffleTicketPrice ?? ''} onChange={handleSettingsChange} />
                            </div>
                            <div>
                                <label htmlFor="rafflePrize" className="block text-sm font-medium text-gray-700 mb-2">Prêmio da Rifa</label>
                                <textarea id="rafflePrize" name="rafflePrize" rows={3} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.rafflePrize || ''} onChange={handleSettingsChange}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Código de confirmação das rifas</label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input type="text" value={localSettings.raffleValidationCode || ''} readOnly className="flex-grow rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50" />
                                    <button
                                        type="button"
                                        onClick={handleGenerateRaffleCode}
                                        disabled={isGeneratingRaffleCode}
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingRaffleCode ? 'A gerar...' : 'Gerar novo'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Este código é necessário para validar vendas externas de rifas.</p>
                            </div>
                            <div>
                                <label htmlFor="history" className="block text-sm font-medium text-gray-700 mb-2">Nossa História</label>
                                <textarea id="history" name="history" rows={5} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.history || ''} onChange={handleSettingsChange}></textarea>
                            </div>
                            <div>
                                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">Missão</label>
                                <textarea id="mission" name="mission" rows={3} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.mission || ''} onChange={handleSettingsChange}></textarea>
                            </div>
                            <div>
                                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">Visão</label>
                                <textarea id="vision" name="vision" rows={3} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={localSettings.vision || ''} onChange={handleSettingsChange}></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={isUploading} className="w-full bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                                    <Save className="mr-2" />
                                    {isUploading ? 'A guardar...' : 'Guardar Configurações'}
                                </button>
                            </div>
                        </form>
                    )}
                    {adminSection === 'members' && ( <div className="space-y-8"> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingId ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2> <form onSubmit={handleMemberSubmit} className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InputField name="name" type="text" placeholder="Nome" Icon={UserIcon} value={memberForm.name} onChange={handleMemberChange} />
                                    <InputField name="birthDate" type="date" placeholder="Data de nascimento" Icon={Calendar} value={memberForm.birthDate} onChange={handleMemberChange} max={birthDateMaxValue} />
                                    <InputField name="course" type="text" placeholder="Curso/Formação" Icon={GraduationCap} value={memberForm.course} onChange={handleMemberChange} />
                                    <SelectField name="membershipType" value={memberForm.membershipType} onChange={handleMemberChange} Icon={UsersIcon}>
                                        <option value="member">Membro efetivo</option>
                                        <option value="trainee">Trainee</option>
                                    </SelectField>
                                </div> <div className="space-y-4"> <h4 className="text-sm font-medium text-gray-700">Atribuições em Departamentos</h4> {memberForm.assignments?.map((assignment, index) => ( <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"> <SelectField name="department" value={assignment.department} onChange={(e) => handleAssignmentChange(index, 'department', e.target.value)} Icon={Building}><option value="">Selecione Departamento</option>{teamHierarchy.departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</SelectField> <SelectField name="role" value={assignment.role} onChange={(e) => handleAssignmentChange(index, 'role', e.target.value)} Icon={Briefcase}>{availableDepartmentRoles.map(r => <option key={r}>{r}</option>)}</SelectField> <button type="button" onClick={() => removeAssignment(index)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18}/></button> </div> ))} <button type="button" onClick={addAssignment} className="text-sm font-semibold text-[#d4982c] hover:text-[#b58426] flex items-center gap-1"><PlusCircle size={16}/> Adicionar Atribuição</button> </div> <div className="space-y-2"> <h4 className="text-sm font-medium text-gray-700">Funções Gerais</h4> <div className="flex flex-wrap gap-4">{availableGeneralRoles.map(role => (<label key={role} className="flex items-center"><input type="checkbox" name="generalRoles" value={role} checked={memberForm.generalRoles?.includes(role)} onChange={(e) => handleGeneralRoleChange(e)} className="h-4 w-4 rounded border-gray-300 text-[#d4982c] focus:ring-[#d4982c]"/><span className="ml-2 text-gray-700">{role}</span></label>))}</div> </div> <div className="flex items-center gap-4 lg:col-span-1"> {memberImagePreview && <img loading="lazy" decoding="async" src={memberImagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#d4982c]"/>} <label htmlFor="member-image-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400" onDragOver={handleDragOver} onDrop={handleMemberImageDrop}><ImageIcon className="mx-auto mb-1"/><span>{hasMemberImage ? 'Alterar foto' : 'Enviar foto'}</span><input id="member-image-upload" type="file" className="sr-only" onChange={handleMemberImageSelect} accept="image/*" /></label> </div> <div className="flex gap-2"><button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><Save className="mr-2" />{isUploading ? 'A guardar...' : (editingId ? 'Salvar Alterações' : 'Adicionar Membro')}</button>{editingId && <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>}</div> </form> </div> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4"> <h3 className="text-xl font-bold text-[#d4982c]">Lista de Membros</h3> <input type="text" value={memberSearchTerm} onChange={(e) => setMemberSearchTerm(e.target.value)} placeholder="Pesquisar por nome..." className="w-full md:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#d4982c] focus:ring-[#d4982c]" /> </div> <div className="space-y-2"> {filteredMembers.length ? filteredMembers.map(member => ( <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div className="flex items-center gap-3"><img loading="lazy" decoding="async" src={member.img || 'https://placehold.co/40x40/e0e0e0/888888?text=?'} alt={member.name} className="w-10 h-10 rounded-full object-cover"/><div><span className="font-semibold text-gray-800">{member.name}</span>{member.membershipType === 'trainee' ? <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Trainee</span> : null} - <span className="text-[#d4982c]">{[...(member.generalRoles || []), ...(member.assignments || []).map(a => a.role)].join(', ')}</span></div></div> <div className="flex items-center gap-2"><button onClick={() => handleEditMember(member)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></	div> </div> )) : <p className="text-sm text-gray-500 text-center py-4">Nenhum membro encontrado.</p>} </div> </div> </div> )}
                    {adminSection === 'departments' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Gerir Departamentos</h2> <div className="flex gap-4 mb-6"><InputField name="new_department" type="text" placeholder="Nome do Novo Departamento" Icon={UsersIcon} value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} /><button onClick={handleAddDepartment} className="bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><PlusCircle className="mr-2" />Adicionar</button></div> <div className="space-y-2">{teamHierarchy.departments.map(dept => (<div key={dept.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><span className="text-gray-800">{dept.name}</span><button onClick={() => handleRemoveDepartment(dept.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div>))}</div> </div> )}
                    {adminSection === 'projects' && ( <div className="space-y-8"> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingProjectId ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h2> <form onSubmit={handleProjectSubmit} className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <InputField name="title" type="text" placeholder="Título do Projeto" Icon={ClipboardList} value={projectForm.title} onChange={handleProjectFormChange} /> <InputField name="year" type="number" placeholder="Ano do Projeto" Icon={Hash} value={projectForm.year} onChange={handleProjectFormChange} /> </div> <div> <textarea name="description" placeholder="Descrição do Projeto" value={projectForm.description} onChange={handleProjectFormChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" rows="4"></textarea> </div> <div className="flex items-center gap-4"> {projectImagePreview && <img loading="lazy" decoding="async" src={projectImagePreview} alt="Preview" className="w-24 h-auto rounded-md object-cover border-2 border-[#d4982c]"/>} <label htmlFor="project-image-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400" onDragOver={handleDragOver} onDrop={handleProjectImageDrop}> <UploadCloud className="mx-auto mb-1"/><span>{hasProjectImage ? 'Alterar imagem' : 'Enviar imagem'}</span> <input id="project-image-upload" type="file" className="sr-only" onChange={handleProjectImageSelect} accept="image/*" /> </label> </div> <div className="flex gap-2"> <button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"> <Save className="mr-2" />{isUploading ? 'A guardar...' : (editingProjectId ? 'Salvar Alterações' : 'Adicionar Projeto')} </button> {editingProjectId && <button type="button" onClick={() => { setProjectForm({ id: null, year: new Date().getFullYear(), title: '', description: '', imageUrl: '' }); setEditingProjectId(null); setProjectImagePreview(''); setProjectImageFile(null); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>} </div> </form> </div> <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h3 className="text-xl font-bold mb-4 text-[#d4982c]">Lista de Projetos</h3> <div className="space-y-2"> {[...projects].sort((a, b) => b.year - a.year).map(project => ( <div key={project.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div className="flex items-center gap-4"> <img loading="lazy" decoding="async" src={project.imageUrl || 'https://placehold.co/60x40/e0e0e0/888888?text=?'} alt={project.title} className="w-16 h-12 rounded object-cover"/> <div> <p className="font-semibold text-gray-800">{project.title} ({project.year})</p> <p className="text-sm text-gray-600 truncate w-64">{project.description}</p> </div> </div> <div className="flex items-center gap-2"> <button onClick={() => handleEditProject(project)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button> <button onClick={() => removeProject(project.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button> </div> </div> ))} </div> </div> </div> )}
                    {adminSection === 'achievements' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingAchievementId ? 'Editar Conquista' : 'Adicionar Conquista'}</h2> <form onSubmit={handleAchievementSubmit} className="space-y-4 mb-6"> <InputField name="title" type="text" placeholder="Título da Conquista" Icon={Award} value={achievementForm.title} onChange={handleAchievementChange} /> <div className="relative flex-grow"><textarea name="description" placeholder="Descrição da conquista" value={achievementForm.description} onChange={handleAchievementChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" rows="3"></textarea></div> <div className="flex gap-2"> <button type="submit" className="flex-grow bg-[#d4982c] hover:bg-[#b58426] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><Save className="mr-2" />{editingAchievementId ? 'Salvar Alterações' : 'Adicionar Conquista'}</button> {editingAchievementId && <button type="button" onClick={() => { setAchievementForm({ title: '', description: '' }); setEditingAchievementId(null);}} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>} </div> </form> <div className="space-y-2"> {achievements.map(ach => ( <div key={ach.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"> <div><p className="font-semibold text-gray-800">{ach.title}</p><p className="text-sm text-gray-600">{ach.description}</p></div> <div className="flex items-center gap-2"><button onClick={() => handleEditAchievement(ach)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => removeAchievement(ach.id)} className="text-red-500 hover:text-red-700 p-2 shrink-0"><Trash2 size={18}/></button></div> </div> ))} </div> </div> )}
                    {adminSection === 'sponsors' && ( <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md"> <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">{editingSponsorId ? 'Editar Patrocinador' : 'Adicionar Patrocinador'}</h2> <form onSubmit={handleSponsorSubmit} className="space-y-4"> <InputField name="name" type="text" placeholder="Nome do Patrocinador" Icon={Briefcase} value={sponsorForm.name} onChange={handleSponsorChange} /> <InputField name="amount" type="number" placeholder="Valor do Patrocínio (R$)" Icon={DollarSign} value={sponsorForm.amount} onChange={handleSponsorChange} /> <div><label htmlFor="sponsor-logo-upload" className="block text-sm font-medium text-gray-700 mb-2">Logótipo do Patrocinador</label><div className="mt-1 flex items-center gap-4">{sponsorLogoPreview && <img loading="lazy" decoding="async" src={sponsorLogoPreview} alt="Preview" className="w-16 h-16 object-contain border border-gray-200 rounded-md p-1"/>}<label htmlFor="sponsor-logo-upload" className="flex-grow relative cursor-pointer bg-gray-100 rounded-md font-medium text-[#d4982c] hover:text-[#b58426] p-3 text-center border border-gray-300 hover:border-gray-400" onDragOver={handleDragOver} onDrop={handleSponsorLogoDrop}><UploadCloud className="mx-auto mb-1"/><span>{hasSponsorLogo ? 'Alterar logótipo' : 'Enviar logótipo'}</span><input id="sponsor-logo-upload" type="file" className="sr-only" onChange={handleSponsorLogoSelect} accept="image/*" /></label></div></div> <div className="flex gap-2"><button type="submit" disabled={isUploading} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shrink-0"><Save className="mr-2" />{isUploading ? 'A guardar...' : (editingSponsorId ? 'Salvar Alterações' : 'Adicionar Patrocinador')}</button>{editingSponsorId && <button type="button" onClick={() => { setSponsorForm({ name: '', logoUrl: '', amount: '' }); setEditingSponsorId(null); setSponsorLogoPreview(''); setSponsorLogoFile(null); }} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>}</div> </form> <div className="space-y-2 mt-6">{sponsors.map(sponsor => (<div key={sponsor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"><div className="flex items-center gap-4"><img loading="lazy" decoding="async" src={sponsor.logo} alt={sponsor.name} className="h-10 w-auto object-contain"/><span>{sponsor.name}</span></div><div className="flex items-center gap-2"><button onClick={() => handleEditSponsor(sponsor)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button><button onClick={() => removeSponsor(sponsor.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button></div></div>))}</div> </div> )}
                    {adminSection === 'raffles' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Rifas vendidas</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalRafflesSold}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Total arrecadado</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRaffleAmount)}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Total recebido</p>
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRaffleReceived)}</p>
                                </div>
                            </div>
                            {siteSettings.raffleClosed ? (
                                <p className="text-sm text-red-600 font-semibold">Rifa encerrada. Reabra para registar novas vendas.</p>
                            ) : null}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5 flex items-start gap-4">
                                <div className="p-3 rounded-full bg-[#d4982c]/10 text-[#d4982c]">
                                    <Gift />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Prêmio atual</p>
                                    <p className="text-lg font-semibold text-gray-900">{rafflePrizeDescription || 'Defina o prêmio nas configurações gerais.'}</p>
                                    <p className="text-sm text-gray-500 mt-1">Valor do bilhete: {raffleTicketPrice ? formatCurrency(raffleTicketPrice) : '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <form onSubmit={handleRaffleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-4">
                                    <h3 className="text-xl font-bold text-[#d4982c]">{editingRaffleId ? 'Editar venda' : 'Registrar nova venda'}</h3>
                                    <InputField name="buyerName" type="text" placeholder="Nome do comprador" Icon={UserIcon} value={raffleForm.buyerName} onChange={handleRaffleChange} />
                                    <SelectField name="sellerId" value={raffleForm.sellerId} onChange={handleRaffleChange} Icon={UsersIcon}>
                                        <option value="">Selecione o vendedor(a)</option>
                                        {teamHierarchy.members.map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </SelectField>
                                    {!raffleForm.sellerId && raffleForm.sellerName ? (
                                        <p className="text-xs text-gray-500">Atual: {raffleForm.sellerName}</p>
                                    ) : null}
                                    <InputField name="contact" type="text" placeholder="Contacto" Icon={Phone} value={raffleForm.contact} onChange={handleRaffleChange} />
                                    {!editingRaffleId && (
                                        <InputField name="quantity" type="number" placeholder="Quantidade de bilhetes" Icon={Hash} value={raffleForm.quantity} onChange={handleRaffleChange} />
                                    )}
                                    <InputField name="amount" type="number" placeholder="Valor por bilhete (R$)" Icon={DollarSign} value={raffleForm.amount} onChange={handleRaffleChange} />
                                    <p className="text-xs text-gray-500">Total estimado: {formatCurrency(estimatedRaffleTotal)}</p>
                                    {editingRaffleId && (
                                        <InputField name="ticketNumber" type="text" placeholder="Número do bilhete" Icon={Hash} value={raffleForm.ticketNumber} onChange={handleRaffleChange} readOnly />
                                    )}
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" name="received" checked={raffleForm.received} onChange={handleRaffleChange} className="h-4 w-4 rounded border-gray-300 text-[#d4982c] focus:ring-[#d4982c]" />
                                        Pagamento recebido
                                    </label>
                                    {lastGeneratedTickets.length ? (
                                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                                            <p className="font-semibold mb-1">Bilhetes gerados</p>
                                            <p>{lastGeneratedTickets.join(', ')}</p>
                                        </div>
                                    ) : null}
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={isSavingRaffle} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                            <Save className="mr-2" />
                                            {isSavingRaffle ? 'A guardar...' : (editingRaffleId ? 'Salvar alterações' : 'Registrar venda')}
                                        </button>
                                        {editingRaffleId && (
                                            <button type="button" onClick={resetRaffleForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                                        <h3 className="text-xl font-bold text-[#d4982c]">Registos de rifas</h3>
                                        <input type="text" value={raffleSearchTerm} onChange={(event) => setRaffleSearchTerm(event.target.value)} placeholder="Pesquisar por nome, vendedor ou número" className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#d4982c] focus:ring-[#d4982c]" />
                                    </div>
                                    <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                                        {filteredRaffles.length ? (
                                            filteredRaffles.map((raffle) => {
                                                const sellerLabel = raffle.sellerName || (raffle.sellerId ? memberNameMap.get(raffle.sellerId) : '—');
                                                return (
                                                <div key={raffle.id} className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{raffle.buyerName}</p>
                                                        <p className="text-sm text-gray-600">Bilhete #{raffle.ticketNumber} • Vendedor(a): {sellerLabel}</p>
                                                        {raffle.contact ? <p className="text-sm text-gray-500">Contacto: {raffle.contact}</p> : null}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-sm font-bold text-gray-800">{formatCurrency(typeof raffle.amount === 'number' ? raffle.amount : raffleTicketPrice)}</span>
                                                        <button type="button" onClick={() => toggleRaffleReceived(raffle)} className={`px-3 py-1 rounded-full text-xs font-semibold ${raffle.received ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {raffle.received ? 'Recebido' : 'Pendente'}
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => handleEditRaffle(raffle)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                                                            <button type="button" onClick={() => removeRaffle(raffle.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-6">Nenhuma rifa registada ainda.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {adminSection === 'financial' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Entradas ({financialYear})</p>
                                    <p className="text-3xl font-bold text-green-700">{formatCurrency(totalIncomeForYear)}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Saídas ({financialYear})</p>
                                    <p className="text-3xl font-bold text-red-700">{formatCurrency(totalPurchasesForYear)}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
                                    <p className="text-sm text-gray-500">Resultado</p>
                                    <p className={`text-3xl font-bold ${netResultForYear >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(netResultForYear)}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Fluxo mensal</p>
                                        <h3 className="text-lg font-semibold text-gray-800">{financialYear}</h3>
                                    </div>
                                    <select value={financialYear} onChange={(event) => setFinancialYear(Number(event.target.value))} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#d4982c] focus:ring-[#d4982c]">
                                        {financialYearOptions.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-6 grid grid-cols-12 gap-3">
                                    {monthlyFinancialSeries.map(({ label, income, expense, incomePercent, expensePercent }) => (
                                        <div key={label} className="flex flex-col items-center text-xs text-gray-500">
                                            <div className="h-40 w-full flex flex-col justify-end gap-1">
                                                <div className="w-full bg-green-500/70 rounded-t-lg" style={{ height: `${incomePercent}%` }} title={`Entradas ${label}: ${formatCurrency(income)}`}></div>
                                                <div className="w-full bg-red-500/70 rounded-b-lg" style={{ height: `${expensePercent}%` }} title={`Saídas ${label}: ${formatCurrency(expense)}`}></div>
                                            </div>
                                            <span className="mt-2 font-semibold">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Entradas por origem</h3>
                                    <div className="space-y-3">
                                        {incomeBreakdown.map((entry) => (
                                            <div key={entry.label} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">{entry.label}</span>
                                                <span className="font-semibold text-gray-900">{formatCurrency(entry.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Compras ({financialYear})</h3>
                                    {purchasesForYear.length ? (
                                        <ul className="space-y-3">
                                            {[...purchasesForYear]
                                                .sort((a, b) => (b.dateValue?.getTime() ?? 0) - (a.dateValue?.getTime() ?? 0))
                                                .slice(0, 6)
                                                .map((purchase) => (
                                                    <li key={purchase.id} className="flex items-center justify-between text-sm">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{purchase.description}</p>
                                                            <p className="text-gray-500">{purchase.dateValue ? purchase.dateValue.toLocaleDateString('pt-BR') : ''}</p>
                                                        </div>
                                                        <span className="font-semibold text-red-600">{formatCurrency(typeof purchase.amount === 'number' ? purchase.amount : 0)}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Nenhuma compra registada neste ano.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {adminSection === 'purchases' && (
                        <div className="space-y-6">
                            <form onSubmit={handlePurchaseSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-4">
                                <h3 className="text-xl font-bold text-[#d4982c]">{editingPurchaseId ? 'Editar compra' : 'Registrar compra'}</h3>
                                <InputField name="description" type="text" placeholder="Descrição" Icon={ClipboardList} value={purchaseForm.description} onChange={handlePurchaseChange} />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField name="vendor" type="text" placeholder="Fornecedor" Icon={Briefcase} value={purchaseForm.vendor} onChange={handlePurchaseChange} />
                                    <InputField name="category" type="text" placeholder="Categoria" Icon={Settings} value={purchaseForm.category} onChange={handlePurchaseChange} />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField name="amount" type="number" placeholder="Valor gasto (R$)" Icon={DollarSign} value={purchaseForm.amount} onChange={handlePurchaseChange} />
                                    <InputField name="date" type="date" placeholder="Data" Icon={Calendar} value={purchaseForm.date} onChange={handlePurchaseChange} />
                                </div>
                                <textarea name="notes" placeholder="Observações" rows={3} className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm" value={purchaseForm.notes} onChange={handlePurchaseChange}></textarea>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={isSavingPurchase} className="flex-grow bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                        <Save className="mr-2" />
                                        {isSavingPurchase ? 'A guardar...' : (editingPurchaseId ? 'Salvar alterações' : 'Registrar compra')}
                                    </button>
                                    {editingPurchaseId && (
                                        <button type="button" onClick={resetPurchaseForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[#d4982c]">Histórico de compras</h3>
                                    <input type="text" value={purchaseSearchTerm} onChange={(event) => setPurchaseSearchTerm(event.target.value)} placeholder="Pesquisar por descrição ou fornecedor" className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#d4982c] focus:ring-[#d4982c]" />
                                </div>
                                <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                                    {filteredPurchases.length ? (
                                        filteredPurchases.map((purchase) => (
                                            <div key={purchase.id} className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{purchase.description}</p>
                                                    <p className="text-sm text-gray-500">{purchase.dateValue ? purchase.dateValue.toLocaleDateString('pt-BR') : ''}{purchase.vendor ? ` • ${purchase.vendor}` : ''}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-600">{formatCurrency(typeof purchase.amount === 'number' ? purchase.amount : 0)}</span>
                                                    <button type="button" onClick={() => handleEditPurchase(purchase)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                                                    <button type="button" onClick={() => removePurchase(purchase.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-6">Nenhuma compra registrada.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {adminSection === 'security' && ( <form onSubmit={handlePasswordChangeSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6"> <h2 className="text-2xl font-bold text-[#d4982c]">Alterar Senha</h2> <InputField id="currentPassword" name="currentPassword" type="password" placeholder="Senha Atual" Icon={Lock} value={passwordForm.currentPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showCurrentPassword} togglePasswordVisibility={() => setShowCurrentPassword(!showCurrentPassword)} /> <InputField id="newPassword" name="newPassword" type="password" placeholder="Nova Senha" Icon={Lock} value={passwordForm.newPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showNewPassword} togglePasswordVisibility={() => setShowNewPassword(!showNewPassword)} /> <InputField id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirmar Nova Senha" Icon={Lock} value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} isPassword={true} showPassword={showConfirmPassword} togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)} /> <div><button type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-[#d4982c] hover:bg-[#b58426] transition-all duration-300 transform hover:scale-105 shadow-lg">Alterar Senha</button></div> </form> )}
                    {adminSection === 'dues' && (
                        <div className="w-full flex justify-center">
                            <div className="w-full max-w-6xl bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                                <h2 className="text-2xl font-bold mb-4 text-[#d4982c]">Mensalidades</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                                    <div className="p-4 bg-green-100 rounded-lg">
                                        <p className="text-sm text-green-700">Total Arrecadado (Mensalidades)</p>
                                        <p className="text-2xl font-bold text-green-800">R$ {totalDuesPaidForYear.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-blue-100 rounded-lg">
                                        <p className="text-sm text-blue-700">Total Arrecadado (Patrocínios)</p>
                                        <p className="text-2xl font-bold text-blue-800">R$ {totalSponsorshipsForYear.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-amber-100 rounded-lg">
                                        <p className="text-sm text-amber-700">Total Geral</p>
                                        <p className="text-2xl font-bold text-amber-800">R$ {(totalDuesPaidForYear + totalSponsorshipsForYear).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                                    <select value={financialYear} onChange={(e) => setFinancialYear(Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:w-auto">
                                        {financialYearOptions.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={handleExportCSV} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 sm:w-auto">
                                        <FileDown size={18} />
                                        Exportar CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <th key={i} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {new Date(0, i).toLocaleString('pt-BR', { month: 'short' })}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {duesMembers.length ? (
                                                duesMembers.map(member => {
                                                    const memberPayments = financials.payments.filter(p => p.memberId === member.id && p.year === financialYear);
                                                    return (
                                                        <tr key={member.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {member.name}
                                                            </td>
                                                            {Array.from({ length: 12 }, (_, i) => {
                                                                const month = i + 1;
                                                                const payment = memberPayments.find(p => p.month === month);
                                                                return (
                                                                    <td key={month} className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                                        <button
                                                                            onClick={() => handleTogglePayment(member.id, month)}
                                                                            className={`p-1.5 rounded-full transition-colors ${payment ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                                                        >
                                                                            {payment ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                                        </button>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={13}>
                                                        Nenhum membro efetivo disponível para cobranças de mensalidade.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
