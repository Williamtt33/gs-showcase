export type Lang = 'zh' | 'en'

export const translations = {
  zh: {
    nav: {
      home: '首页',
      gallery: '场景画廊',
      admin: '管理',
      upload: '上传',
    },
    lang: {
      switchTo: 'Switch to English',
    },
    hero: {
      title: '3D Gaussian Splatting',
      subtitle: '新一代三维重建技术 · 实时渲染 · 照片级真实感',
      ctaView: '探索场景',
      scrollHint: '向下滚动探索更多',
    },
    gallery: {
      title: '场景画廊',
      subtitle: '点击任意场景进入沉浸式 3D 体验',
      loading: '加载中...',
    },
    viewer: {
      back: '返回画廊',
      loading: '正在加载模型...',
      fps: '帧率',
      points: '高斯点数',
    },
    admin: {
      title: '模型管理',
      deleteConfirm: '确定要删除此模型吗？',
    },
    controls: {
      title: '操作说明',
      rotate: '左键拖拽 旋转',
      pan: '右键拖拽 平移',
      zoom: '滚轮 缩放',
      reset: 'R 重置视角',
    },
    footer: {
      tech: '技术栈',
      copyright: '© 2026 Gaussian Splatting Showcase. 基于 gsplat.js 构建。',
    },
  },
  en: {
    nav: {
      home: 'Home',
      gallery: 'Gallery',
      admin: 'Admin',
      upload: 'Upload',
    },
    lang: {
      switchTo: '切换到中文',
    },
    hero: {
      title: '3D Gaussian Splatting',
      subtitle: 'Next-Gen 3D Reconstruction · Real-Time Rendering · Photorealism',
      ctaView: 'Explore Scenes',
      scrollHint: 'Scroll down to explore',
    },
    gallery: {
      title: 'Scene Gallery',
      subtitle: 'Click any scene for an immersive 3D experience',
      loading: 'Loading...',
    },
    viewer: {
      back: 'Back to Gallery',
      loading: 'Loading model...',
      fps: 'FPS',
      points: 'Gaussians',
    },
    admin: {
      title: 'Model Management',
      deleteConfirm: 'Are you sure you want to delete this model?',
    },
    controls: {
      title: 'Controls',
      rotate: 'Left-drag to Rotate',
      pan: 'Right-drag to Pan',
      zoom: 'Scroll to Zoom',
      reset: 'R Reset View',
    },
    footer: {
      tech: 'Tech Stack',
      copyright: '© 2026 Gaussian Splatting Showcase. Built with gsplat.js.',
    },
  },
} as const
