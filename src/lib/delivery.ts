export const RESTAURANT_WHATSAPP = "6281234567890";

export const DELIVERY_AREAS = [
  {
    id: "0-3km",
    label: "Radius 0-3 km",
    desc: "Area sekitar outlet",
    fee: 8000,
    eta: "25-35 menit",
    available: true,
  },
  {
    id: "3-6km",
    label: "Radius 3-6 km",
    desc: "Area Surabaya terdekat",
    fee: 12000,
    eta: "35-50 menit",
    available: true,
  },
  {
    id: "outside",
    label: "Di atas 6 km",
    desc: "Belum tersedia untuk delivery",
    fee: 0,
    eta: "Hubungi outlet",
    available: false,
  },
] as const;

export type DeliveryAreaId = (typeof DELIVERY_AREAS)[number]["id"];

export function getDeliveryArea(id: DeliveryAreaId) {
  return DELIVERY_AREAS.find((area) => area.id === id) ?? DELIVERY_AREAS[0];
}

export function toWhatsAppUrl(message: string, phone = RESTAURANT_WHATSAPP) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
