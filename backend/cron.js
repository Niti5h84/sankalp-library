const cron = require('node-cron');
const webpush = require('web-push');
const Student = require('./models/Student');
const Admin = require('./models/Admin');

// Configure web-push safely
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@sankalp.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (e) {
    console.error('Failed to configure web-push:', e.message);
  }
} else {
  console.warn('VAPID keys not found. Push notifications are disabled.');
}

// Schedule task to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily fee due check for push notifications...');
  try {
    const today = new Date();
    const students = await Student.find();
    
    const dues = students.filter(s => {
      const isExpired = new Date(s.feeExpiryDate) < today;
      const isPartial = Number(s.paidAmount) < Number(s.monthlyFee);
      return isExpired || isPartial;
    });

    if (dues.length > 0) {
      // Find all admins to notify
      const admins = await Admin.find();
      
      const payload = JSON.stringify({
        title: 'Fee Alerts',
        body: `You have ${dues.length} student(s) with pending fees today. Open app to view details.`,
        url: '/admin/fees'
      });

      for (const admin of admins) {
        if (admin.pushSubscriptions && admin.pushSubscriptions.length > 0) {
          for (const sub of admin.pushSubscriptions) {
            try {
              await webpush.sendNotification(sub, payload);
            } catch (err) {
              // If subscription is invalid/expired (410), we could remove it here
              if (err.statusCode === 410) {
                admin.pushSubscriptions = admin.pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                await admin.save();
              }
              console.error('Error sending push notification:', err.statusCode);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
