import type { ReactNode } from 'react';
import { Facebook, Instagram, Linkedin as LinkedinIcon, Mail, MapPin, Youtube as YoutubeIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
            <img className="h-12 mb-4" src="./logo.png" alt="Logo Carancho Aerodesign" loading="lazy" decoding="async" />
            <p className="text-sm">Projetando o futuro da aviação, um voo de cada vez.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Contato</h3>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#d4982c] shrink-0 mt-1" />
                <span>
                  Av. Roraima nº 1000, Cidade Universitária, Bairro Camobi, Santa Maria - RS, 97105-900
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#d4982c] shrink-0" />
                <a href="mailto:carancho@ufsm.br" className="hover:text-[#d4982c] transition-colors">
                  carancho@ufsm.br
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Siga-nos</h3>
            <div className="flex mt-4 space-x-6">
              <FooterLink href="https://www.linkedin.com/company/caranchoaerodesign" label="LinkedIn">
                <LinkedinIcon />
              </FooterLink>
              <FooterLink href="https://www.youtube.com/@CaranchoAer/" label="YouTube">
                <YoutubeIcon />
              </FooterLink>
              <FooterLink href="https://www.instagram.com/caranchoufsm" label="Instagram">
                <Instagram />
              </FooterLink>
              <FooterLink href="https://www.facebook.com/caranchoufsm" label="Facebook">
                <Facebook />
              </FooterLink>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} Carancho Aerodesign. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  label: string;
  children: ReactNode;
}

function FooterLink({ href, label, children }: FooterLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-[#d4982c] transition-colors"
    >
      <span className="sr-only">{label}</span>
      {children}
    </a>
  );
}
