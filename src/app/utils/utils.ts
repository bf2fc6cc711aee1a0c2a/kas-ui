function accessibleRouteChangeHandler() {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById('primary-app-container');
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}

type KeyValueOptions = {
  value: string;
  label: string;
};

enum InstanceStatus {
  READY = 'ready',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  PROVISIONING = 'provisioning',
  FAILED = 'failed',
  DEPROVISION = 'deprovision',
}

const cloudProviderOptions: KeyValueOptions[] = [
  { value: 'aws', label: 'Amazon Web Services' },
  // Only aws is supported for now
  // { value: 'azure', label: 'Microsoft Azure' },
  // { value: 'baremetal', label: 'Bare Metal' },
  // { value: 'gcp', label: 'Google Cloud Platform' },
  // { value: 'libvirt', label: 'Libvirt' },
  // { value: 'openstack', label: 'OpenStack' },
  // { value: 'vsphere', label: 'VSphere' },
];

const statusOptions: KeyValueOptions[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'accepted', label: 'Creation pending' },
  { value: 'provisioning', label: 'Creation in progress' },
  { value: 'preparing', label: 'Creation in progress' },
  { value: 'deprovision', label: 'Deletion in progress' },
];

const getCloudProviderDisplayName = (value: string) => {
  return cloudProviderOptions.find((option) => option.value === value)?.label || value;
};

const cloudRegionOptions: KeyValueOptions[] = [
  { value: 'us-east-1', label: 'US East, N. Virginia' },

  // Only us-east is supported for now
  // { value: 'ap-northeast-1', label: 'Asia Pacific, Tokyo' },
  // { value: 'ap-northeast-2', label: 'Asia Pacific, Seoul' },
  // { value: 'ap-south-1', label: 'Asia Pacific, Mumbai' },
  // { value: 'ap-southeast-1', label: 'Asia Pacific, Singapore' },
  // { value: 'ap-southeast-2', label: 'Asia Pacific, Sydney' },
  // { value: 'ca-central-1', label: 'Canada, Central' },
  // { value: 'eu-central-1', label: 'EU, Frankfurt' },
  // { value: 'eu-north-1', label: 'EU, Stockholm' },
  // { value: 'eu-west-1', label: 'EU, Ireland' },
  // { value: 'eu-west-2', label: 'EU, London' },
  // { value: 'eu-west-3', label: 'EU, Paris' },
  // { value: 'me-south-1', label: 'Middle East, Bahrain' },
  // { value: 'sa-east-1', label: 'South America, São Paulo' },
  // { value: 'us-east-2', label: 'US East, Ohio' },
  // { value: 'us-west-1', label: 'US West, N. California' },
  // { value: 'us-west-2', label: 'US West, Oregon' },
];
const getCloudRegionDisplayName = (value: string) => {
  return cloudRegionOptions.find((option) => option.value === value)?.label || value;
};

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const MAX_INSTANCE_NAME_LENGTH = 32;
const MAX_FILTER_LIMIT = 10;

const MIN_POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_INTERVAL = 10000; // 10 seconds
const AVG_LENGTH_OF_KAFKA_CREATION = 180000; // 3 min
const AVG_LENGTH_OF_KAFKA_DELETION = 60000; // 1 min

const isValidToken = (accessToken: string | undefined) => {
  if (accessToken !== undefined && accessToken !== '') {
    return true;
  }
  return false;
};

// function to get exact number of skeleton count required for the current page
const getLoadingRowsCount = (page: number, perPage: number, expectedTotal: number) => {
  // initiaise loadingRowCount by perPage
  let loadingRowCount = perPage;
  /*
    if number of expected count is greater than 0
      calculate the loadingRowCount
    else
      leave the loadingRowCount to perPage
   */
  if (expectedTotal && expectedTotal > 0) {
    // get total number of pages
    const totalPage =
      expectedTotal % perPage !== 0 ? Math.floor(expectedTotal / perPage) + 1 : Math.floor(expectedTotal / perPage);
    // check whether the current page is the last page
    if (page === totalPage) {
      // check whether to total expected count is greater than perPage count
      if (expectedTotal > perPage) {
        // assign the calculated skelton rows count to display the exact number of expected loading skelton rows
        loadingRowCount = expectedTotal % perPage === 0 ? perPage : expectedTotal % perPage;
      } else {
        loadingRowCount = expectedTotal;
      }
    }
  }
  // return the exact number of skeleton expected at the time of loading
  return loadingRowCount !== 0 ? loadingRowCount : perPage;
};

export {
  accessibleRouteChangeHandler,
  cloudProviderOptions,
  cloudRegionOptions,
  getCloudProviderDisplayName,
  getCloudRegionDisplayName,
  capitalize,
  statusOptions,
  InstanceStatus,
  MAX_INSTANCE_NAME_LENGTH,
  isValidToken,
  MAX_FILTER_LIMIT,
  MIN_POLL_INTERVAL,
  MAX_POLL_INTERVAL,
  AVG_LENGTH_OF_KAFKA_CREATION,
  AVG_LENGTH_OF_KAFKA_DELETION,
  getLoadingRowsCount
};
