import React from "react";
import {
  Button,
  CardActions,
  CardHeader,
  CardTitle,
  Divider,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import SyncIcon from "@patternfly/react-icons/dist/js/icons/sync-icon";
import { FilterByTopic } from "./FilterByTopic";
import { DurationOptions, FilterByTime } from "./FilterByTime";
import { FunctionComponent } from "enzyme";

type UsedDiskSpaceToolbarProps = {
  title: string;
  isDisabled: boolean;
  timeDuration: DurationOptions;
  onSetTimeDuration: (value: DurationOptions) => void;
  onRefresh: () => void;
};
export const UsedDiskSpaceToolbar: FunctionComponent<UsedDiskSpaceToolbarProps> =
  ({ title, isDisabled, timeDuration, onSetTimeDuration, onRefresh }) => {
    return (
      <>
        <CardHeader>
          <CardTitle component="h2">{title}</CardTitle>
          <CardActions>
            <Toolbar>
              <ToolbarContent>
                <FilterByTime
                  timeDuration={timeDuration}
                  onDurationChange={onSetTimeDuration}
                  keyText={"kafka-metrics-time-filter"}
                  disableToolbar={isDisabled}
                />
                <Button variant="plain" aria-label="sync" onClick={onRefresh}>
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
