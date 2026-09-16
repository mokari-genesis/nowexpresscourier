import * as reports from '../reports.js'

export default [
  {
    path: 'reports/guides',
    method: 'GET',
    handler: reports.guides,
    public: true,
  },
]
