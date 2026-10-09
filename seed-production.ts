import { Package, Category } from './src/db/models';
import { sequelize } from './src/db';

async function seedProduction() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected. Starting production seed...');

    // First ensure the categories exist
    await Category.findOrCreate({ where: { slug: 'web-development' }, defaults: { name: 'Web Development', slug: 'web-development', icon: '' } });
    await Category.findOrCreate({ where: { slug: 'digital-marketing' }, defaults: { name: 'Digital Marketing', slug: 'digital-marketing', icon: '' } });
    await Category.findOrCreate({ where: { slug: 'graphic-designing' }, defaults: { name: 'Graphic Designing', slug: 'graphic-designing', icon: '' } });

    // 1. MERN Stack
    let mern = await Package.findOne({ where: { slug: 'mern-stack-development' } });
    if (!mern) mern = await Package.create({ title: 'Full Stack MERN Developer Program with AI', slug: 'mern-stack-development', description: '', status: 'PUBLISHED', category: 'Web Development' });
    
    await mern.update({
      title: 'Full Stack MERN Developer Program with AI',
      description: `<p>Become a job-ready junior full-stack developer in 12 weeks. Learn HTML, CSS, JavaScript, React, Node.js, Express.js and MongoDB, then build and deploy one complete AI-powered MERN application with mentor guidance.</p>`,
      price: 35000,
      status: 'PUBLISHED',
      category: 'Web Development',
      highlights: [
        { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
        { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia working labs.' },
        { title: 'Real Project Experience', description: 'Build your capstone from live client and in-house projects Flymedia is working on.' },
        { title: 'AI Integration', description: 'Add AI-powered features to your app using modern AI tools and APIs.' }
      ],
      skills: [
        'Full Stack MERN Development',
        'Responsive Front-End Design',
        'Modern JavaScript (ES6+)',
        'Advanced React Development',
        'State Management with Redux Toolkit',
        'Backend Development with Node.js and Express.js',
        'REST API Design',
        'Database Modelling with MongoDB',
        'Secure Authentication and Protected Routes',
        'AI Integration in Web Applications',
        'Cloud Deployment',
        'Git and GitHub Workflow'
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
        { question: 'Is this course suitable for beginners?', answer: "Yes. The program starts from HTML and CSS and builds up step by step. Prior coding experience helps but isn't required." },
        { question: 'How long is the program, and how much time do I need?', answer: '12 weeks, with 15-20 hours per week including classes and hands-on practice.' },
        { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, project, and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia labs in Ludhiana.' },
        { question: 'What project will I build?', answer: 'You will build one AI-powered MERN application. Your mentor will finalise it with you in Week 1, based on the real projects Flymedia is currently working on.' },
        { question: 'Will I learn JavaScript before React?', answer: 'Yes. Three weeks are dedicated to JavaScript, including ES6+, closures, the DOM, and async programming, before you start React.' },
        { question: 'Will I learn to deploy my app?', answer: 'Yes. You will deploy your finished application to the cloud so it is live and shareable.' },
        { question: 'How is AI used in the course?', answer: 'You will integrate AI features into your project using AI/LLM APIs, so your final app goes beyond a standard CRUD application.' },
        { question: 'What is the fee?', answer: 'The fee is ₹35,000 for both Live Online and In-House modes.' },
        { question: 'How do I enroll or ask questions?', answer: 'Call +91 78144 08934, +91 87279 09176, or +91 98723 61357, or email admissions@flymediatech.com.' }
      ],
      courseModules: [
        { title: 'Stage 1: Front-End Foundations (Weeks 1-2)', topics: ['HTML5 structure, semantic elements, forms, and accessibility basics', 'CSS selectors, box model, Flexbox, Grid, and animations', 'Responsive design with media queries', 'Bootstrap grid, components, navigation, and forms'] },
        { title: 'Stage 2: JavaScript (Weeks 3-5)', topics: ['Variables, data types, loops, functions, and error handling', 'Arrays, objects, Maps, Sets, destructuring, and spread/rest', 'Scope, closures, prototypes, and classes', 'DOM manipulation and event handling', 'Callbacks, Promises, and async/await'] },
        { title: 'Stage 3: React (Weeks 6-8)', topics: ['Components, JSX, props, and conditional rendering', 'Hooks: useState, useEffect, useRef', 'Context API and useReducer', 'React Router, authentication flow, and protected routes', 'Redux Toolkit and performance optimisation'] },
        { title: 'Stage 4: Node.js, Express.js and REST APIs (Weeks 9-10)', topics: ['Node.js fundamentals, npm, and file handling', 'Building REST APIs with Express.js', 'MVC architecture, middleware, and routing', 'Authentication, validation, error handling, and pagination'] },
        { title: 'Stage 5: MongoDB, AI Integration and Deployment (Weeks 11-12)', topics: ['MongoDB Atlas, CRUD operations, and aggregation', 'Connecting React, Express, and MongoDB', 'Integrating AI-powered features into your app', 'Deploying your application to the cloud'] }
      ]
    });
    console.log('MERN done');

    // 2. Digital Marketing
    let dm = await Package.findOne({ where: { slug: 'digital-marketing-course' } });
    if (!dm) dm = await Package.create({ title: '6-Month Digital Marketing Master Course with AI', slug: 'digital-marketing-course', description: '', status: 'PUBLISHED', category: 'Digital Marketing' });

    await dm.update({
      title: '6-Month Digital Marketing Master Course with AI',
      description: `<p>Become a job-ready digital marketer in 6 months. Learn SEO, Google Ads, social media, content and email marketing, plus the AI tools that speed up modern marketing work, then put it all to work on real projects with mentor guidance.</p>
      <h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">Career Roles You Can Target</h3>
      <ul class="list-disc pl-5 space-y-2 mb-6">
        <li>Digital Marketing Executive</li>
        <li>SEO Executive</li>
        <li>Local SEO Specialist</li>
        <li>Social Media Executive</li>
        <li>Google Ads (PPC) Executive</li>
        <li>Content Marketer</li>
        <li>Email Marketing Executive</li>
        <li>Freelance Digital Marketer</li>
      </ul>`,
      price: 30000,
      status: 'PUBLISHED',
      category: 'Digital Marketing',
      highlights: [
        { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
        { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia working labs.' },
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
        'Email Marketing Tools', 'Analytics and Reporting Tools', 'AI Tools such as ChatGPT and Gemini'
      ],
      projectDetails: {
        description: 'A mix of real projects, built step by step. Throughout the program you will work on a mix of different projects, from website audits and keyword research to social media plans, ad campaigns, email campaigns and AI-assisted content. Your mentor will help you pick projects from the real client and in-house work Flymedia currently handles. By Month 6, you will have a collection of finished work and reports to show employers and clients.',
        stages: [
          { title: 'Search Foundations', content: 'Keyword research, competitor analysis, website audit, technical SEO fixes' },
          { title: 'Local Visibility', content: 'Local SEO and Google Business Profile optimization' },
          { title: 'Social and Content', content: 'Social media plans, content pieces, email campaigns' },
          { title: 'AI for Marketing', content: 'AI-assisted content, creatives and workflow automation' },
          { title: 'Paid and Reporting', content: 'Google Ads campaign, analytics and performance reports' }
        ]
      },
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
        { question: 'Is this course suitable for beginners?', answer: "Yes. The program starts from the basics and builds up step by step to full campaigns. Prior marketing experience isn't required." },
        { question: 'Do I need coding?', answer: "No. You don't need any coding or technical background to join." },
        { question: 'How long is the program?', answer: '6 months.' },
        { question: 'What are the class timings?', answer: 'Timings are discussed on a call with our admissions team, so we can find a schedule that suits you. Call +91 78144 08934 to talk it through.' },
        { question: 'Are the classes live?', answer: 'Yes. All classes are live and instructor-led. You can attend online or in person at Flymedia labs in Ludhiana.' },
        { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, projects and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia labs in Ludhiana.' },
        { question: 'What will I learn?', answer: "SEO, local SEO, Google Business Profile and Maps, technical SEO, website audits, keyword research, social media marketing and optimization, Google Ads, content marketing and writing, email marketing, analytics and reporting, and how to use AI tools in your marketing work." },
        { question: 'What projects will I work on?', answer: "You'll work on a mix of projects, including website audits, keyword research, social media plans, ad campaigns, email campaigns and AI-assisted content. Your mentor will guide your project choices in the first month." },
        { question: 'How is AI used in the course?', answer: "You'll learn AI tools such as ChatGPT and Gemini and use them to research, write, design and automate parts of your marketing work, so you can deliver better results in less time." },
        { question: 'Will I get a certificate?', answer: 'Yes. Certification is included in the course fee.' },
        { question: 'What is the fee?', answer: 'The fee is ₹30,000 for both Live Online and In-House modes.' },
        { question: 'How do I enroll or ask questions?', answer: 'Call +91 78144 08934, +91 87279 09176, or +91 98723 61357, or email admissions@flymediatech.com.' }
      ],
      courseModules: [
        { title: 'Stage 1: Search Foundations', topics: ['Search Engine Optimization (SEO)', 'Keyword Research & Competitor Analysis', 'Technical SEO', 'Website Audit & Optimization'] },
        { title: 'Stage 2: Local Visibility', topics: ['Local SEO', 'Google Business Profile & Maps Optimization'] },
        { title: 'Stage 3: Social Media and Content', topics: ['Social Media Marketing (SMM)', 'Social Media Optimization (SMO)', 'Content Marketing', 'Content Writing', 'Email Marketing'] },
        { title: 'Stage 4: Paid Ads and Reporting', topics: ['Google Ads (PPC)', 'Analytics & Reporting'] },
        { title: 'Stage 5: AI for Marketing', topics: ['AI Tools for Marketing', 'AI-Assisted Content and Creatives', 'Workflow Automation with AI'] }
      ]
    });
    console.log('DM done');

    // 3. Video Editing
    let video = await Package.findOne({ where: { slug: 'video-editing-course' } });
    if (!video) video = await Package.create({ title: '6-Month Video Editing Master Course with AI', slug: 'video-editing-course', description: '', status: 'PUBLISHED', category: 'Graphic Designing' });

    await video.update({
      title: '6-Month Video Editing Master Course with AI',
      description: `<p>Become a job-ready video editor in 6 months. Learn Premiere Pro, After Effects, Audition, Photoshop and DaVinci Resolve, plus AI tools that speed up your editing workflow, then put it all to work on real projects with mentor guidance.</p>
      <h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">Career Roles You Can Target</h3>
      <ul class="list-disc pl-5 space-y-2 mb-6">
        <li>Video Editor</li>
        <li>Colourist</li>
        <li>Motion Graphics Artist</li>
        <li>Post-Production Assistant</li>
        <li>YouTube and Social Media Video Editor</li>
        <li>Film and TV Production Assistant</li>
        <li>Advertising and Marketing Video Creator</li>
        <li>Freelance Video Editor</li>
      </ul>`,
      price: 40000,
      status: 'PUBLISHED',
      category: 'Graphic Designing',
      highlights: [
        { title: 'Live Instructor-Led Classes', description: 'Learn from mentors in real time and get doubts solved on the spot.' },
        { title: 'Two Ways to Learn', description: 'Join online from anywhere, or learn in person at Flymedia working labs.' },
        { title: 'Real Project Experience', description: 'Edit live client and in-house video projects from Flymedia.' },
        { title: 'Industry-Standard Software', description: 'Premiere Pro, After Effects, Audition, Photoshop and DaVinci Resolve.' },
        { title: 'AI Integration', description: 'Use modern AI tools to speed up editing, audio and creative work.' },
        { title: 'Certification', description: 'Included in the course fee.' }
      ],
      skills: [
        'Professional Video Editing with Timeline-Based Tools',
        'Transitions, Effects and Titles',
        'Multi-Camera Editing and Audio Sync',
        'Audio Cleanup, Voiceover and Sound Mixing',
        'Motion Graphics and Animated Titles',
        'Green Screen Keying and Motion Tracking',
        'Colour Correction and Colour Grading',
        'Thumbnails, Posters and Title Graphics',
        'Exporting for YouTube, OTT and Social Media',
        'AI Tools for Video, Audio and Creative Work'
      ],
      techStack: [
        'Adobe Premiere Pro', 'Adobe After Effects', 'Adobe Audition', 'Adobe Photoshop', 'DaVinci Resolve',
        'Runway', 'ElevenLabs', 'Adobe Firefly', 'ChatGPT'
      ],
      projectDetails: {
        description: 'A mix of real projects, built step by step. Throughout the program you will work on a mix of different projects, from short-form social videos and YouTube edits to motion graphics intros, colour-graded sequences and voiceover work. Your mentor will help you pick projects from the real client and in-house work Flymedia currently handles. By Month 6, you will have a collection of finished videos and a showreel to show employers and clients.',
        stages: [
          { title: 'Editing and Audio', content: 'Timeline edits, multi-camera sequences, cleaned-up audio, voiceovers' },
          { title: 'Motion Graphics', content: 'Animated titles, logo animations, intros, green screen shots' },
          { title: 'Colour Grading', content: 'Graded sequences, stylised looks, final delivery exports' },
          { title: 'AI for Video', content: 'AI-assisted visuals, voice and workflow speed-ups' }
        ]
      },
      targetAudience: {
        list: [
          'Students and fresh graduates (any stream)',
          'Career switchers moving into video and media',
          'Working professionals upskilling',
          'YouTubers and content creators who want to edit their own videos',
          'Freelancers and aspiring entrepreneurs'
        ],
        prerequisites: 'Basic computer literacy and a willingness to practise regularly. No prior editing experience required.'
      },
      faqs: [
        { question: 'Is this course suitable for beginners?', answer: 'Yes. The program starts from the basics of editing and builds up step by step to motion graphics and colour grading. Prior editing experience is not required.' },
        { question: 'How long is the program?', answer: '6 months.' },
        { question: 'What are the class timings?', answer: 'Timings are discussed on a call with our admissions team, so we can find a schedule that suits you. Call +91 78144 08934 to talk it through.' },
        { question: 'Are the classes live?', answer: 'Yes. All classes are live and instructor-led. You can attend online or in person at Flymedia labs in Ludhiana.' },
        { question: 'What is the difference between Live Online and In-House?', answer: 'The curriculum, projects and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia labs in Ludhiana.' },
        { question: 'Which software will I learn?', answer: 'Adobe Premiere Pro, After Effects, Audition and Photoshop, plus DaVinci Resolve for colour grading, along with AI tools for video.' },
        { question: 'What projects will I work on?', answer: 'You will work on a mix of projects, including social videos, YouTube edits, motion graphics, voiceover work and colour-graded sequences. Your mentor will guide your project choices in the first month.' },
        { question: 'How is AI used in the course?', answer: 'You will learn AI tools such as Runway, ElevenLabs, Adobe Firefly and ChatGPT and use them to speed up visuals, voice and creative work.' },
        { question: 'Will I get a certificate?', answer: 'Yes. Certification is included in the course fee.' },
        { question: 'What is the fee?', answer: 'The fee is ₹40,000 for both Live Online and In-House modes.' },
        { question: 'How do I enroll or ask questions?', answer: 'Call +91 78144 08934, +91 87279 09176, or +91 98723 61357, or email admissions@flymediatech.com.' }
      ],
      courseModules: [
        { title: 'Stage 1: Video Editing and Audio Essentials', topics: ['Adobe Photoshop: thumbnails, posters, title graphics, lower-thirds and layered files for video', 'Adobe Premiere Pro: timeline editing, transitions, effects, titles, multi-camera editing, basic colour correction and export for YouTube and OTT', 'Adobe Audition: dialogue cleanup, voiceover recording, EQ and effects, multi-track mixing and audio export'] },
        { title: 'Stage 2: Motion Graphics and Compositing', topics: ['Adobe After Effects: animated text and titles, motion graphics, green screen keying, motion tracking, stabilisation, intros and logo animations'] },
        { title: 'Stage 3: Colour Grading and Final Delivery', topics: ['DaVinci Resolve: colour correction and grading, working with RAW, Log and HDR footage, scopes, masks, LUTs, stylised looks and final export'] },
        { title: 'Stage 4: AI for Video', topics: ['AI tools for video, voice and visuals', 'AI-assisted scripting and creative ideas', 'Speeding up your editing workflow with AI'] }
      ]
    });
    console.log('Video done');
    
    // 4. Graphic Design Course
    let gd = await Package.findOne({ where: { slug: 'graphic-design-course' } });
    if (!gd) gd = await Package.create({ title: 'Graphic Design Master Course', slug: 'graphic-design-course', description: '<p>Master graphic design with Adobe tools.</p>', status: 'PUBLISHED', category: 'Graphic Designing' });
    console.log('GD done');
    
    console.log('All packages updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
seedProduction();
