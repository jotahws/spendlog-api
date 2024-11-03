import type { Expense } from "../models/expenses.model.ts";

const getQrValues = (input: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const pairs = input.split("*");
    for (const pair of pairs) {
        const [key, value] = pair.split(":");
        if (key && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
};

const formatNumber = (value: string): number | undefined => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
};

export const formatQr = (input: string): Expense => {
    const values: Record<string, string> = getQrValues(input);

    return {
        merchantVatNumber: values["A"],
        customerVatNumber: values["B"],
        customerCountry: values["C"],
        documentType: values["D"],
        documentStatus: values["E"],
        documentDate: values["F"],
        documentUniqueId: values["G"],
        atcud: values["H"],
        fiscalSpaceI: values["I1"],
        taxableBaseExemptVatI: formatNumber(values["I2"]),
        taxableBaseReducedRateVatI: formatNumber(values["I3"]),
        totalReducedRateVatI: formatNumber(values["I4"]),
        taxableBaseIntermediateRateVatI: formatNumber(values["I5"]),
        totalIntermediateRateVatI: formatNumber(values["I6"]),
        taxableBaseNormalRateVatI: formatNumber(values["I7"]),
        totalNormalRateVatI: formatNumber(values["I8"]),
        fiscalSpaceJ: values["J1"],
        taxableBaseExemptVatJ: formatNumber(values["J2"]),
        taxableBaseReducedRateVatJ: formatNumber(values["J3"]),
        totalReducedRateVatJ: formatNumber(values["J4"]),
        taxableBaseIntermediateRateVatJ: formatNumber(values["J5"]),
        totalIntermediateRateVatJ: formatNumber(values["J6"]),
        taxableBaseNormalRateVatJ: formatNumber(values["J7"]),
        totalNormalRateVatJ: formatNumber(values["J8"]),
        fiscalSpaceK: values["K1"],
        taxableBaseExemptVatK: formatNumber(values["K2"]),
        taxableBaseReducedRateVatK: formatNumber(values["K3"]),
        totalReducedRateVatK: formatNumber(values["K4"]),
        taxableBaseIntermediateRateVatK: formatNumber(values["K5"]),
        totalIntermediateRateVatK: formatNumber(values["K6"]),
        taxableBaseNormalRateVatK: formatNumber(values["K7"]),
        totalNormalRateVatK: formatNumber(values["K8"]),
        nonVatTaxable: formatNumber(values["L"]),
        stampTax: formatNumber(values["M"]),
        totalTaxes: formatNumber(values["N"]),
        totalAmount: formatNumber(values["O"])!,
        withholdingTax: formatNumber(values["P"]),
        hash: values["Q"],
        certificateNumber: values["R"],
        additionalInformation: values["S"],
    };
};
