const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'amandeepkumar.flymediatech@gmail.com',
    pass: 'ijavnsuywhievjxb'
  }
});

transporter.sendMail({
  from: '"Flymedia Technology" <amandeepkumar.flymediatech@gmail.com>',
  to: 'amandeepkumar.flymediatech@gmail.com',
  subject: 'Test Email via Port 465',
  text: 'This is a test email.'
}).then(info => {
  console.log('Success:', info);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
