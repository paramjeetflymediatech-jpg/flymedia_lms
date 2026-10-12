import { Package } from '../src/db/models';

async function run() {
  const whatYoullLearn = [
    'Adobe Premiere Pro',
    'Advanced video editing',
    'Professional cutting and sequencing',
    'Advanced transitions and effects',
    'Audio editing and synchronization',
    'Color correction',
    'Basic color grading',
    'Titles and text effects',
    'YouTube video editing',
    'Reels and short-form content',
    'Promotional and advertisement videos',
    'Adobe After Effects - Basic',
    'Motion graphics fundamentals',
    'Text animation',
    'Logo animation',
    'Shape animation',
    'Keyframes',
    'Basic visual effects'
  ];

  await Package.update({ whatYoullLearn }, { where: { slug: 'video-editing-course' } });
  console.log('✅ Successfully updated whatYoullLearn for video-editing-course');
  process.exit(0);
}

run();
