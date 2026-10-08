import { Package } from '../src/db/models';
const mernPackage = {
  title: 'Full Stack MERN Developer Program with AI',
  slug: 'full-stack-mern-developer-program-with-ai',
  description: '<p>Become a job-ready junior full-stack developer in 12 weeks. Learn HTML, CSS, JavaScript, React, Node.js, Express.js and MongoDB, then build and deploy one complete AI-powered MERN application with mentor guidance.</p>',
  category: 'Developement',
  price: 35000,
  status: 'PUBLISHED',
  mode: 'BOTH',
  thumbnail: '/uploads/packages/1791443941844-Screenshot2026-08-22175920.png',
  
  highlights: [
    { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
    { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia working labs.' },
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
    description: 'One capstone, built end to end. Instead of many small builds, you will work on a single AI-powered MERN application throughout the program. In Week 1, your mentor will pick the project with you from the real client and in-house work Flymedia currently has. By Week 12, you will have a deployed, working product to show employers.',
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
    prerequisites: 'Basic computer literacy and a willingness to code regularly. No prior programming experience required.',
    list: [
      'Students and fresh graduates (BCA, MCA, B.Tech, M.Tech, or any stream)',
      'Career switchers moving into tech',
      'Working professionals upskilling to full-stack',
      'Freelancers and aspiring founders'
    ]
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
  ],
  
  certificateData: {
    title: 'Flymedia Full Stack MERN Training Completion Certificate',
    features: [
      { title: 'Boost Your Resume', body: 'Stand out from the crowd with a verified training completion.' },
      { title: 'Add Credibility', body: 'Earn certification from a brand trusted by industry professionals.' },
      { title: 'Great for Placements', body: 'Makes you a stronger candidate in technical interviews.' }
    ],
    providers: [
      { name: 'Flymedia Technology', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop' },
      { name: 'Google Certificate', image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=1200&auto=format&fit=crop' }
    ]
  }
};

async function seed() {
  console.log('Seeding MERN Course...');
  // check if exists
  const exists = await Package.findOne({ where: { slug: mernPackage.slug } });
  if (exists) {
    await exists.update(mernPackage as any);
    console.log('Updated existing MERN course!');
  } else {
    await Package.create(mernPackage as any);
    console.log('Created new MERN course!');
  }
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
