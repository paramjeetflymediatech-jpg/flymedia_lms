const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'anujguptaflymedia@gmail.com',
    pass: 'ijavnsuywhievjxb'
  },
  logger: true,
  debug: true
});

transporter.sendMail({
  from: '"Flymedia Technology" <anujguptaflymedia@gmail.com>',
  to: 'anujguptaflymedia@gmail.com',
  subject: 'Test Email via Port 465',
  text: 'This is a test email.'
}).then(info => {
  console.log('Success:', info);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
