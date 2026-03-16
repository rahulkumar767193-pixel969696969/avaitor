export const PLANE_SVG = `
<svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Propeller -->
  <rect x="72" y="5" width="2" height="30" fill="#E11D48">
    <animateTransform attributeName="transform" type="rotate" from="0 73 20" to="360 73 20" dur="0.1s" repeatCount="indefinite" />
  </rect>
  <!-- Body -->
  <path d="M10 20L20 15H50L70 20L50 25H20L10 20Z" fill="#E11D48" stroke="white" stroke-width="1"/>
  <!-- Wings -->
  <path d="M35 15L25 5H45L35 15Z" fill="#E11D48" stroke="white" stroke-width="1"/>
  <path d="M35 25L25 35H45L35 25Z" fill="#E11D48" stroke="white" stroke-width="1"/>
  <!-- Tail -->
  <path d="M10 20L2 12V28L10 20Z" fill="#E11D48" stroke="white" stroke-width="1"/>
  <!-- Details -->
  <text x="35" y="22" fill="white" font-size="8" font-weight="bold" font-family="Arial">X</text>
</svg>
`;

export const COLORS = {
  PRIMARY: '#E11D48',
  SECONDARY: '#28A745',
  BG_DARK: '#090A0F',
  BG_CARD: '#1B1C24',
  TEXT_WHITE: '#FFFFFF',
  TEXT_GRAY: '#94A3B8',
};
