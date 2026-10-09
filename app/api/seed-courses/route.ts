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
        description: `If we talk about marketing, it has been here for decades, all about promoting products or services; however, the utilization of modern strategies has taken a new shape under the term “digital marketing”. This includes overall content planning, strategising and implementing with the purpose of getting more engagement and response. Whether you are a beginner, looking for a great shift or already into digital marketing but looking for the right platform to enhance your skills, then welcome here! FlyMedia Technology is introducing you to complete digital marketing courses in Ludhiana to upgrade your career and sharpen your marketing skills. 

Digital marketing is not a single term but a broader term, including different concepts such as video editing, SEO, SMO, SMM, Google Ads and many more, with the purpose of demonstrating the exceptional services of different brands. 
“When you understand that digital marketing is not about finding the audience, it's about ensuring the right audience will find you, things will get clearer!"

What You’ll Master – A Sneak Peek at Digital Marketing Course! 

Different core modules have been covered by digital marketing courses with the purpose of inculcating what exactly digital marketing campaigns are and how they work to take a brand to the top. 

Search Engine Optimization (SEO)
* This thoroughly includes the optimization of website content with the clear purpose of promoting brand visibility and organic traffic. 
* Search engines can easily understand and optimize the content, which remains the top priority, thus deriving positive results.  
* Keyword research remains the priority as well, and strategically using them for better results.  

What does this exactly include? 
On-page SEO: Including the conversation and a clear, communicative tone to let the readers and search engines understand what exactly the content is about; this requires a thorough understanding of whom the content applies to, along with keyword-use strategies. 
Off-page SEO: Involves the major purpose of achieving customers' trust through brand mentions and guest blogging, also including backlinks in a strategic and effective manner.   
Technical SEO: Two main purposes are followed under this: crawlability and indexing. Ensuring the website loads without any interruption and is mobile-friendly. 

Social Media Marketing (SMM)
“The studies of October 2025 have apparently indicated 6 billion social media users, which is quite an impressive score for brands to get the most out of social media platforms”!
* This is associated with the broader term, including SMO and paid advertising campaigns, which thoroughly includes social media platforms for increasing a brand’s connection to the right audience. 
* Not only is increasing customer interactions its real purpose; however, collecting real-time data and analyzing the success of SMM campaigns is also included in this. 
* Community management is also included in this broader concept, replying to customers’ comments under posts and DMs to increase interaction. 
* By thoroughly understanding the user's online behavior, running paid campaigns is a part of this concept as well. 
* Return on Investment, conversion and engagement rate analysis is also considered under this for clearly understanding which stage the strategies are at.

Paid Advertising (Meta Ads)
* This thoroughly includes different parts of Meta’s ecosystem to run the brand’s advertisements on Facebook, Twitter and other audience networks. 
* Creating interactive PPC campaigns along with ad design to make it look presentable remains the chief concern. 
* Also, learning who the target audience is in terms of age, gender and location, with the purpose of placing ads, is also included in this course. 

Video editing 
* This includes important information regarding the vertical aspect ratio, creating Instagram Reels, TikTok videos and YouTube Shorts for demonstrating brand awareness. 
* Video editing is not just about adding short clips and sound; it also includes a clear content strategy and content planning. 
* The most crucial one is keeping the audience hooked to the video in the first 3 seconds; this is the real challenge, which is taught under this. 
* Lighting, contrast and colour palette comprehension is equally important, with the purpose of making a perfect and interactive video. 
* For specific ad managers such as Google Ads and Meta Ads, understanding the formats and resolutions is the core principle in a video editing course. 
* Also, learning about balancing voiceovers, noise reduction and background music is included in this. 

Graphic design 
* Serving different and unique stories through interactive and colour design formats with the use of software tools. 
* Letting the audience feel relatable in terms of evoking their emotions remains the major purpose.  
* Also, creating logos with visual templates to specify the brand’s image and purpose to the audience. 
* Inculcating the handling and use of different software tools for designing banners, presentations and social media posts to let the brand's voice be louder. 
* Designing the reel covers to drive maximum attention from social media users on different social media platforms. 

Digital Marketing: One of the Crucial Skills You Can't Afford to Overlook!  
The above-mentioned digital marketing courses have been included in our list to let students like you level up your career in such an AI-driven and modern world. You can enroll for the specific duration, as we mainly include 6-, 2-, or 3-month courses; you can select accordingly. 

The main goal revolves around enhancing your marketing skills, along with a complete understanding of content planning and what different businesses need to stand out in such a competitive world. The above-mentioned courses would be beneficial for you if your search looks like “best SMO, SEO or PPC courses near me”, providing you with a positive return.`,
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
        description: `Graphic design means creating attractive posters and banners using different colour combinations and different software to describe information in visual form. Creating posters, designing layouts for magazines and designing banners are all examples of graphic design. 
Almost everyone today wants to learn the skills of graphic design, so they are searching for the best graphic designing courses in Ludhiana, which include skills to learn such as color coding spreadsheets for work or adding text to images for social media.  

Main Purpose of Graphic Designing
The main purpose of graphic designing is to enhance or convey a message.
Good graphic designing can streamline communication. Different colours are used in graphic design to highlight the metrics that are dropping and those that are increasing, which makes it easier for the viewer to understand what’s going well and what they want to adjust. 
Well-executed graphic design can provoke an emotional response from the viewer and also motivate them to take action. For example, the sign-up page on various websites entices visitors to start the free trial or join in the email list. Even the food packaging design aims to make the food inside seem more appealing to eat. 

Important Principles of Graphic Designing 
The important principles of graphic design include fundamental concepts such as balance, contrast, hierarchy and alignment. The main part of design thinking is visual hierarchy, which means arranging the elements in order of importance to guide the eyes of viewers. 

Types Of Graphic Designing 
There are various types of graphic design included in design courses in Punjab; the types are mentioned below:

Brand And Visual Identity Design 
* Brand and visual identity designs are closely related to graphic design; the design of visual identity is a subset of brand design. 
* Brand design means setting the guidelines and best practices for companies to use for all branded materials to ensure the consistent identity of the brand. It includes a broad scope, such as the brand, its audience and strategy; on the other hand, visual identity design focuses on the components or visual elements within the design of the brand. 
* Brand designers help brands communicate strategically and appeal to an audience. This process involves the brand’s mission, identity, values and messaging and also converts them into a personality-specific tonality and voice, along with visual identity. 
* Once a brand determines its design, a brand designer can focus on elements and visual components that represent the brand and its visual identity. This design includes anything from determining color palettes and schemes to logo design, iconography, typography, imagery styles and graphics, applications and guidelines of the brand. 

Marketing Design
It is the graphic design for marketing initiatives. Marketing designers work on one-off, small projects, including promotional emails and on large, multifaceted projects such as seasonal campaigns, ad campaigns and designing booths and handouts for trade shows and conventions. Marketing design includes:
* Email marketing campaign
* Social media campaign
* Poster
* Newsletters 
* Print ads 
* Web and mobile assets 
Guidelines set by brand designers are used in marketing design to communicate a message for a single campaign, platform or asset. 

Illustration Design 
Illustrations are part of brand and market design, but they are useful in many ways. Some designers focus on offering illustrations and work with design teams, contributing individual assets for different projects. Illustrators can design visual assets for:
* T- shirts and other wearables 
* Books 
* Stationery and cards 
* Social media 
* Interactive media 
* Marketing campaigns 
The process of illustration design and style can vary from designer to designer. Some artists work exclusively in digital forms, using various tools for graphic design such as Adobe Photoshop, Canva, Pinterest, and many other tools that help combine digital media with physical media. 

Cost of Graphic Designing Course
The graphic designing course cost in India depends on the following factors:
* Type and duration of course 
* Type of institution 
* Mode of learning(online or offline)
* curriculum
* Flymedia Technology is offering the graphic designing course in two ways:

One is the 3- month advanced graphic designing course at Rs. 25,000, and another is the 6-month graphic designing master course at Rs. 35,000. These two courses have different curricula and include different types of graphic design. 
Our graphic designing course can help to boost your career in many ways:

* Makes you an interdisciplinary asset
Companies love those professionals who have multiple hands-on practical skills. Adding the graphic designing skills to your skill set makes you a bridge between departments. With the help of graphic design skills, you can easily translate marketing ideas into visuals or explain the project with a clear diagram. This versatility can make you indispensable. 

* Unlock career pathways
Having the skills of graphic designing can open the doors for further roles like UI/UX  designer; it also gives you opportunities in content creation, marketing, education and entrepreneurship. You can gain the ability to build your own ideas and visualise concepts into reality.`,
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
        description: `Video editing is becoming an increasingly valuable creative skill with opportunities across social media platforms such as YouTube, OTT, education and many more. Video editing is not just cutting or adding clips; to make your video impressive, you have to learn other skills. Creating an impressive video to tell a story requires technical skills and timing that turn raw photos into engaging content. 

If you want to learn to make professional videos, there are numerous video editing courses in India; Flymedia Tech is here to offer you various video editing courses. These video editing sessions can be helpful for beginners to learn the basics before moving on to regular practice and real-world projects. Imagine you do not have fifty thousand rupees to spend on three years of film school, but you have a beautiful art of video editing. 

This does not mean you cannot learn professional video editing courses due to cost in India, if you love editing and have a passion for our invisible art form. Due to financial issues, you have to teach yourself; if so, keep reading this essay for you. You will learn professional video editing with us without spending any money on film schools or editing software subscriptions. 

Learn Video Editing: A Comprehensive View
Video editing is not just one skill; there are various skills that support each other to make a full video. An excellent approach to learning video editing skills is to break it down into different component parts and learn each of the parts separately. 

Essential Skills That Every Editor Should Master
* Dialogue editing 
* Shot flow
* Pace and timing 
* intercutting 
* Starting and ending scenes
* Music scoring 
* Narrative structure 

Skill Breakdown: Makes A Great Editor
Dialogue Editing:
* Cut down the dialogue that is irrelevant to the scene.
* Keep the dialogue that fits the scene. 
* Restructure the remaining scene into a dramatic and engaging story. 

Shot Flow 
The main job of the shot flow is to cut down your B-Rolls, which means extra scenes or observational photos together. This is necessary so that the final video should be smooth, fluid and seem like natural picture editing, and to do this, you should pay attention to the following things.
* Continuity: do the pictures added make any sense visually?
* Camera angle and actions should work together.
* Make the connection or disconnection between B-roll and dialogue.
* What happens with the outgoing and incoming shots?

Pace And Timing 
Social media video editing is usually cut at one pace only, but high-end narrative editing takes you on the multi-tempo roller coaster of the different paces in the whole film. The expert editor knows how to manipulate tempo and speed of the shots, dialogue, and music for dramatic and emotional scenes is an important skill to practice, and pace is determined by different factors, including:-
* The speed of the cut: is it fast or slow
* The speed of the actions that play in front of the camera, fast or slow. 
* Close-up or wide shots
* Intercutting 
The most powerful tool that is used by editors is how to do intercutting of clips, whether used in a short montage or on a large scale within a film. 

Starting And Ending Scene
An expert video editor should be a master of this skill; knowing where the scene should start and how to end the video is a truly powerful skill. Working professionally on this skill can intrigue the audience, which gives them facts and logic about the scene. 

Music Scoring 
If you have the ability to work with music, it is the most powerful skill you can develop, and it is a huge part of the art form.
* Select the ideal music track based on the emotional tone.
* For maximum effects, structure the music track within the sequence. 

Narrative Structure 
There are few people who truly know the meaning of narrative structure with regard to editing. You need to know how to make a visual story on the timeline that you want to show the audience, and it may be one of the difficult parts of video editing.

The Secret Of Becoming a Master In Video Editing
This is one of the main reasons that film schools fail to prepare: a lack of practice. If you want to become an expert in dialogue arcs, try to learn to cut lots of them. Master pacing and intercutting with Flymedia Tech, which provides different video editing courses; you can learn fundamental skills to build your career in motion video editing courses in Punjab without expensive fees.`,
        faqs: [
          { question: "Will you provide a completion certificate on completion of my course?", answer: "Yes, when you successfully complete your video editing course, you will receive a completion certificate that you can add to your resume." },
          { question: "Can I enroll in a video editing course for free?", answer: "Yes, you may enroll in a video editing course and access the content for free, and if you want to receive a certificate upon completion of the course, then non-refundable fees are applicable." },
          { question: "How long did it take me to learn the free video editing basic course?", answer: "With full attention, you can learn the free video course in just 2 hours, but to become a master in video editing, you have to do a lot of practice." },
          { question: "After learning a basic video editing course, how can I use it?", answer: "After learning video editing, you should use the tips and tricks that you learned in the course, and to become a professional editor, you have to do a lot of practice." }
        ]
      }
    ];

    let createdPackages = 0;

    for (const course of coursesData) {
      // Create or find category
      const categorySlug = slugify(course.categoryName);
      let category = await Category.findOne({ where: { slug: categorySlug } });
      
      if (!category) {
        category = await Category.create({
          name: course.categoryName,
          slug: categorySlug,
          content: `Explore our ${course.categoryName} courses designed to boost your career.`,
        });
      }

      // Create package if it doesn't exist
      const packageSlug = slugify(course.title);
      let pkg = await Package.findOne({ where: { slug: packageSlug } });

      if (!pkg) {
        let thumbnailStr = '';
        if (course.categoryName === 'Digital Marketing') thumbnailStr = 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80';
        else if (course.categoryName === 'Graphic Design') thumbnailStr = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80';
        else if (course.categoryName === 'Video Editing') thumbnailStr = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80';

        await Package.create({
          title: course.title,
          slug: packageSlug,
          category: category.name, // using categoryName as per Package model setup
          description: course.description,
          price: course.price,
          thumbnail: thumbnailStr,
          status: 'PUBLISHED',
          mode: 'ONLINE',
          faqs: course.faqs,
        });
        createdPackages++;
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
