const ptBR = {
  navbar: {
    options: {
      home: 'Início',
      categories: 'Categorias',
      team: 'Equipe',
      //papers: 'Publicações',
    },
  },
  footer: {
    contact: 'Nosso contato',
    location: {
      label: 'Onde estamos',
      address:
        'Av. Roraima nº 1000 Cidade Universitária Bairro - Camobi, Santa Maria - RS, 97105-900',
    },
  },
  categories_page: {
    page_header: {
      title: 'Categorias',
      description: `Nossos times desenvolvem tecnologias que
      disputam títulos em várias categorias de competições, como:`,
      categories: [
        'Micro',
        'Regular'
      ],
    },
    categories: [
      {
        title: 'Micro',
        competitions: 'SAE Brasil Aerodesign',
        description: `
        A classe Micro é focada em aeronaves de pequena escala.
        Nesta categoria, as equipes são desafiadas a projetar e construir modelos de aeronaves
        extremamente leves e compactos, com especificações de peso e dimensões ainda mais 
        restritas do que nas outras categorias. Um dos principais objetivos da classe Micro
        é maximizar a eficiência de carga útil em relação ao peso total da aeronave.
        Isso exige das equipes um alto grau de precisão e inovação em engenharia 
        para otimizar cada aspecto do design, desde a seleção de materiais até a
        aerodinâmica e a eficiência do motor.`
      },
      {
        title: 'Regular',
        competitions: 'SAE Brasil Aerodesign',
        description: `A classe Regular na competição é a categoria que apresenta mais restrições 
        comparativamente às classes Advanced e Micro. Esta categoria é projetada para proporcionar um desafio equilibrado,
         permitindo aos novos engenheiros aplicarem conhecimentos básicos de engenharia aeronáutica em um contexto prático,
          mas dentro de parâmetros mais controlados.`
      },
    ],
  },
  content: 'Esse conteúdo está em português',
  home: {
    banner: {
      headline: {
        title: `Representante da UFSM na competição SAE BRASIL Aerodesign`,
        complement: `Desde 2004, dedicamo-nos ao projeto e construção de aeronaves. Projetar e construir aeronaves transcende a engenharia; é uma verdadeira paixão.`,
      },
      heading: 'Desde 2004, dedicamo-nos ao projeto e construção de aeronaves.',
      achievements: [
        { }
      ],
    },
    activities: {
      competitions_card: {
        title: 'Competições',
        description:
          'Representante oficial da Universidade Federal de Santa Maria na SAE Brasil Aerodesign.',
      },
      research_card: {
        title: 'Pesquisa',
        description:
          'Fazemos pesquisa em várias áreas dentro do campo da Aeronaútica.',
      },
      development_card: {
        title: 'Desenvolvimento',
        description: 'Desenvolvemos a estrutura e eletrônica das nossas Aeronaves',
      },
      activity_card_button: 'Ver mais',
    },
    about_us: {
      title: 'Sobre nós',
      description: `
      Fundado em 2004, o Carancho Aerodesign está celebrando 20 anos de atividade este ano. 
      A equipe é composta por estudantes de diversas engenharias da Universidade Federal de Santa Maria 
      e se dedica ao desafio de projetar e construir aeronaves rádio controladas. Este trabalho é 
      desenvolvido especificamente para participar da competição anual SAE Brasil Aerodesign, 
      onde demonstram suas habilidades e inovações na área aeroespacial.`,
      features: {
        participations: 'Participações',
        papers: 'Publicações',
        members: 'Membros',
      },
    },
    sponsors: {
      title: 'Nossos Patrocinadores',
      call_to_action: `Quer sua marca aqui também? 
      Entre em contato:`,
    },
    infoPopup: {
      competitions: {
        title: 'Competição',
        description:
          'Representante oficial da Universidade Federal de Santa Maria na SAE Brasil Aerodesign.',
      },
      research: {
        title: 'Pesquisa',
        description:
          'Fazemos pesquisa em várias áreas dentro do campo da aeronautica',
      },
      development: {
        title: 'Desenvolvimento',
        description: 'Desenvolvemos a estrutura e eletrônica das nossas aeronaves',
      },
    },
  },
  publications_page: {
    header: {
      title: 'Publicações',
      description:
        'Veja nossas pesquisas abaixo',
    },
    team_description_papers: {
      title: 'Documents and Articles',
      description: `Organizamos por ano as visões gerais dos nossos Artigos publicados, os documentos responsáveis por agrupar informações 
      e explicações acerca dos nossos designs.  Confira o conteúdo dos artigos 
      clicando em seus títulos!`,
      button_label: `Ver documentos`,
    },
    publication_card: {
      url_label: 'Artigos',
    },
    publications_list: {
      header: {
        title: 'Artigos',
        description: 'Veja nossos Artigos abaixo',
      },
      default_filter_options: {
        all: 'Todos',
        recent: 'Mais recentes',
      },
      publication_card: {
        url_label: 'Leia',
      },
      filter_results: {
        fallback: 'Oops! Nenhuma publicação foi encontrada para esse ano.',
      },
    },
  },
}

export default ptBR
