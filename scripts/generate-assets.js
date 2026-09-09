const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'));
  const ogSvg = fs.readFileSync(path.join(publicDir, 'og-image.svg'));
  const logoSvg = fs.readFileSync(path.join(publicDir, 'goalbangla-logo.svg'));

  console.log('Generating apple-touch-icon.png (180x180)...');
  await sharp(faviconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Generating favicon-32x32.png...');
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  console.log('Generating favicon.ico...');
  // A 32x32 png can also be copied as favicon.ico or converted
  const icoBuffer = await sharp(faviconSvg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  console.log('Generating og-image.png (1200x630)...');
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Generating goalbangla-logo.png (460x100)...');
  await sharp(logoSvg)
    .resize(460, 100)
    .png()
    .toFile(path.join(publicDir, 'goalbangla-logo.png'));

  console.log('All derived branding assets generated successfully!');
}

generate().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
