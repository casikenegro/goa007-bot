import { createProvider } from "@builderbot/bot";
import { BaileysProvider } from "@builderbot/provider-baileys";

export type IProvider = typeof BaileysProvider;
export const adapterProvider = createProvider(BaileysProvider);
