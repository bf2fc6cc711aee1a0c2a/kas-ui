import React from "react";
import {
    CheckCircleIcon,
    PendingIcon,
    ExclamationCircleIcon,
    IconSize
  } from "@patternfly/react-icons";
  import { Flex, FlexItem } from '@patternfly/react-core';
  import { Spinner } from '@patternfly/react-core';
  import {InstanceStatus} from '@app/constants';
  import "./StatusColumn.css";

type StatusColumnProps={
  status:string
}

const StatusColumn=({status}:StatusColumnProps)=>{
  let icon:React.ReactNode;
  const statusDisplayName=status===InstanceStatus.ACCEPTED?"pending":status;
  
  switch (status?.toLowerCase()) {
    case InstanceStatus.COMPLETED:
        icon = <CheckCircleIcon className="check-circle-icon-color" />;
      break;
      case InstanceStatus.FAILED:
        icon = <ExclamationCircleIcon className="exclamation-circle-icon-clolor" />;
        break;
    case InstanceStatus.PROVISIONING:
      icon = <Spinner size={IconSize.md}/>;
      break;
    case InstanceStatus.ACCEPTED:
      icon = <PendingIcon />;
      break;     
    default:
      icon = <PendingIcon />;
      break;
  }
 
  return (  
    <Flex>
      <FlexItem spacer={{ default: 'spacerSm' }}>
        {icon}
      </FlexItem>
      <FlexItem className="status-label-format">
       {statusDisplayName}
      </FlexItem>
    </Flex>
  );
}

export {StatusColumn};
