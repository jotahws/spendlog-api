import { ObjectId } from "mongodb";

type ContactInfo = {
    email: string | null;
    phone: string | null;
    website: string | null;
    fax: string | null;
};

type StructureInfo = {
    nature: string;
    capital: string;
    capital_currency: string;
};

type GeoInfo = {
    region: string;
    county: string;
    parish: string | null;
};

type PlaceInfo = {
    address: string;
    pc4: string;
    pc3: string;
    city: string;
};

export type Merchant = {
    _id: ObjectId;
    nif: string;
    seo_url: string;
    title: string;
    address: string;
    pc4: string;
    pc3: string;
    city: string;
    start_date: string | null;
    activity: string | null;
    status: string;
    cae: string | string[];
    contacts: ContactInfo;
    structure: StructureInfo;
    geo: GeoInfo;
    place: PlaceInfo;
    racius: string;
    portugalio: string;
};
