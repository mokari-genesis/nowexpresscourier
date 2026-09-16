import { fetchResult } from 'libs/db.js'

const getUser = fetchResult(async ({ id }, conn) => {
  return conn.execute('SELECT * FROM users WHERE id = ?', [id])
})

export default {
  getUser,
}
