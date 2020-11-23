export class NewKafka {

  cloud_provider: string;
  multi_az: boolean;
  region: string;
  name: string;

  constructor() {
    this.cloud_provider = "";
    this.multi_az = false;
    this.region = "";
    this.name = "";
  }
}
