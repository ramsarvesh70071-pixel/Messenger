// Same palette as the Pulse web app (frontend/src/styles/globals.css)
export const colors = {
  bg0: '#0a0e17',
  bg1: '#0f1420',
  bg2: '#141b2b',
  bg3: '#1a2236',
  glassBorder: 'rgba(255,255,255,0.08)',
  textHi: '#f2f4fa',
  textMid: '#aab2c8',
  textLow: '#6b7590',

  accentA: '#7c5cff',
  accentB: '#ff5cae',
  accentC: '#21e6c1',
  accentWarn: '#ffb020',
  accentDanger: '#ff5470',

  bubbleMineStart: '#6d4bff',
  bubbleMineMid: '#9c5cff',
  bubbleMineEnd: '#ff5cae',
};

export const gradients = {
  brand: [colors.accentA, colors.accentB],
  bubbleMine: [colors.bubbleMineStart, colors.bubbleMineMid, colors.bubbleMineEnd],
};
