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
import { Services } from '../../common/app-config';

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

  const actionResolver = (rowData: IRowData) => {
    return getActionResolver(
      rowData,
      onDeleteInstance
      );
  };


  const apisService = Services.getInstance().apiService;

  const onDeleteInstance = async (event) => {
    await apisService.deleteKafkaById("").then(res => {
      console.info("Kafka successfully deleted")
    })
    .catch(error => {
      console.log("Error deleting Kafka")
    })
  }

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
