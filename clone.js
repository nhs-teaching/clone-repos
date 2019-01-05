let Git = require('nodegit');

module.exports = (url, local, username) => {
  let cloneOptions = {};
  cloneOptions.fetchOpts = {
    callbacks: {
      certificateCheck: () => {
        return 1;
      },
      credentials: () => {
        return Git.Cred.userpassPlaintextNew(username, process.env.GITHUB_ACCESSTOKEN);
      }
    }
  };

  return Git.Clone(url, local, cloneOptions).catch((err) => console.log(err));
};

