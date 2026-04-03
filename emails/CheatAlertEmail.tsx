import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CheatAlertEmailProps {
  studentName: string;
  examTitle: string;
  violationType: string;
  timestamp: string;
}

const violationLabels: Record<string, string> = {
  TAB_SWITCH: "الانتقال إلى تبويب آخر",
  EXITED_FULLSCREEN: "الخروج من وضع ملء الشاشة",
};

export default function CheatAlertEmail({
  studentName,
  examTitle,
  violationType,
  timestamp,
}: CheatAlertEmailProps) {
  const violationLabel =
    violationLabels[violationType] ?? violationType;

  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        🚨 تنبيه غش: {studentName} - {examTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={alertBanner}>
            <Heading style={alertHeading}>🚨 تنبيه غش</Heading>
          </Section>
          <Hr style={hr} />
          <Heading style={heading}>خروج عن شاشة الامتحان</Heading>
          <Text style={text}>
            تم رصد مخالفة أثناء أداء أحد الطلاب للامتحان. التفاصيل أدناه:
          </Text>

          <Section style={detailsSection}>
            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>الطالب</td>
                  <td style={valueCell}>{studentName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>الامتحان</td>
                  <td style={valueCell}>{examTitle}</td>
                </tr>
                <tr>
                  <td style={labelCell}>نوع المخالفة</td>
                  <td style={valueCell}>{violationLabel}</td>
                </tr>
                <tr>
                  <td style={labelCell}>التوقيت</td>
                  <td style={valueCell}>{timestamp}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={text}>
            يرجى مراجعة سلوك الطالب أثناء الامتحان واتخاذ الإجراء المناسب.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            تم إرسال هذا البريد تلقائياً من تطبيق رواد. لا تحتاج للرد عليه.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const alertBanner: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const alertHeading: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const heading: React.CSSProperties = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "700",
  textAlign: "right" as const,
  margin: "0 0 12px",
};

const text: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.8",
  textAlign: "right" as const,
};

const detailsSection: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
};

const detailsTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const labelCell: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 12px",
  textAlign: "right" as const,
  width: "120px",
  verticalAlign: "top",
};

const valueCell: React.CSSProperties = {
  color: "#111827",
  fontSize: "14px",
  padding: "8px 12px",
  textAlign: "right" as const,
};

const footer: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  textAlign: "center" as const,
  lineHeight: "1.6",
};
