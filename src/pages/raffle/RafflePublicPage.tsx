import { useMemo, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { Gift, Phone, Ticket, Users } from 'lucide-react';

import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import type { NotificationState, TeamHierarchy } from '../../types';
import { appId } from '../../firebase';
import { allocateTicketNumbers } from '../../utils/raffleManager';

interface RafflePublicPageProps {
  db: Firestore | null;
  teamHierarchy: TeamHierarchy | null;
  raffleTicketPrice: number;
  raffleValidationCode: string;
  raffleClosed: boolean;
  setNotification: (notification: NotificationState) => void;
}

interface PublicRaffleFormState {
  buyerName: string;
  contact: string;
  sellerId: string;
  quantity: string;
  confirmationCode: string;
}

const getDefaultForm = (): PublicRaffleFormState => ({
  buyerName: '',
  contact: '',
  sellerId: '',
  quantity: '',
  confirmationCode: '',
});

export function RafflePublicPage({ db, teamHierarchy, raffleTicketPrice, raffleValidationCode, raffleClosed, setNotification }: RafflePublicPageProps) {
  const [form, setForm] = useState<PublicRaffleFormState>(getDefaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedTickets, setIssuedTickets] = useState<string[]>([]);
  const sellers = teamHierarchy?.members ?? [];
  const parsedQuantity = Number(form.quantity);
  const quantityNumber = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? Math.min(500, Math.floor(parsedQuantity)) : 0;
  const totalPrice = quantityNumber > 0 ? (raffleTicketPrice || 0) * quantityNumber : 0;

  const sellerNameById = useMemo(() => new Map(sellers.map((member) => [member.id, member.name])), [sellers]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === 'quantity') {
      if (value === '') {
        setForm((prev) => ({ ...prev, quantity: '' }));
        return;
      }
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        setForm((prev) => ({ ...prev, quantity: '' }));
        return;
      }
      const normalized = Math.max(0, Math.min(500, Math.floor(numericValue)));
      setForm((prev) => ({ ...prev, quantity: String(normalized) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) {
      setNotification({ message: 'Base de dados indisponível no momento.', type: 'error' });
      return;
    }
    if (!form.buyerName.trim() || !form.sellerId) {
      setNotification({ message: 'Informe o comprador e selecione o vendedor.', type: 'error' });
      return;
    }
    if (!raffleValidationCode) {
      setNotification({ message: 'Código de validação indisponível. Contacte a administração.', type: 'error' });
      return;
    }
    if (form.confirmationCode.trim().toUpperCase() !== raffleValidationCode.toUpperCase()) {
      setNotification({ message: 'Código de confirmação inválido.', type: 'error' });
      return;
    }
    const parsedQuantity = Number(form.quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setNotification({ message: 'Informe a quantidade de bilhetes.', type: 'error' });
      return;
    }
    const sanitizedQuantity = Math.max(1, Math.min(500, Math.floor(parsedQuantity)));
    setIsSubmitting(true);
    const rafflesColRef = collection(db, `/artifacts/${appId}/public/data/raffles`);
    try {
      const allocatedNumbers = await allocateTicketNumbers(db, appId, sanitizedQuantity);
      const paddedNumbers = allocatedNumbers.map((num) => num.toString().padStart(3, '0'));
      await Promise.all(
        paddedNumbers.map((ticketNumber) =>
          addDoc(rafflesColRef, {
            ticketNumber,
            buyerName: form.buyerName.trim(),
            sellerId: form.sellerId,
            sellerName: sellerNameById.get(form.sellerId) ?? '',
            contact: form.contact.trim(),
            amount: raffleTicketPrice,
            received: false,
            dateSold: new Date(),
            updatedAt: new Date(),
          }),
        ),
      );
      setIssuedTickets(paddedNumbers);
      setForm(getDefaultForm());
      setNotification({ message: 'Rifa registada! Partilhe os números com o comprador.', type: 'success' });
    } catch (error) {
      console.error('Erro ao registar rifa pública:', error);
      setNotification({ message: 'Não foi possível registar a rifa. Tente novamente.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClosedState = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 text-center space-y-4">
      <Ticket className="mx-auto text-red-500" size={48} />
      <h1 className="text-3xl font-bold text-gray-900">Rifa encerrada</h1>
      <p className="text-gray-600">Esta rifa já foi finalizada. Agradecemos a todos os participantes!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <Ticket className="mx-auto text-[#d4982c]" size={48} />
          <h1 className="text-3xl font-bold text-gray-900">Compra de Rifas</h1>
          <p className="text-gray-600">Preencha os dados abaixo para gerar os bilhetes e partilhar com o comprador.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
          {raffleClosed ? (
            renderClosedState()
          ) : (
            <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Valor por bilhete</p>
              <p className="text-2xl font-bold text-gray-900">{raffleTicketPrice ? raffleTicketPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Quantidade</p>
              <p className="text-2xl font-bold text-gray-900">{quantityNumber > 0 ? quantityNumber : '—'}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalPrice ? totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField name="buyerName" type="text" placeholder="Nome do comprador" Icon={Users} value={form.buyerName} onChange={handleChange} />
            <InputField name="contact" type="text" placeholder="Contacto (telefone ou e-mail)" Icon={Phone} value={form.contact} onChange={handleChange} />
            <SelectField name="sellerId" value={form.sellerId} onChange={handleChange} Icon={Users}>
              <option value="">Selecione o vendedor(a)</option>
              {sellers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </SelectField>
            {!sellers.length && <p className="text-xs text-red-500">Nenhum vendedor registado. Contacte o administrador.</p>}
            <InputField name="quantity" type="number" placeholder="Quantidade de bilhetes" Icon={Ticket} value={form.quantity} onChange={handleChange} />
            <InputField name="confirmationCode" type="text" placeholder="Código de confirmação" Icon={Gift} value={form.confirmationCode} onChange={handleChange} />
            {!raffleValidationCode && <p className="text-xs text-red-500">O código ainda não foi definido pelos administradores.</p>}
            <button
              type="submit"
              disabled={isSubmitting || !raffleValidationCode}
              className="w-full bg-[#d4982c] hover:bg-[#b58426] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
            >
              {isSubmitting ? 'A gerar bilhetes...' : 'Gerar bilhetes'}
            </button>
          </form>
          {issuedTickets.length ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Gift size={20} />
                <span>Envie estes números ao comprador</span>
              </div>
              <p className="text-gray-700 text-sm">{issuedTickets.join(', ')}</p>
              <p className="text-xs text-gray-500">Guarde os comprovativos de pagamento e certifique-se de que o comprador recebe os números gerados.</p>
            </div>
          ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
