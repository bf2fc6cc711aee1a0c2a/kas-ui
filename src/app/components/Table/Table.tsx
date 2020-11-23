import  React from 'react';
import {
  Table as PFTable,
  TableVariant,
  TableHeader,
  TableBody,
  IRowData
} from '@patternfly/react-table';
import { KafkaRequestAllOf } from '../../../openapi/api';
import {StatusColumn} from './StatusColumn';
import {InstanceStatus} from '@app/constants';

type TableProps = {
  kafkaInstanceItems: KafkaRequestAllOf[],
  mainToggle: boolean
}

const Table = ({mainToggle, kafkaInstanceItems}: TableProps) => {
  const tableColumns = [
    "Name",
    "Cloud provider",
    "Region",
    "Status"    
  ];

  const getActionResolver = (
    rowData: IRowData,
    onDelete: Function
  ) => {    
    const {originalData}=rowData;
    const title=originalData?.status===InstanceStatus.ACCEPTED? "Cancel instance":"Delete instance";
    return [         
      {
        title,
        id: "delete-instance",
        onClick: () => onDelete(originalData)
      }
    ];
  };

  const preparedTableCells = (row:any) => {
    const {name,cloud_provider,region,status}=row;
    const tableRow= {
      cells: [
        name,
        cloud_provider,
        region,
        {
          title:<StatusColumn status={status}/>
        } 
      ],
      originalData: row     
    };
    return tableRow;
  };

  const tableRows = kafkaInstanceItems.map(preparedTableCells);

  const onDeleteInstance=()=>{
    /**
     * Todo: delete instance functionality
     */
  }

  const actionResolver = (rowData: IRowData) => {
    return getActionResolver(
      rowData,
      onDeleteInstance
      );
  };

  return (
      <>
      <PFTable
        variant={TableVariant.compact}
        cells={tableColumns}
        rows={tableRows}
        aria-label="cluster instance list"     
        actionResolver={actionResolver}        
      >
        <TableHeader />
        <TableBody />
      </PFTable>
      </>
  )
}

export { Table };
