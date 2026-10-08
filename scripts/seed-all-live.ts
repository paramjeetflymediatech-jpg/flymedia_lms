import { Category, Package } from '../src/db/models';
import { sequelize } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to database.');

  // ============================================
  // 1. SEED LIVE CATEGORIES
  // ============================================
  const categories = [
    {
      name: 'MERN Stack Developer',
      slug: 'mern-stack-developer',
      icon: 'https://cdn-icons-png.flaticon.com/512/919/919851.png',
      metaTitle: 'MERN Stack Developer Courses | Flymedia',
      metaDescription: 'Master MongoDB, Express, React, and Node.js with our advanced MERN Stack development courses.',
      content: {
        features: [
          { title: 'Full Stack Mastery', description: 'Learn both front-end and back-end development using the powerful MERN stack.' },
          { title: 'Industry Projects', description: 'Build scalable web applications from scratch with mentor guidance.' },
          { title: 'Career Ready', description: 'Prepare for top-tier full stack developer roles with specialized interview prep.' }
        ],
        sections: [
          { heading: 'Why Choose MERN Stack?', body: 'The MERN stack is one of the most popular and high-paying technology stacks in the world. By mastering MongoDB, Express, React, and Node.js, you become a versatile developer capable of building everything from simple websites to complex, AI-powered web applications.' }
        ],
        faqs: [
          { question: 'Do I need prior coding experience?', answer: 'No! Our programs are designed to take you from absolute beginner to professional developer.' },
          { question: 'Are there placement opportunities?', answer: 'Yes, we provide dedicated placement assistance upon successful completion of the course.' }
        ]
      }
    },
    {
      name: 'Graphic Design',
      slug: 'graphic-design',
      icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png',
      metaTitle: 'Graphic Design Courses | Flymedia',
      metaDescription: 'Learn Photoshop, Illustrator, and modern design principles with our Graphic Design courses.',
      content: {
        features: [
          { title: 'Creative Freedom', description: 'Master industry-standard tools like Photoshop, Illustrator, and InDesign.' },
          { title: 'Portfolio Building', description: 'Create a stunning professional portfolio of branding, UI, and print designs.' },
          { title: 'Expert Guidance', description: 'Get direct feedback from senior designers and art directors.' }
        ],
        sections: [
          { heading: 'Unleash Your Creativity', body: 'Graphic design is more than just making things look pretty—it\'s about visual communication and problem-solving. Our courses teach you the core principles of typography, color theory, and composition to make you a sought-after designer.' }
        ],
        faqs: [
          { question: 'What software will I learn?', answer: 'You will learn Adobe Photoshop, Illustrator, CorelDRAW, and Figma.' },
          { question: 'Is this a practical course?', answer: 'Absolutely. You will work on real client briefs and assignments throughout the course.' }
        ]
      }
    },
    {
      name: 'Video Editing',
      slug: 'video-editing',
      icon: 'https://cdn-icons-png.flaticon.com/512/2824/2824810.png',
      metaTitle: 'Video Editing Courses | Flymedia',
      metaDescription: 'Master Premiere Pro, After Effects, and professional video editing workflows.',
      content: {
        features: [
          { title: 'Professional Workflows', description: 'Learn advanced non-linear editing using Premiere Pro.' },
          { title: 'Motion Graphics', description: 'Create stunning visual effects and animations using After Effects.' },
          { title: 'Audio & Color', description: 'Master color grading, sound design, and professional audio mixing.' }
        ],
        sections: [
          { heading: 'Tell Compelling Stories', body: 'Video content is dominating the digital landscape. Whether it\'s for YouTube, social media, or cinematic films, our video editing courses will equip you with the skills to turn raw footage into captivating visual stories.' }
        ],
        faqs: [
          { question: 'What tools are covered?', answer: 'We focus heavily on Adobe Premiere Pro and Adobe After Effects.' },
          { question: 'Do I need a high-end PC?', answer: 'While video editing is resource-intensive, you can practice on our high-end systems in our in-house labs.' }
        ]
      }
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      icon: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
      metaTitle: 'Web Development Courses | Flymedia',
      metaDescription: 'Learn HTML, CSS, JavaScript, and PHP to build responsive websites.',
      content: {
        features: [
          { title: 'Core Foundations', description: 'Master HTML5, CSS3, and responsive design frameworks like Bootstrap.' },
          { title: 'Dynamic Interactivity', description: 'Bring websites to life using modern JavaScript and DOM manipulation.' },
          { title: 'Backend Basics', description: 'Learn the fundamentals of server-side programming and databases.' }
        ],
        sections: [
          { heading: 'Build the Web', body: 'Every business needs a website. Our Web Development category covers everything from building beautiful static landing pages to creating functional, data-driven web experiences that run smoothly across all devices.' }
        ],
        faqs: [
          { question: 'How is this different from MERN Stack?', answer: 'Web Development is a broader foundation course covering traditional web technologies, while MERN Stack is a highly specialized advanced program.' },
          { question: 'Will I learn how to host a website?', answer: 'Yes! You will learn how to deploy and host your websites on live servers.' }
        ]
      }
    },
    {
      name: 'Digital Marketing',
      slug: 'digital-marketing',
      icon: 'https://cdn-icons-png.flaticon.com/512/1998/1998087.png',
      metaTitle: 'Digital Marketing Courses | Flymedia',
      metaDescription: 'Master SEO, Social Media, Google Ads, and AI marketing tools.',
      content: {
        features: [
          { title: 'SEO & Analytics', description: 'Dominate search rankings and analyze traffic using Google Analytics.' },
          { title: 'Paid Advertising', description: 'Run high-converting campaigns on Google Ads and Meta Ads.' },
          { title: 'AI for Marketing', description: 'Leverage tools like ChatGPT and Gemini to automate and scale your workflows.' }
        ],
        sections: [
          { heading: 'Drive Growth and ROI', body: 'Digital marketing is the backbone of modern business. Our comprehensive courses teach you how to acquire customers, optimize conversion funnels, and build strong brand presence across all digital channels using data-driven strategies.' }
        ],
        faqs: [
          { question: 'Do I need a tech background?', answer: 'Not at all! Digital Marketing is perfect for creative and analytical minds from any background.' },
          { question: 'Are certifications included?', answer: 'Yes, you will be prepared for and receive multiple industry-recognized certifications.' }
        ]
      }
    }
  ];

  for (const cat of categories) {
    const existing = await Category.findOne({ where: { slug: cat.slug } });
    if (existing) {
      await existing.update({
        name: cat.name,
        icon: cat.icon,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        content: JSON.stringify(cat.content)
      });
      console.log('Updated existing category:', cat.name);
    } else {
      await Category.create({
        id: uuidv4(),
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        content: JSON.stringify(cat.content)
      });
      console.log('Created new category:', cat.name);
    }
  }

  // ============================================
  // 2. SEED ADVANCED PACKAGES
  // ============================================
  const mernPackage = {
    id: uuidv4(),
    title: 'Full Stack MERN Developer Program with AI',
    slug: 'full-stack-mern-developer-program-with-ai',
    description: 'Become a job-ready junior full-stack developer in 12 weeks. Learn HTML, CSS, JavaScript, React, Node.js, Express.js and MongoDB, then build and deploy one complete AI-powered MERN application with mentor guidance.',
    category: 'MERN Stack Developer', // matches the live category name
    price: 35000,
    status: 'PUBLISHED' as const,
    mode: 'BOTH' as const,
    highlights: [
      { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
      { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia\'s working labs.' },
      { title: 'Real Project Experience', description: 'Build your capstone from live client and in-house projects Flymedia is working on.' },
      { title: 'AI Integration', description: 'Add AI-powered features to your app using modern AI tools and APIs.' }
    ],
    skills: [
      'Full Stack MERN Development', 'Responsive Front-End Design', 'Modern JavaScript (ES6+)',
      'Advanced React Development', 'State Management with Redux Toolkit', 'Backend Development with Node.js and Express.js',
      'REST API Design', 'Database Modelling with MongoDB', 'Secure Authentication and Protected Routes',
      'AI Integration in Web Applications', 'Cloud Deployment', 'Git and GitHub Workflow'
    ],
    techStack: [
      'HTML5', 'CSS3', 'Bootstrap', 'JavaScript', 'React.js', 'React Router', 'Redux Toolkit',
      'Node.js', 'Express.js', 'MongoDB Atlas', 'REST APIs', 'Git & GitHub', 'AI/LLM APIs'
    ],
    projectDetails: {
      description: 'One capstone, built end to end. Instead of many small builds, you\'ll work on a single AI-powered MERN application throughout the program. In Week 1, your mentor will pick the project with you from the real client and in-house work Flymedia currently has. By Week 12, you\'ll have a deployed, working product to show employers.',
      stages: [
        { title: 'Front-End Foundations', content: 'Responsive pages and forms' },
        { title: 'JavaScript', content: 'Interactive features and API calls' },
        { title: 'React', content: 'Component-based user interface, routing, state' },
        { title: 'Node.js and Express', content: 'Backend, REST APIs, authentication' },
        { title: 'MongoDB and AI', content: 'Database, AI features, cloud deployment' }
      ]
    },
    courseModules: [
      {
        title: 'Stage 1: Front-End Foundations (Weeks 1-2)',
        topics: [
          'HTML5 structure, semantic elements, forms, and accessibility basics',
          'CSS selectors, box model, Flexbox, Grid, and animations',
          'Responsive design with media queries',
          'Bootstrap grid, components, navigation, and forms'
        ]
      },
      {
        title: 'Stage 2: JavaScript (Weeks 3-5)',
        topics: [
          'Variables, data types, loops, functions, and error handling',
          'Arrays, objects, Maps, Sets, destructuring, and spread/rest',
          'Scope, closures, prototypes, and classes',
          'DOM manipulation and event handling',
          'Callbacks, Promises, and async/await'
        ]
      },
      {
        title: 'Stage 3: React (Weeks 6-8)',
        topics: [
          'Components, JSX, props, and conditional rendering',
          'Hooks: useState, useEffect, useRef',
          'Context API and useReducer',
          'React Router, authentication flow, and protected routes',
          'Redux Toolkit and performance optimisation'
        ]
      },
      {
        title: 'Stage 4: Node.js, Express.js and REST APIs (Weeks 9-10)',
        topics: [
          'Node.js fundamentals, npm, and file handling',
          'Building REST APIs with Express.js',
          'MVC architecture, middleware, and routing',
          'Authentication, validation, error handling, and pagination'
        ]
      },
      {
        title: 'Stage 5: MongoDB, AI Integration and Deployment (Weeks 11-12)',
        topics: [
          'MongoDB Atlas, CRUD operations, and aggregation',
          'Connecting React, Express, and MongoDB',
          'Integrating AI-powered features into your app',
          'Deploying your application to the cloud'
        ]
      }
    ],
    targetAudience: {
      list: [
        'Students and fresh graduates (BCA, MCA, B.Tech, M.Tech, or any stream)',
        'Career switchers moving into tech',
        'Working professionals upskilling to full-stack',
        'Freelancers and aspiring founders'
      ],
      prerequisites: 'Basic computer literacy and a willingness to code regularly. No prior programming experience required.'
    },
    faqs: [
      { question: 'What is the MERN stack?', answer: 'MERN stands for MongoDB, Express.js, React, and Node.js. Together they let you build complete web applications, from the user interface to the server and database, using JavaScript throughout.' },
      { question: 'Is this course suitable for beginners?', answer: 'Yes. The program starts from HTML and CSS and builds up step by step. Prior coding experience helps but isn\'t required.' },
      { question: 'How long is the program, and how much time do I need?', answer: '12 weeks, with 15-20 hours per week including classes and hands-on practice.' },
      { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, project, and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia\'s labs in Ludhiana.' }
    ]
  };

  const dmPackage = {
    id: uuidv4(),
    title: '6-Month Digital Marketing Master Course with AI',
    slug: '6-month-digital-marketing-master-course-with-ai',
    description: 'Become a job-ready digital marketer in 6 months. Learn SEO, Google Ads, social media, content and email marketing, plus the AI tools that speed up modern marketing work, then put it all to work on real projects with mentor guidance.',
    category: 'Digital Marketing', // matches the live category name
    price: 30000,
    status: 'PUBLISHED' as const,
    mode: 'BOTH' as const,
    highlights: [
      { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
      { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia\'s working labs.' },
      { title: 'Real Project Experience', description: 'Practise on live client and in-house projects from Flymedia, a digital marketing company working with clients in India and abroad.' },
      { title: 'AI Integration', description: 'Use AI tools to research, write, design and automate faster in your marketing work.' }
    ],
    skills: [
      'Search Engine Optimization (On-Page, Off-Page and Technical SEO)',
      'Local SEO and Google Maps Optimization',
      'Keyword Research and Competitor Analysis',
      'Social Media Marketing and Optimization',
      'Google Ads (PPC) Campaigns',
      'Content Marketing and Content Writing'
    ],
    techStack: [
      'Google Search', 'Google Ads', 'Google Business Profile and Maps', 'Social Media Platforms',
      'Email Marketing Tools', 'Analytics and Reporting Tools', 'ChatGPT', 'Gemini'
    ],
    projectDetails: {
      description: 'A mix of real projects, built step by step. Throughout the program you\'ll work on a mix of different projects.',
      stages: [
        { title: 'Search Foundations', content: 'Keyword research, competitor analysis, website audit, technical SEO fixes' },
        { title: 'Local Visibility', content: 'Local SEO and Google Business Profile optimization' },
        { title: 'Social and Content', content: 'Social media plans, content pieces, email campaigns' },
        { title: 'Paid and Reporting', content: 'Google Ads campaign, analytics and performance reports' }
      ]
    },
    courseModules: [
      {
        title: 'Stage 1: Search Foundations',
        topics: [
          'Search Engine Optimization (SEO)',
          'Keyword Research & Competitor Analysis',
          'Technical SEO',
          'Website Audit & Optimization'
        ]
      },
      {
        title: 'Stage 2: Local Visibility',
        topics: [
          'Local SEO',
          'Google Business Profile & Maps Optimization'
        ]
      }
    ],
    targetAudience: {
      list: [
        'Students and fresh graduates (any stream)',
        'Career switchers moving into digital marketing',
        'Working professionals upskilling',
        'Business owners who want to market their own business'
      ],
      prerequisites: 'Basic computer literacy and a willingness to practise regularly. No prior marketing or coding experience required.'
    },
    faqs: [
      { question: 'What is digital marketing?', answer: 'Digital marketing is promoting a business, product or service through digital channels such as search engines, social media, email and websites.' },
      { question: 'Do I need coding?', answer: 'No. You don\'t need any coding or technical background to join.' }
    ]
  };

  const [mPkg, createdM] = await Package.findOrCreate({
    where: { slug: mernPackage.slug },
    defaults: mernPackage
  });
  if (!createdM) await mPkg.update(mernPackage);
  console.log('Updated/Seeded MERN Package');

  const [dPkg, createdD] = await Package.findOrCreate({
    where: { slug: dmPackage.slug },
    defaults: dmPackage
  });
  if (!createdD) await dPkg.update(dmPackage);
  console.log('Updated/Seeded Digital Marketing Package');

  console.log('Done.');
  process.exit(0);
}

seed().catch(console.error);
