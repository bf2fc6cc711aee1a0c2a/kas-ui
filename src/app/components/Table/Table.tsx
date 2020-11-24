import  React from 'react';
import {
  Table as PFTable,
  TableHeader,
  TableBody
} from '@patternfly/react-table';
import {
  Card,CardBody
} from "@patternfly/react-core";
import { KafkaRequestAllOf } from '../../../openapi/api';
import {StatusColumn} from './StatusColumn';
import {InstanceStatus} from '@app/constants';
import { Services } from '../../common/app-config';
import {getCloudProviderDisplayName,getCloudRegionDisplayName} from "@app/utils";

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
    rowData: any,
    onDelete: (data:any)=>void
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

  const preparedTableCells = () => {
    const tableRow:any=[];
    kafkaInstanceItems.forEach((row:any)=>{
      const {name,cloud_provider,region,status}=row;
      const cloud_provider_display_name=getCloudProviderDisplayName(cloud_provider);
      const region_display_name=getCloudRegionDisplayName(region);
      tableRow.push({
        cells: [
          name,
          cloud_provider_display_name,
          region_display_name,
          {
            title:<StatusColumn status={status}/>
          } 
        ],
        originalData: row     
      })
    });
    return tableRow;
  };

  const actionResolver = (rowData: any) => {
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
      <Card>
        <CardBody>
        <PFTable       
          cells={tableColumns}
          rows={preparedTableCells()}
          aria-label="cluster instance list"     
          actionResolver={actionResolver}        
        >
          <TableHeader />
          <TableBody />
        </PFTable>
      </CardBody>
      </Card>
  )
}

export { Table };
