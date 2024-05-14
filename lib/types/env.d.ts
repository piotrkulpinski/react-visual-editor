declare global {
  declare module "fabric/fabric-impl" {
    interface IObjectOptions {
      id?: string | undefined
    }
  }
}
