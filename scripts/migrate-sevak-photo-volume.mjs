import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, constants, lstat, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const container = process.argv[2] || 'bigbro-bigbro-1';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hostDirectory = path.join(projectRoot, 'public', 'sample-sevak');
const stagingDirectory = await mkdtemp(path.join(os.tmpdir(), 'bigbro-sevak-photos-'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

try {
  await lstat(hostDirectory);
  console.log(`Copying photo files from ${container}:/app/public/sample-sevak into a temporary staging folder.`);
  execFileSync('docker', ['cp', `${container}:/app/public/sample-sevak/.`, stagingDirectory], { stdio: 'inherit' });

  const entries = await readdir(stagingDirectory, { withFileTypes: true });
  if (entries.some((entry) => !entry.isFile())) {
    throw new Error('The container photo folder contains non-file entries; nothing was copied to the project folder.');
  }

  const stagedFiles = await Promise.all(entries.map(async (entry) => {
    const source = path.join(stagingDirectory, entry.name);
    const destination = path.join(hostDirectory, entry.name);
    const sourceBytes = await readFile(source);
    try {
      const destinationBytes = await readFile(destination);
      if (sha256(sourceBytes) !== sha256(destinationBytes)) {
        throw new Error(`Filename conflict for ${entry.name}; both copies were preserved and no files were copied.`);
      }
      return { source, destination, exists: true };
    } catch (error) {
      if (error?.code === 'ENOENT') return { source, destination, exists: false };
      throw error;
    }
  }));

  let copied = 0;
  for (const file of stagedFiles) {
    if (file.exists) continue;
    // Exclusive creation prevents overwriting a host file added after the preflight.
    await copyFile(file.source, file.destination, constants.COPYFILE_EXCL);
    copied += 1;
  }
  console.log(`Migration complete: copied ${copied} new photo(s); identical existing files were left untouched.`);
  console.log('The source Docker volume was not modified or deleted.');
} finally {
  await rm(stagingDirectory, { recursive: true, force: true });
}
