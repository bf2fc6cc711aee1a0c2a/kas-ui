import { InstanceBaseProps } from '@app/common/ServiceTable/Table/ServiceTable';

export type ServiceStatus = {
  max_capacity_reached: boolean;
};

export type List<I extends InstanceBaseProps> = {
  /**
   *
   * @type {number}
   * @memberof List
   */
  page?: number;
  /**
   *
   * @type {number}
   * @memberof List
   */
  size?: number;
  /**
   *
   * @type {number}
   * @memberof List
   */
  total?: number;

  items?: Array<I>;
};
