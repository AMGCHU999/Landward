import * as dotenv from 'dotenv';
import * as path from 'path';
import { createApplicant } from './certn';
import sampleApplicant from './fixtures/sample-applicant.json';

// Load environment variables from .env file at the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runExample() {
  console.log('Initiating Certn applicant submission for Landward...');

  try {
    // Submit applicant using the fixture data
    const result = await createApplicant(sampleApplicant);
    console.log('Successfully submitted applicant!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Failed to submit applicant to Certn:');
    console.error(error.message || error);
    // Removed explicit process.exit(1) to allow clean event loop termination
  }
}

runExample();
