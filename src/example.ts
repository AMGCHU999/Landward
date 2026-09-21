import * as dotenv from 'dotenv';
import * as path from 'path';
import { orderScreeningCase } from './certn';
import sampleApplicant from './fixtures/sample-applicant.json';

// Load environment variables from .env file at the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runExample() {
  console.log('Ordering a Certn screening case for Landward...');

  try {
    // Order a case using the fixture data (sandbox unless CERTN_ENV=production)
    const result = await orderScreeningCase(sampleApplicant);
    console.log('Successfully ordered case!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Failed to submit applicant to Certn:');
    console.error(error.message || error);
    // Removed explicit process.exit(1) to allow clean event loop termination
  }
}

runExample();
