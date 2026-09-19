import * as reports from '../reports.js'

export default [
  {
    path: 'reports/guides/export',
    method: 'GET',
    handler: reports.exportGuides,
    public: false,
  },
  {
    path: 'reports/guides',
    method: 'GET',
    handler: reports.guides,
    public: true,
  },
]
