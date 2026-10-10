import { NextResponse } from 'next/server';
import { sequelize } from '../../../src/db/index';
import { Package } from '../../../src/db/models';

const packagesToSeed = [
  {
    title: '6-Month Graphic Designing Master Course',
    slug: '6-month-graphic-designing-master-course',
    description: '<p>Become a job-ready graphic designer in 6 months. Learn Photoshop, Illustrator and Canva Pro, then build a complete professional portfolio with mentor guidance.</p>',
    category: 'graphic-design',
    price: 35000,
    status: 'PUBLISHED',
    mode: 'BOTH',
    level: 'Beginner-friendly',
    whatYoullLearn: [
      'Image Editing and Retouching with Photoshop',
      'Vector Illustration with Illustrator',
      'Quick Design with Canva Pro',
      'Branding and Corporate Identity',
      'Logo Design',
      'Social Media Creative Design',
      'Print Design: Brochures, Flyers and Catalogues',
      'Packaging Design',
      'UI Design Fundamentals',
      'Portfolio Development'
    ],
    techStack: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva Pro'],
    courseModules: [
      {
        title: 'Stage 1: Design Tools',
        topics: [
          'Adobe Photoshop',
          'Adobe Illustrator',
          'Canva Pro Tools'
        ]
      },
      {
        title: 'Stage 2: Brand Identity',
        topics: [
          'Branding and Corporate Identity',
          'Logo Design Mastery'
        ]
      },
      {
        title: 'Stage 3: Print and Packaging',
        topics: [
          'Brochure, Flyer and Catalogue Design',
          'Packaging Design'
        ]
      },
      {
        title: 'Stage 4: Digital Design',
        topics: [
          'Social Media Creative Design',
          'UI Design Fundamentals'
        ]
      },
      {
        title: 'Stage 5: Portfolio',
        topics: [
          'Portfolio Development'
        ]
      }
    ],
    targetAudience: {
      list: [
        'Students and fresh graduates (any stream)',
        'Career switchers moving into design',
        'Working professionals upskilling',
        'Freelancers and aspiring entrepreneurs'
      ],
      prerequisites: 'Basic computer literacy and a willingness to practise regularly. No prior design experience required.'
    },
    faqs: [
      { question: 'Is this course suitable for beginners?', answer: "Yes. The program starts with the design tools and builds up step by step to full brand projects. Prior design experience isn't required." },
      { question: 'How long is the program?', answer: '6 months.' },
      { question: 'What are the class timings?', answer: 'Timings are discussed on a call with our admissions team, so we can find a schedule that suits you. Call +91 78144 08934 to talk it through.' },
      { question: 'Are the classes live?', answer: "Yes. All classes are live and instructor-led. You can attend online or in person at Flymedia's labs in Ludhiana." },
      { question: 'What is the difference between Live Online and In-House?', answer: "The curriculum, projects and fee are the same. Live Online lets you attend from anywhere. In-House means learning in person at Flymedia's labs in Ludhiana." },
      { question: 'Which software will I learn?', answer: 'Adobe Photoshop, Adobe Illustrator and Canva Pro.' },
      { question: 'What will I build?', answer: "You'll build a complete professional portfolio, including logos, brand identity, social media creatives, print material, packaging and UI screens. Your mentor will guide your project choices in the first month." },
      { question: 'Will I get a certificate?', answer: 'Yes. Certification is included in the course fee.' },
      { question: 'What is the fee?', answer: 'The fee is ₹35,000 for both Live Online and In-House modes.' }
    ]
  },
  {
    title: 'Web Development Course',
    slug: 'web-development-course-2-months',
    description: '<p>The Web Development Course is designed for students, freshers, and beginners who want to build practical skills in website development. The training covers HTML, CSS, Responsive Web Design, WordPress, Elementor, WooCommerce, and live website projects.</p>',
    category: 'web-development',
    price: 20000,
    status: 'PUBLISHED',
    mode: 'BOTH',
    level: 'Beginner',
    whatYoullLearn: [
      'Learn Front-End Web Development from Basics',
      'Work on Real-Time Projects',
      'Learn to Build Responsive Websites',
      'Work-from-Office Industry Exposure',
      'Build Projects for Your Portfolio'
    ],
    techStack: ['HTML', 'CSS', 'WordPress', 'Elementor', 'WooCommerce'],
    courseModules: [
      {
        title: 'HTML',
        topics: [
          'Website structure and fundamentals',
          'HTML tags and elements',
          'Forms and tables',
          'Images, links, and multimedia',
          'Creating web pages from scratch'
        ]
      },
      {
        title: 'CSS',
        topics: [
          'Website styling and layouts',
          'Colors, fonts, and spacing',
          'Borders and backgrounds',
          'Flexbox basics',
          'Creating attractive web page designs'
        ]
      },
      {
        title: 'Responsive Web Design',
        topics: [
          'Mobile-friendly website design',
          'Responsive layouts',
          'Media queries',
          'Designing websites for different screen sizes'
        ]
      },
      {
        title: 'Practical Projects',
        topics: [
          'Create responsive web pages',
          'Build a complete business website',
          'Work on live/practical website projects',
          'Practice website design and development'
        ]
      }
    ],
    faqs: []
  },
  {
    title: 'Web Development with WordPress',
    slug: 'web-development-with-wordpress-6-months',
    description: '<p>This 6-month practical Web Development program is designed for students and freshers who want to learn both Front-End and Back-End Web Development, with a strong focus on WordPress website development. Students will learn how to design, develop, customize, manage, and maintain professional websites through practical training and live projects.</p>',
    category: 'web-development',
    price: 60000,
    status: 'PUBLISHED',
    mode: 'BOTH',
    level: 'Beginner to Advanced',
    whatYoullLearn: [
      'Front-End + Back-End Training',
      'Special Focus on WordPress',
      'Real-Time Website Projects',
      'Learn to Build Business & E-Commerce Websites',
      'Domain, Hosting & cPanel Knowledge',
      'WordPress Website Management & Troubleshooting'
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'PHP', 'WooCommerce', 'cPanel'],
    courseModules: [
      {
        title: '1. Front-End Web Development',
        topics: [
          'HTML',
          'CSS',
          'Basic JavaScript',
          'Website structure and layouts',
          'Responsive web design',
          'Mobile-friendly websites',
          'Flexbox and basic responsive techniques'
        ]
      },
      {
        title: '2. Back-End & WordPress Management',
        topics: [
          'WordPress database basics',
          'Hosting and cPanel basics',
          'Website migration',
          'Backup and restoration',
          'Plugin and theme management',
          'Troubleshooting common website issues',
          'Basic PHP concepts for WordPress',
          'Understanding WordPress structure and functionality'
        ]
      },
      {
        title: '3. E-Commerce Website Development',
        topics: [
          'WooCommerce setup',
          'Product management',
          'Categories and variations',
          'Cart and checkout',
          'Payment gateway basics',
          'Shipping settings',
          'Creating and managing online stores'
        ]
      },
      {
        title: '4. Live Projects',
        topics: [
          'Business Websites',
          'Service-Based Websites',
          'Portfolio Websites',
          'E-Commerce Websites',
          'WordPress Customization Projects'
        ]
      }
    ],
    faqs: []
  }
];

export async function GET() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    for (const pkg of packagesToSeed) {
      const existing = await Package.findOne({ where: { slug: pkg.slug } });
      if (existing) {
        await existing.update(pkg as any);
        console.log(`Updated package: ${pkg.slug}`);
      } else {
        await Package.create(pkg as any);
        console.log(`Created package: ${pkg.slug}`);
      }
    }

    return NextResponse.json({ success: true, message: 'Packages seeded successfully' });
  } catch (error: any) {
    console.error('Seeding packages error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
