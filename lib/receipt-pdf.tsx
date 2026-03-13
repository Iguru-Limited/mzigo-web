import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { generateQRCodeDataUrl } from "./qr-utils";

type ReceiptTextSize = "big" | "normal" | "small";

interface ReceiptPdfLine {
  text_size: ReceiptTextSize;
  content: string;
  "pre-text": string;
  end_1?: string;
  is_bold: boolean;
}

interface ReceiptPdfData {
  receipt_number: string;
  s_date: string;
  s_time: string;
  receipt: ReceiptPdfLine[];
  package_token?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    fontFamily: "Courier",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  line: {
    fontSize: 10,
    lineHeight: 1.35,
    marginBottom: 1,
    overflowWrap: "break-word",
  },
  lineSmall: {
    fontSize: 8,
  },
  lineBig: {
    fontSize: 14,
  },
  lineBold: {
    fontWeight: "bold",
  },
  qrSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    alignItems: "center",
  },
  qrImage: {
    width: 88,
    height: 88,
  },
});

function getLineText(line: ReceiptPdfLine): string {
  const preText = line["pre-text"] ?? "";
  const content = line.content ?? "";
  const ending = line.end_1 ?? "";
  return `${preText}${content}${ending}`;
}

function ReceiptPdfDocument({ data, qrCodeDataUrl }: { data: ReceiptPdfData; qrCodeDataUrl?: string }) {
  return (
    <Document title={`Receipt ${data.receipt_number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Receipt #{data.receipt_number}</Text>
            <Text style={styles.subtitle}>Issued on {new Date(`${data.s_date}T${data.s_time}`).toLocaleDateString()}</Text>
          </View>

          {data.receipt.map((line, index) => {
            const sizeStyle =
              line.text_size === "big"
                ? styles.lineBig
                : line.text_size === "small"
                  ? styles.lineSmall
                  : undefined;

            return (
              <Text
                key={`${index}-${line.content}`}
                style={[
                  styles.line,
                  ...(sizeStyle ? [sizeStyle] : []),
                  ...(line.is_bold ? [styles.lineBold] : []),
                ]}
              >
                {getLineText(line)}
              </Text>
            );
          })}

          {qrCodeDataUrl ? (
            <View style={styles.qrSection}>
              <Image src={qrCodeDataUrl} style={styles.qrImage} />
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

export async function downloadReceiptPdf(data: ReceiptPdfData): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("PDF download is only available in the browser");
  }

  let qrCodeDataUrl: string | undefined;
  const isOfflineReceipt = data.receipt_number.startsWith("OFFLINE-");

  if (data.package_token && !isOfflineReceipt) {
    try {
      qrCodeDataUrl = await generateQRCodeDataUrl(data.package_token, 120);
    } catch {
      qrCodeDataUrl = undefined;
    }
  }

  const blob = await pdf(<ReceiptPdfDocument data={data} qrCodeDataUrl={qrCodeDataUrl} />).toBlob();
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${data.receipt_number}.pdf`;
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}