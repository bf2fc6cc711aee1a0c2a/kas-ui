export interface KafkaInstance {
  id: string,
  kind: string,
  href: string,
  status: string,
  cloud_provider: string,
  multi_az: boolean,
  region: string,
  owner: string,
  name: string,
  bootstrapServerHost: string,
  created_at: string,
  updated_at: string
}

export interface KafkaInstanceRequest {
  page: number,
  size: number,
  total: number,
  items: KafkaInstance[]
}
