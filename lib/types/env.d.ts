declare global {
  declare module "fabric" {
    interface FabricObject {
      id?: string | undefined
    }
  }
}
