export const FlymediaContact = {
  companyName: 'Flymedia Technology',
  campusName: 'Flymedia Technology Campus',
  phone: '+91-97793-24178',
  phoneRaw: '+919779324178',
  phoneDisplay: '+91-97793-24178',
  email: 'learnwithflymedia@gmail.com',
  upiId: '9779324178@upi',
  address: 'First Floor, Plot 20, Vishal Nagar Ext, opposite Kashish Cafe, Vishal Nagar, Jawaddi Taksal, Ludhiana, Punjab 141013, India',
  shortAddress: 'Plot 20, Vishal Nagar Ext, Jawaddi, Ludhiana, Punjab - 141013',
  googleMapsUrl: 'https://www.google.com/maps/dir//Learn+With+Flymedia,+First+Floor,+Plot+20,+Vishal+Nagar+Ext,+opposite+Kashish+Cafe,+Vishal+Nagar,+Jawaddi+Taksal,+Ludhiana,+Punjab+141013,+India/@30.9003452,75.8566733,12z',
  whatsappUrl: 'https://wa.me/919779324178?text=Hello%20Flymedia%20Technology%2C%20I%20am%20interested%20in%20your%20training%20programs',
};

export const getUpiPaymentUrl = (amount: number = 99, course: string = 'Demo Class') => {
  const note = encodeURIComponent(`Demo Class Booking - ${course}`);
  const pn = encodeURIComponent(FlymediaContact.companyName);
  return `upi://pay?pa=${FlymediaContact.upiId}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
};

export const getPhonePeUpiUrl = (amount: number = 99, course: string = 'Demo Class') => {
  const note = encodeURIComponent(`Demo Class Booking - ${course}`);
  const pn = encodeURIComponent(FlymediaContact.companyName);
  return `phonepe://pay?pa=${FlymediaContact.upiId}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
};

export const getGPayUpiUrl = (amount: number = 99, course: string = 'Demo Class') => {
  const note = encodeURIComponent(`Demo Class Booking - ${course}`);
  const pn = encodeURIComponent(FlymediaContact.companyName);
  return `gpay://upi/pay?pa=${FlymediaContact.upiId}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
};

export const getPaytmUpiUrl = (amount: number = 99, course: string = 'Demo Class') => {
  const note = encodeURIComponent(`Demo Class Booking - ${course}`);
  const pn = encodeURIComponent(FlymediaContact.companyName);
  return `paytmmp://pay?pa=${FlymediaContact.upiId}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
};

export const getUpiQrCodeUrl = (amount: number = 99, course: string = 'Demo Class') => {
  const upiUrl = getUpiPaymentUrl(amount, course);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUrl)}`;
};

export const getDemoWhatsAppConfirmationUrl = (name: string, phone: string, course: string, amount: number = 99) => {
  const text = encodeURIComponent(
    `Hello Flymedia Technology! 🎓\n\nI have booked my 1-on-1 Demo Class and paid ₹${amount}.\n\n👤 Student Name: ${name}\n📱 Mobile: ${phone}\n💻 Course: ${course}\n\nPlease confirm my scheduled mentor & slot!`
  );
  return `https://wa.me/919779324178?text=${text}`;
};
