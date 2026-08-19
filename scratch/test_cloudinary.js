import { createHash } from 'crypto';

async function main() {
  const cloudName = 'dk0ehzodv';
  const apiKey = '363764621792389';
  const apiSecret = 'SVDSNkLg-dxfWvx9TLHii6ZrVPQ';
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'friendship_story';

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(paramsToSign).digest('hex');

  // Real 1x1 transparent PNG image base64
  const realPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const formData = new FormData();
  formData.append('file', realPngBase64);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('signature', signature);

  console.log('Sending real image signed upload to Cloudinary...');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  console.log('Signed Upload Status:', res.status);
  console.log('Signed Upload Response:', data);
}

main().catch(console.error);
