const expect = require('chai').expect;

it('Should pass this mock test', function() {
    const pass = true;
    expect(pass).to.equal(true);
})

it('Should fail this mock test', function() {
    const pass = false;
    expect(pass).to.equal(true);
})

