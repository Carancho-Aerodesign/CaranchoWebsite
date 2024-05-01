// next.config.js
module.exports = {
    // Configuração de Internacionalização
    i18n: {
        // Define os locais suportados pelo seu aplicativo
        locales: ['en', 'pt-BR'], // Lista de códigos de idiomas/locale suportados
        defaultLocale: 'pt-BR', // O locale padrão se nenhum outro for especificado
    },
    // Habilita o modo estrito do React para ajudar a identificar problemas potenciais
    reactStrictMode: true,
    // Configurações do compilador do Next.js
    compiler: {
        // Ativa o suporte para styled-components, permitindo SSR correto e outros benefícios
        styledComponents: true,
    },
}
