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

/** Compute distance between two 3D points */
export function distance(a: Vector3Like, b: Vector3Like): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/** Lerp between two vectors */
export function lerpVec3(a: Vector3Like, b: Vector3Like, t: number): Vector3Like {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

/** Catmull-Rom spline interpolation (smooth camera path) */
export function catmullRom(
  p0: Vector3Like, p1: Vector3Like, p2: Vector3Like, p3: Vector3Like, t: number
): Vector3Like {
  const t2 = t * t
  const t3 = t2 * t
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  }
}

/** Interpolate along a set of waypoints using Catmull-Rom */
export function interpolateWaypoints(
  waypoints: Vector3Like[],
  t: number, // 0..1 across entire path
): Vector3Like {
  if (waypoints.length === 0) return { x: 0, y: 0, z: 0 }
  if (waypoints.length === 1) return waypoints[0]

  const totalSegments = waypoints.length - 1
  const segmentFloat = t * totalSegments
  const segmentIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1)
  const localT = segmentFloat - segmentIdx

  const p0 = waypoints[Math.max(0, segmentIdx - 1)]
  const p1 = waypoints[segmentIdx]
  const p2 = waypoints[Math.min(waypoints.length - 1, segmentIdx + 1)]
  const p3 = waypoints[Math.min(waypoints.length - 1, segmentIdx + 2)]

  return catmullRom(p0, p1, p2, p3, localT)
}

/** Compute look-at quaternion from position to target */
export function lookAtQuaternion(pos: Vector3Like, target: Vector3Like): { x: number; y: number; z: number; w: number } {
  const fx = target.x - pos.x
  const fy = target.y - pos.y
  const fz = target.z - pos.z
  const fLen = Math.sqrt(fx * fx + fy * fy + fz * fz)
  if (fLen < 0.0001) return { x: 0, y: 0, z: 0, w: 1 }
  const fwd = { x: fx / fLen, y: fy / fLen, z: fz / fLen }

  const worldUp = { x: 0, y: 1, z: 0 }
  let rx = worldUp.y * fwd.z - worldUp.z * fwd.y
  let ry = worldUp.z * fwd.x - worldUp.x * fwd.z
  let rz = worldUp.x * fwd.y - worldUp.y * fwd.x
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
  if (rLen < 0.0001) {
    rx = 1; ry = 0; rz = 0
  } else {
    rx /= rLen; ry /= rLen; rz /= rLen
  }

  const ux = fwd.y * rz - fwd.z * ry
  const uy = fwd.z * rx - fwd.x * rz
  const uz = fwd.x * ry - fwd.y * rx

  // Rotation matrix to quaternion
  const m00 = rx, m01 = ux, m02 = fwd.x
  const m10 = ry, m11 = uy, m12 = fwd.y
  const m20 = rz, m21 = uz, m22 = fwd.z

  const trace = m00 + m11 + m22
  let qx: number, qy: number, qz: number, qw: number

  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2
    qw = 0.25 * s
    qx = (m21 - m12) / s
    qy = (m02 - m20) / s
    qz = (m10 - m01) / s
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2
    qw = (m21 - m12) / s
    qx = 0.25 * s
    qy = (m01 + m10) / s
    qz = (m02 + m20) / s
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2
    qw = (m02 - m20) / s
    qx = (m01 + m10) / s
    qy = 0.25 * s
    qz = (m12 + m21) / s
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2
    qw = (m10 - m01) / s
    qx = (m02 + m20) / s
    qy = (m12 + m21) / s
    qz = 0.25 * s
  }

  return { x: qx, y: qy, z: qz, w: qw }
}
