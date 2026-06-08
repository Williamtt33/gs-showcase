import type { Vector3Like } from '../types'

/** Project a 3D world point to 2D screen coordinates */
export function worldToScreen(
  worldPos: Vector3Like,
  cameraPos: Vector3Like,
  cameraForward: Vector3Like,
  fovY: number,
  screenWidth: number,
  screenHeight: number,
): { x: number; y: number; visible: boolean } | null {
  // Compute camera basis vectors
  const worldUp = { x: 0, y: 1, z: 0 }

  // forward = cameraForward (normalized)
  const fLen = Math.sqrt(cameraForward.x ** 2 + cameraForward.y ** 2 + cameraForward.z ** 2)
  const fwd = { x: cameraForward.x / fLen, y: cameraForward.y / fLen, z: cameraForward.z / fLen }

  // right = normalize(cross(worldUp, forward))
  let rx = worldUp.y * fwd.z - worldUp.z * fwd.y
  let ry = worldUp.z * fwd.x - worldUp.x * fwd.z
  let rz = worldUp.x * fwd.y - worldUp.y * fwd.x
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
  if (rLen < 0.0001) {
    rx = 1; ry = 0; rz = 0
  } else {
    rx /= rLen; ry /= rLen; rz /= rLen
  }

  // up = cross(forward, right)
  const ux = fwd.y * rz - fwd.z * ry
  const uy = fwd.z * rx - fwd.x * rz
  const uz = fwd.x * ry - fwd.y * rx

  // Vector from camera to world point
  const dx = worldPos.x - cameraPos.x
  const dy = worldPos.y - cameraPos.y
  const dz = worldPos.z - cameraPos.z

  // Transform to view space
  const vx = dx * rx + dy * ry + dz * rz     // right component
  const vy = dx * ux + dy * uy + dz * uz     // up component
  const vz = dx * fwd.x + dy * fwd.y + dz * fwd.z // forward component

  // Behind camera
  if (vz <= 0.001) return null

  // Perspective projection
  const aspect = screenWidth / screenHeight
  const tanHalfFov = Math.tan((fovY * Math.PI) / 360)
  const h = 2 * tanHalfFov * vz
  const w = h * aspect

  const ndcX = vx / (w / 2)
  const ndcY = -(vy / (h / 2))  // flip Y

  const screenX = (ndcX + 1) / 2 * screenWidth
  const screenY = (ndcY + 1) / 2 * screenHeight

  const visible = screenX >= -50 && screenX <= screenWidth + 50 &&
                  screenY >= -50 && screenY <= screenHeight + 50

  return { x: screenX, y: screenY, visible }
}
