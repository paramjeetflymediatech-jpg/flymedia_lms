import { Package } from '../src/db/models';
import { sequelize } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to database.');

  // 1. MERN Stack Package
  const mernPackage = {
    id: uuidv4(),
    title: 'Full Stack MERN Developer Program with AI',
    slug: 'full-stack-mern-developer-program-with-ai',
    description: 'Become a job-ready junior full-stack developer in 12 weeks. Learn HTML, CSS, JavaScript, React, Node.js, Express.js and MongoDB, then build and deploy one complete AI-powered MERN application with mentor guidance.',
    category: 'MERN Stack Development',
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
      { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, project, and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia\'s labs in Ludhiana.' },
      { question: 'What project will I build?', answer: 'You\'ll build one AI-powered MERN application. Your mentor will finalise it with you in Week 1, based on the real projects Flymedia is currently working on.' },
      { question: 'Will I learn JavaScript before React?', answer: 'Yes. Three weeks are dedicated to JavaScript, including ES6+, closures, the DOM, and async programming, before you start React.' },
      { question: 'Will I learn to deploy my app?', answer: 'Yes. You\'ll deploy your finished application to the cloud so it\'s live and shareable.' },
      { question: 'How is AI used in the course?', answer: 'You\'ll integrate AI features into your project using AI/LLM APIs, so your final app goes beyond a standard CRUD application.' },
      { question: 'What is the fee?', answer: 'The fee is ₹35,000 for both Live Online and In-House modes.' }
    ]
  };

  // 2. Digital Marketing Package
  const dmPackage = {
    id: uuidv4(),
    title: '6-Month Digital Marketing Master Course with AI',
    slug: '6-month-digital-marketing-master-course-with-ai',
    description: 'Become a job-ready digital marketer in 6 months. Learn SEO, Google Ads, social media, content and email marketing, plus the AI tools that speed up modern marketing work, then put it all to work on real projects with mentor guidance.',
    category: 'Digital Marketing',
    price: 30000,
    status: 'PUBLISHED' as const,
    mode: 'BOTH' as const,
    highlights: [
      { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
      { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia\'s working labs.' },
      { title: 'Real Project Experience', description: 'Practise on live client and in-house projects from Flymedia, a digital marketing company working with clients in India and abroad.' },
      { title: 'AI Integration', description: 'Use AI tools to research, write, design and automate faster in your marketing work.' },
      { title: '14 Practical Modules', description: 'From SEO and Google Ads to email marketing, reporting and AI tools.' },
      { title: 'Certification', description: 'Included in the course fee.' }
    ],
    skills: [
      'Search Engine Optimization (On-Page, Off-Page and Technical SEO)',
      'Local SEO and Google Maps Optimization',
      'Keyword Research and Competitor Analysis',
      'Website Audits and Optimization',
      'Social Media Marketing and Optimization',
      'Google Ads (PPC) Campaigns',
      'Content Marketing and Content Writing',
      'Email Marketing',
      'Analytics and Reporting',
      'AI Tools for Marketing: Content, Creatives, Research and Automation'
    ],
    techStack: [
      'Google Search', 'Google Ads', 'Google Business Profile and Maps', 'Social Media Platforms',
      'Email Marketing Tools', 'Analytics and Reporting Tools', 'ChatGPT', 'Gemini'
    ],
    projectDetails: {
      description: 'A mix of real projects, built step by step. Throughout the program you\'ll work on a mix of different projects, from website audits and keyword research to social media plans, ad campaigns, email campaigns and AI-assisted content. Your mentor will help you pick projects from the real client and in-house work Flymedia currently handles. By Month 6, you\'ll have a collection of finished work and reports to show employers and clients.',
      stages: [
        { title: 'Search Foundations', content: 'Keyword research, competitor analysis, website audit, technical SEO fixes' },
        { title: 'Local Visibility', content: 'Local SEO and Google Business Profile optimization' },
        { title: 'Social and Content', content: 'Social media plans, content pieces, email campaigns' },
        { title: 'AI for Marketing', content: 'AI-assisted content, creatives and workflow automation' },
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
      },
      {
        title: 'Stage 3: Social Media and Content',
        topics: [
          'Social Media Marketing (SMM)',
          'Social Media Optimization (SMO)',
          'Content Marketing',
          'Content Writing',
          'Email Marketing'
        ]
      },
      {
        title: 'Stage 4: Paid Ads and Reporting',
        topics: [
          'Google Ads (PPC)',
          'Analytics & Reporting'
        ]
      },
      {
        title: 'Stage 5: AI for Marketing',
        topics: [
          'AI Tools for Marketing',
          'AI-Assisted Content and Creatives',
          'Workflow Automation with AI'
        ]
      }
    ],
    targetAudience: {
      list: [
        'Students and fresh graduates (any stream)',
        'Career switchers moving into digital marketing',
        'Working professionals upskilling',
        'Business owners who want to market their own business',
        'Freelancers and aspiring entrepreneurs'
      ],
      prerequisites: 'Basic computer literacy and a willingness to practise regularly. No prior marketing or coding experience required.'
    },
    faqs: [
      { question: 'What is digital marketing?', answer: 'Digital marketing is promoting a business, product or service through digital channels such as search engines, social media, email and websites.' },
      { question: 'Is this course suitable for beginners?', answer: 'Yes. The program starts from the basics and builds up step by step to full campaigns. Prior marketing experience isn\'t required.' },
      { question: 'Do I need coding?', answer: 'No. You don\'t need any coding or technical background to join.' },
      { question: 'How long is the program?', answer: '6 months.' },
      { question: 'Are the classes live?', answer: 'Yes. All classes are live and instructor-led. You can attend online or in person at Flymedia\'s labs in Ludhiana.' },
      { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, projects and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia\'s labs in Ludhiana.' },
      { question: 'What will I learn?', answer: 'SEO, local SEO, Google Business Profile and Maps, technical SEO, website audits, keyword research, social media marketing and optimization, Google Ads, content marketing and writing, email marketing, analytics and reporting, and how to use AI tools in your marketing work.' },
      { question: 'What projects will I work on?', answer: 'You\'ll work on a mix of projects, including website audits, keyword research, social media plans, ad campaigns, email campaigns and AI-assisted content. Your mentor will guide your project choices in the first month.' },
      { question: 'How is AI used in the course?', answer: 'You\'ll learn AI tools such as ChatGPT and Gemini and use them to research, write, design and automate parts of your marketing work, so you can deliver better results in less time.' },
      { question: 'Will I get a certificate?', answer: 'Yes. Certification is included in the course fee.' },
      { question: 'What is the fee?', answer: 'The fee is ₹30,000 for both Live Online and In-House modes.' }
    ]
  };

  // Check if they exist, else create them
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

  process.exit(0);
}

seed().catch(console.error);
