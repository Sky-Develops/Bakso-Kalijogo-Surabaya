import { StoreSettings } from "@/types";
import { createClient } from "@/utils/supabase/client";

type StoreSettingsRow = {
  id: number;
  restaurant_name: string;
  whatsapp_number: string;
  address: string;
  service_fee: number | string;
  delivery_fee_default: number | string;
  print_template: StoreSettings["printTemplate"];
  website_config: StoreSettings["websiteConfig"];
  payment_config?: StoreSettings["paymentConfig"];
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_WEBSITE_CONFIG: StoreSettings["websiteConfig"] = {
  logoUrl: "",
  bannerUrl: "",
  isOpen: true,
  announcement: "",
  about: "Bakso Kalijogo berdiri sejak 1995 di Surabaya. Kami memakai daging sapi pilihan dan kuah kaldu yang dimasak perlahan untuk rasa yang konsisten.",
  locationUrl: "",
};

const DEFAULT_PAYMENT_CONFIG: StoreSettings["paymentConfig"] = {
  cashEnabled: true,
  transferEnabled: true,
  qrisEnabled: true,
  bankName: "BCA",
  bankAccountNumber: "",
  bankAccountHolder: "Bakso Kalijogo",
  qrisImageUrl: "",
};

function mapToStoreSettings(row: StoreSettingsRow): StoreSettings {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    whatsappNumber: row.whatsapp_number,
    address: row.address,
    serviceFee: Number(row.service_fee),
    deliveryFeeDefault: Number(row.delivery_fee_default),
    printTemplate: row.print_template,
    websiteConfig: { ...DEFAULT_WEBSITE_CONFIG, ...row.website_config },
    paymentConfig: { ...DEFAULT_PAYMENT_CONFIG, ...row.payment_config },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to load settings");
  }

  return mapToStoreSettings(data);
}

export async function updateStoreSettings(payload: Partial<StoreSettings>): Promise<StoreSettings> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = {};
  if (payload.restaurantName !== undefined) updateData.restaurant_name = payload.restaurantName;
  if (payload.whatsappNumber !== undefined) updateData.whatsapp_number = payload.whatsappNumber;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.serviceFee !== undefined) updateData.service_fee = payload.serviceFee;
  if (payload.deliveryFeeDefault !== undefined) updateData.delivery_fee_default = payload.deliveryFeeDefault;
  if (payload.printTemplate !== undefined) updateData.print_template = payload.printTemplate;
  if (payload.websiteConfig !== undefined) updateData.website_config = payload.websiteConfig;
  if (payload.paymentConfig !== undefined) updateData.payment_config = payload.paymentConfig;

  const { data, error } = await supabase
    .from("store_settings")
    .update(updateData)
    .eq("id", 1)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update settings");
  }

  return mapToStoreSettings(data);
}
