import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'maddison53@ethereal.email',
    pass: 'N3_4c-h_o-w'
  }
});

export async function sendGasHighEmail(userEmail: string, deviceName: string, gasLevel: number) {
  const mailOptions = {
    from: '"Gas Leak Detector" <noreply@gasleakdetector.com>',
    to: userEmail,
    subject: `High Gas Level Alert for ${deviceName}`,
    text: `Alert! The gas level for your device "${deviceName}" has reached a high level of ${gasLevel} ppm.`,
    html: `<b>Alert!</b><p>The gas level for your device "${deviceName}" has reached a high level of ${gasLevel} ppm.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}