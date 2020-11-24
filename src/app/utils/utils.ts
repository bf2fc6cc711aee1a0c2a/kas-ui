function accessibleRouteChangeHandler() {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById('primary-app-container');
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}

const getCloudProviderDisplayName = (key: string) => {
  const keyLabels: any = {
    "aws":"Amazon Web Services",
    "azure":"Microsoft Azure",   
    "baremetal":"Bare Metal",
    "gcp":"Google Cloud Platform",
    "libvirt":"Libvirt",
    "openstack":"OpenStack",
    "vsphere":"VSphere"
  };

  if (key in keyLabels) {
    return keyLabels[key];
  }
  return key;
};

const getCloudRegionDisplayName = (key: string) => {
  const keyLabels: any = {
    "ap-northeast-1":"Asia Pacific, Tokyo",
    "ap-northeast-2": "Asia Pacific, Seoul",
    "ap-south-1":"Asia Pacific, Mumbai",
    "ap-southeast-1":"Asia Pacific, Singapore",
    "ap-southeast-2":"Asia Pacific, Sydney",
    "ca-central-1":"Canada, Central",
    "eu-central-1":"EU, Frankfurt",
    "eu-north-1":"EU, Stockholm",
    "eu-west-1":"EU, Ireland",
    "eu-west-2":"EU, London",
    "eu-west-3":"EU, Paris",
    "me-south-1":"Middle East, Bahrain",
    "sa-east-1":"South America, São Paulo",
    "us-east-1":"US East, N. Virginia",
    "us-east-2":"US East, Ohio",
    "us-west-1":"US West, N. California",
    "us-west-2":"US West, Oregon"
  };

  if (key in keyLabels) {
    return keyLabels[key];
  }
  return key;
};

export{
  accessibleRouteChangeHandler,
  getCloudProviderDisplayName,
  getCloudRegionDisplayName
};