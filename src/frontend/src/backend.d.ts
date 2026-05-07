import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    sender: SenderType;
    message: string;
    timestamp: bigint;
}
export interface ContactInfo {
    socialLinks: Array<string>;
    email: string;
    phone: string;
}
export enum SenderType {
    bot = "bot",
    user = "user"
}
export interface backendInterface {
    getContactInfo(): Promise<ContactInfo | null>;
    getConversation(): Promise<Array<ChatMessage>>;
    sendMessage(message: string): Promise<string>;
    updateContactInfo(email: string, phone: string, socialLinks: Array<string>): Promise<void>;
}
