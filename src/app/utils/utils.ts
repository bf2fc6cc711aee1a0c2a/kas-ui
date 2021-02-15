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

const isValidToken = (accessToken: string | undefined) => {
  if (accessToken !== undefined && accessToken !== '') {
    return true;
  }
  return false;
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
};
