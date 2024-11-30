import type { ObjectId } from "mongodb";
import { z } from "zod";

export interface Expense {
    _id?: ObjectId;
    userId?: ObjectId;
    merchantVatNumber?: string;
    customerVatNumber?: string;
    customerCountry?: string;
    documentType?: string;
    documentStatus?: string;
    documentDate?: Date;
    documentUniqueId?: string;
    atcud?: string;
    fiscalSpaceI?: string;
    taxableBaseExemptVatI?: number;
    taxableBaseReducedRateVatI?: number;
    totalReducedRateVatI?: number;
    taxableBaseIntermediateRateVatI?: number;
    totalIntermediateRateVatI?: number;
    taxableBaseNormalRateVatI?: number;
    totalNormalRateVatI?: number;
    fiscalSpaceJ?: string;
    taxableBaseExemptVatJ?: number;
    taxableBaseReducedRateVatJ?: number;
    totalReducedRateVatJ?: number;
    taxableBaseIntermediateRateVatJ?: number;
    totalIntermediateRateVatJ?: number;
    taxableBaseNormalRateVatJ?: number;
    totalNormalRateVatJ?: number;
    fiscalSpaceK?: string;
    taxableBaseExemptVatK?: number;
    taxableBaseReducedRateVatK?: number;
    totalReducedRateVatK?: number;
    taxableBaseIntermediateRateVatK?: number;
    totalIntermediateRateVatK?: number;
    taxableBaseNormalRateVatK?: number;
    totalNormalRateVatK?: number;
    nonVatTaxable?: number;
    stampTax?: number;
    totalTaxes?: number;
    totalAmount: number;
    withholdingTax?: number;
    hash?: string;
    certificateNumber?: string;
    additionalInformation?: string;
}

export interface Location {
    type: "Point";
    coordinates: [number, number];
}

export interface ExpenseQrCode {
    qrCode: string;
}

export interface ExpenseFilter {
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    atcud?: string;
    merchantVatNumber?: string;
}

export type ExpenseQrCodeList = Array<string>;

//SCHEMAS

export const ExpenseSchema = z.object({
    merchantVatNumber: z.string().optional(),
    customerVatNumber: z.string().optional(),
    customerCountry: z.string().optional(),
    documentType: z.string().optional(),
    documentStatus: z.string().optional(),
    documentDate: z.string().optional(),
    documentUniqueId: z.string().optional(),
    atcud: z.string().optional(),
    fiscalSpaceI: z.string().optional(),
    taxableBaseExemptVatI: z.number().optional(),
    taxableBaseReducedRateVatI: z.number().optional(),
    totalReducedRateVatI: z.number().optional(),
    taxableBaseIntermediateRateVatI: z.number().optional(),
    totalIntermediateRateVatI: z.number().optional(),
    taxableBaseNormalRateVatI: z.number().optional(),
    totalNormalRateVatI: z.number().optional(),
    fiscalSpaceJ: z.string().optional(),
    taxableBaseExemptVatJ: z.number().optional(),
    taxableBaseReducedRateVatJ: z.number().optional(),
    totalReducedRateVatJ: z.number().optional(),
    taxableBaseIntermediateRateVatJ: z.number().optional(),
    totalIntermediateRateVatJ: z.number().optional(),
    taxableBaseNormalRateVatJ: z.number().optional(),
    totalNormalRateVatJ: z.number().optional(),
    fiscalSpaceK: z.string().optional(),
    taxableBaseExemptVatK: z.number().optional(),
    taxableBaseReducedRateVatK: z.number().optional(),
    totalReducedRateVatK: z.number().optional(),
    taxableBaseIntermediateRateVatK: z.number().optional(),
    totalIntermediateRateVatK: z.number().optional(),
    taxableBaseNormalRateVatK: z.number().optional(),
    totalNormalRateVatK: z.number().optional(),
    nonVatTaxable: z.number().optional(),
    stampTax: z.number().optional(),
    totalTaxes: z.number().optional(),
    totalAmount: z.number(),
    withholdingTax: z.number().optional(),
    hash: z.string().optional(),
    certificateNumber: z.string().optional(),
    additionalInformation: z.string().optional(),
}).strict();

const qrCodePattern =
    /^([A-Z][0-9]?:[^*]*)?(\*[A-Z][0-9]?:[^*]*)*(\*O:[^*]*)?(\*[A-Z][0-9]?:[^*]*)*\*?$/;

const QRCodeFormat = z.string().regex(qrCodePattern, {
    message: `Must follow pattern ${qrCodePattern}`,
}).transform((val) => val.endsWith("*") ? val.slice(0, -1) : val);

export const ExpenseQRCodeSchema = z.object({
    qrCode: QRCodeFormat,
}).strict();

export const ExpenseQRCodeListSchema = z.array(QRCodeFormat);

const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;

export const ExpenseFilterSchema = z.object({
    dateFrom: z.string().regex(datePattern, {
        message: `Must follow pattern YYYY-MM-DD`,
    }).optional().transform((
        val,
    ) => (val ? new Date(val) : undefined)),
    dateTo: z.string().regex(datePattern, {
        message: `Must follow pattern YYYY-MM-DD`,
    }).optional().transform((
        val,
    ) => (val ? new Date(val) : undefined)),
    minAmount: z.string().optional().transform((
        val,
    ) => (val ? parseFloat(val) : undefined)),
    maxAmount: z.string().optional().transform((
        val,
    ) => (val ? parseFloat(val) : undefined)),
    atcud: z.string().optional(),
    merchantVatNumber: z.string().optional(),
}).strict();

export const IdSchema = z.object({
    id: z.string().length(24).regex(
        /^[0-9a-fA-F]+$/,
        "Must be a valid 24 character hex string",
    ),
});

export const AtcudSchema = z.object({
    atcud: z.string(),
});
