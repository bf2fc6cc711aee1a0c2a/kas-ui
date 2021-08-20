import React from 'react';
import { Label, Tooltip } from '@patternfly/react-core';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';
import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';

export type CreateInstanceLabelProps = {
  maxCapacityReached: boolean;
};

/**
 * Todo: remove after summit
 */
export const CreateInstanceLabel: React.FunctionComponent<CreateInstanceLabelProps> =
  ({ maxCapacityReached }) => {
    /**
     * Todo: remove after summit
     */
    const getLabelTooltipContent = () => {
      let content = '';
      if (maxCapacityReached) {
        content =
          'Development preview instances are currently unavailable for creation.';
      } else {
        content =
          'Development preview instances are available for creation. You can deploy 1 preview instance at a time.';
      }
      return content;
    };

    const content = getLabelTooltipContent();
    if (maxCapacityReached) {
      return (
        <Tooltip content={content}>
          <Label icon={<BanIcon />} className='pf-u-ml-md' tabIndex={0}>
            No instances available
          </Label>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip content={content}>
          <Label
            color='green'
            icon={<CheckIcon />}
            className='pf-u-ml-md'
            tabIndex={0}
          >
            Instances available
          </Label>
        </Tooltip>
      );
    }
  };
