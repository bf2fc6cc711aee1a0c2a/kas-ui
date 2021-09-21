// lint-staged will call these scripts with a set of files - eg npm run x 'file.txt' 'styling.css' etc
const lintChecksForAllFiles = ['npm run lint:src', 'npm run lint:format']; // note: the licence tool, run as a part of `allfiles`, will update non staged files as well - this cannot be configured currently.

// https://github.com/okonet/lint-staged#configuration
module.exports = {
  '**': lintChecksForAllFiles,
};
