import { copyFileSync } from 'fs';
import { join } from 'path';

const src = String.raw`C:\Users\USER\.gemini\antigravity\brain\06cb2252-6b0b-4136-82c5-3c2aa3ccc6f8\peplos_logo_v2_1784903627608.png`;
const dest1 = join(process.cwd(), 'public', 'icon.png');
const dest2 = join(process.cwd(), 'public', 'apple-touch-icon.png');

copyFileSync(src, dest1);
copyFileSync(src, dest2);
console.log('✅ Logo copied to public/icon.png and public/apple-touch-icon.png');
