let masterScale = 1

export function getMasterDimmerScale(): number {
  return masterScale
}

export function setMasterDimmerScale(scale: number): void {
  if (Number.isNaN(scale) || !Number.isFinite(scale)) {
    masterScale = 1
    return
  }
  masterScale = Math.max(0, Math.min(1, scale))
}
