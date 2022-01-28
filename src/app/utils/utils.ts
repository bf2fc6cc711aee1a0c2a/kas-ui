import { IRowCell, IRowData } from '@patternfly/react-table';
import { formatDistance } from 'date-fns';

function accessibleRouteChangeHandler(): number {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById('primary-app-container');
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}

export type KeyValueOptions = {
  value: string;
  label: string;
  disabled?: boolean;
};

enum InstanceStatus {
  READY = 'ready',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  PROVISIONING = 'provisioning',
  FAILED = 'failed',
  DEPROVISION = 'deprovision',
  DELETED = 'deleting',
}

enum InstanceType {
  eval = 'eval',
  standard = 'standard',
}

const cloudProviderOptions: KeyValueOptions[] = [
  { value: 'aws', label: 'Amazon Web Services' },
  // Only aws is supported for now
  // { value: 'azure', label: 'Microsoft Azure' },
  // { value: 'baremetal', label: 'Bare Metal' },
  // { value: 'gcp', label: 'Google Cloud Platform' },
  // { value: 'libvirt', label: 'Libvirt' },
  // { value: 'openstack', label: 'OpenStack' },
  // { value: 'vsphere', label: 'VSphere' },
];

const statusOptions: KeyValueOptions[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'accepted', label: 'Creation pending' },
  { value: 'provisioning', label: 'Creation in progress' },
  { value: 'preparing', label: 'Creation in progress' },
  { value: 'deprovision', label: 'Deletion in progress' },
  { value: 'deleting', label: 'Deletion in progress' },
];

const getCloudProviderDisplayName = (value: string): string => {
  return (
    cloudProviderOptions.find((option) => option.value === value)?.label ||
    value
  );
};

const cloudRegionOptions: KeyValueOptions[] = [
  { value: 'us-east-1', label: 'US East, N. Virginia' },
  { value: 'eu-west-1', label: 'EU, Ireland' },

  // Only us-east is supported for now
  // { value: 'ap-northeast-1', label: 'Asia Pacific, Tokyo' },
  // { value: 'ap-northeast-2', label: 'Asia Pacific, Seoul' },
  // { value: 'ap-south-1', label: 'Asia Pacific, Mumbai' },
  // { value: 'ap-southeast-1', label: 'Asia Pacific, Singapore' },
  // { value: 'ap-southeast-2', label: 'Asia Pacific, Sydney' },
  // { value: 'ca-central-1', label: 'Canada, Central' },
  // { value: 'eu-central-1', label: 'EU, Frankfurt' },
  // { value: 'eu-north-1', label: 'EU, Stockholm' },
  // { value: 'eu-west-2', label: 'EU, London' },
  // { value: 'eu-west-3', label: 'EU, Paris' },
  // { value: 'me-south-1', label: 'Middle East, Bahrain' },
  // { value: 'sa-east-1', label: 'South America, São Paulo' },
  // { value: 'us-east-2', label: 'US East, Ohio' },
  // { value: 'us-west-1', label: 'US West, N. California' },
  // { value: 'us-west-2', label: 'US West, Oregon' },
];

const MAX_INSTANCE_NAME_LENGTH = 32;
const MAX_FILTER_LIMIT = 10;
const MAX_SERVICE_ACCOUNT_NAME_LENGTH = 50;

const MAX_POLL_INTERVAL = 5000;

// function to get exact number of skeleton count required for the current page
const getLoadingRowsCount = (
  page: number,
  perPage: number,
  expectedTotal: number
): number => {
  // initiaise loadingRowCount by perPage
  let loadingRowCount = perPage;
  /*
    if number of expected count is greater than 0
      calculate the loadingRowCount
    else
      leave the loadingRowCount to perPage
   */
  if (expectedTotal && expectedTotal > 0) {
    // get total number of pages
    const totalPage =
      expectedTotal % perPage !== 0
        ? Math.floor(expectedTotal / perPage) + 1
        : Math.floor(expectedTotal / perPage);
    // check whether the current page is the last page
    if (page === totalPage) {
      // check whether to total expected count is greater than perPage count
      if (expectedTotal > perPage) {
        // assign the calculated skelton rows count to display the exact number of expected loading skelton rows
        loadingRowCount =
          expectedTotal % perPage === 0 ? perPage : expectedTotal % perPage;
      } else {
        loadingRowCount = expectedTotal;
      }
    }
  }
  // return the exact number of skeleton expected at the time of loading
  return loadingRowCount !== 0 ? loadingRowCount : perPage;
};

const sortValues = <T>(
  items: T[] | undefined,
  key: string,
  order = 'asc'
): T[] | undefined => {
  const compareValue = (a: T, b: T) => {
    if (
      !Object.prototype.hasOwnProperty.call(a, key) ||
      Object.prototype.hasOwnProperty.call(b, key)
    ) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === 'desc' ? comparison * -1 : comparison;
  };
  return items?.sort(compareValue);
};

const getFormattedDate = (
  date: string | Date,
  translatePostfix: string
): string => {
  date = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(date, new Date()) + ' ' + translatePostfix;
};

const getTimeLeft = (date: string | Date, kind?: string): string | number => {
  date = typeof date === 'string' ? new Date(date) : date;
  const timeOfExpiry = new Date(date);
  timeOfExpiry.setDate(timeOfExpiry.getDate() + 2);
  const currentDate = new Date();
  const timeLeft = timeOfExpiry.getTime() - currentDate.getTime();
  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor(
    (timeLeft - hours * (60 * 60 * 1000)) / ((60 * 60 * 1000) / 60)
  );
  if (kind == 'hours') return hours;
  else if (hours == 0)
    return minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute');
  else if (minutes == 0) return hours + ' ' + (hours > 1 ? 'hours' : 'hour');
  else
    return (
      hours +
      ' ' +
      (hours > 1 ? 'hours' : 'hour') +
      ' ' +
      minutes +
      ' ' +
      (minutes > 1 ? 'minutes' : 'minute')
    );
};

const getModalAppendTo = (): HTMLElement =>
  (document.getElementById('chrome-app-render-root') as HTMLElement) ||
  document.body;

const isMobileTablet = (): boolean => {
  let check = false;
  (function (a) {
    /* eslint-disable */
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window['opera']);
  return check;
};

const getSkeletonForRows = ({
  loadingCount,
  skeleton,
  length,
}: {
  loadingCount: number;
  skeleton: React.ReactNode;
  length: number;
}) => {
  const rows: (IRowData | string[])[] | undefined = [];
  const cells: (React.ReactNode | IRowCell)[] = [];
  //get exact number of skeletonCompoenet cells based on total columns
  for (let i = 0; i < length; i++) {
    cells.push({ title: skeleton });
  }
  // get exact of skeleton rows based on expected total count of instances
  for (let i = 0; i < loadingCount; i++) {
    rows.push({
      cells: cells,
    });
  }
  return rows;
};

export {
  accessibleRouteChangeHandler,
  cloudProviderOptions,
  cloudRegionOptions,
  getCloudProviderDisplayName,
  statusOptions,
  InstanceStatus,
  MAX_INSTANCE_NAME_LENGTH,
  MAX_FILTER_LIMIT,
  MAX_POLL_INTERVAL,
  getLoadingRowsCount,
  MAX_SERVICE_ACCOUNT_NAME_LENGTH,
  sortValues,
  getFormattedDate,
  getTimeLeft,
  getModalAppendTo,
  isMobileTablet,
  getSkeletonForRows,
  InstanceType,
};
