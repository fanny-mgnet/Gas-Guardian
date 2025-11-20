const nodemailer = require('nodemailer');

async function createTestAccount() {
  try {
    const account = await nodemailer.createTestAccount();
    console.log('Ethereal account created successfully!');
    console.log('User: %s', account.user);
    console.log('Password: %s', account.pass);
    console.log('SMTP Host: %s', account.smtp.host);
    console.log('SMTP Port: %s', account.smtp.port);
    console.log('SMTP Secure: %s', account.smtp.secure);
  } catch (error) {
    console.error('Failed to create Ethereal account:', error);
  }
}

createTestAccount();