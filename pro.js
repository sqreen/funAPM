const Profile = require('cpuprofile').Profile;

// read and parse a .cpuprofile file
let content = require('fs').readFileSync('profile.json', {encoding: 'utf8'});
let parsed = JSON.parse(content);

console.log(Object.keys(parsed))

// create Profile
let profile = Profile.createFromObject(parsed.head);

// generate formatted overview on self and total times
// let output = profile.formattedBottomUpProfile();

console.log(profile)

