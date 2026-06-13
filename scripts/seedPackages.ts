import { Package } from '../src/db/models';
import { sequelize } from '../src/db/index';

const packages = [
  // 1. Digital Marketing Training Program
  {
    title: '2-Month SEO Professional Course',
    slug: '2-month-seo-professional-course',
    price: 15000,
    mode: 'ONLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>SEO Fundamentals</li>
  <li>On-Page SEO</li>
  <li>Off-Page SEO</li>
  <li>Profile Creation</li>
  <li>Social Bookmarking</li>
  <li>Classified Submission</li>
  <li>Directory Submission</li>
  <li>Link Building</li>
  <li>Content Writing for SEO</li>
  <li>Keyword Research</li>
  <li>Competitor Analysis</li>
  <li>Basic Technical SEO</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced SEO Course',
    slug: '3-month-advanced-seo-course',
    price: 20000,
    mode: 'ONLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced On-Page SEO</li>
  <li>Advanced Off-Page SEO</li>
  <li>Local SEO</li>
  <li>Google Maps Optimization</li>
  <li>Google Business Profile Management</li>
  <li>Technical SEO</li>
  <li>Website Audit</li>
  <li>Advanced Link Building Strategies</li>
  <li>Content Marketing</li>
  <li>SEO Reporting & Analytics</li>
  <li>Live Project Training</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Digital Marketing Master Course',
    slug: '6-month-digital-marketing-master-course',
    price: 30000,
    mode: 'ONLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Search Engine Optimization (SEO)</li>
  <li>Social Media Marketing (SMM)</li>
  <li>Social Media Optimization (SMO)</li>
  <li>Google Ads (PPC)</li>
  <li>Content Marketing</li>
  <li>Content Writing</li>
  <li>Email Marketing</li>
  <li>Local SEO</li>
  <li>Google Business Profile & Maps Optimization</li>
  <li>Technical SEO</li>
  <li>Website Audit & Optimization</li>
  <li>Keyword Research & Competitor Analysis</li>
  <li>Analytics & Reporting</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  },

  // 2. Social Media Marketing Training Program
  {
    title: '2-Month Social Media Marketing Course',
    slug: '2-month-social-media-marketing-course',
    price: 15000,
    mode: 'BOTH',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Social Media Marketing</li>
  <li>Facebook Marketing</li>
  <li>Instagram Marketing</li>
  <li>LinkedIn Marketing</li>
  <li>Content Planning</li>
  <li>Social Media Post Creation</li>
  <li>Hashtag Research</li>
  <li>Audience Engagement Strategies</li>
  <li>Social Media Tools</li>
  <li>Content Calendar Management</li>
  <li>Social Media Analytics Basics</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Social Media Marketing Course',
    slug: '3-month-advanced-social-media-marketing-course',
    price: 20000,
    mode: 'BOTH',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced Facebook Marketing</li>
  <li>Advanced Instagram Growth Strategies</li>
  <li>LinkedIn Marketing & Lead Generation</li>
  <li>Social Media Campaign Planning</li>
  <li>Community Management</li>
  <li>Social Media Copywriting</li>
  <li>Video Content Strategy</li>
  <li>Performance Tracking & Reporting</li>
  <li>Live Project Training</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Social Media Marketing Master Course',
    slug: '6-month-social-media-marketing-master-course',
    price: 30000,
    mode: 'BOTH',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Facebook Marketing</li>
  <li>Instagram Marketing</li>
  <li>LinkedIn Marketing</li>
  <li>YouTube Marketing</li>
  <li>Pinterest Marketing</li>
  <li>Content Strategy & Planning</li>
  <li>Reels & Short Video Marketing</li>
  <li>Brand Building</li>
  <li>Social Media Advertising</li>
  <li>Lead Generation Campaigns</li>
  <li>Social Media Analytics & Reporting</li>
  <li>AI Tools for Social Media Marketing</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80',
  },

  // 3. Content Writing Training Program
  {
    title: '2-Month Content Writing Course',
    slug: '2-month-content-writing-course',
    price: 15000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Content Writing</li>
  <li>Grammar & Sentence Structure</li>
  <li>Blog Writing</li>
  <li>Article Writing</li>
  <li>Website Content Writing</li>
  <li>Social Media Content Writing</li>
  <li>SEO Basics for Writers</li>
  <li>Keyword Research</li>
  <li>Content Formatting</li>
  <li>Proofreading & Editing</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead27d2?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Content Writing Course',
    slug: '3-month-advanced-content-writing-course',
    price: 20000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced Blog Writing</li>
  <li>SEO Content Writing</li>
  <li>Website Content Creation</li>
  <li>Landing Page Content</li>
  <li>Product Descriptions</li>
  <li>Copywriting Basics</li>
  <li>Social Media Content Strategy</li>
  <li>Content Research Techniques</li>
  <li>Content Optimization</li>
  <li>Content Editing & Proofreading</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Content Writing Master Course',
    slug: '6-month-content-writing-master-course',
    price: 30000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>SEO Content Writing</li>
  <li>Blog & Article Writing</li>
  <li>Website Content Writing</li>
  <li>Technical Writing Basics</li>
  <li>Copywriting & Sales Writing</li>
  <li>Social Media Content Creation</li>
  <li>Script Writing for Reels & Videos</li>
  <li>Content Strategy & Planning</li>
  <li>Content Audit & Optimization</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead27d2?auto=format&fit=crop&w=800&q=80',
  },

  // 4. Graphic Designing Training Program
  {
    title: '2-Month Graphic Designing Course',
    slug: '2-month-graphic-designing-course',
    price: 15000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Graphic Designing</li>
  <li>Design Principles & Color Theory</li>
  <li>Adobe Photoshop Basics</li>
  <li>Canva Designing</li>
  <li>Social Media Post Design</li>
  <li>Banner & Poster Design</li>
  <li>Logo Design Fundamentals</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Graphic Designing Course',
    slug: '3-month-advanced-graphic-designing-course',
    price: 25000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced Photoshop</li>
  <li>Advanced Illustrator</li>
  <li>Professional Logo Designing</li>
  <li>Branding & Identity Design</li>
  <li>Brochure & Flyer Design</li>
  <li>Social Media Creative Design</li>
  <li>Packaging Design Basics</li>
  <li>Typography & Layout Design</li>
  <li>Portfolio Development</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Graphic Designing Master Course',
    slug: '6-month-graphic-designing-master-course',
    price: 35000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Adobe Photoshop</li>
  <li>Adobe Illustrator</li>
  <li>Canva Pro Tools</li>
  <li>Branding & Corporate Identity</li>
  <li>Logo Design Mastery</li>
  <li>Social Media Creative Design</li>
  <li>Brochure, Flyer & Catalogue Design</li>
  <li>Packaging Design</li>
  <li>UI Design Fundamentals</li>
  <li>AI Tools for Graphic Designers</li>
  <li>Portfolio Development</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80',
  },

  // 5. Video Editing Training Program
  {
    title: '2-Month Video Editing Course',
    slug: '2-month-video-editing-course',
    price: 20000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Video Editing</li>
  <li>Adobe Premiere Pro Basics</li>
  <li>Video Cutting & Trimming</li>
  <li>Transitions & Effects</li>
  <li>Audio Editing Basics</li>
  <li>Color Correction</li>
  <li>Text & Titles</li>
  <li>Social Media Video Editing</li>
  <li>Reels & Shorts Creation</li>
  <li>Export Settings & Formats</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Video Editing Course',
    slug: '3-month-advanced-video-editing-course',
    price: 30000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced Adobe Premiere Pro</li>
  <li>Color Grading</li>
  <li>Audio Mixing & Enhancement</li>
  <li>Green Screen Editing</li>
  <li>YouTube Video Editing</li>
  <li>Corporate Video Editing</li>
  <li>Reels & Viral Content Editing</li>
  <li>Storytelling Through Editing</li>
  <li>Advanced Effects & Transitions</li>
  <li>Portfolio Development</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Video Editing Master Course',
    slug: '6-month-video-editing-master-course',
    price: 40000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Adobe Premiere Pro</li>
  <li>Adobe After Effects</li>
  <li>Advanced Color Grading</li>
  <li>Cinematic Video Editing</li>
  <li>Audio Design & Sound Effects</li>
  <li>YouTube & Podcast Editing</li>
  <li>Social Media Content Editing</li>
  <li>Commercial & Advertisement Editing</li>
  <li>AI Tools for Video Editing</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },

  // 6. Website Designing Training Program
  {
    title: '2-Month Website Designing Course',
    slug: '2-month-website-designing-course',
    price: 25000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Web Designing</li>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>Responsive Web Design</li>
  <li>Website Layout Creation</li>
  <li>UI/UX Design Fundamentals</li>
  <li>WordPress Installation & Setup</li>
  <li>WordPress Themes & Plugins</li>
  <li>Website Customization</li>
  <li>Blog & Business Website Creation</li>
  <li>Website Deployment</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Website Designing Course',
    slug: '3-month-advanced-website-designing-course',
    price: 30000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced HTML5 & CSS3</li>
  <li>JavaScript Fundamentals</li>
  <li>jQuery Basics</li>
  <li>Responsive Website Development</li>
  <li>Advanced WordPress Development</li>
  <li>Elementor Page Builder</li>
  <li>E-commerce Website Design</li>
  <li>Website Speed Optimization</li>
  <li>SEO-Friendly Website Structure</li>
  <li>UI/UX Best Practices</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Website Designing Master Course',
    slug: '6-month-website-designing-master-course',
    price: 45000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>HTML5, CSS3 & Bootstrap</li>
  <li>JavaScript & jQuery</li>
  <li>Responsive Web Design</li>
  <li>UI/UX Design</li>
  <li>WordPress Development</li>
  <li>Elementor Pro</li>
  <li>WooCommerce Development</li>
  <li>Website Redesign & Optimization</li>
  <li>Website Security Basics</li>
  <li>Website Performance Optimization</li>
  <li>SEO-Friendly Website Development</li>
  <li>Landing Page Design</li>
  <li>Portfolio & Business Website Development</li>
  <li>Domain & Hosting Management</li>
  <li>Website Deployment & Maintenance</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  },

  // 7. Full Stack Development Training Program
  {
    title: '3-Month Full Stack Development Course',
    slug: '3-month-full-stack-development-course',
    price: 25000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Introduction to Web Development</li>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>Bootstrap</li>
  <li>JavaScript Fundamentals</li>
  <li>Responsive Web Design</li>
  <li>Git & GitHub Basics</li>
  <li>Node.js Fundamentals</li>
  <li>Express.js Basics</li>
  <li>MongoDB Basics</li>
  <li>Database Operations (CRUD)</li>
  <li>Mini Project Development</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '3-Month Advanced Full Stack Development Course',
    slug: '3-month-advanced-full-stack-development-course',
    price: 35000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>Advanced HTML5 & CSS3</li>
  <li>Bootstrap Framework</li>
  <li>JavaScript ES6+</li>
  <li>React.js Fundamentals</li>
  <li>React Components & Hooks</li>
  <li>Node.js & Express.js</li>
  <li>MongoDB Database</li>
  <li>Authentication & Authorization</li>
  <li>REST API Development</li>
  <li>State Management</li>
  <li>Front-End & Back-End Integration</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '6-Month Full Stack Development Master Course',
    slug: '6-month-full-stack-development-master-course',
    price: 45000,
    mode: 'OFFLINE',
    status: 'PUBLISHED',
    description: `<h2>Modules Covered:</h2>
<ul>
  <li>HTML5, CSS3 & Bootstrap</li>
  <li>JavaScript ES6+</li>
  <li>React.js Development</li>
  <li>Advanced React.js</li>
  <li>Node.js & Express.js</li>
  <li>MongoDB Database</li>
  <li>REST API Development</li>
  <li>Authentication & Security</li>
  <li>Git & GitHub</li>
  <li>Full MERN Stack Development</li>
  <li>React Native App Development</li>
  <li>Mobile App UI Development</li>
  <li>API Integration</li>
</ul>`,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  }
];

async function seed() {
  console.log('Synchronizing Package DB if necessary...');
  await sequelize.sync();

  console.log('Seeding Packages...');
  for (const pkg of packages) {
    const existing = await Package.findOne({ where: { slug: pkg.slug } });
    if (existing) {
      console.log(`Updating package: ${pkg.title}`);
      await existing.update(pkg as any);
    } else {
      console.log(`Creating package: ${pkg.title}`);
      await Package.create(pkg as any);
    }
  }

  console.log('Seeding completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding packages:', err);
  process.exit(1);
});
