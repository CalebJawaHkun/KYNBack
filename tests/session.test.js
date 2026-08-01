const test = require('node:test')
const assert = require('assert')
const { setSession } = require('../routes/signcommon')

function createMockSession() {
  return {
    data: {},
    save(cb) {
      this.saved = true
      if (cb) cb(null)
    }
  }
}

test('setSession saves the session before returning', async () => {
    const req = { session: createMockSession() }

    await setSession(req, 'user-1', 'user', 'user@example.com', '', 'local')

    assert.strictEqual(req.session.clientData.userId, 'user-1')
    assert.strictEqual(req.session.saved, true)
})
