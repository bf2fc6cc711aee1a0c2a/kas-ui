import React from "react";
import {
    CheckCircleIcon,
    PendingIcon,
    ExclamationCircleIcon
  } from "@patternfly/react-icons";
  import { Spinner } from '@patternfly/react-core';

type StatusColumnProps={
  status:string
}

const StatusColumn=({status}:StatusColumnProps)=>{
  let icon:React.ReactNode;
  switch (status?.toLowerCase()) {
    case "complete":
        icon = <CheckCircleIcon color="var(--pf-global--success-color--100)" />;
      break;
      case "failed":
        icon = <ExclamationCircleIcon color="var(--pf-global--danger-color--100)" />;
        break;
    case "provisioning":
      icon = <Spinner />;
      break;
    case "accepted":
      icon = <PendingIcon />;
      break;     
    default:
      icon = <PendingIcon />;
      break;
  }
  
  return (
    <>
      {icon}&nbsp;{status?.trim() !== "" ? status : "Pending"}
    </>
  );
}

export {StatusColumn};
