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

interface OtpEmailProps {
  otp: string;
  purpose: string;
}

export default function OtpEmail({ otp, purpose }: OtpEmailProps) {
  const isResetPassword = purpose === "forget-password";
  const subject = isResetPassword ? "إعادة تعيين كلمة المرور" : "رمز التحقق";

  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>{subject} - تطبيق رواد</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>رواد</Heading>
          </Section>
          <Hr style={hr} />
          <Heading style={heading}>{subject}</Heading>
          <Text style={text}>
            {isResetPassword
              ? "لقد طلبت إعادة تعيين كلمة المرور. استخدم الرمز أدناه:"
              : "استخدم الرمز أدناه للتحقق من حسابك:"}
          </Text>
          <Section style={codeSection}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>هذا الرمز صالح لمدة 10 دقائق.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
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

const codeSection: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "16px",
  textAlign: "center",
};

const code: React.CSSProperties = {
  color: "#6d28d9",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
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
