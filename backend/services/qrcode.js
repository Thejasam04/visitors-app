const QRCode = require('qrcode');

// Generate QR code as base64 image
const generateQRCode = async (data) => {
  const qrString = await QRCode.toDataURL(JSON.stringify(data), {
    width         : 300,
    margin        : 2,
    color         : {
      dark  : '#1e3a5f',
      light : '#ffffff'
    }
  });

  // Return just the base64 part
  return qrString.replace(/^data:image\/png;base64,/, '');
};

module.exports = { generateQRCode };