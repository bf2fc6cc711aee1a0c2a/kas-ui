enum InstanceStatus{
  READY="ready",
  COMPLETE="complete", //remove this in future
  ACCEPTED="accepted",
  PREPARING="preparing",
  RESOURCE_CREATING="resource_creating", //remove this in future
  PROVISIONING="provisioning",
  FAILED="failed"
}

export{
  InstanceStatus
}