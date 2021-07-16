export class NewKafka {
  cloud_provider: string;
  multi_az: boolean;
  region: string;
  name: string;

  constructor() {
    this.cloud_provider = '';
    this.multi_az = true;
    this.region = '';
    this.name = '';
  }
}

export interface QuotaCost {
  /**
   *
   * @type {string}
   * @memberof QuotaCost
   */
  href?: string;
  /**
   *
   * @type {string}
   * @memberof QuotaCost
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof QuotaCost
   */
  kind?: string;
  /**
   *
   * @type {number}
   * @memberof QuotaCost
   */
  allowed: number;
  /**
   *
   * @type {number}
   * @memberof QuotaCost
   */
  consumed: number;
  /**
   *
   * @type {string}
   * @memberof QuotaCost
   */
  organization_id?: string;
  /**
   *
   * @type {string}
   * @memberof QuotaCost
   */
  quota_id: string;
}

export interface QuotaCostList {
  /**
   *
   * @type {string}
   * @memberof QuotaCostList
   */
  kind: string;
  /**
   *
   * @type {number}
   * @memberof QuotaCostList
   */
  page: number;
  /**
   *
   * @type {number}
   * @memberof QuotaCostList
   */
  size: number;
  /**
   *
   * @type {number}
   * @memberof QuotaCostList
   */
  total: number;
  /**
   *
   * @type {Array<QuotaCost>}
   * @memberof QuotaCostList
   */
  items: Array<QuotaCost>;
}
