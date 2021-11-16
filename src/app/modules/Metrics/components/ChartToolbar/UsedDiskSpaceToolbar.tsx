import React from 'react';
import {
  Button,
  CardActions,
  CardHeader,
  CardTitle,
  Divider,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import SyncIcon from '@patternfly/react-icons/dist/js/icons/sync-icon';
import { FilterByTopic } from './FilterByTopic';
import { FilterByTime } from './FilterByTime';
import { FunctionComponent } from 'enzyme';

type UsedDiskSpaceToolbarProps = {
  title: string;
  isDisabled: boolean;
  onSetTimeDuration: (value: number) => void;
  onSetTimeInterval: (value: number) => void;
  onRefresh: () => void;
};
export const UsedDiskSpaceToolbar: FunctionComponent<UsedDiskSpaceToolbarProps> =
  ({ title, isDisabled, onSetTimeDuration, onSetTimeInterval, onRefresh }) => {
    return (
      <>
        <CardHeader>
          <CardTitle component='h2'>{title}</CardTitle>
          <CardActions>
            <Toolbar>
              <ToolbarContent>
                <FilterByTime
                  setTimeDuration={onSetTimeDuration}
                  setTimeInterval={onSetTimeInterval}
                  keyText={'kafka-metrics-time-filter'}
                  disableToolbar={isDisabled}
                />
                <Button variant='plain' aria-label='sync' onClick={onRefresh}>
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          </CardActions>
        </CardHeader>
        <Divider />
      </>
    );
  };
