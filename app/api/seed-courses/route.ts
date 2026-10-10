import { NextResponse } from 'next/server';
import { Category, Package } from '../../../src/db/models';
import { sequelize } from '../../../src/db';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET() {
  try {
    await sequelize.authenticate(); // Ensure DB is connected

    const coursesData = [
      {
        categoryName: "Digital Marketing",
        title: "Zero Experience? No Problem! Learn Digital Marketing From Scratch!",
        price: 15000,
        htmlContent: `<p>If we talk about marketing, it has been here for decades, all about promoting products or services; however, the utilization of modern strategies has taken a new shape under the term “digital marketing”. This includes overall content planning, strategising and implementing with the purpose of getting more engagement and response. Whether you are a beginner, looking for a great shift or already into digital marketing but looking for the right platform to enhance your skills, then welcome here! FlyMedia Technology is introducing you to complete digital marketing courses in Ludhiana to upgrade your career and sharpen your marketing skills.</p>
<p>Digital marketing is not a single term but a broader term, including different concepts such as video editing, SEO, SMO, SMM, Google Ads and many more, with the purpose of demonstrating the exceptional services of different brands.<br/>
<em>“When you understand that digital marketing is not about finding the audience, it's about ensuring the right audience will find you, things will get clearer!"</em></p>`,
        features: [
          { title: "Search Engine Optimization (SEO)", description: "Master On-page, Off-page, and Technical SEO to promote brand visibility, organic traffic, and crawlability." },
          { title: "Social Media Marketing (SMM)", description: "Increase brand connection, manage communities, run paid campaigns, and analyze SMM ROI and engagement rates." },
          { title: "Paid Advertising (Meta Ads)", description: "Create interactive PPC campaigns and ad designs on Meta networks targeting specific demographics." },
          { title: "Video Editing", description: "Learn aspect ratios, content strategy, lighting, voiceovers, and hooking the audience in the first 3 seconds." },
          { title: "Graphic Design", description: "Design visual templates, logos, and banners to evoke emotions and specify the brand’s image and purpose." }
        ],
        sections: [
          { heading: "What You’ll Master – A Sneak Peek at Digital Marketing Course!", body: "Different core modules have been covered by digital marketing courses with the purpose of inculcating what exactly digital marketing campaigns are and how they work to take a brand to the top." },
          { heading: "Search Engine Optimization (SEO)", body: "SEO works like a powerful foundation for making the brand’s voice and services more recognizable, thus providing you with the best SEO courses in Punjab.\n\nThis thoroughly includes the optimization of website content with the clear purpose of promoting brand visibility and organic traffic.\nSearch engines can easily understand and optimize the content, which remains the top priority, thus deriving positive results.\nKeyword research remains the priority as well, and strategically using them for better results.\n\nWhat does this exactly include?\n\nOn-page SEO: Including the conversation and a clear, communicative tone to let the readers and search engines understand what exactly the content is about; this requires a thorough understanding of whom the content applies to, along with keyword-use strategies.\n\nOff-page SEO: Involves the major purpose of achieving customers' trust through brand mentions and guest blogging, also including backlinks in a strategic and effective manner.\n\nTechnical SEO: Two main purposes are followed under this: crawlability and indexing. Ensuring the website loads without any interruption and is mobile-friendly." },
          { heading: "Social Media Marketing (SMM)", body: "“The studies of October 2025 have apparently indicated 6 billion social media users, which is quite an impressive score for brands to get the most out of social media platforms”!\n\nThis is associated with the broader term, including SMO and paid advertising campaigns, which thoroughly includes social media platforms for increasing a brand’s connection to the right audience.\nNot only is increasing customer interactions its real purpose; however, collecting real-time data and analyzing the success of SMM campaigns is also included in this.\nCommunity management is also included in this broader concept, replying to customers’ comments under posts and DMs to increase interaction.\nBy thoroughly understanding the user's online behavior, running paid campaigns is a part of this concept as well.\nReturn on Investment, conversion and engagement rate analysis is also considered under this for clearly understanding which stage the strategies are at." },
          { heading: "Paid Advertising (Meta Ads)", body: "This thoroughly includes different parts of Meta’s ecosystem to run the brand’s advertisements on Facebook, Twitter and other audience networks.\nCreating interactive PPC campaigns along with ad design to make it look presentable remains the chief concern.\nAlso, learning who the target audience is in terms of age, gender and location, with the purpose of placing ads, is also included in this course." },
          { heading: "Video Editing", body: "This includes important information regarding the vertical aspect ratio, creating Instagram Reels, TikTok videos and YouTube Shorts for demonstrating brand awareness.\nVideo editing is not just about adding short clips and sound; it also includes a clear content strategy and content planning.\nThe most crucial one is keeping the audience hooked to the video in the first 3 seconds; this is the real challenge, which is taught under this.\nLighting, contrast and colour palette comprehension is equally important, with the purpose of making a perfect and interactive video.\nFor specific ad managers such as Google Ads and Meta Ads, understanding the formats and resolutions is the core principle in a video editing course.\nAlso, learning about balancing voiceovers, noise reduction and background music is included in this." },
          { heading: "Graphic Design", body: "Serving different and unique stories through interactive and colour design formats with the use of software tools.\nLetting the audience feel relatable in terms of evoking their emotions remains the major purpose.\nAlso, creating logos with visual templates to specify the brand’s image and purpose to the audience.\nInculcating the handling and use of different software tools for designing banners, presentations and social media posts to let the brand's voice be louder.\nDesigning the reel covers to drive maximum attention from social media users on different social media platforms." },
          { heading: "Digital Marketing: One of the Crucial Skills You Can't Afford to Overlook!", body: "The above-mentioned digital marketing courses have been included in our list to let students like you level up your career in such an AI-driven and modern world. You can enroll for the specific duration, as we mainly include 6-, 2-, or 3-month courses; you can select accordingly.\n\nThe main goal revolves around enhancing your marketing skills, along with a complete understanding of content planning and what different businesses need to stand out in such a competitive world. The above-mentioned courses would be beneficial for you if your search looks like “best SMO, SEO or PPC courses near me”, providing you with a positive return." }
        ],
        faqs: [
          { question: "What is the procedure for enrolling in your digital marketing course online?", answer: "You can simply register through our website and proceed further, including assigning a tutor from our side to let you delve deeply into our digital marketing course." },
          { question: "Are both online and offline modes available for learning the digital marketing course with you?", answer: "Yes, we do provide complete digital marketing courses in both online and offline modes. You can simply contact us for more detailed information." },
          { question: "Can I opt for an SEO course without any technical knowledge?", answer: "Yes, you can opt for SEO courses without any technical knowledge; in fact, there are numerous examples of beginners learning from scratch and gaining a lot of SEO knowledge." },
          { question: "What is the duration of your complete digital marketing course?", answer: "We provide a complete 6-month digital marketing course to help you shape your modern and digital marketing skills with SEO, SMO and Google Ads." },
          { question: "Do you provide a separate Social Media Marketing course or not?", answer: "Yes, we do provide a separate social media marketing course as well, with the inclusion of precise handling of different social media platforms in a 2-month course of Rs. 15,000." },
          { question: "Is there any formal degree required before learning a digital marketing course?", answer: "No, there’s no need for any formal degree before learning a digital marketing course, as you can learn its concepts even if you have zero knowledge about it." },
          { question: "Is SMO also included in your digital marketing course?", answer: "Yes, we also provide SMO courses in India, including the appropriate guidance and hands-on knowledge about using different social media platforms and deriving maximum outputs." }
        ]
      },
      {
        categoryName: "Graphic Design",
        title: "What Is Graphic Designing?",
        price: 25000,
        htmlContent: `<p>Graphic design means creating attractive posters and banners using different colour combinations and different software to describe information in visual form. Creating posters, designing layouts for magazines and designing banners are all examples of graphic design.</p>
<p>Almost everyone today wants to learn the skills of graphic design, so they are searching for the best graphic designing courses in Ludhiana, which include skills to learn such as color coding spreadsheets for work or adding text to images for social media.</p>
<h3>Types Of Graphic Designing</h3>
<p>There are various types of graphic design included in design courses in Punjab; such as Brand Identity, Marketing Design, and Illustration Design.</p>`,
        features: [
          { title: "Brand And Visual Identity Design", description: "Set guidelines and best practices for companies to use for all branded materials to ensure consistent brand identity, from color palettes to typography." },
          { title: "Marketing Design", description: "Design promotional emails, ad campaigns, booths, handouts, newsletters, print ads, and web/mobile assets for marketing initiatives." },
          { title: "Illustration Design", description: "Create custom illustrations for t-shirts, books, stationery, social media, and interactive media using tools like Photoshop and Canva." },
          { title: "Interdisciplinary Asset", description: "Translate marketing ideas into visuals or explain projects with clear diagrams. This versatility makes you indispensable across departments." }
        ],
        sections: [
          { heading: "Main Purpose of Graphic Designing", body: "The main purpose of graphic designing is to enhance or convey a message. Good graphic designing can streamline communication. Different colours are used in graphic design to highlight the metrics that are dropping and those that are increasing, which makes it easier for the viewer to understand what’s going well and what they want to adjust.\n\nWell-executed graphic design can provoke an emotional response from the viewer and also motivate them to take action. For example, the sign-up page on various websites entices visitors to start the free trial or join in the email list. Even the food packaging design aims to make the food inside seem more appealing to eat." },
          { heading: "Important Principles of Graphic Designing", body: "The important principles of graphic design include fundamental concepts such as balance, contrast, hierarchy and alignment. The main part of design thinking is visual hierarchy, which means arranging the elements in order of importance to guide the eyes of viewers." },
          { heading: "Unlock Career Pathways", body: "Having the skills of graphic designing can open the doors for further roles like UI/UX designer; it also gives you opportunities in content creation, marketing, education and entrepreneurship. You can gain the ability to build your own ideas and visualise concepts into reality." },
          { heading: "Cost of Graphic Designing Course", body: "The graphic designing course cost in India depends on the following factors:\n- Type and duration of course\n- Type of institution\n- Mode of learning (online or offline)\n- Curriculum\n\nFlymedia Technology is offering the graphic designing course in two ways: One is the 3-month advanced graphic designing course at Rs. 25,000, and another is the 6-month graphic designing master course at Rs. 35,000." }
        ],
        faqs: [
          { question: "What are the basic principles of graphic designing?", answer: "The basic principles of graphic design include contrast, alignment, proximity, repetition, balance, hierarchy and white space and together all these principles help guide attention, organise content and create designs that are easy to understand." },
          { question: "How can we opt for the course?", answer: "You can simply visit the website, create an account, and proceed further." },
          { question: "What is the key difference between graphic designing and web designing?", answer: "Graphic designing means creating posters and banners, and web designing means designing web pages for different websites, or we can say designing UI/ux design." },
          { question: "Which software is mainly used for graphic designing?", answer: "Two major software programs used for graphic design are Canva and Photoshop." },
          { question: "Is there any requirement for prior experience in graphic designing to join this course?", answer: "No, to enroll in this course, there is no requirement for prior experience." }
        ]
      },
      {
        categoryName: "Video Editing",
        title: "Want To Edit Like a Pro, Without Spending Years in Film Schools?",
        price: 20000,
        htmlContent: `<p>Video editing is becoming an increasingly valuable creative skill with opportunities across social media platforms such as YouTube, OTT, education and many more. Video editing is not just cutting or adding clips; to make your video impressive, you have to learn other skills. Creating an impressive video to tell a story requires technical skills and timing that turn raw photos into engaging content.</p>
<p>If you want to learn to make professional videos, there are numerous video editing courses in India; Flymedia Tech is here to offer you various video editing courses. These video editing sessions can be helpful for beginners to learn the basics before moving on to regular practice and real-world projects. Imagine you do not have fifty thousand rupees to spend on three years of film school, but you have a beautiful art of video editing.</p>
<p>This does not mean you cannot learn professional video editing courses due to cost in India, if you love editing and have a passion for our invisible art form. Due to financial issues, you have to teach yourself; if so, keep reading this essay for you. You will learn professional video editing with us without spending any money on film schools or editing software subscriptions.</p>
<h3>Essential Skills That Every Editor Should Master</h3>
<ul>
<li>Dialogue editing</li>
<li>Shot flow</li>
<li>Pace and timing</li>
<li>Intercutting</li>
<li>Starting and ending scenes</li>
<li>Music scoring</li>
<li>Narrative structure</li>
</ul>`,
        features: [
          { title: "Dialogue Editing", description: "Cut down the dialogue that is irrelevant to the scene. Keep the dialogue that fits the scene. Restructure the remaining scene into a dramatic and engaging story." },
          { title: "Shot Flow", description: "Cut down your B-Rolls together so the final video is smooth and fluid. Pay attention to continuity, camera angles, and the connection between B-roll and dialogue." },
          { title: "Pace And Timing", description: "Manipulate the tempo and speed of the shots, dialogue, and music for dramatic and emotional scenes." },
          { title: "Intercutting", description: "The most powerful tool used by editors is how to do intercutting of clips, whether in a short montage or on a large scale within a film." },
          { title: "Starting And Ending Scene", description: "Knowing where the scene should start and how to end the video is a powerful skill to intrigue the audience." },
          { title: "Music Scoring", description: "Select the ideal music track based on the emotional tone and structure the music track within the sequence for maximum effects." },
          { title: "Narrative Structure", description: "Know how to make a visual story on the timeline that you want to show the audience." }
        ],
        sections: [
          { heading: "Learn Video Editing: A Comprehensive View", body: "Video editing is not just one skill; there are various skills that support each other to make a full video. An excellent approach to learning video editing skills is to break it down into different component parts and learn each of the parts separately." },
          { heading: "The Secret Of Becoming a Master In Video Editing", body: "This is one of the main reasons that film schools fail to prepare: a lack of practice. If you want to become an expert in dialogue arcs, try to learn to cut lots of them. Master pacing and intercutting with Flymedia Tech, which provides different video editing courses; you can learn fundamental skills to build your career in motion video editing courses in Punjab without expensive fees." }
        ],
        faqs: [
          { question: "Will you provide a completion certificate on completion of my course?", answer: "Yes, when you successfully complete your video editing course, you will receive a completion certificate that you can add to your resume." },
          { question: "Can I enroll in a video editing course for free?", answer: "Yes, you may enroll in a video editing course and access the content for free, and if you want to receive a certificate upon completion of the course, then non-refundable fees are applicable." },
          { question: "How long did it take me to learn the free video editing basic course?", answer: "With full attention, you can learn the free video course in just 2 hours, but to become a master in video editing, you have to do a lot of practice." },
          { question: "After learning a basic video editing course, how can I use it?", answer: "After learning video editing, you should use the tips and tricks that you learned in the course, and to become a professional editor, you have to do a lot of practice." }
        ]
      },
      {
        categoryName: "Web Development",
        title: "Get Ready To Learn Website Development Course In India From Flymedia Technology Experts",
        price: 20000,
        htmlContent: `<p>We are living in times where companies can reach out to their customers or potential clients any day, at any time via websites. The use of websites has simplified and improved how customers interact with clients and can get what they want from a position of rest. Websites are an effective tool for companies to reach their market on a global scale; as such, we have numerous companies that desire to have or improve their website to advance their business.</p>
<p>This is your opportunity to become the next website development expert who has the expertise to create websites that are user-friendly, advanced, and professionally appealing. The first step in your journey of becoming a website developer is enrolling on website design courses in Punjab, where Flymedia Technology’s team of experts instill the right knowledge and skills for you to develop websites.</p>
<p>FlyMedia Technology offers practical knowledge in web development through strategic and advanced methodologies that meet today’s demands and provide the flexibility to adapt to various changes in website development. Our courses are structured with practical projects that ensure that you have the expertise to comprehend and deliver effective websites.</p>`,
        features: [
          { title: "Web fundamentals and UI/UX", description: "Understand how the web works, master core design principles, and learn essential development tools." },
          { title: "Front-End Development", description: "Master CSS3, JavaScript, HTML5, and various Front-end libraries and frameworks to build stunning user interfaces." },
          { title: "Version Control", description: "Learn how to collaborate on large projects efficiently using Git and GitHub." },
          { title: "Backend Development", description: "Learn server-side languages and runtimes, API communication, authentication, and security." },
          { title: "Databases", description: "Gain hands-on experience in managing data with Relational databases and NoSQL databases." },
          { title: "Testing & Deployment", description: "Learn testing, optimization, and seamless deployment, culminating in a robust capstone project." }
        ],
        sections: [
          { heading: "What You Will Learn", body: "The website design courses in Punjab are vast; you get to learn programming languages that are tools to build a website. You will attain the knowledge and skills of how to control visual styling, how the website can adapt to a desktop or mobile phone and how to ensure that the website is user-friendly." },
          { heading: "Careers After Studying Web Development", body: "Website development courses come with great career options to select from. You can become:\n- A full-stack developer\n- A backend developer\n- A front-end developer\n- WordPress/CMS developer" },
          { heading: "Structured and Practical Curriculum", body: "Real-life practical training is what Flymedia Technology is always ready to offer. That means projects that are related to real-life problems that you would be challenged to solve by training you how to understand and create websites that meet the needs and demands." },
          { heading: "Learn From The Best", body: "You will be exposed to skilled trainers who have honed their skills in website development so that you have the opportunity to ask questions, attain skills, and gain the right knowledge and guidance to become the next website development expert." },
          { heading: "Career Guidance & Portfolio", body: "With Flymedia Technology expertise, you will have the opportunity to develop an impressive portfolio for your career so that you can excel in the business industries by providing companies with the website services that they require, which is all offered at an exceptional HTML course cost in Ludhiana." }
        ],
        faqs: [
          { question: "What kind of projects will I work on as I study website development?", answer: "The projects are segmented based on the modules you have covered, from fundamentals such as creating a personal portfolio website, an e-commerce product gallery, to complex projects such as a real-time chat app, an AI-integrated web app, and so much more." },
          { question: "Do I need to have prior knowledge to study website development?", answer: "The web development course does not require prior knowledge; the curriculum is structured for you to learn from basics to advanced topics." },
          { question: "Will I be able to master the skills in 3 months?", answer: "The web development course can be completed in at least 6 months or a year." },
          { question: "Do you offer certifications after completing the web development course?", answer: "After completing the course, you will receive certification to prove that you have undergone different training and have completed the projects." },
          { question: "What is full stack web development all about?", answer: "This involves both the front end and back end of the course, which involves the client side and server side." }
        ]
      },
      {
        categoryName: "MERN Stack Development",
        title: "Building Modern Web Apps with the MERN Stack",
        price: 25000,
        htmlContent: `<p>There is always a demand for good web developers as companies move their services on the web. Companies need applications that are fast, reliable and easy to use, from e-commerce websites to interactive business platforms. Getting an opportunity to learn MERN stack development is a great achievement from which you will be gaining a lot of skills that prepare you for your job.</p>
<p>Taking MERN Stack Development Courses in Ludhiana allows students to gain experience in creating websites and skills that are needed in this field of development practices.</p>`,
        features: [
          { title: "HTML and CSS", description: "Learners will know where and when to put the colors and fonts on webpages to look good and attract an audience." },
          { title: "JavaScript", description: "This is where learners come to know about creating pages that allow customers to interact with the brand owners." },
          { title: "React", description: "This tool lets you build reusable pieces for a website so the pages update instantly and smoothly without constantly refreshing." },
          { title: "API Development", description: "This skill involves setting up secure pipelines that allow your website to safely swap information with other systems." }
        ],
        sections: [
          { heading: "What is the MERN stack?", body: "MERN stands for MongoDB, Express.js, React and Node.js. These aspects are very important because they allow students to create websites that help businesses grow.\n- MongoDB: It is a database that is used to store and manage application data\n- Express js: A framework that helps developers build server-side applications and APIs.\n- React: A popular tool for building the visible parts of a website that you click and interact with.\n- Node.js: The hidden engine that lets you run code on the computer's server instead of just inside a web browser." },
          { heading: "Benefits of MERN stack development", body: "Uplifts development skills: Students will have access to create websites with all the features you see on them. Learning both skills helps students truly understand how full-stack development works.\n\nCareer opportunities: MERN stack skills can support career pathways for students such as full-stack developer, React developer, Node.js developer and junior web developer. Working on these practicals allows students to showcase their talents and strengthen their portfolios.\n\nSupport for modern business: For businesses to have a lot of surplus, they need websites and applications that work smoothly across all devices. MERN stack development can help create digital solutions that can support customer engagement, online services and business operations.\n\nFast performance: Websites built with MERN load very fast. React was designed to make webpages run smoothly and work without slowing down." },
          { heading: "Learning MERN Stack Development Courses in India", body: "Learning using MERN stack development courses in India allows all the students who are passionate about making beautiful webpages and becoming programmers to have their dreams come true.\nGet a local job: locally, and it saves money; no movement from one city to another.\nYou learn by yourself: students will get the opportunity to work on actual projects that allow them to gain experience that equips them for interviews.\nLearning these courses allows you to earn a lot of money because it is a highly demanding job." },
          { heading: "Advantages of Node.js Development Courses in Punjab", body: "Becoming a student of Node.js development courses in Punjab allows you to have more advantages when working in these fields. This course is important because it is commonly used for APIs, web servers and applications that need to process requests efficiently.\nSave money: you can learn high-paying global skills near your home. This saves you from spending lots of money to live in expensive cities.\nWork from Home: knowing Node.js lets you live in Punjab and work online for tech companies anywhere in the world." },
          { heading: "Training & Projects", body: "Graduates or college students can look for courses that provide these skills to improve their knowledge:\n- Hands-on coding labs and homework\n- Independent and assisted project building\n- Code troubleshooting and logic training\n- Creating a professional project showcase\n- Job coaching and interview practice\n\nThings you can work on after learning these courses:\n- Creating websites that have wishlists\n- Websites for scheduling appointments online\n- Blogging tools and article management systems\n- Job search boards and hiring platforms\n- Admin control panels and data tracking tools" },
          { heading: "Why does MERN Stack stand out?", body: "The MERN stack is a top choice for building websites that pay very well. By learning its four parts, you can build everything yourself from simple pages to smart, AI web apps.\n\nLearn Everything: Learn to build the front part of a website that users see and the back part that saves data. You will use MERN to make the whole website yourself.\n\nReal Projects: Build complete websites from start to finish with the help of a teacher.\n\nJob Ready: Get ready for high-paying developer jobs with special interview training." }
        ],
        faqs: [
          { question: "Do I need to know coding before starting MERN?", answer: "It is not mandatory to know it because you learn it during the course of the learning period." },
          { question: "What are the benefits of learning these courses in my life?", answer: "You will be able to make your own money by creating websites for brands." },
          { question: "Which career opportunities can I get after completing MERN courses?", answer: "Learning these courses makes you ready to work as a website creator and also engage in developing apps for companies." },
          { question: "Are there any opportunities to work from home when you have studied these courses?", answer: "Yes. Many companies hire MERN developers to work online from anywhere in the world." }
        ]
      }
    ];

    let createdPackages = 0;
    
    for (const course of coursesData) {
      // Find or create Category
      const [category, catCreated] = await Category.findOrCreate({
        where: { name: course.categoryName },
        defaults: {
          name: course.categoryName,
          slug: slugify(course.categoryName),
          content: JSON.stringify({
            htmlContent: course.htmlContent,
            features: course.features,
            sections: course.sections,
            faqs: course.faqs,
            themeColor: 'indigo',
            heroLayout: 'centered'
          })
        }
      });

      // Update existing category content to match exactly what the user requested
      if (!catCreated) {
        // Read existing content to preserve hero images/colors if any
        let existingContent: any = {};
        try { existingContent = JSON.parse(category.content || '{}'); } catch (e) {}
        
        await category.update({
          content: JSON.stringify({
            ...existingContent,
            htmlContent: course.htmlContent,
            features: course.features,
            sections: course.sections.map((s: any, idx: number) => ({
               ...s,
               // Preserve existing bgImage/image if layout is the same
               layout: existingContent.sections?.[idx]?.layout || 'centered',
               bgImage: existingContent.sections?.[idx]?.bgImage || '',
               image: existingContent.sections?.[idx]?.image || ''
            })),
            faqs: course.faqs
          })
        });
      }

      // Find or create a dummy package under this category
      const packageSlug = slugify(course.title);
      const thumbnailStr = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80';
      
      try {
        const [pkg, created] = await Package.findOrCreate({
          where: { slug: packageSlug },
          defaults: {
            title: course.title,
            slug: packageSlug,
            category: category.name, 
            description: `Explore our comprehensive ${course.title} course designed to boost your career.`,
            price: course.price,
            thumbnail: thumbnailStr,
            status: 'PUBLISHED',
            mode: 'ONLINE',
            faqs: [],
          }
        });
        if (created) {
          createdPackages++;
        }
      } catch (err: any) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          // Ignore
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded and updated categories successfully!` 
    });

  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
