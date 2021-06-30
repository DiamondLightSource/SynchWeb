import SampleTableNew from 'modules/types/saxs/samples/experiments/default/sample-table-new.vue'
import SampleTableView from 'modules/types/saxs/samples/experiments/default/sample-table-view.vue'

import SampleTableNewRobot from 'modules/types/saxs/samples/experiments/robot/sample-table-new.vue'
import SampleTableNewHplc from  'modules/types/saxs/samples/experiments/hplc/sample-table-new.vue'

import SampleTableViewRobot from 'modules/types/saxs/samples/experiments/robot/sample-table-view.vue'
import SampleTableViewHplc from 'modules/types/saxs/samples/experiments/hplc/sample-table-view.vue'

export const SampleHeaders = {
  common: [
    {key: 'LOCATION', title: 'Location'},
    {key: 'PROTEINID', title: 'Acronym'},
    {key: 'NAME', title: 'Name'},
    {key: 'VOLUME', title: 'Volume (uL)'},
  ],
  robot: [
    { key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature' },
    { key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature' },
  ],
  hplc: [
    { key: 'PURIFICATIONCOLUMNID', title: 'Column' },
    { key: 'COMMENTS', title: 'Comment: Buffer Location' },
  ]
}

export const SampleTableNewMap = {
  default: SampleTableNew,
  robot: SampleTableNewRobot,
  hplc: SampleTableNewHplc,
}


export const SampleTableViewMap = {
  default: SampleTableView,
  robot: SampleTableViewRobot,
  hplc: SampleTableViewHplc
}