import fs from 'fs';

const files = [
  'src/components/LandingGateway.tsx',
  'src/components/UserAuthView.tsx',
  'src/components/VendorAuthView.tsx'
];

const urls = new Set<string>();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/https:\/\/images\.unsplash\.com\/[^\s'"]+/g) || [];
  matches.forEach(m => urls.add(m));
});

console.log('Testing', urls.size, 'unique URLs...');
async function test() {
  for (const url of Array.from(urls)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.log('FAILED:', res.status, url);
      }
    } catch (err: any) {
      console.log('ERROR:', err.message, url);
    }
  }
  console.log('Done testing!');
}
test();
