import { getMeeraSprite } from './sprites';
import { HubDestination } from '../types/game';

export interface LandmarkRenderOptions {
  isNearby: boolean;
  isHovered: boolean;
  isSelected: boolean;
  selectionProgress: number; // 0..1 during selection beat
  isVisited: boolean;
}

export function drawLandmarkBuilding(
  ctx: CanvasRenderingContext2D,
  dest: HubDestination,
  tick: number,
  opts: LandmarkRenderOptions
) {
  const { x, y, width, height, id, accentColor } = dest;
  const cx = x + width / 2;
  const { isNearby, isHovered, isSelected, selectionProgress, isVisited } = opts;
  const active = isNearby || isHovered || isSelected;
  const brightnessLift = isSelected ? 1 : active ? 0.85 : 0;

  // Multi-tiered stone terrace plinth for strong grounded architectural silhouette
  ctx.fillStyle = '#0B0F1E';
  ctx.fillRect(x - 18, y + height - 16, width + 36, 34);
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(x - 14, y + height - 20, width + 28, 28);
  ctx.fillStyle = active ? accentColor : '#3B307D';
  ctx.globalAlpha = active ? 0.45 : 0.85;
  ctx.fillRect(x - 14, y + height - 20, width + 28, 4);
  ctx.globalAlpha = 1;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x + 4, y + height - 6, width - 8, 16);

  // Subtle ambient ground lighting beneath building matching its identity
  const glowColor =
    id === 'profile'
      ? 'rgba(255, 62, 157, '
      : id === 'missions'
      ? 'rgba(239, 68, 68, '
      : id === 'skills'
      ? 'rgba(56, 189, 248, '
      : id === 'academy'
      ? 'rgba(168, 85, 247, '
      : id === 'trophies'
      ? 'rgba(245, 158, 11, '
      : 'rgba(56, 189, 248, ';

  const ambientRadius = Math.max(width, height) * (active ? 0.78 : 0.62);
  const glowAlpha = active ? 0.24 : 0.12;
  const rad = ctx.createRadialGradient(
    cx,
    y + height * 0.65,
    12,
    cx,
    y + height * 0.65,
    ambientRadius
  );
  rad.addColorStop(0, `${glowColor}${glowAlpha})`);
  rad.addColorStop(1, `${glowColor}0)`);
  ctx.fillStyle = rad;
  ctx.beginPath();
  ctx.arc(cx, y + height * 0.65, ambientRadius, 0, Math.PI * 2);
  ctx.fill();

  // Selection surge ring
  if (isSelected && selectionProgress > 0) {
    const surgeR = width * (0.55 + selectionProgress * 0.85);
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = Math.max(0, 1 - selectionProgress);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, y + height * 0.75, surgeR, surgeR * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (id === 'profile') {
    // ------------------------------------------------------------------
    // PLAYER PROFILE: Cozy Two-Story Designer Atelier (Pink/Red + Emerald)
    // ------------------------------------------------------------------
    // Left Studio Wing + Main Villa Body
    ctx.fillStyle = '#251B4C';
    ctx.fillRect(x + 12, y + 48, width - 24, height - 48);
    ctx.fillStyle = '#332568';
    ctx.fillRect(x + 18, y + 54, width - 36, height - 60);

    // Gable Pitched Roof (Pink & Coral-Red Neon Trim)
    ctx.fillStyle = '#9D174D';
    ctx.fillRect(x + 2, y + 32, width - 4, 22);
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x + 14, y + 18, width - 28, 16);
    ctx.fillStyle = '#FB7185';
    ctx.fillRect(x + 32, y + 6, width - 64, 14);
    ctx.fillStyle = active ? '#FFF1F2' : '#FDA4AF';
    ctx.fillRect(x + 2, y + 50, width - 4, 4);

    // Cozy Brick Chimney + Drifting Pixel Smoke Puffs
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(x + width - 44, y - 10, 18, 28);
    ctx.fillStyle = '#FB7185';
    ctx.fillRect(x + width - 46, y - 12, 22, 4);
    for (let s = 0; s < 3; s++) {
      const cycle = ((tick * 0.38 + s * 11) % 32) / 32;
      const sx = x + width - 38 + Math.sin(cycle * 5 + s) * 6;
      const sy = y - 16 - cycle * 26;
      ctx.fillStyle = `rgba(253, 224, 240, ${(1 - cycle) * 0.72})`;
      ctx.fillRect(sx, sy, 8 + cycle * 4, 6 + cycle * 2);
    }

    // Animated Studio Bay Windows (Warm pulsing pink/amber studio glow)
    const winFlicker = 0.78 + 0.22 * Math.sin(tick * 0.08);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 24, y + 68, 48, 38);
    ctx.fillStyle = `rgba(255, 117, 181, ${winFlicker})`;
    ctx.fillRect(x + 28, y + 72, 40, 30);
    // Interior desk lamp silhouette & easel bars inside window
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(x + 34, y + 78, 10, 10);
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(x + 47, y + 72, 3, 30);
    ctx.fillRect(x + 28, y + 86, 40, 3);

    // Window planter box with swaying emerald leaves + pink blooms
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x + 24, y + 106, 48, 8);
    const bloomShift = Math.round(Math.sin(tick * 0.07));
    ctx.fillStyle = '#22FF88';
    ctx.fillRect(x + 28 + bloomShift, y + 100, 12, 6);
    ctx.fillRect(x + 50 - bloomShift, y + 100, 14, 6);
    ctx.fillStyle = '#FF3E9D';
    ctx.fillRect(x + 32 + bloomShift, y + 98, 4, 4);
    ctx.fillRect(x + 56 - bloomShift, y + 98, 4, 4);

    // Arched Glowing Atelier Doorway + Warm Threshold Spill
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(cx + 8, y + height - 58, 48, 58);
    ctx.fillStyle = '#06060E';
    ctx.fillRect(cx + 14, y + height - 52, 36, 52);
    ctx.fillStyle = active ? '#FF75B5' : '#22FF88';
    ctx.fillRect(cx + 18, y + height - 48, 28, 48);
    // Warm porch light spill
    ctx.fillStyle = active ? 'rgba(255, 62, 157, 0.35)' : 'rgba(251, 113, 133, 0.2)';
    ctx.fillRect(cx + 10, y + height - 4, 44, 8);
    // Wall lantern left of door
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(cx - 2, y + height - 42, 6, 8);

    // Environmental reaction: Waving mini-portrait hologram on hover/proximity
    if (active) {
      const waveSpr = getMeeraSprite(Math.floor(tick / 12) % 2 === 0 ? 'wave' : 'idle1');
      ctx.drawImage(waveSpr, x - 26, y + height - 66, waveSpr.width * 2.6, waveSpr.height * 2.6);
    }
  } else if (id === 'missions') {
    // ------------------------------------------------------------------
    // MISSION CONTROL: Command Citadel with Red Alert Beacons & Live Screen
    // ------------------------------------------------------------------
    // Heavy Stepped Command Bunker Body
    ctx.fillStyle = '#14112B';
    ctx.fillRect(x + 14, y + 36, width - 28, height - 36);
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(x + 22, y + 42, width - 44, height - 46);

    // Left & Right Armored Telemetry Towers
    ctx.fillStyle = '#2A215C';
    ctx.fillRect(x + 2, y + 14, 38, height - 14);
    ctx.fillRect(x + width - 40, y + 14, 38, height - 14);

    // Red-Alert Strobing Beacons on Twin Towers
    const alertPhase = Math.sin(tick * (active ? 0.22 : 0.1));
    const beaconBright = alertPhase > 0;
    ctx.fillStyle = beaconBright ? '#EF4444' : '#7F1D1D';
    ctx.fillRect(x + 12, y, 18, 14);
    ctx.fillRect(x + width - 30, y, 18, 14);
    if (beaconBright) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.26)';
      ctx.beginPath();
      ctx.arc(x + 21, y + 6, active ? 26 : 18, 0, Math.PI * 2);
      ctx.arc(x + width - 21, y + 6, active ? 26 : 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center Rotating Radar Dish Array above Screen
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 4, y + 8, 8, 20);
    const dishW = 14 + Math.round(Math.cos(tick * 0.06) * 10);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(cx - Math.abs(dishW) / 2, y + 2, Math.abs(dishW), 10);
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(cx - 2, y - 2, 4, 4);

    // Parapet Alert Status Strip
    for (let led = 0; led < 5; led++) {
      const on = Math.floor(tick / 10 + led) % 5 === 0;
      ctx.fillStyle = on ? '#EF4444' : '#FFD93D';
      ctx.fillRect(cx - 50 + led * 24, y + 30, 8, 4);
    }

    // Large Mission Control Display Screen
    ctx.fillStyle = '#04060E';
    ctx.fillRect(cx - 60, y + 44, 120, 62);
    ctx.strokeStyle = active ? '#EF4444' : '#FFD93D';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 60, y + 44, 120, 62);

    // Animated telemetry wireframes + pulsing waveform inside display
    const screenPhase = Math.floor(tick / (active ? 32 : 64)) % 3;
    const pColor = screenPhase === 0 ? '#22FF88' : screenPhase === 1 ? '#FF3E9D' : '#38BDF8';
    ctx.fillStyle = pColor;
    ctx.fillRect(cx - 52, y + 51, 46, 8);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(cx + 34, y + 51, 18, 8);
    // Mini wireframe layout & telemetry bars
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(cx - 52, y + 63, 56, 34);
    for (let bar = 0; bar < 5; bar++) {
      const bh = 8 + Math.round(Math.abs(Math.sin(tick * 0.12 + bar)) * 22);
      ctx.fillStyle = pColor;
      ctx.fillRect(cx + 10 + bar * 8, y + 97 - bh, 5, bh);
    }
    const scanX = cx - 54 + ((tick * (active ? 2.4 : 1.3)) % 106);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(scanX, y + 48, 3, 54);

    // Armored Command Bay Gate
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(cx - 28, y + height - 56, 56, 56);
    ctx.fillStyle = '#06060E';
    ctx.fillRect(cx - 22, y + height - 50, 44, 50);
    ctx.fillStyle = active ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 217, 61, 0.25)';
    ctx.fillRect(cx - 18, y + height - 46, 36, 46);
  } else if (id === 'skills') {
    // ------------------------------------------------------------------
    // SKILL LAB: Futuristic Cyber Observatory (Cyan & Emerald Energy)
    // ------------------------------------------------------------------
    // Main Lab Chassis + Side Containment Tanks
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 14, y + 54, width - 28, height - 54);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + 22, y + 58, width - 44, height - 62);

    // Stepped Glass Dome Roof
    ctx.fillStyle = '#164E63';
    ctx.fillRect(x + 28, y + 26, width - 56, 30);
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(x + 48, y + 12, width - 96, 16);
    // Tesla Energy Spire on Roof
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cx - 3, y - 14, 6, 26);
    ctx.fillStyle = tick % 18 < 9 ? '#22FF88' : '#38BDF8';
    ctx.fillRect(cx - 7, y - 18, 14, 8);

    // Left & Right Bubbling Bio-Design Containment Cylinders
    for (const sideX of [x + 18, x + width - 38]) {
      ctx.fillStyle = '#042F2E';
      ctx.fillRect(sideX, y + 64, 20, 56);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(sideX, y + 64, 20, 56);
      // Rising bubbles inside glass cylinders
      const bubbleY1 = y + 114 - ((tick * 1.1) % 44);
      const bubbleY2 = y + 114 - ((tick * 1.1 + 22) % 44);
      ctx.fillStyle = '#22FF88';
      ctx.fillRect(sideX + 5, bubbleY1, 5, 5);
      ctx.fillStyle = '#67E8F9';
      ctx.fillRect(sideX + 10, bubbleY2, 4, 4);
    }

    // Center Illuminated Oscilloscope / Prototype Test Window
    ctx.fillStyle = '#06060E';
    ctx.fillRect(cx - 38, y + 64, 76, 34);
    ctx.strokeStyle = '#22FF88';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 38, y + 64, 76, 34);
    for (let wx = 0; wx < 10; wx++) {
      const waveY = y + 81 + Math.round(Math.sin(tick * 0.16 + wx * 0.65) * 9);
      ctx.fillStyle = wx % 2 === 0 ? '#22FF88' : '#38BDF8';
      ctx.fillRect(cx - 32 + wx * 7, waveY, 4, 4);
    }

    // Orbiting Prototype Cubes around Spire (faster & brighter on hover!)
    const speed = active ? 0.08 : 0.04;
    const orb1X = cx + Math.cos(tick * speed) * 62;
    const orb1Y = y + 16 + Math.sin(tick * speed) * 10;
    const orb2X = cx + Math.cos(tick * speed + Math.PI) * 62;
    const orb2Y = y + 16 + Math.sin(tick * speed + Math.PI) * 10;
    ctx.fillStyle = '#22FF88';
    ctx.fillRect(orb1X - 5, orb1Y - 5, 10, 10);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(orb2X - 5, orb2Y - 5, 10, 10);

    // Glowing Airlock Door
    ctx.fillStyle = '#06060E';
    ctx.fillRect(cx - 22, y + height - 48, 44, 48);
    ctx.fillStyle = active ? '#22FF88' : '#38BDF8';
    ctx.fillRect(cx - 16, y + height - 42, 32, 42);
  } else if (id === 'academy') {
    // ------------------------------------------------------------------
    // TRAINING ACADEMY: Purple Starlight Citadel & Clock-Spire Library
    // ------------------------------------------------------------------
    // Main Stone Hall
    ctx.fillStyle = '#240C4E';
    ctx.fillRect(x + 14, y + 40, width - 28, height - 40);
    // Flanking Scholar Buttresses
    ctx.fillStyle = '#3B0764';
    ctx.fillRect(x + 10, y + 42, 16, height - 42);
    ctx.fillRect(x + width - 26, y + 42, 16, height - 42);

    // Stepped Violet Roof & Central Belfry Spire
    ctx.fillStyle = '#7E22CE';
    ctx.fillRect(x + 6, y + 22, width - 12, 20);
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(cx - 28, y + 2, 56, 22);
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(cx - 10, y - 14, 20, 16);

    // Illuminated Astronomical Clock / Astrolabe Window
    ctx.fillStyle = '#0F0720';
    ctx.beginPath();
    ctx.arc(cx, y + 60, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Moving clock hands
    const handAngle = tick * 0.04;
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, y + 60);
    ctx.lineTo(cx + Math.cos(handAngle) * 13, y + 60 + Math.sin(handAngle) * 13);
    ctx.stroke();

    // Tall Gothic Arched Library Windows Left & Right
    for (const wx of [x + 32, x + width - 50]) {
      ctx.fillStyle = '#C084FC';
      ctx.fillRect(wx, y + 54, 18, 42);
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(wx + 4, y + 58, 10, 34);
    }

    // Oak Double-Door + Stone Steps
    ctx.fillStyle = '#78350F';
    ctx.fillRect(cx - 22, y + height - 48, 44, 48);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(cx - 16, y + height - 42, 14, 42);
    ctx.fillRect(cx + 2, y + height - 42, 14, 42);

    // Floating Starlight Books drifting near eaves
    const lift = active ? -10 : 0;
    const b1Y = y + 12 + lift + Math.sin(tick * 0.07) * 5;
    const b2Y = y + 18 + lift + Math.cos(tick * 0.07) * 5;
    ctx.fillStyle = '#22FF88';
    ctx.fillRect(x + 8, b1Y, 16, 11);
    ctx.fillStyle = '#FF75B5';
    ctx.fillRect(x + width - 24, b2Y, 16, 11);
  } else if (id === 'trophies') {
    // ------------------------------------------------------------------
    // TROPHY GALLERY: Golden Exhibition Pavilion with Visible Vitrines
    // ------------------------------------------------------------------
    // Marble & Dark Velvet Hall Body
    ctx.fillStyle = '#1E162B';
    ctx.fillRect(x + 10, y + 40, width - 20, height - 40);

    // Tiered Golden Pediment Crown
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x + 2, y + 24, width - 4, 18);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(x + 22, y + 10, width - 44, 14);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(cx - 22, y, 44, 10);

    // Golden Pillars framing Wide Glass Display Vitrines
    for (const colX of [x + 14, x + width - 26]) {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(colX, y + 42, 12, height - 42);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(colX + 3, y + 42, 4, height - 42);
    }

    // Wide Illuminated Glass Vitrine Showcasing 3 Trophies Visible From Outside!
    ctx.fillStyle = '#090714';
    ctx.fillRect(x + 32, y + 48, width - 64, 46);
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 32, y + 48, width - 64, 46);

    // Soft sweeping spotlight beam inside vitrine
    const beamX = x + 38 + ((Math.sin(tick * 0.05) + 1) / 2) * (width - 96);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.fillRect(beamX, y + 50, 22, 42);

    // 3 Visible Pixel Trophies inside showcase
    const trophyXs = [cx - 38, cx, cx + 38];
    trophyXs.forEach((tx, ti) => {
      const shimmer = Math.floor(tick / 14 + ti) % 3 === 0;
      ctx.fillStyle = shimmer ? '#FFFFFF' : '#FFD93D';
      ctx.fillRect(tx - 6, y + 60, 12, 10);
      ctx.fillRect(tx - 2, y + 70, 4, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(tx - 8, y + 78, 16, 6);
    });

    // Red-Carpet Entrance Steps + Gold Arch Door
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(cx - 22, y + height - 6, 44, 18);
    ctx.fillStyle = '#DB2777';
    ctx.fillRect(cx - 18, y + height - 46, 36, 46);
    ctx.fillStyle = '#FFD93D';
    ctx.fillRect(cx - 14, y + height - 42, 28, 42);

    // Celebratory floating gold sparkles above pediment
    for (let sp = 0; sp < 4; sp++) {
      const sOff = (tick * 0.6 + sp * 18) % 36;
      ctx.fillStyle = sp % 2 === 0 ? '#FEF08A' : '#FF75B5';
      ctx.globalAlpha = Math.max(0, 1 - sOff / 36);
      ctx.fillRect(x + 36 + sp * 36, y - 4 - sOff * 0.7, 4, 4);
    }
    ctx.globalAlpha = 1;
  } else {
    // ------------------------------------------------------------------
    // CONNECTION PORTAL: Celestial Rune Monolith Arch & Energy Vortex
    // ------------------------------------------------------------------
    // Stone Dais & Runic Monolith Pillars
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 18, y + 24, width - 36, height - 24);
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x + 12, y + 18, 28, height - 18);
    ctx.fillRect(x + width - 40, y + 18, 28, height - 18);
    ctx.fillRect(x + 12, y + 10, width - 24, 20);

    // Carved Glowing Cyan Runes on Pillars
    for (let r = 0; r < 4; r++) {
      const lit = Math.floor(tick / 10 + r) % 4 === 0;
      ctx.fillStyle = lit ? '#FFFFFF' : '#38BDF8';
      ctx.fillRect(x + 21, y + 36 + r * 24, 10, 8);
      ctx.fillRect(x + width - 31, y + 36 + r * 24, 10, 8);
    }

    // Center Celestial Vortex Rings
    const portalCx = cx;
    const portalCy = y + height * 0.56;
    ctx.fillStyle = '#040612';
    ctx.beginPath();
    ctx.ellipse(portalCx, portalCy, 44, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    const pPulse = Math.sin(tick * 0.1) * 4;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = active ? 5 : 3;
    ctx.beginPath();
    ctx.ellipse(portalCx, portalCy, 38 + pPulse * 0.5, 50 + pPulse * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#22FF88';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(portalCx, portalCy, 25 - pPulse * 0.4, 34 - pPulse * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FF3E9D';
    ctx.beginPath();
    ctx.ellipse(portalCx, portalCy, 12 + brightnessLift * 4, 18 + brightnessLift * 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Controlled inward-spiraling particle motes
    for (let p = 0; p < 8; p++) {
      const ang = tick * 0.045 + (p * Math.PI) / 4;
      const radDist = (active ? 64 : 52) - ((tick * 0.9 + p * 8) % 38);
      const px = portalCx + Math.cos(ang) * radDist;
      const py = portalCy + Math.sin(ang) * (radDist * 0.72);
      ctx.fillStyle = p % 3 === 0 ? '#FF75B5' : p % 2 === 0 ? '#22FF88' : '#38BDF8';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }
  }

  // Active architectural border highlight
  if (active) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = isSelected ? 4 : 2.5;
    ctx.strokeRect(x - 6, y - 6, width + 12, height + 12);
  }

  // Polished Destination Signboard (brighter & sharper on hover/focus)
  const labelW = Math.max(220, dest.title.length * 11 + 42);
  const labelX = Math.floor(cx - labelW / 2);
  const labelY = y - 64;

  ctx.fillStyle = active ? 'rgba(11, 11, 25, 0.98)' : 'rgba(6, 6, 14, 0.92)';
  ctx.fillRect(labelX, labelY, labelW, 48);
  ctx.strokeStyle = active ? '#FFFFFF' : accentColor;
  ctx.lineWidth = active ? 3 : 2;
  ctx.strokeRect(labelX, labelY, labelW, 48);

  ctx.textAlign = 'center';
  ctx.fillStyle = active ? '#FFFFFF' : accentColor;
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillText(dest.title.toUpperCase(), cx, labelY + 20);

  ctx.fillStyle = isVisited ? '#22FF88' : '#E2E8F0';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(isVisited ? `✓ ${dest.shortLabel} · Explored` : dest.subtitle, cx, labelY + 38);
  ctx.textAlign = 'left';

  if (isNearby || isSelected) {
    const promptW = 188;
    const px = Math.floor(cx - promptW / 2);
    const py = y + height + 12;
    ctx.fillStyle = isSelected ? '#FFFFFF' : '#22FF88';
    ctx.fillRect(px, py, promptW, 28);
    ctx.strokeStyle = '#06060E';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, promptW, 28);
    ctx.fillStyle = '#06060E';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isSelected ? 'ENTERING...' : 'CLICK OR [E]', cx, py + 18);
    ctx.textAlign = 'left';
  }
}
