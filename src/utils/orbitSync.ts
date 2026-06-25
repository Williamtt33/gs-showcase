import type { OrbitControls } from 'gsplat'

/**
 * Force-sync OrbitControls internal spherical coordinates to a given target.
 * Sets the target, calls update() with zero dampening to instantly recompute
 * azimuth/elevation/distance from the current camera position, then restores
 * the specified dampening.
 */
export function syncOrbitControls(
  controls: OrbitControls,
  splatModule: typeof import('gsplat'),
  targetX: number,
  targetY: number,
  targetZ: number,
  restoreDampening = 0.2,
): void {
  controls.setCameraTarget(
    new splatModule.Vector3(targetX, targetY, targetZ),
  )
  // dampening=1 means immediate sync (0 means "never update")
  controls.dampening = 1
  controls.update()
  controls.dampening = restoreDampening
}
