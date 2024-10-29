# SpendLog API 🇵🇹

Track your expenses with the Portuguese QR code Receipt

SpendLog API is designed to help users efficiently control and manage their expenses. It provides endpoints to add, view, and manage expense entries, with the option to add them manually or by scanning a QR Code from Portuguese receipts. Each expense entry is stored in a MongoDB collection to ensure persistence and data accessibility.

## Features

- Expense Tracking: Add expenses by inputting required details or by scanning a Portuguese QR Code that contains relevant transaction data.
- QR Code Parsing: The API accepts QR codes in the official Portuguese format, extracting details such as VAT numbers, document type, fiscal space, taxes, and more.
- MongoDB Storage: All expenses are stored in MongoDB, with a structured schema to facilitate retrieval and analysis of expense data.

## Project Structure

```text
/spendlog-api
│
├── /src
│   ├── /config             # Configuration files (MongoDB connection, environment)
│   ├── /controllers        # API route handler logic
│   ├── /middlewares        # Middleware (authentication, validation, etc.)
│   ├── /models             # Data models (Schemas)
│   ├── /routes             # API route definitions
│   ├── /services           # Business logic (e.g., database interactions)
│   ├── /utils              # Utility functions or helpers
│   └── app.ts              # Main application setup (routes, middleware, etc.)'
│
├── .env                    # Environment variables (MongoDB URI, API keys)
├── deps.ts                 # Dependency imports (Deno's version of a package.json)
├── deno.json               # Deno configuration file
└── README.md               # Project documentation
```

## QR Code Structure

| Code | Description                              | Example                 | Keys                            |
| ---- | ---------------------------------------- | ----------------------- | ------------------------------- |
| A    | NIF do emitente                          | A:123456789             | merchantVatNumber               |
| B    | NIF do adquirente                        | B:999999990             | customerVatNumber               |
| C    | País do adquirente                       | C:PT                    | customerCountry                 |
| D    | Tipo de documento                        | D:FT                    | documentType                    |
| E    | Estado do documento                      | E:N                     | documentStatus                  |
| F    | Data do documento                        | F:20191231              | documentDate                    |
| G    | Identificação única do documento         | G:FTAB2019/0035         | documentUniqueId                |
| H    | ATCUD                                    | H:CSDF7T5H-0035         | atcud                           |
| I1   | Espaço fiscal                            | I1:PT                   | fiscalSpaceI                    |
| I2   | Base tributável isenta de IVA            | I2:12000.00             | taxableBaseExemptVatI           |
| I3   | Base tributável de IVA à taxa reduzida   | I3:15000.00             | taxableBaseReducedRateVatI      |
| I4   | Total de IVA à taxa reduzida             | 14:900.00               | totalReducedRateVatI            |
| I5   | Base tributável de IVA à taxa intermédia | 15:50000.00             | taxableBaseIntermediateRateVatI |
| I6   | Total de IVA à taxa intermédia           | I6:6500.00              | totalIntermediateRateVatI       |
| I7   | Base tributável de IVA à taxa normal     | I7:80000.00             | taxableBaseNormalRateVatI       |
| I8   | Total de IVA à taxa normal               | 18:18400.00             | totalNormalRateVatI             |
| J1   | Espaço fiscal                            | J1:PT-AC                | fiscalSpaceJ                    |
| J2   | Base tributável isenta                   | 12:10000.00             | taxableBaseExemptVatJ           |
| J3   | Base tributável de IVA à taxa reduzida   | J3:25000.56             | taxableBaseReducedRateVatJ      |
| J4   | Total de IVA à taxa reduzida             | J4:1000.02              | totalReducedRateVatJ            |
| J5   | Base tributável de IVA à taxa intermédia | J5:75000.00             | taxableBaseIntermediateRateVatJ |
| J6   | Total de IVA à taxa intermédia           | J6:6750.00              | totalIntermediateRateVatJ       |
| J7   | Base tributável de IVA à taxa normal     | J7:100000.00            | taxableBaseNormalRateVatJ       |
| J8   | Total de IVA à taxa normal               | J8:18000.00             | totalNormalRateVatJ             |
| K1   | Espaço fiscal                            | K1:PT-MA                | fiscalSpaceK                    |
| K2   | Base tributável isenta                   | K2:5000.00              | taxableBaseExemptVatK           |
| K3   | Base tributável de IVA à taxa reduzida   | K3:12500.00             | taxableBaseReducedRateVatK      |
| K4   | Total de IVA à taxa reduzida             | K4:625.00               | totalReducedRateVatK            |
| K5   | Base tributável de IVA à taxa intermédia | K5:25000.00             | taxableBaseIntermediateRateVatK |
| K6   | Total de IVA à taxa intermédia           | K6:3000.00              | totalIntermediateRateVatK       |
| K7   | Base tributável de IVA à taxa normal     | K7:40000.00             | taxableBaseNormalRateVatK       |
| K8   | Total de IVA à taxa normal               | K8:8800.00              | totalNormalRateVatK             |
| L    | Não sujeito / não tributável em IVA      | L: 100.00               | nonVatTaxable                   |
| M    | Imposto do Selo                          | M:25.00                 | stampTax                        |
| N    | Total de impostos                        | N:64000.02              | totalTaxes                      |
| O    | Total do documento com impostos          | O:513600.58             | totalAmount                     |
| P    | Retenções na fonte                       | P:100.00                | withholdingTax                  |
| Q    | 4 carateres do Hash                      | Q:kLp0                  | hash                            |
| R    | N° do certificado                        | R:9999                  | certificateNumber               |
| S    | Outras informações                       | S:TB;PT000000;513500.58 | additionalInformation           |

