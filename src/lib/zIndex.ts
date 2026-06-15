/**
 * Camadas de empilhamento da UI (menor = mais atrás).
 * Usar estes valores em style={{ zIndex: Z.* }} ou z-[N] com o mesmo número.
 */
export const Z = {
  BACKGROUND: 0,
  HUD: 45,
  ALERT_BANNER: 100,
  PLAYER_LIST: 900,
  TABLETOP_SHELL: 980,
  TABLETOP_MAP: 990,
  SCENERY: 992,
  NPC_OVERLAY: 994,
  COMBAT_TRACKER: 995,
  MASTER_SHIELD: 996,
  MASTER_TOOLBAR: 1000,
  PROJECTION_CONTROLS: 1010,
  MODAL: 3000,
  SHEET: 3100,
  TABLETOP_MANAGER: 3200,
  ENEMY_BANK_EDITOR: 3210,
  TOKEN_EDITOR: 3220,
  CARD_ZOOM: 3300,
  TOAST: 4000,
  DICE_OVERLAY: 50000,
  CARD_CAST: 8999998,
  FEAR_ALERT: 9000000,
} as const;
