import { uploadDefaultSocialLinks } from '../lib/firestore/social-links';

async function runUpload() {
  console.log('Starting social links upload...');
  try {
    await uploadDefaultSocialLinks();
    console.log('Social links uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

// Auto-run the upload
runUpload();

export { runUpload };
