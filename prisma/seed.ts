import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password using same method as the app
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

// ================================================================
// DEMO DATA - All synthetic, no real personal information
// ================================================================

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Create demo user
  const passwordHash = await hashPassword('Demo@1234');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@careerpilot.dev' },
    update: {},
    create: {
      name: 'Alex Demo',
      email: 'demo@careerpilot.dev',
      passwordHash,
      role: 'USER',
    },
  });
  console.log('✅ Demo user created: demo@careerpilot.dev / Demo@1234');

  // Create admin user
  const adminHash = await hashPassword('Admin@1234');
  await prisma.user.upsert({
    where: { email: 'admin@careerpilot.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@careerpilot.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@careerpilot.dev / Admin@1234');

  // Create sample skills
  const skillsData = [
    { name: 'JavaScript', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'React', category: 'Web Development' },
    { name: 'Next.js', category: 'Web Development' },
    { name: 'Node.js', category: 'Web Development' },
    { name: 'HTML', category: 'Web Development' },
    { name: 'CSS', category: 'Web Development' },
    { name: 'Tailwind CSS', category: 'Web Development' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'Docker', category: 'Cloud/DevOps' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'Problem Solving', category: 'Soft Skills' },
  ];

  for (const skill of skillsData) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });

    // Assign some skills to demo user
    if (['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Git', 'Python', 'PostgreSQL'].includes(skill.name)) {
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: demoUser.id, skillId: created.id } },
        update: {},
        create: {
          userId: demoUser.id,
          skillId: created.id,
          status: skill.name === 'Python' ? 'LEARNING' : 'COMPLETED',
        },
      });
    }
  }
  console.log('✅ Skills seeded');

  // Create sample resume
  const sampleResumeText = `Alex Demo
demo@careerpilot.dev
+1-555-0100

Summary
Motivated Computer Science student with strong foundation in full-stack web development and machine learning. Experienced in building scalable web applications using modern frameworks.

Education
B.Tech Computer Science and Engineering
Demo Institute of Technology
2023 - 2027
CGPA: 8.5/10

Skills
JavaScript, TypeScript, Python, React, Next.js, Node.js, Express.js, PostgreSQL, MongoDB, Git, Docker, Tailwind CSS, HTML, CSS, REST API, Machine Learning

Projects
CareerPilot - AI Resume Analyzer
Built a full-stack resume analysis platform using Next.js, TypeScript, and Prisma. Implemented AI-powered resume scoring and job matching features.
Technologies: Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL

TaskFlow - Project Management App
Developed a collaborative project management application with real-time updates and team collaboration features.
Technologies: React, Node.js, MongoDB, Socket.io

ML Image Classifier
Created an image classification model using TensorFlow achieving 94% accuracy on the test dataset.
Technologies: Python, TensorFlow, NumPy, Matplotlib

Experience
Software Development Intern
Demo Tech Solutions
Jun 2025 - Aug 2025
Developed RESTful APIs and improved database query performance by 40%.

Certifications
Web Development Bootcamp - Online Platform
Introduction to Machine Learning - Coursera`;

  const resume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      fileName: 'alex_demo_resume.pdf',
      fileType: '.pdf',
      fileSize: 45000,
      rawText: sampleResumeText,
      parsedData: {},
      name: 'Alex Demo',
      email: 'demo@careerpilot.dev',
      phone: '+1-555-0100',
      education: [{ institution: 'Demo Institute of Technology', degree: 'B.Tech', field: 'Computer Science and Engineering', year: '2027' }],
      skills: ['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'Git', 'Docker', 'Tailwind CSS'],
      projects: [
        { name: 'CareerPilot - AI Resume Analyzer', description: 'Full-stack resume analysis platform', technologies: ['Next.js', 'TypeScript', 'Prisma'] },
        { name: 'TaskFlow', description: 'Collaborative project management app', technologies: ['React', 'Node.js', 'MongoDB'] },
        { name: 'ML Image Classifier', description: 'Image classification model with 94% accuracy', technologies: ['Python', 'TensorFlow'] },
      ],
      experience: [
        { company: 'Demo Tech Solutions', role: 'Software Development Intern', duration: 'Jun 2025 - Aug 2025', description: 'Developed RESTful APIs and improved database query performance.' },
      ],
      certifications: ['Web Development Bootcamp', 'Introduction to Machine Learning'],
      summary: 'Motivated Computer Science student with strong foundation in full-stack web development and machine learning.',
    },
  });
  console.log('✅ Sample resume created');

  // Create sample analysis
  await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      userId: demoUser.id,
      overallScore: 78,
      atsScore: 72,
      skillsScore: 85,
      experienceScore: 65,
      educationScore: 80,
      formattingScore: 75,
      missingSections: ['LinkedIn Profile'],
      detectedSkills: ['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Git'],
      suggestions: [
        'Add a LinkedIn profile link',
        'Include specific metrics in project descriptions',
        'Add more action verbs like developed, implemented, designed',
      ],
      analysisType: 'FALLBACK',
    },
  });
  console.log('✅ Sample analysis created');

  // Create sample applications
  const applications = [
    { company: 'Demo Corp', jobTitle: 'Frontend Developer Intern', status: 'APPLIED' as const, location: 'Remote', appliedDate: new Date('2025-09-15') },
    { company: 'Tech Solutions Inc', jobTitle: 'Full Stack Developer', status: 'INTERVIEW' as const, location: 'Bangalore', appliedDate: new Date('2025-09-10') },
    { company: 'StartupXYZ', jobTitle: 'Software Engineer', status: 'SAVED' as const, location: 'Hyderabad', appliedDate: new Date('2025-09-20') },
    { company: 'DataDriven Co', jobTitle: 'ML Engineer Intern', status: 'ASSESSMENT' as const, location: 'Remote', appliedDate: new Date('2025-09-12') },
  ];

  for (const app of applications) {
    await prisma.jobApplication.create({
      data: { userId: demoUser.id, ...app },
    });
  }
  console.log('✅ Sample applications created');

  console.log('\\n🎉 Database seeded successfully!');
  console.log('\\n📝 Demo Login Credentials:');
  console.log('   Email: demo@careerpilot.dev');
  console.log('   Password: Demo@1234');
  console.log('\\n📝 Admin Login Credentials:');
  console.log('   Email: admin@careerpilot.dev');
  console.log('   Password: Admin@1234');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
