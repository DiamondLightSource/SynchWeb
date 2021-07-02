import SampleTableNew from 'modules/types/saxs/samples/experiments/default/sample-table-new.vue'
import SampleTableView from 'modules/types/saxs/samples/experiments/default/sample-table-view.vue'

import SampleTableNewRobot from 'modules/types/saxs/samples/experiments/robot/sample-table-new.vue'
import SampleTableNewHplc from  'modules/types/saxs/samples/experiments/hplc/sample-table-new.vue'
import SampleTableNewRack from  'modules/types/saxs/samples/experiments/rack/sample-table-new.vue'

import SampleTableViewRobot from 'modules/types/saxs/samples/experiments/robot/sample-table-view.vue'
import SampleTableViewHplc from 'modules/types/saxs/samples/experiments/hplc/sample-table-view.vue'
import SampleTableViewRack from 'modules/types/saxs/samples/experiments/rack/sample-table-view.vue'

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
  ],
  rack: [
    { key: 'THICKNESS', title: 'Thickness' },
    { key: 'BACKGROUND_1', title: 'Background Location 1' },
    { key: 'BACKGROUND_2', title: 'Background Location 2' },
    { key: 'QRANGE', title: 'Q Range' },
  ]
}

export const SampleTableNewMap = {
  default: SampleTableNew,
  robot: SampleTableNewRobot,
  hplc: SampleTableNewHplc,
  rack: SampleTableNewRack,
}


export const SampleTableViewMap = {
  default: SampleTableView,
  robot: SampleTableViewRobot,
  hplc: SampleTableViewHplc,
  rack: SampleTableViewRack
}