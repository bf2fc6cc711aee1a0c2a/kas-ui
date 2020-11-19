export class NewKafka {

  cloud_provider: string;
  multi_az: boolean;
  region: string;
  owner: string;
  name: string;

  constructor() {
    this.cloud_provider = "";
    this.multi_az = false;
    this.region = "";
    this.owner = "";
    this.name = "";
  }
}
