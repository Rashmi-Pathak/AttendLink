const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="100" fill="#0a0f1c"/>
    <text x="50%" y="55%" font-family="sans-serif" font-weight="bold" font-size="300" fill="#06b6d4" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>`;

const publicDir = path.join(__dirname, '../public');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgCode);

async function generateIcons() {
    try {
        await sharp(Buffer.from(svgCode)).resize(192, 192).toFile(path.join(publicDir, 'icon-192x192.png'));
        await sharp(Buffer.from(svgCode)).resize(512, 512).toFile(path.join(publicDir, 'icon-512x512.png'));
        await sharp(Buffer.from(svgCode)).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
        console.log("Icons generated successfully.");
    } catch (err) {
        console.error("Error generating icons:", err);
    }
}

generateIcons();
