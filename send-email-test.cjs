const nodemailer = require('nodemailer');

async function main() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'firj4ig6xtqgz66p@ethereal.email',
      pass: 'pw7rgZv7aJjfyzv3D9'
    }
  });

  const info = await transporter.sendMail({
    from: '"Gas Leak Detector" <noreply@gasleakdetector.com>',
    to: "test@gmail.com",
    subject: "High Gas Level Alert",
    text: "This is an alert that your gas level is high.",
    html: "<b>This is an alert that your gas level is high.</b>",
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);