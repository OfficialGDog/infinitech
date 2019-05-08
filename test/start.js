const expect = require('chai').expect;
const assert = require('chai').assert;

const user = require("../routes/user.js") 

const testConnectionPool = user.getConnection();

// describe('Mock Tests', function(){
//     it('Should pass this mock test', function() {
//         const pass = true;
//         expect(pass).to.equal(true);
//     })
    
//     it('Should fail this mock test', function() {
//         const pass = false;
//         expect(pass).to.equal(true);    
//     })
// })

describe('Test getConnection function', function(){
    it('Get connection should not throw an error', function() {
        expect(user.getConnection.bind(this)).to.not.throw();
    })
    it('Get connection should return an object', function() {
        expect(testConnectionPool).to.be.an('object')
    })    
})

describe('Verify Pool Object properties', function(){
    it('Pool object should contain config property', function() {
        assert.property(testConnectionPool, 'config')
    })
    it('Pool object config should contain host us-cdbr-iron-east-03.cleardb.net', function() {
        assert.nestedProperty(testConnectionPool, 'config.connectionConfig.host')
        assert.nestedPropertyVal(testConnectionPool, 'config.connectionConfig.host', 'us-cdbr-iron-east-03.cleardb.net')
    })
    it('Pool object config should supply user b64fbcbeb81ae0', function() {
        assert.nestedProperty(testConnectionPool, 'config.connectionConfig.user')
        assert.nestedPropertyVal(testConnectionPool, 'config.connectionConfig.user', 'b64fbcbeb81ae0')
    })
    it('Pool object config should use password 903dcf50', function() {
        assert.nestedProperty(testConnectionPool, 'config.connectionConfig.password')
        assert.nestedPropertyVal(testConnectionPool, 'config.connectionConfig.password', '903dcf50')
    })
    it('Pool object should connect to database heroku_ebed775274bf25d', function() {
        assert.nestedProperty(testConnectionPool, 'config.connectionConfig.database')
        assert.nestedPropertyVal(testConnectionPool, 'config.connectionConfig.database', 'heroku_ebed775274bf25d')
    })
    
})





