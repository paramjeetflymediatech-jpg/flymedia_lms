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
        description: `<p>If we talk about marketing, it has been here for decades, all about promoting products or services; however, the utilization of modern strategies has taken a new shape under the term “digital marketing”. This includes overall content planning, strategising and implementing with the purpose of getting more engagement and response. Whether you are a beginner, looking for a great shift or already into digital marketing but looking for the right platform to enhance your skills, then welcome here! FlyMedia Technology is introducing you to complete digital marketing courses in Ludhiana to upgrade your career and sharpen your marketing skills.</p>
<p>Digital marketing is not a single term but a broader term, including different concepts such as video editing, SEO, SMO, SMM, Google Ads and many more, with the purpose of demonstrating the exceptional services of different brands.<br/>
<em>“When you understand that digital marketing is not about finding the audience, it's about ensuring the right audience will find you, things will get clearer!"</em></p>
<h2>What You’ll Master – A Sneak Peek at Digital Marketing Course!</h2>
<p>Different core modules have been covered by digital marketing courses with the purpose of inculcating what exactly digital marketing campaigns are and how they work to take a brand to the top.</p>
<h3>Search Engine Optimization (SEO)</h3>
<ul>
<li>This thoroughly includes the optimization of website content with the clear purpose of promoting brand visibility and organic traffic.</li>
<li>Search engines can easily understand and optimize the content, which remains the top priority, thus deriving positive results.</li>
<li>Keyword research remains the priority as well, and strategically using them for better results.</li>
</ul>
<p><strong>What does this exactly include?</strong><br/>
<strong>On-page SEO:</strong> Including the conversation and a clear, communicative tone to let the readers and search engines understand what exactly the content is about; this requires a thorough understanding of whom the content applies to, along with keyword-use strategies.<br/>
<strong>Off-page SEO:</strong> Involves the major purpose of achieving customers' trust through brand mentions and guest blogging, also including backlinks in a strategic and effective manner.<br/>
<strong>Technical SEO:</strong> Two main purposes are followed under this: crawlability and indexing. Ensuring the website loads without any interruption and is mobile-friendly.</p>
<h3>Social Media Marketing (SMM)</h3>
<p><em>“The studies of October 2025 have apparently indicated 6 billion social media users, which is quite an impressive score for brands to get the most out of social media platforms”!</em></p>
<ul>
<li>This is associated with the broader term, including SMO and paid advertising campaigns, which thoroughly includes social media platforms for increasing a brand’s connection to the right audience.</li>
<li>Not only is increasing customer interactions its real purpose; however, collecting real-time data and analyzing the success of SMM campaigns is also included in this.</li>
<li>Community management is also included in this broader concept, replying to customers’ comments under posts and DMs to increase interaction.</li>
<li>By thoroughly understanding the user's online behavior, running paid campaigns is a part of this concept as well.</li>
<li>Return on Investment, conversion and engagement rate analysis is also considered under this for clearly understanding which stage the strategies are at.</li>
</ul>
<h3>Paid Advertising (Meta Ads)</h3>
<ul>
<li>This thoroughly includes different parts of Meta’s ecosystem to run the brand’s advertisements on Facebook, Twitter and other audience networks.</li>
<li>Creating interactive PPC campaigns along with ad design to make it look presentable remains the chief concern.</li>
<li>Also, learning who the target audience is in terms of age, gender and location, with the purpose of placing ads, is also included in this course.</li>
</ul>
<h3>Video editing</h3>
<ul>
<li>This includes important information regarding the vertical aspect ratio, creating Instagram Reels, TikTok videos and YouTube Shorts for demonstrating brand awareness.</li>
<li>Video editing is not just about adding short clips and sound; it also includes a clear content strategy and content planning.</li>
<li>The most crucial one is keeping the audience hooked to the video in the first 3 seconds; this is the real challenge, which is taught under this.</li>
<li>Lighting, contrast and colour palette comprehension is equally important, with the purpose of making a perfect and interactive video.</li>
<li>For specific ad managers such as Google Ads and Meta Ads, understanding the formats and resolutions is the core principle in a video editing course.</li>
<li>Also, learning about balancing voiceovers, noise reduction and background music is included in this.</li>
</ul>
<h3>Graphic design</h3>
<ul>
<li>Serving different and unique stories through interactive and colour design formats with the use of software tools.</li>
<li>Letting the audience feel relatable in terms of evoking their emotions remains the major purpose.</li>
<li>Also, creating logos with visual templates to specify the brand’s image and purpose to the audience.</li>
<li>Inculcating the handling and use of different software tools for designing banners, presentations and social media posts to let the brand's voice be louder.</li>
<li>Designing the reel covers to drive maximum attention from social media users on different social media platforms.</li>
</ul>
<h2>Digital Marketing: One of the Crucial Skills You Can't Afford to Overlook!</h2>
<p>The above-mentioned digital marketing courses have been included in our list to let students like you level up your career in such an AI-driven and modern world. You can enroll for the specific duration, as we mainly include 6-, 2-, or 3-month courses; you can select accordingly.</p>
<p>The main goal revolves around enhancing your marketing skills, along with a complete understanding of content planning and what different businesses need to stand out in such a competitive world. The above-mentioned courses would be beneficial for you if your search looks like “best SMO, SEO or PPC courses near me”, providing you with a positive return.</p>`,
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
        description: `<p>Graphic design means creating attractive posters and banners using different colour combinations and different software to describe information in visual form. Creating posters, designing layouts for magazines and designing banners are all examples of graphic design.<br/>
Almost everyone today wants to learn the skills of graphic design, so they are searching for the best graphic designing courses in Ludhiana, which include skills to learn such as color coding spreadsheets for work or adding text to images for social media.</p>

<h2>Main Purpose of Graphic Designing</h2>
<p>The main purpose of graphic designing is to enhance or convey a message.<br/>
Good graphic designing can streamline communication. Different colours are used in graphic design to highlight the metrics that are dropping and those that are increasing, which makes it easier for the viewer to understand what’s going well and what they want to adjust.<br/>
Well-executed graphic design can provoke an emotional response from the viewer and also motivate them to take action. For example, the sign-up page on various websites entices visitors to start the free trial or join in the email list. Even the food packaging design aims to make the food inside seem more appealing to eat.</p>

<h2>Important Principles of Graphic Designing</h2>
<p>The important principles of graphic design include fundamental concepts such as balance, contrast, hierarchy and alignment. The main part of design thinking is visual hierarchy, which means arranging the elements in order of importance to guide the eyes of viewers.</p>

<h2>Types Of Graphic Designing</h2>
<p>There are various types of graphic design included in design courses in Punjab; the types are mentioned below:</p>

<h3>Brand And Visual Identity Design</h3>
<ul>
<li>Brand and visual identity designs are closely related to graphic design; the design of visual identity is a subset of brand design.</li>
<li>Brand design means setting the guidelines and best practices for companies to use for all branded materials to ensure the consistent identity of the brand. It includes a broad scope, such as the brand, its audience and strategy; on the other hand, visual identity design focuses on the components or visual elements within the design of the brand.</li>
<li>Brand designers help brands communicate strategically and appeal to an audience. This process involves the brand’s mission, identity, values and messaging and also converts them into a personality-specific tonality and voice, along with visual identity.</li>
<li>Once a brand determines its design, a brand designer can focus on elements and visual components that represent the brand and its visual identity. This design includes anything from determining color palettes and schemes to logo design, iconography, typography, imagery styles and graphics, applications and guidelines of the brand.</li>
</ul>

<h3>Marketing Design</h3>
<p>It is the graphic design for marketing initiatives. Marketing designers work on one-off, small projects, including promotional emails and on large, multifaceted projects such as seasonal campaigns, ad campaigns and designing booths and handouts for trade shows and conventions. Marketing design includes:</p>
<ul>
<li>Email marketing campaign</li>
<li>Social media campaign</li>
<li>Poster</li>
<li>Newsletters</li>
<li>Print ads</li>
<li>Web and mobile assets</li>
</ul>
<p>Guidelines set by brand designers are used in marketing design to communicate a message for a single campaign, platform or asset.</p>

<h3>Illustration Design</h3>
<p>Illustrations are part of brand and market design, but they are useful in many ways. Some designers focus on offering illustrations and work with design teams, contributing individual assets for different projects. Illustrators can design visual assets for:</p>
<ul>
<li>T-shirts and other wearables</li>
<li>Books</li>
<li>Stationery and cards</li>
<li>Social media</li>
<li>Interactive media</li>
<li>Marketing campaigns</li>
</ul>
<p>The process of illustration design and style can vary from designer to designer. Some artists work exclusively in digital forms, using various tools for graphic design such as Adobe Photoshop, Canva, Pinterest, and many other tools that help combine digital media with physical media.</p>

<h2>Cost of Graphic Designing Course</h2>
<p>The graphic designing course cost in India depends on the following factors:</p>
<ul>
<li>Type and duration of course</li>
<li>Type of institution</li>
<li>Mode of learning (online or offline)</li>
<li>Curriculum</li>
</ul>
<p>Flymedia Technology is offering the graphic designing course in two ways:</p>
<p>One is the 3-month advanced graphic designing course at Rs. 25,000, and another is the 6-month graphic designing master course at Rs. 35,000. These two courses have different curricula and include different types of graphic design.<br/>
Our graphic designing course can help to boost your career in many ways:</p>

<h3>Makes you an interdisciplinary asset</h3>
<p>Companies love those professionals who have multiple hands-on practical skills. Adding the graphic designing skills to your skill set makes you a bridge between departments. With the help of graphic design skills, you can easily translate marketing ideas into visuals or explain the project with a clear diagram. This versatility can make you indispensable.</p>

<h3>Unlock career pathways</h3>
<p>Having the skills of graphic designing can open the doors for further roles like UI/UX designer; it also gives you opportunities in content creation, marketing, education and entrepreneurship. You can gain the ability to build your own ideas and visualise concepts into reality.</p>`,
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
        description: `<p>Video editing is becoming an increasingly valuable creative skill with opportunities across social media platforms such as YouTube, OTT, education and many more. Video editing is not just cutting or adding clips; to make your video impressive, you have to learn other skills. Creating an impressive video to tell a story requires technical skills and timing that turn raw photos into engaging content.</p>

<p>If you want to learn to make professional videos, there are numerous video editing courses in India; Flymedia Tech is here to offer you various video editing courses. These video editing sessions can be helpful for beginners to learn the basics before moving on to regular practice and real-world projects. Imagine you do not have fifty thousand rupees to spend on three years of film school, but you have a beautiful art of video editing.</p>

<p>This does not mean you cannot learn professional video editing courses due to cost in India, if you love editing and have a passion for our invisible art form. Due to financial issues, you have to teach yourself; if so, keep reading this essay for you. You will learn professional video editing with us without spending any money on film schools or editing software subscriptions.</p>

<h2>Learn Video Editing: A Comprehensive View</h2>
<p>Video editing is not just one skill; there are various skills that support each other to make a full video. An excellent approach to learning video editing skills is to break it down into different component parts and learn each of the parts separately.</p>

<h2>Essential Skills That Every Editor Should Master</h2>
<ul>
<li>Dialogue editing</li>
<li>Shot flow</li>
<li>Pace and timing</li>
<li>Intercutting</li>
<li>Starting and ending scenes</li>
<li>Music scoring</li>
<li>Narrative structure</li>
</ul>

<h2>Skill Breakdown: Makes A Great Editor</h2>

<h3>Dialogue Editing:</h3>
<ul>
<li>Cut down the dialogue that is irrelevant to the scene.</li>
<li>Keep the dialogue that fits the scene.</li>
<li>Restructure the remaining scene into a dramatic and engaging story.</li>
</ul>

<h3>Shot Flow</h3>
<p>The main job of the shot flow is to cut down your B-Rolls, which means extra scenes or observational photos together. This is necessary so that the final video should be smooth, fluid and seem like natural picture editing, and to do this, you should pay attention to the following things.</p>
<ul>
<li>Continuity: do the pictures added make any sense visually?</li>
<li>Camera angle and actions should work together.</li>
<li>Make the connection or disconnection between B-roll and dialogue.</li>
<li>What happens with the outgoing and incoming shots?</li>
</ul>

<h3>Pace And Timing</h3>
<p>Social media video editing is usually cut at one pace only, but high-end narrative editing takes you on the multi-tempo roller coaster of the different paces in the whole film. The expert editor knows how to manipulate tempo and speed of the shots, dialogue, and music for dramatic and emotional scenes is an important skill to practice, and pace is determined by different factors, including:-</p>
<ul>
<li>The speed of the cut: is it fast or slow</li>
<li>The speed of the actions that play in front of the camera, fast or slow.</li>
<li>Close-up or wide shots</li>
<li>Intercutting</li>
</ul>
<p>The most powerful tool that is used by editors is how to do intercutting of clips, whether used in a short montage or on a large scale within a film.</p>

<h3>Starting And Ending Scene</h3>
<p>An expert video editor should be a master of this skill; knowing where the scene should start and how to end the video is a truly powerful skill. Working professionally on this skill can intrigue the audience, which gives them facts and logic about the scene.</p>

<h3>Music Scoring</h3>
<p>If you have the ability to work with music, it is the most powerful skill you can develop, and it is a huge part of the art form.</p>
<ul>
<li>Select the ideal music track based on the emotional tone.</li>
<li>For maximum effects, structure the music track within the sequence.</li>
</ul>

<h3>Narrative Structure</h3>
<p>There are few people who truly know the meaning of narrative structure with regard to editing. You need to know how to make a visual story on the timeline that you want to show the audience, and it may be one of the difficult parts of video editing.</p>

<h2>The Secret Of Becoming a Master In Video Editing</h2>
<p>This is one of the main reasons that film schools fail to prepare: a lack of practice. If you want to become an expert in dialogue arcs, try to learn to cut lots of them. Master pacing and intercutting with Flymedia Tech, which provides different video editing courses; you can learn fundamental skills to build your career in motion video editing courses in Punjab without expensive fees.</p>`,
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
        description: `<p>We are living in times where companies can reach out to their customers or potential clients any day, at any time via websites. The use of websites has simplified and improved how customers interact with clients and can get what they want from a position of rest. Websites are an effective tool for companies to reach their market on a global scale; as such, we have numerous companies that desire to have or improve their website to advance their business.</p>
<p>This is your opportunity to become the next website development expert who has the expertise to create websites that are user-friendly, advanced, and professionally appealing. The first step in your journey of becoming a website developer is enrolling on website design courses in Punjab, where Flymedia Technology’s team of experts instill the right knowledge and skills for you to develop websites. FlyMedia Technology offers practical knowledge in web development through strategic and advanced methodologies that meet today’s demands and provide the flexibility to adapt to various changes in website development. Our courses are structured with practical projects that ensure that you have the expertise to comprehend and deliver effective websites.</p>
<h2>Take a sneak peek into what you are going to learn as you study website development.</h2>
<p>The website design courses in Punjab are vast; you get to learn programming languages that are tools to build a website. You will attain the knowledge and skills of how to control visual styling, how the website can adapt to a desktop or mobile phone and how to ensure that the website is user-friendly. This is the structure;</p>
<h3>Web fundamentals and UI/UX Basics</h3>
<ul>
<li>You will get to understand how the web works</li>
<li>You will learn design principles</li>
<li>Development tools</li>
</ul>
<h3>Front-End Development</h3>
<ul>
<li>CSS3</li>
<li>Javascript</li>
<li>HTML5</li>
<li>Front-end libraries/frameworks</li>
</ul>
<h3>Version control and collaboration</h3>
<ul>
<li>Git/Github</li>
</ul>
<h3>Backend development</h3>
<ul>
<li>Server-side languages and runtimes</li>
<li>API’s and communication</li>
<li>Authentication and security</li>
</ul>
<h3>Databases</h3>
<ul>
<li>Relational database</li>
<li>NoSQL databases</li>
</ul>
<h3>Testing, deployment and capstone project</h3>
<ul>
<li>Testing and optimization</li>
<li>Deployment</li>
<li>Capstone project</li>
</ul>
<h2>The careers you can venture into after studying website development</h2>
<p>Website development courses come with great career options to select from;</p>
<ul>
<li>A full-stack developer</li>
<li>A backend developer</li>
<li>A front-end developer</li>
<li>Word press/CMS developer</li>
</ul>
<h2>Reasons why Flymedia Technology stands out</h2>
<h3>Structured and practical curriculum</h3>
<p>Real-life practical training is what Flymedia Technology is always ready to offer. That means projects that are related to real-life problems that you would be challenged to solve by training you how to understand and create websites that meet the needs and demands.</p>
<h3>An opportunity to learn from the best</h3>
<p>You will be exposed to skilled trainers who have honed their skills in website development so that you have the opportunity to ask questions, attain skills, and gain the right knowledge and guidance to become the next website development expert.</p>
<h3>An opportunity to receive guidance for your website development career.</h3>
<p>With Flymedia Technology expertise, you will have the opportunity to develop an impressive portfolio for your career so that you can excel in the business industries by providing companies with the website services that they require, which is all offered at an exceptional HTML course cost in Ludhiana.</p>`,
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
        price: 30000,
        description: `<p>There is always a demand for good web developers as companies move their services on the web. Companies need applications that are fast, reliable and easy to use, from e-commerce websites to interactive business platforms. Getting an opportunity to learn MERN stack development is a great achievement from which you will be gaining a lot of skills that prepare you for your job.</p>
<p>Taking MERN Stack Development Courses in Ludhiana allows students to gain experience in creating websites and skills that are needed in this field of development practices.</p>
<h2>What is the MERN stack?</h2>
<p>MERN stands for MongoDB, Express.js, React and Node. js. These aspects are very important because they allow students to create websites that help businesses grow.</p>
<ul>
<li><strong>MongoDB:</strong> It is a database that is used to store and manage application data</li>
<li><strong>Express js:</strong> A framework that helps developers build server-side applications and APIs.</li>
<li><strong>React:</strong> A popular tool for building the visible parts of a website that you click and interact with.</li>
<li><strong>Node. js:</strong> The hidden engine that lets you run code on the computer's server instead of just inside a web browser.</li>
</ul>
<h2>Benefits of MERN stack development</h2>
<h3>Uplifts development skills</h3>
<ul>
<li>Students will have access to create websites with all the features you see on them.</li>
<li>Learning both skills helps students truly understand how full-stack development works.</li>
</ul>
<h3>Career opportunities</h3>
<ul>
<li>MERN stack skills can support career pathways for students such as full-stack developer, React developer,Node.js developer and junior web developer.</li>
<li>Working on these practicals allows students to showcase their talents and strengthen their portfolios.</li>
</ul>
<h3>Support for modern business</h3>
<ul>
<li>For businesses to have a lot of surplus, they need websites and applications that work smoothly across all devices.</li>
<li>MERN stack development can help create digital solutions that can support customer engagement, online services and business operations.</li>
</ul>
<h3>Fast performance</h3>
<p>Websites built with MERN load very fast. React was designed to make webpages run smoothly and work without slowing down.</p>
<h2>Core skills acquired when learning a MERN stack development course</h2>
<h3>HTML and CSS</h3>
<p>HTML stands for HyperText Markup Language, and CSS stands for Cascading Style Sheets.</p>
<ul>
<li>Learners will know where and when to put the colors and fonts on webpages to look good and attract an audience to come for it.</li>
</ul>
<h3>JavaScript</h3>
<ul>
<li>This is where learners come to know about creating pages that allow customers to interact with the brand owners.</li>
</ul>
<h3>React</h3>
<ul>
<li>This tool lets you build reusable pieces for a website so the pages update instantly and smoothly without constantly refreshing.</li>
</ul>
<h3>API Development</h3>
<ul>
<li>This skill involves setting up secure pipelines that allow your website to safely swap information with other systems.</li>
</ul>
<h2>Begin building websites today.</h2>
<p>Learning using MERN stack development courses in India allows all the students who are passionate about making beautiful webpages and becoming programmers to have their dreams come true.</p>
<ul>
<li><strong>Get a local job:</strong> locally, and it saves money; no movement from one city to another.</li>
<li><strong>You learn by yourself:</strong> students will get the opportunity to work on actual projects that allow them to gain experience that equips them for interviews.</li>
<li><strong>Learning these courses allows you to earn a lot of money:</strong> because it is a highly demanding job.</li>
</ul>
<p>Becoming a student of Node. js development courses in Punjab allows you to have more advantages when working in these fields. This course is important because it is commonly used for APIs, web servers and applications that need to process requests efficiently.</p>
<ul>
<li><strong>Save money:</strong> you can learn high-paying global skills near your home. This saves you from spending lots of money to live in expensive cities.</li>
<li><strong>Work from Home:</strong> knowing Node.js lets you live in Punjab and work online for tech companies anywhere in the world.</li>
</ul>
<h2>What makes this category a good choice</h2>
<h3>Learn Everything</h3>
<ul>
<li>Learn to build the front part of a website that users see and the back part that saves data. You will use MERN to make the whole website yourself.</li>
</ul>
<h3>Real Projects</h3>
<ul>
<li>Build complete websites from start to finish with the help of a teacher.</li>
</ul>
<h3>Job Ready</h3>
<ul>
<li>Get ready for high-paying developer jobs with special interview training.</li>
</ul>
<h2>Why does MERN Stack stand out?</h2>
<p>The MERN stack is a top choice for building websites that pay very well. By learning its four parts, you can build everything yourself from simple pages to smart, AI web apps.</p>`,
        faqs: [
          { question: "Do I need to know coding before starting MERN?", answer: "It is not mandatory to know it because you learn it during the course of the learning period." },
          { question: "What are the benefits of learning these courses in my life?", answer: "You will be able to make your own money by creating websites for brands." },
          { question: "Which career opportunities can I get after completing MERN courses?", answer: "Learning these courses makes you ready to work as website creator and also engage in developing apps for companies." },
          { question: "Are there any opportunities to work from home when you have studied these courses?", answer: "Yes. Many companies hire MERN developers to work online from anywhere in the world." }
        ]
      }
    ];

    let createdPackages = 0;

    for (const course of coursesData) {
      // Create or find category
      const categorySlug = slugify(course.categoryName);
      let category = await Category.findOne({ where: { slug: categorySlug } });
      
      const fullCategoryContent = JSON.stringify({
        htmlContent: course.description,
        faqs: course.faqs
      });

      if (!category) {
        category = await Category.create({
          name: course.categoryName,
          slug: categorySlug,
          content: fullCategoryContent,
        });
      } else {
        await category.update({ content: fullCategoryContent });
      }

      // Create package if it doesn't exist
      const packageSlug = slugify(course.title);
      
      let thumbnailStr = '';
      if (course.categoryName === 'Digital Marketing') thumbnailStr = 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80';
      else if (course.categoryName === 'Graphic Design') thumbnailStr = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80';
      else if (course.categoryName === 'Video Editing') thumbnailStr = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80';
      else if (course.categoryName === 'Web Development') thumbnailStr = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80';
      else if (course.categoryName === 'MERN Stack Development') thumbnailStr = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80';

      try {
        const [pkg, created] = await Package.findOrCreate({
          where: { slug: packageSlug },
          defaults: {
            title: course.title,
            slug: packageSlug,
            category: category.name, // using categoryName as per Package model setup
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
        } else {
          // If it already exists, force update the description to the simple fallback
          await pkg.update({
            description: `Explore our comprehensive ${course.title} course designed to boost your career.`,
            faqs: [],
            thumbnail: thumbnailStr
          });
        }
      } catch (err: any) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          // It was created by a concurrent request, just ignore
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${createdPackages} new packages and their categories!` 
    });

  } catch (error: any) {
    console.error("Error seeding courses:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
