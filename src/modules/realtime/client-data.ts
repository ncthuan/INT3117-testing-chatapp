export class ClientData {
  private readonly data = new Map<string, Map<string, any>>();

  async get(clientId: string, key: string) {
    const dataMap = this.data.get(clientId);
    if (dataMap) return dataMap.get(key);
  }

  async set(clientId: string, key: string, value: any) {
    let dataMap = this.data.get(clientId);
    if (!dataMap) {
      dataMap = new Map<string, any>();
      this.data.set(clientId, dataMap);
    }
    dataMap.set(key, value);
  }

  async delete(clientId: string, key?: string) {
    if (key) {
      const dataMap = this.data.get(clientId);
      if (dataMap) dataMap.delete(key);
    } else {
      this.data.delete(clientId);
    }
  }
}
