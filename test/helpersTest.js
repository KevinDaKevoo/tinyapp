const { assert } = require('chai');

const { emailLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
    // Write your assert statement here
    
  });
  it('should return undefined with a not valid email', function() {
    const user = emailLookup("hello@example.com", testUsers);
    const expectedOutput = "undefined";
    assert.equal(user, expectedOutput);
    // Write your assert statement here
  });
});