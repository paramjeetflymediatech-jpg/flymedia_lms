import { Category } from '../src/db/models';
import { sequelize } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to database.');

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
    // Check if it already exists
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

  console.log('Successfully seeded all live categories!');
  process.exit(0);
}

seed().catch(console.error);
