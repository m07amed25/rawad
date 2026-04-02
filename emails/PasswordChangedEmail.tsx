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

export default function PasswordChangedEmail() {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>تم تغيير كلمة المرور - تطبيق رواد</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>رواد</Heading>
          </Section>
          <Hr style={hr} />
          <Section style={iconSection}>
            <Text style={checkIcon}>✓</Text>
          </Section>
          <Heading style={heading}>تم تغيير كلمة المرور</Heading>
          <Text style={text}>
            تم تغيير كلمة المرور الخاصة بحسابك بنجاح.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            إذا لم تقم بهذا الإجراء، يرجى التواصل مع الدعم فوراً أو إعادة
            تعيين كلمة المرور.
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
  maxWidth: "480px",
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

const iconSection: React.CSSProperties = {
  textAlign: "center",
  margin: "16px 0 0",
};

const checkIcon: React.CSSProperties = {
  display: "inline-block",
  width: "48px",
  height: "48px",
  lineHeight: "48px",
  borderRadius: "50%",
  backgroundColor: "#d1fae5",
  color: "#059669",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
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
