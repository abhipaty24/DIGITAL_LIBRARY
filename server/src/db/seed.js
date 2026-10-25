import bcrypt from 'bcryptjs'; import { pool } from './pool.js'
await pool.query(`INSERT INTO students(full_name,roll_number,section,department,subject,faculty_name,instagram_url,github_url,linkedin_url,email)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(roll_number) DO NOTHING`,
 ['M Abhilash','24102A030161','3','Data Science','Data Science','Bose Babu','https://www.instagram.com/abhi_paty?srtk=a2NjbzF0YTBnajN2','https://github.com/abhipaty24','https://www.linkedin.com/in/mallari-abhilash-62a264321?utm_source=share_via&utm_content=profile&utm_medium=member_android','mallariabhi@gmail.com'])
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)
  await pool.query('INSERT INTO admin_users(email,password_hash) VALUES($1,$2) ON CONFLICT(email) DO NOTHING', [process.env.ADMIN_EMAIL, await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)])
console.log('seeded'); await pool.end()
