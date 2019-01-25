/**
 * STEP 1: Fetch all the repositories
 * STEP 2: Clone them all
 * STEP 3: Run the test suite 
 * STEP 4: Generate score based off of which tests are passed
 *
 * @author Josh Rasmussen <rasmussenj@bsd405.org>
 */

const { execSync } = require('child_process');
const { getStudent, fetchRoster, writeStudentInfo } = require('./lookupUser.js');
const clone = require('./clone.js');
const mkdirp = require('mkdirp');
const Octokit = require('@octokit/rest');
const path = require('path');
const Git = require('nodegit');

/**
 * Authenticate using the access token from my account
 */

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_ACCESSTOKEN}`
});

async function fetchPage(org, page) {
  return await octokit.repos.listForOrg({
    org,
    type: 'private',
    page
  });
}

async function fetchAll(org, project) {
  let page_num = 1; 
  let repos = [];

  let results = await fetchPage(org, page_num);

  while (results.data.length > 0) {
    repos = repos.concat(results.data.filter((r) => {
      return r.name.split('-')[0] === project;
    }));
    
    page_num++;
    results = await fetchPage(org, page_num);
  }
  
  return repos;
}

(async function main() {
  // Make directory in 'repos' for the project
  const YEAR = process.argv[2];
  const PERIOD = process.argv[3];
  const PROJECT = process.argv[4];
  const ROSTER_FILE = process.argv[5];

  const ORG = `NHS-${YEAR}-P${PERIOD}-AP-Comp-Sci`;

  const roster = await fetchRoster(ROSTER_FILE);

  mkdirp.sync(path.join(__dirname, 'repos', ORG, PROJECT));

  // STEP 1
  let repos = await fetchAll(ORG, PROJECT);

  // STEP 2
  for (r of repos) {

    // Get the student from the roster provided
    let uname = r.name.substring(r.name.indexOf('-') + 1);
    let student = getStudent(uname, roster);

    // Clone the remote repository
    process.stdout.write(`Cloning into ${uname}\n${r.clone_url}\n`); 
    let local = path.join(__dirname, 'repos', ORG, PROJECT, uname);
    await clone(r.clone_url, local, process.env.GITHUB_UNAME);

    // Grab the head commit
    process.stdout.write('Fetching the HEAD commit...\n');
    let local_repo = await Git.Repository.open(local);   
    let commit = await local_repo.getHeadCommit();

    // Navigate to the directory
    process.stdout.write('Moving to directory...\n');
    process.chdir(local);

    // Generate output.log (minus the compile junk)
    if (student !== undefined) {
      process.stdout.write('Aggregate basic info...\n');
      writeStudentInfo(student, PERIOD, commit);   
    } else {
      process.stdout.write('Couldn\'t find student info...\n');
      process.stdout.write('Aggregate basic info...\n');
      writeStudentInfo('???', PERIOD, commit);   
    }

    // STEP 3
    try {
      // Run all the diagnostics on their code
      process.stdout.write(`Compiling JAR file...\n`);
      execSync('ant jar');
    } catch (e) {
      /* handle error */
      process.stdout.write('Error creating JAR\n');
    }

    try {
      process.stdout.write(`Running Checkstyle...\n`);
      execSync('ant check > /dev/null 2>&1');
    } catch (e) {
      /* handle error */
      process.stdout.write('Error Checking Style\n');
    }
    
    try {
      process.stdout.write(`Running Unit Tests...\n`);
      execSync('ant test > /dev/null 2>&1');
    } catch (e) {
      /* handle error */
      process.stdout.write('Error Running tests\n');
    }

    process.stdout.write('DONE!\n\n');  
    // STEP 4 is in the compile-repots project...
  };  
})();

