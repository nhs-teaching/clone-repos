const { promisify } = require('util');
const fs = require('fs');
const parse = promisify(require('csv-parse'));

async function fetchRoster(path) {
  let file = fs.readFileSync(path).toString();

  return await parse(file, {
    columns: true  
  });
}

function getStudent(github, roster) {
  let user = roster.find((element) => {
    return element['Github'] === github; 
  });

  return user;
}

function writeStudentInfo(student, period, commit) {
  let date = commit.date();
  let message = commit.message()
  fs.writeFileSync('output.log', `Period: ${period}\nName: ${student['Student']}\nAuthor: ${student['Github']}\nDate: ${date}\n${message}`);
}

module.exports = {
  getStudent,
  fetchRoster,
  writeStudentInfo
};

