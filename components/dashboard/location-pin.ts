import L from "leaflet";

/**
 * دبّوس تحديد الموقع في لوحة التحكم.
 * شكل الدبّوس المدبّب (لا الدائرة) يوضّح أن طرفه السفلي هو النقطة الحقيقية،
 * وهو ما يهمّ صاحب المطعم وهو يسحبه فوق مبناه.
 */
export function createPinIcon(): L.DivIcon {
  const html = `
    <div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:grab;">
      <span style="width:34px;height:34px;border-radius:9999px 9999px 9999px 2px;transform:rotate(-45deg);background:#b3290f;border:3px solid #fff;box-shadow:0 6px 18px rgba(0,0,0,.28);display:block;"></span>
      <span style="width:8px;height:8px;border-radius:9999px;background:rgba(0,0,0,.35);margin-top:2px;"></span>
    </div>`;

  return L.divIcon({ className: "eatit-marker", html, iconSize: [34, 44], iconAnchor: [0, 0] });
}
