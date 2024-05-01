const en = {
  navbar: {
    options: {
      home: 'Home',
      categories: 'Categories',
      team: 'Team',
      //papers: 'Publications',
    },
  },
  footer: {
    contact: 'Contact Us',
    location: {
      label: 'Find Us',
      address: 'Av. Roraima nº 1000 University City District - Camobi, Santa Maria - RS, 97105-900',
    },
  },
  categories_page: {
    page_header: {
      title: 'Categories',
      description: `Our teams develop technologies that compete in various categories, such as:`,
      categories: [
        'Micro',
        'Regular',
      ],
    },
    categories: [
      {
        title: 'Micro',
        competitions: 'SAE Brasil Aerodesign',
        description: `The Micro class focuses on small-scale aircraft.
        In this category, teams are challenged to design and build extremely light and compact aircraft models,
        with even more restrictive weight and dimension specifications than other categories.
        One of the main goals of the Micro class is to maximize payload efficiency relative to the total weight of the aircraft.
        This requires teams to achieve a high degree of engineering precision and innovation
        to optimize every aspect of the design, from material selection to aerodynamics and engine efficiency.`,
      },
      {
        title: 'Regular',
        competitions: 'SAE Brasil Aerodesign',
        description: `The Regular class in the competition is the category that presents more restrictions
        compared to the Advanced and Micro classes. This category is designed to provide a balanced challenge,
        allowing new engineers to apply basic aeronautical engineering knowledge in a practical context,
        but within more controlled parameters.`,
      },
    ],
  },
  content: 'This content is in English',
  home: {
    banner: {
      headline: {
        title: `Representative of UFSM at the SAE BRASIL Aerodesign competition`,
        complement: `Since 2004, we have dedicated ourselves to the design and construction of aircraft. Designing and building aircraft transcends engineering; it is a true passion.`,
      },
      heading: 'Since 2004, we have dedicated ourselves to the design and construction of aircraft.',
      achievements: [
        // Place your achievements here as in the Portuguese version.
      ],
    },
    activities: {
      competitions_card: {
        title: 'Competitions',
        description: 'Official representative of the Federal University of Santa Maria in the SAE Brasil Aerodesign.',
      },
      research_card: {
        title: 'Research',
        description: 'We conduct research in various areas within the field of aeronautics.',
      },
      development_card: {
        title: 'Development',
        description: 'We develop the structure and electronics of our aircraft.',
      },
      activity_card_button: 'See more',
    },
    about_us: {
      title: 'About Us',
      description: `Founded in 2004, the Carancho Aerodesign has been celebrating 20 years of activity this year.
      The team consists of students from various engineering disciplines at the Federal University of Santa Maria
      and is dedicated to the challenge of designing and building radio-controlled aircraft. This work is
      developed specifically to participate in the annual SAE Brazil Aerodesign competition,
      where they demonstrate their skills and innovations in the aerospace area.`,
      features: {
        participations: 'Participations',
        papers: 'Publications',
        members: 'Members',
      },
    },
    sponsors: {
      title: 'Our Sponsors',
      call_to_action: `Want your brand here too? Contact us:`,
    },
    infoPopup: {
      competitions: {
        title: 'Competition',
        description: 'Official representative of the Federal University of Santa Maria in the SAE Brasil Aerodesign.',
      },
      research: {
        title: 'Research',
        description: 'We conduct research in various areas within the field of aeronautics.',
      },
      development: {
        title: 'Development',
        description: 'We develop the structure and electronics of our aircraft.',
      },
    },
  },
  publications_page: {
    header: {
      title: 'Publications',
      description: 'Check out our research below.',
    },
    team_description_papers: {
      title: 'Documents and Articles',
      description: `We organize the overviews of our published Articles by year, the documents responsible for grouping information
      and explanations about our designs. Check the content of the articles
      by clicking on their titles!`,
      button_label: `See documents`,
    },
    publications_list: {
      header: {
        title: 'Articles',
        description: 'See our Articles below.',
      },
      default_filter_options: {
        all: 'All',
        recent: 'Most recent',
      },
      publication_card: {
        url_label: 'Read',
      },
      filter_results: {
        fallback: 'Oops! No publications were found for this year.',
      },
    },
  },
}

export default en;
