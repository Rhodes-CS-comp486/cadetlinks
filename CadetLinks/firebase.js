import { FIREBASE_URL } from '@env';

import { FIREBASE_URL } from '@env';

// Fetch all cadets
export async function getCadets() {
  const response = await fetch(`${FIREBASE_URL}/cadets.json`);
  return await response.json();
}

// Fetch a single cadet by ID
export async function getCadet(cadetId) {
  const response = await fetch(`${FIREBASE_URL}/cadets/${cadetId}.json`);
  return await response.json();
}

// Fetch the job hierarchy
export async function getJobIndex() {
  const response = await fetch(`${FIREBASE_URL}/indexes/job.json`);
  return await response.json();
}