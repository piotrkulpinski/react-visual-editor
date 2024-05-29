import { FabricObject, ActiveSelection, Gradient, Pattern, Text, Group, Canvas } from "fabric"
import { Group as NativeGroup } from "fabric"
import { GuideLine } from "../objects/GuideLine"

const isActiveSelection = (thing: unknown): thing is ActiveSelection => {
  return thing instanceof ActiveSelection
}

const isGroup = (thing?: unknown): thing is Group => {
  return thing instanceof Group
}

const isCollection = (thing?: unknown): thing is Group | ActiveSelection | Canvas => {
  return !!thing && Array.isArray((thing as Group)._objects)
}

const isNativeGroup = (thing?: unknown): thing is NativeGroup => {
  return thing instanceof NativeGroup
}

const isGradient = (thing: unknown): thing is Gradient<"linear" | "radial"> => {
  return thing instanceof Gradient
}

const isPattern = (thing: unknown): thing is Pattern => {
  return thing instanceof Pattern
}

const isGuideLine = (thing: unknown): thing is GuideLine => {
  return thing instanceof GuideLine
}

const isTextObject = (thing?: FabricObject): thing is Text => {
  // we could use instanceof but that would mean pulling in Text code for a simple check
  // @todo discuss what to do and how to do
  return !!thing && thing.isType("Text", "IText", "Textbox", "ArcText")
}

export const check = {
  isCollection,
  isGradient,
  isPattern,
  isGuideLine,
  isActiveSelection,
  isTextObject,
  isGroup,
  isNativeGroup,
}
