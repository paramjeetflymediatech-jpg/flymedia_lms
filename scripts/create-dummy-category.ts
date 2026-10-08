import { Category } from '../src/db/models';
import { sequelize } from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to database.');

  const content = {
    features: [
      {
        title: 'Expert Instructors',
        description: 'Learn from industry professionals with years of real-world experience building scalable applications.'
      },
      {
        title: 'Hands-on Projects',
        description: 'Build real-world projects that you can showcase in your portfolio to land your dream job.'
      },
      {
        title: 'Career Support',
        description: 'Get dedicated placement assistance, resume reviews, and mock interviews to prepare you for success.'
      }
    ],
    sections: [
      {
        heading: 'Why Learn Advanced Web Technologies?',
        body: 'The web development landscape is constantly evolving. Staying ahead of the curve means mastering modern frameworks, understanding cloud architecture, and writing clean, scalable code. Our advanced programs are designed to take you from a basic understanding to professional mastery.'
      }
    ],
    faqs: [
      {
        question: 'Who is this category for?',
        answer: 'These programs are perfect for beginners looking to start their career, as well as intermediate developers wanting to upskill and learn modern tech stacks.'
      },
      {
        question: 'Do I get a certificate?',
        answer: 'Yes! Upon successful completion of any program in this category, you will receive an industry-recognized certification from Flymedia Technology.'
      }
    ]
  };

  const cat = await Category.create({
    id: uuidv4(),
    name: 'Advanced Bootcamp (Dummy)',
    slug: 'advanced-bootcamp-dummy-' + Date.now(),
    icon: 'https://cdn-icons-png.flaticon.com/512/2721/2721620.png',
    content: JSON.stringify(content),
    metaTitle: 'Advanced Bootcamp | Flymedia',
    metaDescription: 'An awesome dummy category to demonstrate dynamic JSON rendering.'
  });

  console.log('Created dummy category:', cat.name);
  process.exit(0);
}

seed().catch(console.error);
