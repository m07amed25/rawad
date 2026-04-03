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

interface ExamNotificationEmailProps {
  studentName: string;
  examTitle: string;
  subjectName: string;
  examDate: string;
  examTime: string;
  durationMinutes: number;
  teacherName: string;
}

export default function ExamNotificationEmail({
  studentName,
  examTitle,
  subjectName,
  examDate,
  examTime,
  durationMinutes,
  teacherName,
}: ExamNotificationEmailProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>امتحان جديد متاح: {examTitle} - تطبيق رواد</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>رواد</Heading>
          </Section>
          <Hr style={hr} />
          <Heading style={heading}>امتحان جديد متاح</Heading>
          <Text style={text}>مرحباً {studentName}،</Text>
          <Text style={text}>
            تم نشر امتحان جديد وأصبح متاحاً لك. يرجى مراجعة التفاصيل أدناه:
          </Text>

          <Section style={detailsSection}>
            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={labelCell}>الامتحان</td>
                  <td style={valueCell}>{examTitle}</td>
                </tr>
                <tr>
                  <td style={labelCell}>المادة</td>
                  <td style={valueCell}>{subjectName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>المحاضر</td>
                  <td style={valueCell}>{teacherName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>التاريخ</td>
                  <td style={valueCell}>{examDate}</td>
                </tr>
                <tr>
                  <td style={labelCell}>الوقت</td>
                  <td style={valueCell}>{examTime}</td>
                </tr>
                <tr>
                  <td style={labelCell}>المدة</td>
                  <td style={valueCell}>{durationMinutes} دقيقة</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={text}>
            يمكنك الدخول إلى الامتحان من صفحة الامتحانات في لوحة التحكم الخاصة
            بك عند حلول موعده.
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
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "520px",
  borderRadius: "8px",
  border: "1px solid #e6ebf1",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  padding: "0 0 16px",
};

const logo: React.CSSProperties = {
  color: "#6d28d9",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const heading: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "22px",
  fontWeight: "600",
  textAlign: "center",
  margin: "24px 0 16px",
};

const text: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center",
};

const detailsSection: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "20px",
  border: "1px solid #e5e7eb",
};

const detailsTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const labelCell: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 12px 8px 0",
  textAlign: "right",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const valueCell: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  padding: "8px 0",
  textAlign: "right",
  verticalAlign: "top",
};

const hr: React.CSSProperties = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "22px",
  textAlign: "center",
};