## API Endpoints

### 1. Add Expense

- Endpoint: /expense
- Method: POST
- Description: Creates a new expense entry using a JSON body that matches the required expense schema. This endpoint is designed for manually entered expense data.
- Schema: ExpenseSchema

#### Response:

- Status: 201 Created
- Body: JSON object of the created expense entry.

#### Example Request

```json
POST /expense
{
  "merchantVatNumber": "PT123456789",
  "customerVatNumber": "PT987654321",
  "customerCountry": "PT",
  "documentType": "Invoice",
  "documentDate": "2024-10-20",
  "totalAmount": 150.0
}
```

### 2. Add Expense with QR Code

- Endpoint: /expense/qr
- Method: POST
- Description: Creates a new expense entry using data extracted from a QR code. This endpoint expects the QR code data to follow the Portuguese QR code format.
- Schema: ExpenseQRCodeSchema

#### Body Parameters:

- qrCode: (string) The QR code data in a specific format that contains key-value pairs (e.g., A:123456789*B:987654321*...\*O:150.00).

#### Response

- Status: 201 Created
- Body: JSON object of the created expense entry.

#### Example Request

```json
POST /expense/qr
{
    "qrCode": "A:123456789*B:987654321*C:PT*D:FT*...*O:150.00"
}
```

### 3. Bulk Add Expenses with QR Codes

- Endpoint: /expense/qr/bulk
- Method: POST
- Description: Creates multiple expense entries in bulk using a list of QR codes. Each QR code in the list should follow the Portuguese QR code format.
- Schema: ExpenseQRCodeListSchema

#### Body Parameters

- qrCodes: (array of strings) An array of QR codes, each containing key-value pairs (e.g., A:123456789*B:987654321*...\*O:150.00).

#### Response:

- Status: 201 Created
- Body: JSON array of the created expense entries.

#### Example Request:

```json
POST /expense/qr/bulk
{
    "qrCodes": [
    "A:123456789*B:987654321*C:PT*D:FT*...*O:150.00",
    "A:223344556*B:667788990*C:PT*D:FT*...*O:200.00"
    ]
}
```
